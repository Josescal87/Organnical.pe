"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendPrescriptionNotification } from "@/lib/emails";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function updateClinicalNotes(aptId: string, notes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .schema("medical")
    .from("appointments")
    .update({ clinical_notes: notes, updated_at: new Date().toISOString() })
    .eq("id", aptId)
    .eq("doctor_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/medico/consultas/${aptId}`);
  return { success: true };
}

export async function updateAppointmentStatus(
  aptId: string,
  status: "confirmed" | "completed" | "cancelled"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .schema("medical")
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", aptId)
    .eq("doctor_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/medico/consultas/${aptId}`);
  revalidatePath("/dashboard/medico/consultas");
  revalidatePath("/dashboard/medico");
  return { success: true };
}

export type PrescriptionItem = {
  producto_sku: string;
  quantity: number;
  dosage_instructions: string;
};

export async function createPrescription(
  aptId: string,
  patientId: string,
  validUntil: string,
  items: PrescriptionItem[]
) {
  if (!items.length) return { error: "Agrega al menos un producto" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  // Verificar que la cita pertenece a este doctor
  const { data: apt } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id")
    .eq("id", aptId)
    .eq("doctor_id", user.id)
    .single();

  if (!apt) return { error: "Cita no encontrada" };

  const { data: rx, error: rxError } = await supabase
    .schema("medical")
    .from("prescriptions")
    .insert({
      appointment_id: aptId,
      doctor_id: user.id,
      patient_id: patientId,
      valid_until: validUntil,
    })
    .select("id")
    .single();

  if (rxError) return { error: rxError.message };

  const { error: itemsError } = await supabase
    .schema("medical")
    .from("prescription_items")
    .insert(
      items.map((it) => ({
        prescription_id: rx.id,
        producto_sku: it.producto_sku,
        quantity: it.quantity,
        dosage_instructions: it.dosage_instructions || null,
      }))
    );

  if (itemsError) return { error: itemsError.message };

  // Enviar email al paciente (no-fatal)
  try {
    const [patientProfile, doctorProfile, productos] = await Promise.all([
      supabase.schema("medical").from("profiles").select("full_name").eq("id", patientId).single(),
      supabase.schema("medical").from("profiles").select("full_name").eq("id", user.id).single(),
      supabase.from("productos").select("sku, descripcion").in("sku", items.map((i) => i.producto_sku)),
    ]);
    const { data: patientAuth } = await createAdminClient().auth.admin.getUserById(patientId);
    const patientEmail = patientAuth?.user?.email;
    if (patientEmail) {
      const enrichedItems = items.map((it) => ({
        nombre: (productos.data as {sku:string;descripcion:string}[]|null)?.find((p) => p.sku === it.producto_sku)?.descripcion ?? it.producto_sku,
        quantity: it.quantity,
        dosage_instructions: it.dosage_instructions || null,
      }));
      await sendPrescriptionNotification({
        toEmail:     patientEmail,
        patientName: patientProfile.data?.full_name ?? "Paciente",
        doctorName:  doctorProfile.data?.full_name ?? "Tu médico",
        items:       enrichedItems,
        validUntil,
      });
    }
  } catch (e) {
    console.error("Resend prescription email error (non-fatal):", e);
  }

  revalidatePath(`/dashboard/medico/consultas/${aptId}`);
  revalidatePath("/dashboard/medico/recetas");
  revalidatePath("/dashboard/medico");
  return { success: true, prescriptionId: rx.id };
}
