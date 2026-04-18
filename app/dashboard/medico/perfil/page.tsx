import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import ProfileForm from "@/components/ProfileForm";
import type { UserRole } from "@/lib/supabase/database.types";

type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string | null;
  document_id: string | null;
  phone: string | null;
  cmp: string | null;
};

export default async function PerfilMedicoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, document_id, phone, cmp")
    .eq("id", user.id)
    .single();

  const profile = data as ProfileRow | null;

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <BackLink href="/dashboard/medico" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi perfil</h1>
        {profile?.cmp && (
          <p className="text-xs text-zinc-400 mt-1 font-mono">{profile.cmp}</p>
        )}
      </div>

      <ProfileForm
        userId={user.id}
        email={user.email ?? ""}
        initialData={{
          full_name: profile?.full_name ?? "",
          document_id: profile?.document_id ?? "",
          phone: profile?.phone ?? "",
        }}
      />
    </div>
  );
}
