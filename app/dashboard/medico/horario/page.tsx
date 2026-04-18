import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScheduleEditor from "@/components/ScheduleEditor";

export default async function HorarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .schema("medical")
    .from("profiles")
    .select("available_hours, available_days, role")
    .eq("id", user.id)
    .single();

  if (data?.role === "patient") redirect("/dashboard/paciente");

  const availableHours = (data?.available_hours ?? []) as number[];
  const availableDays  = (data?.available_days  ?? [1,2,3,4,5]) as number[];

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <Link
          href="/dashboard/medico"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
        </Link>
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi horario de atención</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Elige los días y horarios en los que puedes atender pacientes.
          Cada bloque es de 30 minutos — 25 min de consulta + 5 min de buffer.
        </p>
      </div>

      <ScheduleEditor initialHours={availableHours} initialDays={availableDays} />
    </div>
  );
}
