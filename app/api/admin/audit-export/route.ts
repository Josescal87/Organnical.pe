import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase.schema("medical").from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

  const from = req.nextUrl.searchParams.get("from") ?? new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const to   = req.nextUrl.searchParams.get("to")   ?? new Date().toISOString();

  const admin = adminClient();
  const { data: logs } = await admin
    .schema("medical")
    .from("audit_log")
    .select("id, event_time, actor_id, actor_role, actor_ip, action, resource_type, resource_id, patient_id")
    .gte("event_time", from)
    .lte("event_time", to)
    .order("event_time", { ascending: false })
    .limit(10000);

  const rows = logs ?? [];
  const headers = ["ID", "Fecha/Hora", "Actor ID", "Rol", "IP", "Acción", "Recurso", "Resource ID", "Paciente ID"];
  const csv = [
    headers,
    ...rows.map((r) => [
      r.id,
      new Date(r.event_time).toLocaleString("es-PE", { timeZone: "America/Lima" }),
      r.actor_id ?? "",
      r.actor_role ?? "",
      r.actor_ip ?? "",
      r.action,
      r.resource_type,
      r.resource_id,
      r.patient_id ?? "",
    ]),
  ]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const filename = `audit-log-${from.split("T")[0]}-${to.split("T")[0]}.csv`;
  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
