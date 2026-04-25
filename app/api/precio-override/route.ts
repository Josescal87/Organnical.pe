import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ precio_override: null });

  const { data } = await supabase
    .schema("medical")
    .from("profiles")
    .select("precio_override")
    .eq("id", user.id)
    .single() as { data: { precio_override: number | null } | null };

  return NextResponse.json({ precio_override: data?.precio_override ?? null });
}
