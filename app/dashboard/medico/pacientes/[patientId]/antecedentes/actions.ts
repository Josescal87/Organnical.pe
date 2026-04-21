"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MedicationItem = {
  name: string;
  dose: string;
  frequency: string;
};

export type AllergyItem = {
  substance: string;
  reaction: string;
  severity: "leve" | "moderada" | "grave";
};

export type BackgroundFormData = {
  chronic_conditions: string[];
  previous_surgeries: string[];
  previous_hospitalizations: string[];
  current_medications: MedicationItem[];
  allergies: AllergyItem[];
  family_history: string[];
  smoking_status: string;
  alcohol_use: string;
};

export async function createOrUpdateBackground(
  patientId: string,
  data: BackgroundFormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .schema("medical")
    .from("patient_background")
    .upsert(
      {
        patient_id:               patientId,
        chronic_conditions:       data.chronic_conditions.filter(Boolean),
        previous_surgeries:       data.previous_surgeries.filter(Boolean),
        previous_hospitalizations: data.previous_hospitalizations.filter(Boolean),
        current_medications:      data.current_medications,
        allergies:                data.allergies,
        family_history:           data.family_history.filter(Boolean),
        smoking_status:           data.smoking_status || null,
        alcohol_use:              data.alcohol_use || null,
        last_updated_by:          user.id,
        updated_at:               new Date().toISOString(),
      },
      { onConflict: "patient_id" }
    );

  if (error) return { error: error.message };

  // Registrar en audit log (non-fatal)
  try {
    await supabase.schema("medical").rpc("log_event", {
      p_action:        "update",
      p_resource_type: "patient_background",
      p_resource_id:   patientId,
      p_patient_id:    patientId,
    });
  } catch {}

  revalidatePath(`/dashboard/medico/pacientes/${patientId}/antecedentes`);
  revalidatePath(`/dashboard/medico/consultas`);
  return { success: true };
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
