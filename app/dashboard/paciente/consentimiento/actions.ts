"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export const CONSENT_VERSIONS = {
  general_treatment: "v1.0",
  telemedicine:      "v1.0",
  cannabis_use:      "v1.0",
  data_processing:   "v1.0",
} as const;

export type ConsentType = keyof typeof CONSENT_VERSIONS;

export const CONSENT_TEXTS: Record<ConsentType, string> = {
  general_treatment: `Autorizo a los médicos de Organnical Salud S.A.C. a realizar las evaluaciones,
diagnósticos y tratamientos necesarios para mi atención médica, de acuerdo con las normas éticas
y legales vigentes en el Perú. Entiendo que tengo derecho a recibir información sobre mi estado de
salud y a tomar decisiones informadas sobre mi tratamiento.`,

  telemedicine: `Acepto recibir atención médica mediante teleconsulta (videollamada). Entiendo que
la telemedicina tiene limitaciones comparada con la atención presencial, y que el médico puede
recomendarme una consulta presencial si lo considera necesario. La consulta se realiza a través de
una plataforma segura y mis datos son confidenciales.`,

  cannabis_use: `Declaro haber sido informado(a) sobre el uso terapéutico de cannabis medicinal
conforme a la Ley N° 30681 y su reglamento. Entiendo que el tratamiento con cannabis medicinal
requiere prescripción médica, que los productos son de uso exclusivamente terapéutico, y que estoy
bajo supervisión médica durante el tratamiento. Me comprometo a no ceder, vender ni transferir los
productos recetados.`,

  data_processing: `Autorizo el tratamiento de mis datos personales de salud por parte de Organnical
Salud S.A.C., conforme a la Ley N° 29733 (Ley de Protección de Datos Personales). Mis datos serán
utilizados exclusivamente para mi atención médica y no serán compartidos con terceros sin mi
consentimiento, salvo obligación legal. Puedo solicitar su rectificación, cancelación u oposición
en cualquier momento.`,
};

export async function recordConsent(consentType: ConsentType, accepted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const text = CONSENT_TEXTS[consentType];
  const hash = createHash("sha256").update(text).digest("hex");

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? null;
  const device = headersList.get("user-agent") ?? null;

  const { error } = await supabase
    .schema("medical")
    .from("consent_records")
    .insert({
      patient_id:        user.id,
      consent_type:      consentType,
      consent_text_hash: hash,
      consent_version:   CONSENT_VERSIONS[consentType],
      accepted,
      accepted_at:       accepted ? new Date().toISOString() : null,
      patient_ip:        ip,
      patient_device:    device,
    });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/paciente/consentimiento");
  return { success: true };
}

export async function getMyConsents() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .schema("medical")
    .from("consent_records")
    .select("consent_type, accepted, accepted_at, consent_version")
    .eq("patient_id", user.id)
    .order("accepted_at", { ascending: false });

  // Retornar solo el más reciente por tipo
  const latest: Record<string, typeof data extends (infer T)[] | null ? T : never> = {};
  for (const row of data ?? []) {
    if (!latest[row.consent_type]) latest[row.consent_type] = row;
  }
  return Object.values(latest);
}
