"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { CONSENT_TEXTS, CONSENT_VERSIONS, type ConsentType } from "./constants";

export type { ConsentType };

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

  const latest: Record<string, typeof data extends (infer T)[] | null ? T : never> = {};
  for (const row of data ?? []) {
    if (!latest[row.consent_type]) latest[row.consent_type] = row;
  }
  return Object.values(latest);
}
