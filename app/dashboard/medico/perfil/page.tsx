export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import ProfileForm from "@/components/ProfileForm";
import DoctorEHRForm from "./DoctorEHRForm";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function PerfilMedicoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .schema("medical")
    .from("profiles")
    .select("full_name, document_id, phone, cmp, rne, specialty_label, photo_url, weekly_schedule")
    .eq("id", user.id)
    .single();

  const checks = [
    { label: "Nombre completo",  ok: !!data?.full_name },
    { label: "CMP",              ok: !!data?.cmp && data.cmp !== "PENDIENTE" },
    { label: "Especialidad",     ok: !!data?.specialty_label },
    { label: "Horario semanal",  ok: !!(data?.weekly_schedule && Object.keys(data.weekly_schedule as object).length > 0), href: "/dashboard/medico/horario" },
  ];
  const allComplete = checks.every((c) => c.ok);

  return (
    <div className="p-6 md:p-10 max-w-2xl space-y-6">
      <div className="mb-2">
        <BackLink href="/dashboard/medico" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi perfil</h1>
        {data?.cmp && <p className="text-xs text-zinc-400 mt-1 font-mono">CMP {data.cmp}</p>}
      </div>

      {/* Checklist de completitud */}
      <div className={`rounded-2xl border p-5 ${allComplete ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        <div className="flex items-center gap-2 mb-3">
          {allComplete
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            : <AlertTriangle className="w-4 h-4 text-amber-500" />}
          <p className={`text-sm font-semibold ${allComplete ? "text-emerald-800" : "text-amber-800"}`}>
            {allComplete ? "Perfil completo — listo para atender pacientes" : "Completa tu perfil para aparecer como médico disponible"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs">
              {c.ok
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                : <Circle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
              <span className={c.ok ? "text-emerald-700" : "text-amber-700"}>
                {c.href && !c.ok
                  ? <Link href={c.href} className="underline">{c.label}</Link>
                  : c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ProfileForm
        userId={user.id}
        email={user.email ?? ""}
        initialData={{
          full_name:   data?.full_name   ?? "",
          document_id: data?.document_id ?? "",
          phone:       data?.phone       ?? "",
        }}
      />

      <DoctorEHRForm
        userId={user.id}
        initialData={{
          cmp:             data?.cmp             ?? "",
          rne:             data?.rne             ?? "",
          specialty_label: data?.specialty_label ?? "",
        }}
      />
    </div>
  );
}
