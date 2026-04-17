import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "no session" });

  const { data: apts, error: aptsError } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, doctor_id, status")
    .eq("doctor_id", user.id);

  const { data: profile, error: profileError } = await supabase
    .schema("medical")
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    jwtRole: user.user_metadata?.role,
    profile,
    profileError: profileError?.message,
    appointments: apts,
    appointmentsError: aptsError?.message,
  });
}
