export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, FileText, Package, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { UserRole, AppointmentStatus, AppointmentSpecialty } from "@/lib/supabase/database.types";
import { SPECIALTY_LABELS } from "@/lib/specialty-labels";

type AppointmentRow = {
  id: string;
  slot_start: string;
  status: AppointmentStatus;
  specialty: AppointmentSpecialty;
  meeting_link: string | null;
};
type PrescriptionRow = { id: string; issued_at: string; valid_until: string; pdf_url: string | null };

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending:   { label: "Pendiente",  color: "bg-amber-50 text-amber-600",     icon: Clock },
  confirmed: { label: "Confirmada", color: "bg-sky-50 text-sky-600",         icon: CheckCircle },
  completed: { label: "Completada", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
  cancelled: { label: "Cancelada",  color: "bg-zinc-100 text-zinc-500",      icon: AlertCircle },
};

export default async function PacienteDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .schema("medical")
    .from("profiles")
    .select("role, full_name, document_id, birth_date")
    .eq("id", user.id)
    .single();

  const role = (profileData?.role ?? user.user_metadata?.role) as UserRole | undefined;
  if (role !== "patient") redirect("/dashboard/medico");

  const { data: aptsData } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, slot_start, status, specialty, meeting_link")
    .eq("patient_id", user.id)
    .order("slot_start", { ascending: false })
    .limit(5);

  const appointments = (aptsData ?? []) as AppointmentRow[];

  const { data: rxData } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select("id, issued_at, valid_until, pdf_url")
    .eq("patient_id", user.id)
    .order("issued_at", { ascending: false })
    .limit(3);

  const prescriptions = (rxData ?? []) as PrescriptionRow[];

  // Verificar consentimientos y perfil completo
  const { data: consentsData } = await supabase
    .schema("medical")
    .from("consent_records")
    .select("consent_type")
    .eq("patient_id", user.id)
    .eq("accepted", true);

  const REQUIRED_CONSENTS = ["general_treatment", "telemedicine", "cannabis_use", "data_processing"];
  const acceptedTypes = new Set((consentsData ?? []).map((c) => c.consent_type));
  const missingConsents = REQUIRED_CONSENTS.filter((t) => !acceptedTypes.has(t));
  const profileIncomplete = !profileData?.document_id || !profileData?.birth_date;
  const isReady = missingConsents.length === 0 && !profileIncomplete;

  const firstName = profileData?.full_name?.split(" ")[0] ?? "Paciente";
  const activeAppointments = appointments.filter((a) => ["pending", "confirmed"].includes(a.status));
  const activePrescriptions = prescriptions.filter((p) => new Date(p.valid_until) > new Date());

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-zinc-400 mb-1">Panel del paciente</p>
        <h1 className="font-display text-3xl font-black text-[#0B1D35]">
          Hola, {firstName} 👋
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">Aquí tienes un resumen de tu salud.</p>
      </div>

      {/* Banner: perfil incompleto */}
      {!isReady && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Completa tu perfil para acceder a consultas médicas</p>
            <p className="text-amber-600 text-xs mt-0.5">
              {profileIncomplete && missingConsents.length > 0
                ? "Falta tu DNI/fecha de nacimiento y aceptar los consentimientos médicos."
                : profileIncomplete
                ? "Falta tu DNI y/o fecha de nacimiento."
                : `Falta aceptar ${missingConsents.length} consentimiento(s) médico(s).`}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {profileIncomplete && (
              <Link href="/dashboard/paciente/perfil" className="rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-300 hover:bg-amber-100 transition-colors">
                Completar perfil
              </Link>
            )}
            {missingConsents.length > 0 && (
              <Link href="/dashboard/paciente/consentimiento" className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: G }}>
                Ver consentimientos
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Citas activas",      value: activeAppointments.length,  icon: Calendar,    href: "/dashboard/paciente/citas" },
          { label: "Recetas vigentes",   value: activePrescriptions.length, icon: FileText,    href: "/dashboard/paciente/recetas" },
          { label: "Total de consultas", value: appointments.length,        icon: CheckCircle, href: "/dashboard/paciente/citas" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 border border-zinc-100 hover:border-violet-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)" }}>
                <Icon className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-[#A78BFA] transition-colors" />
            </div>
            <p className="text-2xl font-black text-[#0B1D35]">{value}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* CTA — siempre visible */}
      <div
        className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a6e 100%)` }}
      >
        <div>
          <p className="font-display font-black text-white text-lg">
            {activeAppointments.length === 0 ? "¿Listo para tu primera consulta?" : "Agenda otra consulta"}
          </p>
          <p className="text-white/50 text-sm mt-1">Médicos disponibles hoy. Cita en menos de 48h.</p>
        </div>
        <Link
          href="/agendar"
          className="flex-shrink-0 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: G }}
        >
          Agendar consulta
        </Link>
      </div>

      {/* Asesoría Express */}
      <a
        href="https://wa.me/51952476574?text=Hola%20Organnical%2C%20quiero%20una%20asesor%C3%ADa%20express.%20Ya%20s%C3%A9%20qu%C3%A9%20producto%20necesito%20y%20solo%20requiero%20la%20prescripci%C3%B3n%20m%C3%A9dica."
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-2xl p-5 mb-8 flex items-center gap-4 hover:opacity-90 transition-opacity"
        style={{ background: "#0B1D35" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl bg-white/10">
          ⚡
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">¿Ya sabes qué producto necesitas?</p>
          <p className="text-white/50 text-xs mt-0.5">Agenda una asesoría express y obtén tu receta en minutos</p>
        </div>
        <span
          className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
        >
          Escribir →
        </span>
      </a>

      {/* Próximas citas */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[#0B1D35] text-lg">Próximas citas</h2>
          <Link href="/dashboard/paciente/citas" className="text-xs text-[#A78BFA] hover:underline font-semibold flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.slice(0, 3).map((apt) => {
              const st = STATUS_LABELS[apt.status] ?? STATUS_LABELS.pending;
              const StatusIcon = st.icon;
              const date = new Date(apt.slot_start);
              return (
                <div key={apt.id} className="bg-white rounded-2xl p-5 border border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                      <span className="text-xs text-zinc-400">{SPECIALTY_LABELS[apt.specialty] ?? apt.specialty}</span>
                    </div>
                    <p className="font-semibold text-sm text-[#0B1D35]">
                      {date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
                      {" · "}
                      {date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {apt.meeting_link && apt.status === "confirmed" && (
                    <a
                      href={apt.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: G }}
                    >
                      Unirse a la consulta
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-zinc-100 text-center">
            <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No tienes citas agendadas aún.</p>
          </div>
        )}
      </section>

      {/* Recetas activas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[#0B1D35] text-lg">Mis recetas</h2>
          <Link href="/dashboard/paciente/recetas" className="text-xs text-[#A78BFA] hover:underline font-semibold flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {prescriptions.length > 0 ? (
          <div className="space-y-3">
            {prescriptions.map((rx) => {
              const isActive = new Date(rx.valid_until) > new Date();
              return (
                <div key={rx.id} className="bg-white rounded-2xl p-5 border border-zinc-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)" }}>
                      <FileText className="w-5 h-5 text-[#A78BFA]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0B1D35]">
                        Receta del {new Date(rx.issued_at).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className={`text-xs mt-0.5 ${isActive ? "text-emerald-500" : "text-zinc-400"}`}>
                        {isActive
                          ? `Vigente hasta ${new Date(rx.valid_until).toLocaleDateString("es-PE", { day: "numeric", month: "long" })}`
                          : "Vencida"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {rx.pdf_url && (
                      <a href={rx.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#A78BFA] hover:underline flex items-center gap-1">
                        Descargar PDF <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                    {isActive && (
                      <Link href="/dashboard/paciente/catalogo"
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                        style={{ background: G }}>
                        Ver productos
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-zinc-100 text-center">
            <Package className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">Aún no tienes recetas emitidas.</p>
            <p className="text-xs text-zinc-400 mt-1">Las recibirás después de tu primera consulta.</p>
          </div>
        )}
      </section>
    </div>
  );
}
