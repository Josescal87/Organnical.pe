"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateWhatsAppOptIn(userId: string, optIn: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: "No autorizado" };

  await supabase
    .schema("medical")
    .from("profiles")
    .update({ whatsapp_opt_in: optIn })
    .eq("id", userId);

  revalidatePath("/dashboard/paciente/perfil");
  return { success: true };
}
