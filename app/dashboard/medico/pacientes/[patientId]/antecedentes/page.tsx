export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import BackgroundForm from "./BackgroundForm";
import type { BackgroundFormData } from "./actions";
import { ClipboardList, AlertTriangle } from "lucide-react";

const EMPTY: BackgroundFormData = {
  chronic_conditions:       [],
  previous_surgeries:       [],
  previous_hospitalizations: [],
  current_medications:      [],
  allergies:                [],
  family_history:           [],
  smoking_status:           "",
  alcohol_use:              "",
};

export default async function AntecedentesPage({
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

  // Verificar que el paciente existe y tiene cita con este doctor
  const { data: patient } = await supabase
    .schema("medical")
    .from("profiles")
    .select("full_name, document_id")
    .eq("id", patientId)
    .single();

  if (!patient) notFound();

  // Obtener número de HC
  const { data: record } = await supabase
    .schema("medical")
    .from("patient_records")
    .select("hc_number")
    .eq("patient_id", patientId)
    .single();

  // Obtener antecedentes existentes
  const { data: bg } = await supabase
    .schema("medical")
    .from("patient_background")
    .select("*")
    .eq("patient_id", patientId)
    .single();

  const initial: BackgroundFormData = bg ? {
    chronic_conditions:        (bg.chronic_conditions as string[]) ?? [],
    previous_surgeries:        (bg.previous_surgeries as string[]) ?? [],
    previous_hospitalizations: (bg.previous_hospitalizations as string[]) ?? [],
    current_medications:       (bg.current_medications as BackgroundFormData["current_medications"]) ?? [],
    allergies:                 (bg.allergies as BackgroundFormData["allergies"]) ?? [],
    family_history:            (bg.family_history as string[]) ?? [],
    smoking_status:            (bg.smoking_status as string) ?? "",
    alcohol_use:               (bg.alcohol_use as string) ?? "",
  } : EMPTY;

  const hasAllergies = initial.allergies.length > 0;

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <BackLink href={`/dashboard/medico/consultas`} />
        <div className="flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">
              Antecedentes — {patient.full_name ?? "Paciente"}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {record?.hc_number && <span className="font-mono mr-2">{record.hc_number}</span>}
              {patient.document_id && <span>DNI: {patient.document_id}</span>}
            </p>
          </div>
        </div>
      </div>

      {hasAllergies && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {initial.allergies.length} alergia(s) registrada(s)
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {initial.allergies.map(a => `${a.substance} (${a.severity})`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      <BackgroundForm patientId={patientId} initial={initial} />
    </div>
  );
}
