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

  const emails: string[] = [];
  await Promise.all(
    adminProfiles.map(async (p) => {
      const { data } = await admin.auth.admin.getUserById(p.id);
      if (data?.user?.email) emails.push(data.user.email);
    })
  );
  return emails;
}
