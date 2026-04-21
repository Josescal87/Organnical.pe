export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Video, User, Calendar, ClipboardList } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import type { AppointmentStatus, AppointmentSpecialty, Producto } from "@/lib/supabase/database.types";
import ClinicalNotesEditor from "./ClinicalNotesEditor";
import ClinicalEncounterForm from "./ClinicalEncounterForm";
import StatusButtons from "./StatusButtons";
import PrescriptionForm from "./PrescriptionForm";
import CalendarButtons from "@/components/CalendarButtons";
import { getEncounter } from "./ehr-actions";

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

export default async function ConsultaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [aptResult, productosResult, prescriptionResult, encounter, doctorResult] = await Promise.all([
    supabase
      .schema("medical")
      .from("appointments")
      .select("id, slot_start, status, specialty, meeting_link, meeting_provider, meeting_host_link, clinical_notes, patient_id")
      .eq("id", id)
      .eq("doctor_id", user.id)
      .single(),

    supabase
      .from("productos")
      .select("sku, descripcion, precio, categoria")
      .order("descripcion"),

    supabase
      .schema("medical")
      .from("prescriptions")
      .select("id, issued_at, valid_until, diagnosis_cie10, diagnosis_label, prescription_items(producto_sku, quantity, dosage_instructions)")
      .eq("appointment_id", id)
      .maybeSingle(),

    getEncounter(id),

    supabase
      .schema("medical")
      .from("profiles")
      .select("full_name, cmp, rne")
      .eq("id", user.id)
      .single(),
  ]);

  const apt = aptResult.data as {
    id: string;
    slot_start: string;
    status: AppointmentStatus;
    specialty: AppointmentSpecialty;
    meeting_link: string | null;
    meeting_provider: string | null;
    meeting_host_link: string | null;
    clinical_notes: string | null;
    patient_id: string;
  } | null;

  if (!apt) notFound();

  const productos = (productosResult.data ?? []) as Producto[];

  const rxRaw = prescriptionResult.data as {
    id: string;
    issued_at: string;
    valid_until: string;
    diagnosis_cie10: string | null;
    diagnosis_label: string | null;
    prescription_items: { producto_sku: string; quantity: number; dosage_instructions: string | null }[];
  } | null;

  const existingPrescription = rxRaw
    ? {
        ...rxRaw,
        items: rxRaw.prescription_items.map((it) => ({
          ...it,
          nombre: productos.find((p) => p.sku === it.producto_sku)?.descripcion ?? it.producto_sku,
        })),
      }
    : null;

  const { data: patientData } = await supabase
    .schema("medical")
    .from("profiles")
    .select("full_name, phone, document_id")
    .eq("id", apt.patient_id)
    .single();

  const patient = patientData as { full_name: string | null; phone: string | null; document_id: string | null } | null;

  const { data: patientRecord } = await supabase
    .schema("medical")
    .from("patient_records")
    .select("hc_number")
    .eq("patient_id", apt.patient_id)
    .maybeSingle();

  const doctor = doctorResult.data as { full_name: string | null; cmp: string | null; rne: string | null } | null;

  const st = STATUS[apt.status];
  const vt = SPECIALTY[apt.specialty];
  const date = new Date(apt.slot_start);
  // Prefer host link (Whereby) for doctor; fall back to patient link
  const doctorMeetLink = apt.meeting_host_link ?? apt.meeting_link;
  const canJoin = doctorMeetLink && ["pending", "confirmed"].includes(apt.status);

  // La receta solo se puede emitir si la HC está firmada
  const encounterSigned = encounter?.status === "signed";

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <BackLink href="/dashboard/medico/consultas" label="Volver a consultas" />
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-2xl font-black text-[#0B1D35]">Detalle de consulta</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.color}`}>{st.label}</span>
          {doctor?.cmp && doctor.cmp !== "PENDIENTE" && (
            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-violet-50 text-violet-700">
              {doctor.full_name ? `Dr/a. ${doctor.full_name.split(" ")[0]}` : "Médico"} · CMP {doctor.cmp}{doctor.rne ? ` · RNE ${doctor.rne}` : ""}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
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
              href={doctorMeetLink!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: G }}
            >
              <Video className="w-4 h-4" />
              {apt.meeting_provider === "whereby" ? "Unirse (Whereby)" : "Unirse a la videollamada"}
            </a>
          )}
          {["pending", "confirmed"].includes(apt.status) && (
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <CalendarButtons
                compact
                event={{
                  title:       `Consulta Organnical — ${vt.label}`,
                  description: `Teleconsulta de ${vt.label}\nPaciente: ${patient?.full_name ?? "Paciente"}${apt.meeting_link ? `\nLink: ${apt.meeting_link}` : ""}\n\nSoporte: reservas@organnical.com`,
                  startISO:    apt.slot_start,
                  endISO:      new Date(date.getTime() + 25 * 60 * 1000).toISOString(),
                  location:    apt.meeting_link ?? undefined,
                }}
              />
            </div>
          )}
        </div>

        {/* Paciente info */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Paciente
          </p>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-zinc-400">Nombre</dt>
              <dd className="font-semibold text-[#0B1D35]">{patient?.full_name ?? "Sin nombre"}</dd>
            </div>
            {patientRecord?.hc_number && (
              <div>
                <dt className="text-xs text-zinc-400">N° HC</dt>
                <dd className="font-mono text-xs font-bold text-violet-600">{patientRecord.hc_number}</dd>
              </div>
            )}
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
          {/* Link a antecedentes */}
          <Link
            href={`/dashboard/medico/pacientes/${apt.patient_id}/antecedentes`}
            className="mt-4 flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-800"
          >
            <ClipboardList className="w-3.5 h-3.5" /> Ver antecedentes del paciente
          </Link>
        </div>
      </div>

      {/* Estado — solo si no está completada/cancelada */}
      {!["completed", "cancelled"].includes(apt.status) && (
        <div className="mb-4">
          <StatusButtons aptId={apt.id} currentStatus={apt.status} />
        </div>
      )}

      {/* Historia Clínica Estructurada (Sprint 3) */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-display font-bold text-[#0B1D35] text-lg">Historia Clínica</h2>
          {encounter?.status === "signed" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Firmada</span>
          )}
          {encounter?.status === "draft" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Borrador</span>
          )}
        </div>
        <ClinicalEncounterForm aptId={apt.id} existing={encounter as Parameters<typeof ClinicalEncounterForm>[0]["existing"]} />
      </div>

      {/* Notas clínicas legacy — solo si la cita no tiene HC estructurada */}
      {!encounter && apt.clinical_notes && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Notas anteriores (legado)</p>
          <ClinicalNotesEditor aptId={apt.id} initialNotes={apt.clinical_notes} />
        </div>
      )}

      {/* Receta — requiere HC firmada */}
      {apt.status !== "cancelled" && (
        <div>
          {!encounterSigned && (
            <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 font-medium">
              Debes firmar la historia clínica antes de emitir una receta.
            </div>
          )}
          <PrescriptionForm
            aptId={apt.id}
            patientId={apt.patient_id}
            productos={productos}
            existing={existingPrescription}
            disabled={!encounterSigned}
          />
        </div>
      )}
    </div>
  );
}
