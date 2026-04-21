export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { CheckCircle2, Download } from "lucide-react";
import DownloadPDFButton from "./DownloadPDFButton";

export default async function EncounterDetailPage({
  params,
}: {
  params: Promise<{ encounterId: string }>;
}) {
  const { encounterId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role;
  if (role !== "patient") redirect("/dashboard/medico");

  const { data: enc } = await supabase
    .schema("medical")
    .from("clinical_encounters")
    .select("*, appointments(slot_start, specialty)")
    .eq("id", encounterId)
    .eq("patient_id", user.id)
    .eq("status", "signed")
    .single();

  if (!enc) notFound();

  const { data: doctorData } = await supabase
    .schema("medical")
    .from("profiles")
    .select("full_name, cmp, specialty_label")
    .eq("id", enc.doctor_id)
    .single();

  const doctor = doctorData as { full_name: string | null; cmp: string | null; specialty_label: string | null } | null;

  type Diagnosis = { cie10_code: string; cie10_description: string; type: string; certainty: string };
  const diagnoses = (enc.diagnoses as Diagnosis[]) ?? [];
  const signedDate = new Date(enc.signed_at ?? "").toLocaleString("es-PE", {
    dateStyle: "long", timeStyle: "short",
  });

  const SPECIALTY: Record<string, string> = {
    sleep: "🌙 Sueño", pain: "🦴 Dolor Crónico",
    anxiety: "🧠 Ansiedad", womens_health: "🌸 Salud Femenina",
  };
  const specialty = (enc as { appointments?: { specialty?: string } }).appointments?.specialty;

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-6">
        <BackLink href="/dashboard/paciente/historial" />
        <div className="flex items-start justify-between gap-3 mt-1 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">Historia Clínica</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{signedDate}</p>
          </div>
          <DownloadPDFButton encounterId={encounterId} />
        </div>
      </div>

      {/* Firma banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3 mb-5">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Documento firmado electrónicamente</p>
          <p className="text-xs text-emerald-600 mt-0.5">{signedDate} · Conforme RM 164-2025/MINSA</p>
          <p className="text-[10px] font-mono text-emerald-500 mt-0.5 break-all">{enc.doctor_signature_hash}</p>
        </div>
      </div>

      {/* Médico y especialidad */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <p className="text-xs text-zinc-400">Médico tratante</p>
            <p className="text-sm font-semibold text-[#0B1D35]">Dr(a). {doctor?.full_name ?? "—"}</p>
            {doctor?.cmp && <p className="text-xs text-zinc-400">CMP {doctor.cmp}</p>}
          </div>
          {specialty && (
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 font-medium">
              {SPECIALTY[specialty] ?? specialty}
            </span>
          )}
        </div>
      </div>

      {/* Secciones SOAP */}
      {[
        { tag: "S", title: "Anamnesis", fields: [
          { label: "Motivo de consulta",         value: enc.chief_complaint },
          { label: "Historia de la enfermedad",  value: enc.illness_history },
          { label: "Antecedentes relevantes",    value: enc.relevant_history },
        ]},
        { tag: "O", title: "Signos vitales y examen físico", fields: [
          { label: "Signos vitales", value: [
            enc.vital_weight_kg   && `Peso: ${enc.vital_weight_kg} kg`,
            enc.vital_height_cm   && `Talla: ${enc.vital_height_cm} cm`,
            enc.vital_bmi         && `IMC: ${enc.vital_bmi} kg/m²`,
            enc.vital_bp_systolic && `PA: ${enc.vital_bp_systolic}/${enc.vital_bp_diastolic} mmHg`,
            enc.vital_heart_rate  && `FC: ${enc.vital_heart_rate} lpm`,
            enc.vital_temperature_c && `T°: ${enc.vital_temperature_c}°C`,
            enc.vital_spo2_pct    && `SpO2: ${enc.vital_spo2_pct}%`,
          ].filter(Boolean).join("   ·   ") || null },
          { label: "Examen físico",              value: enc.physical_exam_notes },
        ]},
        { tag: "P", title: "Plan de tratamiento", fields: [
          { label: "Plan",                       value: enc.treatment_plan },
          { label: "Indicaciones",               value: enc.indications },
          { label: "Pedidos de laboratorio",     value: enc.lab_orders },
          { label: "Próximo control",            value: enc.follow_up_days ? `${enc.follow_up_days} días` : null },
        ]},
      ].map(({ tag, title, fields }) => (
        <div key={tag} className="bg-white rounded-2xl border border-zinc-100 p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">{tag}</span>
            <h3 className="font-semibold text-sm text-[#0B1D35]">{title}</h3>
          </div>
          <div className="space-y-2">
            {fields.filter(f => f.value).map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{f.label}</p>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Diagnósticos */}
      {diagnoses.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">A</span>
            <h3 className="font-semibold text-sm text-[#0B1D35]">Diagnósticos CIE-10</h3>
          </div>
          <div className="space-y-2">
            {diagnoses.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-violet-600 flex-shrink-0">{d.cie10_code}</span>
                <span className="text-xs text-zinc-700 flex-1">{d.cie10_description}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${d.type === "principal" ? "bg-violet-100 text-violet-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {d.type === "principal" ? "Principal" : "Secundario"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cannabis */}
      {(enc.cannabis_indication || enc.expected_outcomes) && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">🌿</span>
            <h3 className="font-semibold text-sm text-[#0B1D35]">Cannabis medicinal — Ley 30681</h3>
          </div>
          {enc.cannabis_indication && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Indicación</p>
              <p className="text-sm text-zinc-700">{enc.cannabis_indication}</p>
            </div>
          )}
          {enc.expected_outcomes && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Resultados esperados</p>
              <p className="text-sm text-zinc-700">{enc.expected_outcomes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
