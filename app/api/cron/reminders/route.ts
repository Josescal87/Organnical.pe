import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendWhatsAppTemplate } from "@/lib/whatsapp/wati";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

// Vercel Cron job — invoked via cron.json or Vercel dashboard
// Messages must NOT include clinical data (PHI) — logistics only
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = adminClient();
  const now = new Date();

  // 24h reminder: appointments starting in 23–25 hours
  const from24h = new Date(now.getTime() + 23 * 3600 * 1000).toISOString();
  const to24h   = new Date(now.getTime() + 25 * 3600 * 1000).toISOString();

  const { data: upcoming } = await admin
    .schema("medical")
    .from("appointments")
    .select("id, slot_start, meeting_link, patient_id, doctor_id, specialty, profiles!patient_id(full_name, phone)")
    .in("status", ["confirmed", "pending"])
    .gte("slot_start", from24h)
    .lte("slot_start", to24h);

  let sent = 0;
  for (const apt of upcoming ?? []) {
    const profile = Array.isArray(apt.profiles) ? apt.profiles[0] : apt.profiles;
    const phone = (profile as { phone?: string | null })?.phone;
    const name  = (profile as { full_name?: string | null })?.full_name ?? "Paciente";

    if (!phone) continue;

    // Check WhatsApp opt-in
    const { data: patientProfile } = await admin
      .schema("medical")
      .from("profiles")
      .select("whatsapp_opt_in")
      .eq("id", apt.patient_id)
      .maybeSingle();

    if (!patientProfile?.whatsapp_opt_in) continue;

    const slotDate = new Date(apt.slot_start);
    const timeStr  = slotDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" });

    const ok = await sendWhatsAppTemplate(phone, "cita_recordatorio_24h", [
      name.split(" ")[0],
      timeStr,
      apt.meeting_link ?? "Ver en la app",
    ]);

    if (ok) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
