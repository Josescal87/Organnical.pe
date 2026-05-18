/**
 * GET /api/public/doctors
 *
 * Devuelve los perfiles de médicos publicables (campos no-PII) para el wizard
 * de /agendar y otras vistas de cara al público. Usa admin client para bypass
 * de RLS — las columnas seleccionadas son las mismas que ya se muestran en la
 * landing pública.
 */
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type PublicDoctor = {
  id: string;
  full_name: string | null;
  cmp: string | null;
  photo_url: string | null;
  specialty_label: string | null;
  verticals: string[];
  rating: number;
  reviews_count: number;
  weekly_schedule: Record<string, number[]> | null;
};

export async function GET() {
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data, error } = await admin
    .schema("medical")
    .from("profiles")
    .select("id, full_name, cmp, photo_url, specialty_label, verticals, rating, reviews_count, weekly_schedule")
    .eq("role", "doctor");

  if (error) {
    return NextResponse.json({ doctors: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ doctors: (data ?? []) as PublicDoctor[] });
}
