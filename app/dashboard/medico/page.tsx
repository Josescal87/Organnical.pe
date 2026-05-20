export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import Link from "next/link";
import { Calendar, FileText, ArrowRight, Clock, CalendarClock, Zap, Phone } from "lucide-react";
import type { UserRole, AppointmentStatus, AppointmentSpecialty } from "@/lib/supabase/database.types";
import { SPECIALTY_LABELS } from "@/lib/specialty-labels";

type AppointmentRow = {
  id: string;
  slot_start: string;
  status: AppointmentStatus;
  specialty: AppointmentSpecialty;
  patient_id: string;
};
type PrescriptionRow = { id: string; issued_at: string; patient_id: string };
type ExpressRow = {
  id: string;
  patient_name: string;
  patient_phone: string;
  motivo: string | null;
  preferred_time: "asap" | "today" | "tomorrow";
  status: string;
  created_at: string;
};

const EXPRESS_TIME_LABELS: Record<string, string> = {
  asap: "Lo antes posible",
  today: "Hoy",
  tomorrow: "Mañana",
};

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Pendiente",  color: "bg-amber-50 text-amber-600" },
  confirmed: { label: "Confirmada", color: "bg-sky-50 text-sky-600" },
  completed: { label: "Completada", color: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Cancelada",  color: "bg-zinc-100 text-zinc-500" },
};

export default async function MedicoDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .schema("medical")
    .from("profiles")
    .select("role, full_name, cmp")
    .eq("id", user.id)
    .single();

  const role = (profileData?.role ?? user.user_metadata?.role) as UserRole | undefined;
  if (role === "patient") redirect("/dashboard/paciente");

  const { data: aptsData } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, slot_start, status, specialty, patient_id")
    .eq("doctor_id", user.id)
    .in("status", ["pending", "confirmed"])
    .order("slot_start", { ascending: true })
    .limit(10);

  const appointments = (aptsData ?? []) as AppointmentRow[];

  const { data: rxData } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select("id, issued_at, patient_id")
    .eq("doctor_id", user.id)
    .order("issued_at", { ascending: false })
    .limit(5);

  const prescriptions = (rxData ?? []) as PrescriptionRow[];

  // Express consultations (service-role para bypassear RLS)
  let expressPending: ExpressRow[] = [];
  try {
    const adminSupa = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );
    const { data: expressData } = await adminSupa
      .schema("medical")
      .from("express_consultations")
      .select("id, patient_name, patient_phone, motivo, preferred_time, status, created_at")
      .in("status", ["paid", "contacted"])
      .order("created_at", { ascending: false })
      .limit(5);
    expressPending = (expressData ?? []) as ExpressRow[];
  } catch { /* non-fatal */ }

  const firstName = profileData?.full_name?.split(" ")[0] ?? "Dr.";
  const upcoming = appointments.filter((a) => ["pending", "confirmed"].includes(a.status));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayApts = upcoming.filter((a) => {
    const d = new Date(a.slot_start);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-zinc-400 mb-1">Panel del médico</p>
        <h1 className="font-display text-3xl font-black text-[#0B1D35]">
          Bienvenido, {firstName}
        </h1>
        {profileData?.cmp && (
          <p className="text-xs text-zinc-400 mt-1">{profileData.cmp}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Consultas hoy",     value: todayApts.length,          icon: Clock,         href: "/dashboard/medico/consultas" },
          { label: "Próximas citas",    value: upcoming.length,           icon: Calendar,      href: "/dashboard/medico/consultas" },
          { label: "Recetas emitidas",  value: prescriptions.length,      icon: FileText,      href: "/dashboard/medico/recetas" },
          { label: "Mi horario",        value: "→",                       icon: CalendarClock, href: "/dashboard/medico/horario" },
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

      {/* Express card */}
      <Link
        href="/medicos/express"
        className="flex items-center justify-between gap-4 rounded-2xl p-5 mb-8 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-sm text-[#0B1D35]">Consultas Express</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {expressPending.filter(e => e.status === "paid").length > 0
                ? `${expressPending.filter(e => e.status === "paid").length} pendiente${expressPending.filter(e => e.status === "paid").length !== 1 ? "s" : ""} de contactar`
                : "Sin pendientes · todo al día"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expressPending.filter(e => e.status === "paid").length > 0 && (
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
              {expressPending.filter(e => e.status === "paid").length}
            </span>
          )}
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 transition-colors" />
        </div>
      </Link>

      {/* Express pendientes — listado rápido */}
      {expressPending.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-[#0B1D35] text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Express pendientes
            </h2>
            <Link href="/medicos/express" className="text-xs text-amber-600 hover:underline font-semibold flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {expressPending.map((e) => {
              const waUrl = `https://wa.me/${e.patient_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hola ${e.patient_name}, soy la Dra. de Organnical. Te contacto por tu consulta express. ¿En qué puedo ayudarte?`
              )}`;
              return (
                <div key={e.id} className="bg-white rounded-2xl p-4 border border-zinc-100 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0B1D35] truncate">{e.patient_name}</p>
                    <p className="text-xs text-zinc-400">{EXPRESS_TIME_LABELS[e.preferred_time] ?? e.preferred_time}</p>
                    {e.motivo && <p className="text-xs text-zinc-500 truncate mt-0.5">{e.motivo}</p>}
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-all"
                  >
                    <Phone className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Próximas consultas */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[#0B1D35] text-lg">Próximas consultas</h2>
          <Link href="/dashboard/medico/consultas" className="text-xs text-[#A78BFA] hover:underline font-semibold flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((apt) => {
              const st = STATUS_LABELS[apt.status] ?? STATUS_LABELS.pending;
              const date = new Date(apt.slot_start);
              const isToday = (() => {
                const d = new Date(apt.slot_start);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
              })();

              return (
                <div key={apt.id} className="bg-white rounded-2xl p-5 border border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isToday && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: G }}>
                          HOY
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.color}`}>
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
                  <Link
                    href={`/dashboard/medico/consultas/${apt.id}`}
                    className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: G }}
                  >
                    Ver detalle
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-zinc-100 text-center">
            <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No tienes consultas próximas.</p>
          </div>
        )}
      </section>
    </div>
  );
}
