import { createClient } from "@supabase/supabase-js";

export type IpressMode = "disabled" | "enabled";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function getIpressMode(): Promise<IpressMode> {
  const { data } = await adminClient()
    .schema("medical")
    .from("system_config")
    .select("value")
    .eq("key", "ipress_mode")
    .single();
  return (data?.value as IpressMode) ?? "disabled";
}

export async function isIpressEnabled(): Promise<boolean> {
  return (await getIpressMode()) === "enabled";
}
