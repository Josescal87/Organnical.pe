import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import type { UserRole } from "@/lib/supabase/database.types";

type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string | null;
  document_id: string | null;
  phone: string | null;
};

export default async function PerfilPacientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, document_id, phone")
    .eq("id", user.id)
    .single();

  const profile = data as ProfileRow | null;

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/paciente" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
        </Link>
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi perfil</h1>
        <p className="text-zinc-500 text-sm mt-1">Tus datos personales. El DNI es requerido para emitir recetas.</p>
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
