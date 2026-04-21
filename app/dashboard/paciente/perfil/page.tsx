export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import ProfileForm from "@/components/ProfileForm";
import EHRProfileForm from "./EHRProfileForm";
import WhatsAppOptIn from "./WhatsAppOptIn";

export default async function PerfilPacientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .schema("medical")
    .from("profiles")
    .select("full_name, document_id, phone, birth_date, gender, blood_type, document_type, whatsapp_opt_in")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-6 md:p-10 max-w-2xl space-y-6">
      <div className="mb-2">
        <BackLink href="/dashboard/paciente" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi perfil</h1>
        <p className="text-zinc-500 text-sm mt-1">El DNI y fecha de nacimiento son requeridos para emitir recetas.</p>
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

      <EHRProfileForm
        userId={user.id}
        initialData={{
          birth_date:    data?.birth_date    ?? "",
          gender:        data?.gender        ?? "",
          blood_type:    data?.blood_type    ?? "",
          document_type: data?.document_type ?? "DNI",
        }}
      />

      <WhatsAppOptIn userId={user.id} initial={data?.whatsapp_opt_in ?? false} />
    </div>
  );
}
