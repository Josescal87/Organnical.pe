import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CancelAppointmentButton from "@/components/CancelAppointmentButton";
import CalendarButtons from "@/components/CalendarButtons";
import { RescheduleModal } from "@/components/RescheduleModal";
import Link from "next/link";
import { Calendar, Clock, Video } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import type { AppointmentStatus, AppointmentSpecialty } from "@/lib/supabase/database.types";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

type AppointmentRow = {
  id: string;
  slot_start: string;
  doctor_id: string;
  status: AppointmentStatus;
  specialty: AppointmentSpecialty;
  meeting_link: string | null;
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

export default async function CitasPacientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aptsData } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, slot_start, doctor_id, status, specialty, meeting_link")
    .eq("patient_id", user.id)
    .order("slot_start", { ascending: false });

  const appointments = (aptsData ?? []) as AppointmentRow[];
  const upcoming = appointments.filter((a) => ["pending", "confirmed"].includes(a.status));
  const past = appointments.filter((a) => ["completed", "cancelled"].includes(a.status));

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-8">
        <BackLink href="/dashboard/paciente" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mis citas</h1>
        <p className="text-zinc-500 text-sm mt-1">Historial completo de tus consultas médicas.</p>
      </div>

      {/* CTA agendar */}
      <div
        className="rounded-2xl p-5 mb-8 flex items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #0B1D35 0%, #1a3a6e 100%)" }}
      >
        <div>
          <p className="font-semibold text-white text-sm">¿Necesitas una nueva consulta?</p>
          <p className="text-white/50 text-xs mt-0.5">Médicos disponibles hoy · Primera cita en 48h</p>
        </div>
        <Link
          href="/agendar"
          className="flex-shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ background: G }}
        >
          Agendar consulta
        </Link>
      </div>

      {/* Próximas */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Próximas</h2>
          <div className="space-y-3">
            {upcoming.map((apt) => <AppointmentCard key={apt.id} apt={apt} canCancel />)}
          </div>
        </section>
      )}

      {/* Historial */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Historial</h2>
          <div className="space-y-3">
            {past.map((apt) => <AppointmentCard key={apt.id} apt={apt} canCancel={false} />)}
          </div>
        </section>
      )}

      {appointments.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-zinc-100 text-center">
          <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="font-semibold text-zinc-600">Aún no tienes citas</p>
          <p className="text-sm text-zinc-400 mt-1">Agenda tu primera consulta en línea.</p>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ apt, canCancel }: { apt: AppointmentRow; canCancel: boolean }) {
  const st = STATUS[apt.status];
  const vt = SPECIALTY[apt.specialty];
  const date = new Date(apt.slot_start);
  const isPast = date < new Date();

  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Date block */}
      <div className="flex-shrink-0 w-14 text-center hidden sm:block">
        <p className="text-2xl font-black text-[#0B1D35] leading-none">{date.getDate()}</p>
        <p className="text-xs text-zinc-400 uppercase">
          {date.toLocaleDateString("es-PE", { month: "short" })}
        </p>
      </div>
      <div className="sm:hidden flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-zinc-400" />
        <p className="text-sm text-zinc-600">
          {date.toLocaleDateString("es-PE", { day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.color}`}>
            {st.label}
          </span>
          <span className="text-sm">{vt.icon} {vt.label}</span>
        </div>
        <p className="text-sm font-semibold text-[#0B1D35]">
          {date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {" · "}
          {date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0 items-end">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {apt.meeting_link && apt.status === "confirmed" && !isPast && (
            <Link
              href={`/consulta/${apt.id}`}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white"
              style={{ background: G }}
            >
              <Video className="w-3.5 h-3.5" /> Unirse
            </Link>
          )}
          {canCancel && !isPast && ["pending", "confirmed"].includes(apt.status) && (
            <>
              <RescheduleModal
                appointmentId={apt.id}
                doctorId={apt.doctor_id}
                currentSlotStart={apt.slot_start}
              />
              <CancelAppointmentButton appointmentId={apt.id} />
            </>
          )}
        </div>
        {["pending", "confirmed"].includes(apt.status) && (
          <CalendarButtons
            compact
            event={{
              title:       `Teleconsulta Organnical — ${vt.label}`,
              description: `Consulta de ${vt.label}\n${apt.meeting_link ? `\nLink: ${apt.meeting_link}` : ""}\n\nSoporte: reservas@organnical.com`,
              startISO:    apt.slot_start,
              endISO:      new Date(date.getTime() + 25 * 60 * 1000).toISOString(),
              location:    apt.meeting_link ?? undefined,
            }}
          />
        )}
      </div>
    </div>
  );
}
