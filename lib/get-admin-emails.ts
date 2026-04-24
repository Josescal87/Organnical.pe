import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function getAdminEmails(): Promise<string[]> {
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: adminProfiles } = await admin
    .schema("medical")
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!adminProfiles?.length) return [];

  const adminIds = new Set(adminProfiles.map((p) => p.id));

  // Una sola llamada a Auth en lugar de N llamadas individuales
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });

  return users
    .filter((u) => adminIds.has(u.id) && u.email)
    .map((u) => u.email!);
}
