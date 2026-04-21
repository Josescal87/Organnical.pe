export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import ProfileForm from "@/components/ProfileForm";
import DoctorEHRForm from "./DoctorEHRForm";

export default async function PerfilMedicoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .schema("medical")
    .from("profiles")
    .select("full_name, document_id, phone, cmp, rne, specialty_label")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-6 md:p-10 max-w-2xl space-y-6">
      <div className="mb-2">
        <BackLink href="/dashboard/medico" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi perfil</h1>
        {data?.cmp && <p className="text-xs text-zinc-400 mt-1 font-mono">CMP {data.cmp}</p>}
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
