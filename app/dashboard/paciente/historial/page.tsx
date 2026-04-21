export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { ClipboardList, ChevronRight, CheckCircle2, FileText } from "lucide-react";

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role;
  if (role !== "patient") redirect("/dashboard/medico");

  const [encountersResult, hcResult] = await Promise.all([
    supabase
      .schema("medical")
      .from("clinical_encounters")
      .select("id, signed_at, chief_complaint, diagnoses, treatment_plan, appointments(slot_start, specialty)")
      .eq("patient_id", user.id)
      .eq("status", "signed")
      .order("signed_at", { ascending: false }),

    supabase
      .schema("medical")
      .from("patient_records")
      .select("hc_number")
      .eq("patient_id", user.id)
      .maybeSingle(),
  ]);

  const encounters = (encountersResult.data ?? []) as unknown as {
    id: string;
    signed_at: string;
    chief_complaint: string;
    diagnoses: { cie10_code: string; cie10_description: string; type: string }[];
    treatment_plan: string;
    appointments: { slot_start: string; specialty: string } | null;
  }[];

  const hcNumber = hcResult.data?.hc_number;

  const SPECIALTY: Record<string, string> = {
    sleep: "🌙 Sueño", pain: "🦴 Dolor Crónico",
    anxiety: "🧠 Ansiedad", womens_health: "🌸 Salud Femenina",
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <BackLink href="/dashboard/paciente" />
        <div className="flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi historial clínico</h1>
            {hcNumber && (
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">{hcNumber}</p>
            )}
          </div>
        </div>
      </div>

      {encounters.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Aún no tienes historias clínicas firmadas.</p>
          <p className="text-zinc-300 text-xs mt-1">Aparecerán aquí después de tu primera consulta.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {encounters.map((enc) => {
            const principal = enc.diagnoses?.find(d => d.type === "principal");
            const date = new Date(enc.signed_at);
            const specialty = enc.appointments?.specialty
              ? SPECIALTY[enc.appointments.specialty] ?? enc.appointments.specialty
              : null;
            return (
              <Link
                key={enc.id}
                href={`/dashboard/paciente/historial/${enc.id}`}
                className="block bg-white rounded-2xl border border-zinc-100 p-4 hover:border-violet-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-[#0B1D35]">
                        {date.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                      {specialty && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium">{specialty}</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate mb-1.5">{enc.chief_complaint}</p>
                    {principal && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-violet-600">{principal.cie10_code}</span>
                        <span className="text-[10px] text-zinc-500 truncate">{principal.cie10_description}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-violet-400 flex-shrink-0 mt-1 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
