export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { Users, ChevronRight, AlertTriangle } from "lucide-react";

export default async function PacientesListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role;
  if (role !== "doctor" && role !== "admin") redirect("/dashboard/paciente");

  // Distinct patients who have appointments with this doctor
  const { data: apts } = await supabase
    .schema("medical")
    .from("appointments")
    .select("patient_id, slot_start, specialty, status")
    .eq("doctor_id", user.id)
    .order("slot_start", { ascending: false });

  // Unique patient IDs with their latest appointment
  const patientMap = new Map<string, { latest: string; specialty: string; status: string }>();
  for (const apt of apts ?? []) {
    if (!patientMap.has(apt.patient_id)) {
      patientMap.set(apt.patient_id, { latest: apt.slot_start, specialty: apt.specialty, status: apt.status });
    }
  }
  const patientIds = [...patientMap.keys()];

  // Fetch patient profiles
  const { data: profiles } = patientIds.length
    ? await supabase
        .schema("medical")
        .from("profiles")
        .select("id, full_name, document_id")
        .in("id", patientIds)
    : { data: [] };

  const { data: records } = patientIds.length
    ? await supabase
        .schema("medical")
        .from("patient_records")
        .select("patient_id, hc_number")
        .in("patient_id", patientIds)
    : { data: [] };

  const { data: backgrounds } = patientIds.length
    ? await supabase
        .schema("medical")
        .from("patient_background")
        .select("patient_id, allergies")
        .in("patient_id", patientIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));
  const recordMap  = Object.fromEntries((records ?? []).map(r => [r.patient_id, r]));
  const bgMap      = Object.fromEntries((backgrounds ?? []).map(b => [b.patient_id, b]));

  const SPECIALTY: Record<string, string> = {
    sleep: "🌙 Sueño", pain: "🦴 Dolor", anxiety: "🧠 Ansiedad", womens_health: "🌸 Salud Femenina",
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <BackLink href="/dashboard/medico" />
        <div className="flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 flex-shrink-0">
            <Users className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mis pacientes</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{patientIds.length} paciente{patientIds.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {patientIds.length === 0 ? (
        <p className="text-zinc-400 text-sm text-center py-16">Aún no tienes pacientes con citas agendadas.</p>
      ) : (
        <div className="space-y-2">
          {patientIds.map(pid => {
            const p = profileMap[pid];
            const rec = recordMap[pid];
            const bg = bgMap[pid];
            const apt = patientMap.get(pid);
            const hasAllergies = (bg?.allergies as unknown[])?.length > 0;

            return (
              <Link
                key={pid}
                href={`/dashboard/medico/pacientes/${pid}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-4 hover:border-violet-200 hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 text-sm font-bold text-violet-600">
                  {p?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#0B1D35]">{p?.full_name ?? "Paciente"}</p>
                    {hasAllergies && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                        <AlertTriangle className="w-3 h-3" /> Alergias
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {rec?.hc_number && <span className="font-mono text-[10px] text-violet-600 font-bold">{rec.hc_number}</span>}
                    {p?.document_id && <span className="text-[10px] text-zinc-400">DNI: {p.document_id}</span>}
                    {apt && <span className="text-[10px] text-zinc-400">{SPECIALTY[apt.specialty] ?? apt.specialty}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
