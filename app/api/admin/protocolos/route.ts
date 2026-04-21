import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase.schema("medical").from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

  const { slug, url } = await req.json() as { slug: string; url: string };
  if (!slug || !url) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  const admin = adminClient();
  const { error } = await admin.schema("medical").from("system_config").upsert(
    { key: `protocol_${slug}`, value: url, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
