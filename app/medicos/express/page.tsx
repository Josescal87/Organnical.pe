export const dynamic = "force-dynamic";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { BackLink } from "@/components/BackLink";
import { MarkContactedButton, MarkCompletedButton } from "./ExpressActions";
import { Phone, Clock, CheckCircle, MessageCircle, Zap } from "lucide-react";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

type ExpressConsultation = {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_document_type: string;
  patient_document_number: string;
  birth_date: string | null;
  motivo: string | null;
  preferred_time: "asap" | "today" | "tomorrow";
  amount_paid: number;
  status: "paid" | "contacted" | "completed" | "refunded" | "cancelled";
  contacted_at: string | null;
  completed_at: string | null;
  notes_doctor: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  paid:      "Pendiente",
  contacted: "Contactada",
  completed: "Completada",
  refunded:  "Reembolsada",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  paid:      "bg-amber-50 border-amber-200 text-amber-700",
  contacted: "bg-blue-50 border-blue-200 text-blue-700",
  completed: "bg-emerald-50 border-emerald-200 text-emerald-700",
  refunded:  "bg-zinc-50 border-zinc-200 text-zinc-500",
  cancelled: "bg-zinc-50 border-zinc-200 text-zinc-400",
};

const PREFERRED_TIME_LABELS: Record<string, string> = {
  asap:     "Lo antes posible",
  today:    "Hoy",
  tomorrow: "Mañana",
};

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function ExpressPanel() {
  const supabase = adminClient();

  const { data: consultations } = await supabase
    .schema("medical")
    .from("express_consultations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100) as { data: ExpressConsultation[] | null };

  const rows = consultations ?? [];
  const pending   = rows.filter((r) => r.status === "paid");
  const contacted = rows.filter((r) => r.status === "contacted");
  const others    = rows.filter((r) => !["paid", "contacted"].includes(r.status));

  function ConsultationCard({ c }: { c: ExpressConsultation }) {
    const waUrl = `https://wa.me/${c.patient_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Hola ${c.patient_name}, soy la Dra. de Organnical. Te contacto por tu consulta express. ¿En qué puedo ayudarte?`
    )}`;

    return (
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-[#0B1D35] text-sm">{c.patient_name}</p>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{c.patient_document_type} {c.patient_document_number}</p>
            {c.birth_date && <p className="text-xs text-zinc-400">Nacimiento: {c.birth_date}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[c.status]}`}>
              {STATUS_LABELS[c.status]}
            </span>
            <span className="text-xs text-zinc-400">{timeAgo(c.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
          >
            <Phone className="w-3 h-3" />
            {c.patient_phone}
          </a>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            {PREFERRED_TIME_LABELS[c.preferred_time] ?? c.preferred_time}
          </div>
          <div className="text-xs text-zinc-400 font-mono">S/ {c.amount_paid}</div>
        </div>

        {c.motivo && (
          <div className="bg-zinc-50 rounded-xl px-3 py-2.5 text-xs text-zinc-600 leading-relaxed">
            <span className="font-semibold text-zinc-400 uppercase tracking-wide text-[10px]">Motivo </span>
            {c.motivo}
          </div>
        )}

        {c.notes_doctor && (
          <div className="bg-emerald-50 rounded-xl px-3 py-2.5 text-xs text-emerald-700 leading-relaxed">
            <span className="font-semibold text-emerald-400 uppercase tracking-wide text-[10px]">Notas </span>
            {c.notes_doctor}
          </div>
        )}

        <div className="text-xs text-zinc-300 font-mono">{formatDate(c.created_at)}</div>

        <div className="flex flex-wrap gap-2 pt-1">
          {c.status === "paid" && <MarkContactedButton id={c.id} />}
          {(c.status === "paid" || c.status === "contacted") && (
            <MarkCompletedButton id={c.id} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl space-y-8">
      <div className="mb-2">
        <BackLink href="/medicos" />
        <div className="flex items-center gap-2 mt-1">
          <Zap className="w-5 h-5 text-amber-500" />
          <h1 className="font-display text-2xl font-black text-[#0B1D35]">Consultas Express</h1>
        </div>
        <p className="text-zinc-500 text-sm mt-1">
          {pending.length} pendiente{pending.length !== 1 ? "s" : ""} · {contacted.length} contactada{contacted.length !== 1 ? "s" : ""}
        </p>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aún no hay consultas express.</p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pendientes de contactar ({pending.length})
          </h2>
          {pending.map((c) => <ConsultationCard key={c.id} c={c} />)}
        </section>
      )}

      {contacted.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> Contactadas ({contacted.length})
          </h2>
          {contacted.map((c) => <ConsultationCard key={c.id} c={c} />)}
        </section>
      )}

      {others.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Historial
          </h2>
          {others.map((c) => <ConsultationCard key={c.id} c={c} />)}
        </section>
      )}
    </div>
  );
}
