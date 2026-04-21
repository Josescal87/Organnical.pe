export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { EncounterPDF, type EncounterPDFData } from "@/lib/pdf/EncounterPDF";
import { PrescriptionPDF, type PrescriptionPDFData } from "@/lib/pdf/PrescriptionPDF";

const BUCKET = "medical-documents";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

async function getIpress(admin: ReturnType<typeof adminClient>) {
  const { data } = await admin
    .schema("medical")
    .from("system_config")
    .select("key, value");

  const cfg = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return {
    ipress_name:     cfg.ipress_name     ?? "Organnical Salud S.A.C.",
    ipress_code:     cfg.ipress_code     ?? "PENDIENTE",
    ipress_ruc:      cfg.ipress_ruc      ?? "—",
    ipress_address:  cfg.ipress_address  ?? "—",
    ipress_category: cfg.ipress_category ?? "I-1",
  };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json() as { type: "encounter" | "prescription"; id: string };
  const admin = adminClient();

  if (body.type === "encounter") {
    return generateEncounterPDF(body.id, user.id, admin);
  } else if (body.type === "prescription") {
    return generatePrescriptionPDF(body.id, user.id, admin);
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
}

async function generateEncounterPDF(
  encounterId: string,
  actorId: string,
  admin: ReturnType<typeof adminClient>
) {
  // Fetch encounter (verify doctor ownership)
  const { data: enc } = await admin
    .schema("medical")
    .from("clinical_encounters")
    .select("*, appointments(slot_start)")
    .eq("id", encounterId)
    .eq("doctor_id", actorId)
    .single();

  if (!enc) return NextResponse.json({ error: "Encuentro no encontrado" }, { status: 404 });
  if (enc.status !== "signed") return NextResponse.json({ error: "La HC debe estar firmada" }, { status: 400 });

  // Fetch related data in parallel
  const [ipress, patientResult, doctorResult, hcResult] = await Promise.all([
    getIpress(admin),
    admin.schema("medical").from("profiles").select("full_name, document_id, birth_date, gender").eq("id", enc.patient_id).single(),
    admin.schema("medical").from("profiles").select("full_name, cmp, specialty_label, rne").eq("id", enc.doctor_id).single(),
    admin.schema("medical").from("patient_records").select("hc_number").eq("patient_id", enc.patient_id).single(),
  ]);

  const patient = patientResult.data;
  const doctor  = doctorResult.data;
  const hcNum   = hcResult.data?.hc_number ?? "—";

  const aptDate = (enc as { appointments?: { slot_start?: string } }).appointments?.slot_start
    ? new Date((enc as { appointments: { slot_start: string } }).appointments.slot_start).toLocaleDateString("es-PE", {
        day: "2-digit", month: "long", year: "numeric", timeZone: "America/Lima",
      })
    : "—";

  const pdfData: EncounterPDFData = {
    ...ipress,
    doctor_name:     doctor?.full_name ?? "—",
    doctor_cmp:      doctor?.cmp ?? "—",
    doctor_specialty: doctor?.specialty_label ?? "—",
    doctor_rne:      doctor?.rne ?? undefined,
    patient_name:    patient?.full_name ?? "—",
    patient_dni:     patient?.document_id ?? "—",
    patient_birth:   patient?.birth_date
      ? new Date(patient.birth_date).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })
      : "—",
    patient_gender:  patient?.gender ?? "—",
    hc_number:       hcNum,
    appointment_date: aptDate,
    chief_complaint:  enc.chief_complaint ?? "",
    illness_history:  enc.illness_history ?? "",
    relevant_history: enc.relevant_history ?? undefined,
    vital_weight_kg:    enc.vital_weight_kg ?? undefined,
    vital_height_cm:    enc.vital_height_cm ?? undefined,
    vital_bmi:          enc.vital_bmi ?? undefined,
    vital_bp_systolic:  enc.vital_bp_systolic ?? undefined,
    vital_bp_diastolic: enc.vital_bp_diastolic ?? undefined,
    vital_heart_rate:   enc.vital_heart_rate ?? undefined,
    vital_respiratory_rate: enc.vital_respiratory_rate ?? undefined,
    vital_temperature_c:    enc.vital_temperature_c ?? undefined,
    vital_spo2_pct:         enc.vital_spo2_pct ?? undefined,
    physical_exam_notes:    enc.physical_exam_notes ?? undefined,
    diagnoses:           (enc.diagnoses as EncounterPDFData["diagnoses"]) ?? [],
    treatment_plan:      enc.treatment_plan ?? "",
    indications:         enc.indications ?? undefined,
    follow_up_days:      enc.follow_up_days ?? undefined,
    lab_orders:          enc.lab_orders ?? undefined,
    cannabis_indication: enc.cannabis_indication ?? undefined,
    expected_outcomes:   enc.expected_outcomes ?? undefined,
    signed_at:            enc.signed_at ?? new Date().toISOString(),
    doctor_signature_hash: enc.doctor_signature_hash ?? "—",
  };

  const buffer = await renderToBuffer(React.createElement(EncounterPDF, { data: pdfData }) as React.ReactElement<DocumentProps>);
  const path = `encounters/${enc.patient_id}/${encounterId}.pdf`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

  await admin.schema("medical").from("clinical_encounters").update({ pdf_url: publicUrl }).eq("id", encounterId);

  // Audit log (non-fatal)
  try {
    await admin.schema("medical").rpc("log_event", {
      p_action: "create", p_resource_type: "encounter_pdf",
      p_resource_id: encounterId, p_patient_id: enc.patient_id,
    });
  } catch {}

  return NextResponse.json({ success: true, pdf_url: publicUrl });
}

async function generatePrescriptionPDF(
  prescriptionId: string,
  actorId: string,
  admin: ReturnType<typeof adminClient>
) {
  const { data: rx } = await admin
    .schema("medical")
    .from("prescriptions")
    .select("*, prescription_items(producto_sku, quantity, dosage_instructions)")
    .eq("id", prescriptionId)
    .eq("doctor_id", actorId)
    .single();

  if (!rx) return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 });

  const [ipress, patientResult, doctorResult, hcResult, productosResult] = await Promise.all([
    getIpress(admin),
    admin.schema("medical").from("profiles").select("full_name, document_id").eq("id", rx.patient_id).single(),
    admin.schema("medical").from("profiles").select("full_name, cmp, specialty_label, rne").eq("id", rx.doctor_id).single(),
    admin.schema("medical").from("patient_records").select("hc_number").eq("patient_id", rx.patient_id).single(),
    admin.from("productos").select("sku, descripcion"),
  ]);

  const patient  = patientResult.data;
  const doctor   = doctorResult.data;
  const hcNum    = hcResult.data?.hc_number ?? "—";
  const productos = (productosResult.data ?? []) as { sku: string; descripcion: string }[];

  const rxNum = rx.prescription_number ?? `RX-${new Date().getFullYear()}-${prescriptionId.slice(-6).toUpperCase()}`;

  const items = ((rx.prescription_items ?? []) as { producto_sku: string; quantity: number; dosage_instructions: string | null }[]).map((it) => ({
    nombre:              productos.find((p) => p.sku === it.producto_sku)?.descripcion ?? it.producto_sku,
    producto_sku:        it.producto_sku,
    quantity:            it.quantity,
    dosage_instructions: it.dosage_instructions,
  }));

  const pdfData: PrescriptionPDFData = {
    ...ipress,
    doctor_name:      doctor?.full_name ?? "—",
    doctor_cmp:       doctor?.cmp ?? "—",
    doctor_specialty: doctor?.specialty_label ?? "—",
    doctor_rne:       doctor?.rne ?? undefined,
    patient_name:     patient?.full_name ?? "—",
    patient_dni:      patient?.document_id ?? "—",
    hc_number:        hcNum,
    prescription_number: rxNum,
    issued_at:        rx.issued_at,
    valid_until:      rx.valid_until,
    diagnosis_cie10:  rx.diagnosis_cie10 ?? undefined,
    diagnosis_label:  rx.diagnosis_label ?? undefined,
    items,
  };

  const buffer = await renderToBuffer(React.createElement(PrescriptionPDF, { data: pdfData }) as React.ReactElement<DocumentProps>);
  const path = `prescriptions/${rx.patient_id}/${prescriptionId}.pdf`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

  await admin.schema("medical").from("prescriptions").update({ pdf_url: publicUrl }).eq("id", prescriptionId);

  try {
    await admin.schema("medical").rpc("log_event", {
      p_action: "create", p_resource_type: "prescription_pdf",
      p_resource_id: prescriptionId, p_patient_id: rx.patient_id,
    });
  } catch {}

  return NextResponse.json({ success: true, pdf_url: publicUrl });
}
