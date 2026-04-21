"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { signDocument } from "@/lib/digital-signature/provider";

export type DiagnosisItem = {
  cie10_code:        string;
  cie10_description: string;
  type:              "principal" | "secondary";
  certainty:         "definitivo" | "presuntivo";
};

export type EncounterFormData = {
  // S — Subjetivo
  chief_complaint:    string;
  illness_history:    string;
  relevant_history:   string;
  // O — Objetivo (signos vitales)
  vital_weight_kg:    string;
  vital_height_cm:    string;
  vital_bp_systolic:  string;
  vital_bp_diastolic: string;
  vital_heart_rate:   string;
  vital_respiratory_rate: string;
  vital_temperature_c: string;
  vital_spo2_pct:     string;
  physical_exam_notes: string;
  // A — Análisis
  diagnoses:          DiagnosisItem[];
  // P — Plan
  treatment_plan:     string;
  indications:        string;
  follow_up_days:     string;
  lab_orders:         string;
  // Específico Ley 30681
  cannabis_indication: string;
  expected_outcomes:   string;
};

function parseNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function parseIntSafe(v: string): number | null {
  const n = globalThis.parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function calcBMI(weight: string, height: string): number | null {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h) return null;
  return Math.round((w / Math.pow(h / 100, 2)) * 100) / 100;
}

export async function saveEncounterDraft(aptId: string, data: EncounterFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  // Verificar que la cita pertenece a este doctor
  const { data: apt } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, patient_id")
    .eq("id", aptId)
    .eq("doctor_id", user.id)
    .single();

  if (!apt) return { error: "Cita no encontrada" };

  const payload = {
    appointment_id:        aptId,
    patient_id:            apt.patient_id,
    doctor_id:             user.id,
    chief_complaint:       data.chief_complaint,
    illness_history:       data.illness_history,
    relevant_history:      data.relevant_history || null,
    vital_weight_kg:       parseNum(data.vital_weight_kg),
    vital_height_cm:       parseNum(data.vital_height_cm),
    vital_bmi:             calcBMI(data.vital_weight_kg, data.vital_height_cm),
    vital_bp_systolic:     parseIntSafe(data.vital_bp_systolic),
    vital_bp_diastolic:    parseIntSafe(data.vital_bp_diastolic),
    vital_heart_rate:      parseIntSafe(data.vital_heart_rate),
    vital_respiratory_rate: parseIntSafe(data.vital_respiratory_rate),
    vital_temperature_c:   parseNum(data.vital_temperature_c),
    vital_spo2_pct:        parseIntSafe(data.vital_spo2_pct),
    physical_exam_notes:   data.physical_exam_notes || null,
    diagnoses:             data.diagnoses,
    treatment_plan:        data.treatment_plan,
    indications:           data.indications || null,
    follow_up_days:        parseIntSafe(data.follow_up_days),
    lab_orders:            data.lab_orders || null,
    cannabis_indication:   data.cannabis_indication || null,
    expected_outcomes:     data.expected_outcomes || null,
    status:                "draft",
    updated_at:            new Date().toISOString(),
  };

  const { error } = await supabase
    .schema("medical")
    .from("clinical_encounters")
    .upsert(payload, { onConflict: "appointment_id" });

  if (error) return { error: error.message };

  try {
    await supabase.schema("medical").rpc("log_event", {
      p_action:        "update",
      p_resource_type: "clinical_encounter_draft",
      p_resource_id:   aptId,
      p_patient_id:    apt.patient_id,
    });
  } catch {}

  revalidatePath(`/dashboard/medico/consultas/${aptId}`);
  return { success: true };
}

export async function signEncounter(aptId: string, data: EncounterFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: apt } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, patient_id")
    .eq("id", aptId)
    .eq("doctor_id", user.id)
    .single();

  if (!apt) return { error: "Cita no encontrada" };

  // F2 — Verificar que IPRESS code esté configurado antes de permitir firma
  const { data: ipressConfig } = await supabase
    .schema("medical")
    .from("system_config")
    .select("value")
    .eq("key", "ipress_code")
    .maybeSingle();
  if (!ipressConfig?.value || ipressConfig.value === "PENDIENTE") {
    return { error: "Configure el código IPRESS antes de firmar historias clínicas. Vaya a Administración → IPRESS." };
  }

  if (!data.chief_complaint.trim()) return { error: "El motivo de consulta es obligatorio" };
  if (!data.illness_history.trim())  return { error: "La historia de enfermedad es obligatoria" };
  if (!data.treatment_plan.trim())   return { error: "El plan de tratamiento es obligatorio" };
  if (!data.diagnoses.length)        return { error: "Debes agregar al menos un diagnóstico CIE-10" };
  if (!data.diagnoses.some(d => d.type === "principal")) return { error: "Marca un diagnóstico como principal" };

  const signedAt = new Date().toISOString();

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";

  const contentForSigning = JSON.stringify({
    aptId,
    doctorId:        user.id,
    signedAt,
    chief_complaint: data.chief_complaint,
    diagnoses:       data.diagnoses,
    treatment_plan:  data.treatment_plan,
  });

  const signature = await signDocument({
    content:   contentForSigning,
    doctor_id: user.id,
    timestamp: signedAt,
  });

  const payload = {
    appointment_id:        aptId,
    patient_id:            apt.patient_id,
    doctor_id:             user.id,
    chief_complaint:       data.chief_complaint,
    illness_history:       data.illness_history,
    relevant_history:      data.relevant_history || null,
    vital_weight_kg:       parseNum(data.vital_weight_kg),
    vital_height_cm:       parseNum(data.vital_height_cm),
    vital_bmi:             calcBMI(data.vital_weight_kg, data.vital_height_cm),
    vital_bp_systolic:     parseIntSafe(data.vital_bp_systolic),
    vital_bp_diastolic:    parseIntSafe(data.vital_bp_diastolic),
    vital_heart_rate:      parseIntSafe(data.vital_heart_rate),
    vital_respiratory_rate: parseIntSafe(data.vital_respiratory_rate),
    vital_temperature_c:   parseNum(data.vital_temperature_c),
    vital_spo2_pct:        parseIntSafe(data.vital_spo2_pct),
    physical_exam_notes:   data.physical_exam_notes || null,
    diagnoses:             data.diagnoses,
    treatment_plan:        data.treatment_plan,
    indications:           data.indications || null,
    follow_up_days:        parseIntSafe(data.follow_up_days),
    lab_orders:            data.lab_orders || null,
    cannabis_indication:   data.cannabis_indication || null,
    expected_outcomes:     data.expected_outcomes || null,
    status:                        "signed",
    signed_at:                     signedAt,
    signed_by:                     user.id,
    doctor_signature_hash:         signature.hash,
    doctor_ip:                     ip,
    updated_at:                    signedAt,
    signature_provider:            signature.provider,
    signature_certificate_serial:  signature.certificate_serial,
    signature_timestamp_rfc3161:   signature.timestamp_rfc3161,
  };

  const { data: upserted, error } = await supabase
    .schema("medical")
    .from("clinical_encounters")
    .upsert(payload, { onConflict: "appointment_id" })
    .select("id")
    .single();

  if (error) return { error: error.message };

  try {
    await supabase.schema("medical").rpc("log_event", {
      p_action:        "sign",
      p_resource_type: "clinical_encounter",
      p_resource_id:   aptId,
      p_patient_id:    apt.patient_id,
    });
  } catch {}

  revalidatePath(`/dashboard/medico/consultas/${aptId}`);
  return { success: true, signedAt, hash: signature.hash, encounterId: upserted?.id };
}

export async function getEncounter(aptId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .schema("medical")
    .from("clinical_encounters")
    .select("*")
    .eq("appointment_id", aptId)
    .single();

  return data;
}

export async function searchCIE10(query: string) {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const term = query.trim().toLowerCase();

  const { data } = await supabase
    .schema("medical")
    .from("cie10_cache")
    .select("code, description, specialty")
    .or(`code.ilike.%${term}%,description.ilike.%${term}%`)
    .eq("is_active", true)
    .order("specialty")
    .limit(20);

  return data ?? [];
}
