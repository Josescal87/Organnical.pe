import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Video } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import type { AppointmentStatus, AppointmentSpecialty } from "@/lib/supabase/database.types";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

type AppointmentWithPatient = {
  id: string;
  slot_start: string;
  status: AppointmentStatus;
  specialty: AppointmentSpecialty;
  meeting_link: string | null;
  patient_id: string;
};

const STATUS: Record<AppointmentStatus, { label: string; color: string }> = {
  pending:   { label: "Pendiente",  color: "bg-amber-50 text-amber-600 border-amber-100" },
  confirmed: { label: "Confirmada", color: "bg-sky-50 text-sky-600 border-sky-100" },
  completed: { label: "Completada", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  cancelled: { label: "Cancelada",  color: "bg-zinc-100 text-zinc-500 border-zinc-200" },
};

const SPECIALTY: Record<AppointmentSpecialty, { label: string; icon: string }> = {
  sleep:         { label: "Sueño",          icon: "🌙" },
  pain:          { label: "Dolor Crónico",  icon: "🦴" },
  anxiety:       { label: "Ansiedad",       icon: "🧠" },
  womens_health: { label: "Salud Femenina", icon: "🌸" },
};

function groupByDate(apts: AppointmentWithPatient[]) {
  const groups: Record<string, AppointmentWithPatient[]> = {};
  for (const apt of apts) {
    const key = new Date(apt.slot_start).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(apt);
  }
  return groups;
}

export default async function ConsultasMedicoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aptsData } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, slot_start, status, specialty, meeting_link, patient_id")
    .eq("doctor_id", user.id)
    .order("slot_start", { ascending: false });

  const appointments = (aptsData ?? []) as AppointmentWithPatient[];
  const upcoming = appointments.filter((a) => ["pending", "confirmed"].includes(a.status));
  const past = appointments.filter((a) => ["completed", "cancelled"].includes(a.status));

  const upcomingGroups = groupByDate(upcoming);
  const today = new Date().toDateString();

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-8">
        <BackLink href="/dashboard/medico" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Consultas</h1>
        <p className="text-zinc-500 text-sm mt-1">{upcoming.length} consulta{upcoming.length !== 1 ? "s" : ""} programada{upcoming.length !== 1 ? "s" : ""}.</p>
      </div>

      {/* Próximas agrupadas por día */}
      {Object.keys(upcomingGroups).length > 0 ? (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-5">Programadas</h2>
          <div className="space-y-6">
            {Object.entries(upcomingGroups).map(([dateStr, apts]) => {
              const date = new Date(dateStr);
              const isToday = dateStr === today;
              return (
                <div key={dateStr}>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-sm font-bold text-[#0B1D35]">
                      {isToday ? "🔴 Hoy — " : ""}
                      {date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    <div className="flex-1 h-px bg-zinc-100" />
                    <span className="text-xs text-zinc-400">{apts.length} cita{apts.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-3">
                    {apts.map((apt) => <ConsultaCard key={apt.id} apt={apt} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="bg-white rounded-2xl p-10 border border-zinc-100 text-center mb-8">
          <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="font-semibold text-zinc-600">Sin consultas programadas</p>
        </div>
      )}

      {/* Historial */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Historial</h2>
          <div className="space-y-3 opacity-70">
            {past.slice(0, 10).map((apt) => <ConsultaCard key={apt.id} apt={apt} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ConsultaCard({ apt }: { apt: AppointmentWithPatient }) {
  const st = STATUS[apt.status];
  const vt = SPECIALTY[apt.specialty];
  const date = new Date(apt.slot_start);
  const now = new Date();
  const minutesUntil = (date.getTime() - now.getTime()) / 60000;
  const isImminent = minutesUntil > 0 && minutesUntil < 30;

  return (
    <div className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center gap-4 ${
      isImminent ? "border-violet-300 shadow-md shadow-violet-50" : "border-zinc-100"
    }`}>
      {isImminent && (
        <div className="sm:hidden">
          <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white animate-pulse" style={{ background: G }}>
            ¡En {Math.round(minutesUntil)} min!
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {isImminent && (
            <span className="hidden sm:inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white animate-pulse" style={{ background: G }}>
              ¡En {Math.round(minutesUntil)} min!
            </span>
          )}
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.color}`}>
            {st.label}
          </span>
          <span className="text-sm">{vt.icon} {vt.label}</span>
        </div>
        <p className="text-sm font-semibold text-[#0B1D35]">
          {date.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" })}
          {" · "}
          {date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/dashboard/medico/consultas/${apt.id}`}
          className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 hover:border-[#A78BFA] hover:text-[#A78BFA] transition-all"
        >
          Ver detalle
        </Link>
        {apt.meeting_link && ["pending", "confirmed"].includes(apt.status) && (
          <a
            href={apt.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white"
            style={{ background: G }}
          >
            <Video className="w-3.5 h-3.5" /> Unirse
          </a>
        )}
      </div>
    </div>
  );
}
