export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import {
  User, ClipboardList, AlertTriangle, FileText,
  CheckCircle2, ChevronRight, Pill,
} from "lucide-react";

export default async function PatientOverviewPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role;
  if (role !== "doctor" && role !== "admin") redirect("/dashboard/paciente");

  const [
    patientResult, recordResult, backgroundResult,
    encountersResult, prescriptionsResult,
  ] = await Promise.all([
    supabase.schema("medical").from("profiles")
      .select("full_name, document_id, phone, birth_date, gender, blood_type")
      .eq("id", patientId).single(),

    supabase.schema("medical").from("patient_records")
      .select("hc_number, created_at").eq("patient_id", patientId).maybeSingle(),

    supabase.schema("medical").from("patient_background")
      .select("*").eq("patient_id", patientId).maybeSingle(),

    supabase.schema("medical").from("clinical_encounters")
      .select("id, appointment_id, signed_at, chief_complaint, diagnoses, status, appointments(slot_start, specialty)")
      .eq("patient_id", patientId)
      .order("signed_at", { ascending: false })
      .limit(10),

    supabase.schema("medical").from("prescriptions")
      .select("id, issued_at, valid_until, diagnosis_cie10, diagnosis_label, prescription_items(producto_sku, quantity)")
      .eq("patient_id", patientId)
      .order("issued_at", { ascending: false })
      .limit(5),
  ]);

  const patient = patientResult.data;
  if (!patient) notFound();

  // Audit: log doctor viewing patient record
  await supabase.schema("medical").rpc("log_event", {
    p_action: "view",
    p_resource_type: "patient_record",
    p_resource_id: patientId,
    p_patient_id: patientId,
  }).maybeSingle();

  const record     = recordResult.data;
  const bg         = backgroundResult.data;
  const encounters = (encountersResult.data ?? []) as unknown as {
    id: string; appointment_id: string; signed_at: string | null; chief_complaint: string;
    diagnoses: { cie10_code: string; cie10_description: string; type: string }[];
    status: string;
    appointments: { slot_start: string; specialty: string } | null;
  }[];
  const prescriptions = (prescriptionsResult.data ?? []) as {
    id: string; issued_at: string; valid_until: string;
    diagnosis_cie10: string | null; diagnosis_label: string | null;
    prescription_items: { producto_sku: string; quantity: number }[];
  }[];

  type AllergyItem = { substance: string; reaction: string; severity: string };
  type MedItem = { name: string; dose: string; frequency: string };
  const allergies = (bg?.allergies as AllergyItem[]) ?? [];
  const meds      = (bg?.current_medications as MedItem[]) ?? [];

  const SPECIALTY: Record<string, string> = {
    sleep: "🌙 Sueño", pain: "🦴 Dolor", anxiety: "🧠 Ansiedad", womens_health: "🌸 Salud Femenina",
  };

  const age = patient.birth_date
    ? Math.floor((Date.now() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="p-6 md:p-10 max-w-3xl space-y-5">
      <div>
        <BackLink href="/dashboard/medico/pacientes" />
      </div>

      {/* Header paciente */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-lg font-bold text-violet-600 flex-shrink-0">
            {patient.full_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-black text-[#0B1D35]">{patient.full_name ?? "Paciente"}</h1>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-zinc-500">
              {record?.hc_number && <span className="font-mono font-bold text-violet-600">{record.hc_number}</span>}
              {patient.document_id && <span>DNI: {patient.document_id}</span>}
              {age && <span>{age} años</span>}
              {patient.gender && <span>{patient.gender === "M" ? "Masculino" : patient.gender === "F" ? "Femenino" : patient.gender}</span>}
              {patient.blood_type && <span className="font-bold text-red-500">{patient.blood_type}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Link
              href={`/dashboard/medico/pacientes/${patientId}/antecedentes`}
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800"
            >
              <ClipboardList className="w-3.5 h-3.5" /> Editar antecedentes
            </Link>
            <Link
              href={`/dashboard/medico/pacientes/${patientId}/express`}
              className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-800"
            >
              ⚡ Formulario Express
            </Link>
          </div>
        </div>
      </div>

      {/* Alergias alert */}
      {allergies.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">{allergies.length} alergia(s) registrada(s)</p>
            <p className="text-xs text-red-600 mt-0.5">
              {allergies.map(a => `${a.substance} — ${a.reaction} (${a.severity})`).join("  ·  ")}
            </p>
          </div>
        </div>
      )}

      {/* Antecedentes resumen */}
      {bg && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <h2 className="font-semibold text-sm text-[#0B1D35] mb-3 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-violet-400" /> Antecedentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {(bg.chronic_conditions as string[] ?? []).length > 0 && (
              <div>
                <p className="text-zinc-400 uppercase tracking-wide font-semibold mb-1">Condiciones crónicas</p>
                <ul className="space-y-0.5">
                  {(bg.chronic_conditions as string[]).map((c, i) => <li key={i} className="text-zinc-700">• {c}</li>)}
                </ul>
              </div>
            )}
            {meds.length > 0 && (
              <div>
                <p className="text-zinc-400 uppercase tracking-wide font-semibold mb-1">Medicamentos actuales</p>
                <ul className="space-y-0.5">
                  {meds.map((m, i) => <li key={i} className="text-zinc-700">• {m.name} {m.dose} — {m.frequency}</li>)}
                </ul>
              </div>
            )}
            {(bg.family_history as string[] ?? []).length > 0 && (
              <div>
                <p className="text-zinc-400 uppercase tracking-wide font-semibold mb-1">Antecedentes familiares</p>
                <ul className="space-y-0.5">
                  {(bg.family_history as string[]).map((f, i) => <li key={i} className="text-zinc-700">• {f}</li>)}
                </ul>
              </div>
            )}
            {(bg.smoking_status || bg.alcohol_use) && (
              <div>
                <p className="text-zinc-400 uppercase tracking-wide font-semibold mb-1">Hábitos</p>
                {bg.smoking_status && <p className="text-zinc-700">Tabaco: {bg.smoking_status}</p>}
                {bg.alcohol_use    && <p className="text-zinc-700">Alcohol: {bg.alcohol_use}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline HCs */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5">
        <h2 className="font-semibold text-sm text-[#0B1D35] mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-400" /> Historias clínicas ({encounters.length})
        </h2>
        {encounters.length === 0 ? (
          <p className="text-xs text-zinc-400">Sin historias clínicas registradas.</p>
        ) : (
          <div className="space-y-2">
            {encounters.map(enc => {
              const principal = (enc.diagnoses ?? []).find(d => d.type === "principal");
              const date = enc.signed_at ? new Date(enc.signed_at) : null;
              const spec = enc.appointments?.specialty;
              return (
                <Link
                  key={enc.id}
                  href={`/dashboard/medico/consultas/${enc.appointment_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-zinc-50 hover:border-violet-100 hover:bg-violet-50/30 transition-all group"
                >
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${enc.status === "signed" ? "text-emerald-500" : "text-zinc-300"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {date && <span className="text-xs font-semibold text-[#0B1D35]">{date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                      {spec && <span className="text-[10px] text-zinc-400">{SPECIALTY[spec] ?? spec}</span>}
                      {enc.status === "draft" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold">Borrador</span>}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{enc.chief_complaint}</p>
                    {principal && <p className="text-[10px] text-violet-600 font-mono">{principal.cie10_code} — {principal.cie10_description}</p>}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recetas */}
      {prescriptions.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <h2 className="font-semibold text-sm text-[#0B1D35] mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-violet-400" /> Recetas emitidas
          </h2>
          <div className="space-y-2">
            {prescriptions.map(rx => (
              <div key={rx.id} className="p-3 rounded-xl border border-zinc-50 bg-zinc-50/50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[#0B1D35]">
                      {new Date(rx.issued_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    {rx.diagnosis_cie10 && (
                      <p className="text-[10px] text-violet-600 font-mono mt-0.5">{rx.diagnosis_cie10} — {rx.diagnosis_label}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {rx.prescription_items?.length ?? 0} producto(s)  ·  válida hasta {new Date(rx.valid_until).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
