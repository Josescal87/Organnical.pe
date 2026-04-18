import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import ScheduleEditor from "@/components/ScheduleEditor";

export default async function HorarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.schema("medical") as any)
    .from("profiles")
    .select("weekly_schedule, role")
    .eq("id", user.id)
    .single();

  if (data?.role === "patient") redirect("/dashboard/paciente");

  const weeklySchedule = (data?.weekly_schedule ?? {}) as Record<string, number[]>;

  // Convert string keys → number keys
  const schedule: Record<number, number[]> = {};
  Object.entries(weeklySchedule).forEach(([k, v]) => {
    schedule[Number(k)] = v as number[];
  });

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <BackLink href="/dashboard/medico" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi horario de atención</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Configura los horarios disponibles para cada día de la semana.
          Cada bloque es de 30 min — 25 min de consulta + 5 min de buffer.
        </p>
      </div>

      <ScheduleEditor initialSchedule={schedule} />
    </div>
  );
}
