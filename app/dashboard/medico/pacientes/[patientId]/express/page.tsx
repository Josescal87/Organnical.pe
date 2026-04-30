export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import ExpressForm from "./ExpressForm";
import type { BackgroundFormData } from "../antecedentes/actions";

export default async function ExpressPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role as string | undefined;
  if (role !== "doctor" && role !== "admin") redirect("/dashboard/paciente");

  const [patientResult, backgroundResult] = await Promise.all([
    supabase.schema("medical").from("profiles")
      .select("full_name").eq("id", patientId).single(),
    supabase.schema("medical").from("patient_background")
      .select("*").eq("patient_id", patientId).maybeSingle(),
  ]);

  if (!patientResult.data) notFound();

  const bg = backgroundResult.data;

  const initial: BackgroundFormData = {
    chronic_conditions:        (bg?.chronic_conditions as string[]) ?? [],
    current_medications:       (bg?.current_medications as BackgroundFormData["current_medications"]) ?? [],
    allergies:                 (bg?.allergies as BackgroundFormData["allergies"]) ?? [],
    previous_surgeries:        (bg?.previous_surgeries as string[]) ?? [],
    previous_hospitalizations: (bg?.previous_hospitalizations as string[]) ?? [],
    family_history:            (bg?.family_history as string[]) ?? [],
    smoking_status:            (bg?.smoking_status as string) ?? "",
    alcohol_use:               (bg?.alcohol_use as string) ?? "",
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl space-y-6">
      <BackLink href={`/dashboard/medico/pacientes/${patientId}`} />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚡</span>
          <h1 className="font-display text-2xl font-black text-[#0B1D35]">Formulario Express</h1>
        </div>
        <p className="text-sm text-zinc-500">
          {patientResult.data.full_name} · Antecedentes y medicamentos habituales
        </p>
      </div>
      <ExpressForm patientId={patientId} initial={initial} />
    </div>
  );
}
