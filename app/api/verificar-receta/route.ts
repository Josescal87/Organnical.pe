import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { isIpressEnabled } from "@/lib/ipress-config";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await checkRateLimit(`verificar-receta:${ip}`, 30, 60 * 1000))) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const numero = req.nextUrl.searchParams.get("numero")?.trim().toUpperCase();
  if (!numero) return NextResponse.json({ error: "Número de receta requerido" }, { status: 400 });

  // Verificar si el request viene de un usuario autenticado
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const admin = adminClient();

  const { data: rx } = await admin
    .schema("medical")
    .from("prescriptions")
    .select("id, prescription_number, issued_at, valid_until, diagnosis_cie10, doctor_id")
    .eq("prescription_number", numero)
    .single();

  if (!rx) return NextResponse.json({ found: false });

  const now = new Date();
  const validUntil = new Date(rx.valid_until);
  const status = validUntil >= now ? "VÁLIDA" : "VENCIDA";

  // Sin auth: solo estado de validez
  if (!isAuthenticated) {
    return NextResponse.json({
      found: true,
      prescription_number: rx.prescription_number,
      status,
    });
  }

  // Con auth: datos completos del médico + IPRESS
  const [doctorRes, ipressRes, ipressEnabled] = await Promise.all([
    admin.schema("medical").from("profiles")
      .select("full_name, cmp, specialty_label")
      .eq("id", rx.doctor_id)
      .single(),
    admin.schema("medical").from("system_config")
      .select("value")
      .eq("key", "ipress_code")
      .single(),
    isIpressEnabled(),
  ]);

  return NextResponse.json({
    found: true,
    prescription_number: rx.prescription_number,
    issued_at: rx.issued_at,
    valid_until: rx.valid_until,
    status,
    doctor_name: doctorRes.data?.full_name ?? "—",
    doctor_cmp: doctorRes.data?.cmp ?? "—",
    doctor_specialty: doctorRes.data?.specialty_label ?? "—",
    ...(ipressEnabled ? { ipress_code: ipressRes.data?.value ?? "—" } : {}),
    diagnosis_cie10: rx.diagnosis_cie10 ?? null,
  });
}
