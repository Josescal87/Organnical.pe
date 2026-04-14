import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Video, User, Calendar, Stethoscope } from "lucide-react";
import type { AppointmentStatus, AppointmentSpecialty } from "@/lib/supabase/database.types";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const STATUS: Record<AppointmentStatus, { label: string; color: string }> = {
  pending:   { label: "Pendiente",  color: "bg-amber-50 text-amber-600" },
  confirmed: { label: "Confirmada", color: "bg-sky-50 text-sky-600" },
  completed: { label: "Completada", color: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Cancelada",  color: "bg-zinc-100 text-zinc-500" },
};

const SPECIALTY: Record<AppointmentSpecialty, { label: string; icon: string }> = {
  sleep:         { label: "Sueño",          icon: "🌙" },
  pain:          { label: "Dolor Crónico",  icon: "🦴" },
  anxiety:       { label: "Ansiedad",       icon: "🧠" },
  womens_health: { label: "Salud Femenina", icon: "🌸" },
};

type AptRow = {
  id: string;
  slot_start: string;
  status: AppointmentStatus;
  specialty: AppointmentSpecialty;
  meeting_link: string | null;
  clinical_notes: string | null;
  patient_id: string;
};

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  document_id: string | null;
};

export default async function ConsultaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aptData } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, slot_start, status, specialty, meeting_link, clinical_notes, patient_id")
    .eq("id", id)
    .eq("doctor_id", user.id)
    .single();

  const apt = aptData as AptRow | null;
  if (!apt) notFound();

  const { data: patientData } = await supabase
    .schema("medical")
    .from("profiles")
    .select("full_name, phone, document_id")
    .eq("id", apt.patient_id)
    .single();

  const patient = patientData as ProfileRow | null;

  const st = STATUS[apt.status];
  const vt = SPECIALTY[apt.specialty];
  const date = new Date(apt.slot_start);
  const canJoin = apt.meeting_link && ["pending", "confirmed"].includes(apt.status);

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <Link href="/dashboard/medico/consultas" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a consultas
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-2xl font-black text-[#0B1D35]">Detalle de consulta</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.color}`}>{st.label}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Cita info */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Datos de la consulta
          </p>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-zinc-400">Especialidad</dt>
              <dd className="font-semibold text-[#0B1D35]">{vt.icon} {vt.label}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">Fecha y hora</dt>
              <dd className="font-semibold text-[#0B1D35]">
                {date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                <br />
                <span className="text-zinc-500">{date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</span>
              </dd>
            </div>
          </dl>
          {canJoin && (
            <a
              href={apt.meeting_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: G }}
            >
              <Video className="w-4 h-4" /> Unirse a la videollamada
            </a>
          )}
        </div>

        {/* Patient info */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Paciente
          </p>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-zinc-400">Nombre</dt>
              <dd className="font-semibold text-[#0B1D35]">{patient?.full_name ?? "Sin nombre"}</dd>
            </div>
            {patient?.document_id && (
              <div>
                <dt className="text-xs text-zinc-400">DNI</dt>
                <dd className="font-semibold text-[#0B1D35]">{patient.document_id}</dd>
              </div>
            )}
            {patient?.phone && (
              <div>
                <dt className="text-xs text-zinc-400">Teléfono</dt>
                <dd>
                  <a
                    href={`https://wa.me/51${patient.phone.replace(/\s/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#A78BFA] hover:underline"
                  >
                    {patient.phone}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Clinical notes */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-100">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
          <Stethoscope className="w-3.5 h-3.5" /> Notas clínicas
        </p>
        {apt.clinical_notes ? (
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{apt.clinical_notes}</p>
        ) : (
          <p className="text-sm text-zinc-400 italic">Sin notas clínicas registradas.</p>
        )}
      </div>
    </div>
  );
}
