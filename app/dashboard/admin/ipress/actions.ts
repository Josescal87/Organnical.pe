"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export type IpressConfig = {
  ipress_code: string;
  ipress_name: string;
  ipress_ruc: string;
  ipress_address: string;
  ipress_category: string;
  pdf_header_logo_url: string;
  retention_years_clinical: string;
  retention_years_payments: string;
};

export async function updateIpressConfig(config: IpressConfig) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: profile } = await supabase
    .schema("medical")
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Solo administradores pueden modificar la configuración IPRESS" };

  const admin = adminClient();
  const entries = Object.entries(config) as [string, string][];
  for (const [key, value] of entries) {
    const { error } = await admin
      .schema("medical")
      .from("system_config")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) return { error: `Error al guardar ${key}: ${error.message}` };
  }

  revalidatePath("/dashboard/admin/ipress");
  return { success: true };
}

export async function activateIpressMode(): Promise<{ error?: string }> {
  const admin = adminClient();
  // Verify ipress_code is set and not PENDIENTE before allowing activation
  const { data: codeRow } = await admin
    .schema("medical")
    .from("system_config")
    .select("value")
    .eq("key", "ipress_code")
    .single();

  const code = codeRow?.value;
  if (!code || code === "PENDIENTE" || code.trim() === "") {
    return { error: "Configura el código IPRESS antes de activar el modo IPRESS." };
  }

  const { error } = await admin
    .schema("medical")
    .from("system_config")
    .upsert({ key: "ipress_mode", value: "enabled", updated_at: new Date().toISOString() }, { onConflict: "key" });

  return error ? { error: error.message } : {};
}

export async function deactivateIpressMode(): Promise<{ error?: string }> {
  const admin = adminClient();
  const { error } = await admin
    .schema("medical")
    .from("system_config")
    .upsert({ key: "ipress_mode", value: "disabled", updated_at: new Date().toISOString() }, { onConflict: "key" });

  return error ? { error: error.message } : {};
}
