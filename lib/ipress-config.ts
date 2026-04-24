import { createClient } from "@supabase/supabase-js";

export type IpressMode = "disabled" | "enabled";

let _client: ReturnType<typeof createClient> | null = null;
function adminClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );
  }
  return _client;
}

export async function getIpressMode(): Promise<IpressMode> {
  try {
    const { data } = await adminClient()
      .schema("medical")
      .from("system_config")
      .select("value")
      .eq("key", "ipress_mode")
      .single();
    const raw = data?.value;
    return raw === "enabled" ? "enabled" : "disabled";
  } catch {
    return "disabled";
  }
}

export async function isIpressEnabled(): Promise<boolean> {
  return (await getIpressMode()) === "enabled";
}
