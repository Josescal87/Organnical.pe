import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET(req: NextRequest) {
  const numero = req.nextUrl.searchParams.get("numero")?.trim().toUpperCase();
  if (!numero) return NextResponse.json({ error: "Número de receta requerido" }, { status: 400 });

  const admin = adminClient();

  const { data: rx } = await admin
    .schema("medical")
    .from("prescriptions")
    .select("id, prescription_number, issued_at, valid_until, diagnosis_cie10, diagnosis_label, doctor_id, ipress_code:appointment_id")
    .eq("prescription_number", numero)
    .single();

  if (!rx) return NextResponse.json({ found: false });

  // Fetch doctor profile (only public fields)
  const { data: doctor } = await admin
    .schema("medical")
    .from("profiles")
    .select("full_name, cmp, specialty_label")
    .eq("id", rx.doctor_id)
    .single();

  // Fetch IPRESS code from system_config
  const { data: ipressRow } = await admin
    .schema("medical")
    .from("system_config")
    .select("value")
    .eq("key", "ipress_code")
    .single();

  const now = new Date();
  const validUntil = new Date(rx.valid_until);
  const status = validUntil >= now ? "VÁLIDA" : "VENCIDA";

  return NextResponse.json({
    found: true,
    prescription_number: rx.prescription_number,
    issued_at: rx.issued_at,
    valid_until: rx.valid_until,
    status,
    doctor_name: doctor?.full_name ?? "—",
    doctor_cmp: doctor?.cmp ?? "—",
    doctor_specialty: doctor?.specialty_label ?? "—",
    ipress_code: ipressRow?.value ?? "—",
    diagnosis_cie10: rx.diagnosis_cie10 ?? null,
  });
}
