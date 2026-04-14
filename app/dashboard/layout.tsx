import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { UserRole } from "@/lib/supabase/database.types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Leer perfil desde medical schema (fuente de verdad)
  const { data } = await supabase
    .schema("medical")
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  // Fallback: si el perfil aún no existe (ej. durante migración), usar JWT metadata
  const role = (data?.role ?? user.user_metadata?.role ?? "patient") as UserRole;
  const fullName = data?.full_name ?? (user.user_metadata?.full_name as string | null) ?? "";

  if (!data) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <DashboardSidebar role={role} fullName={fullName} email={user.email ?? ""} />
      <main className="flex-1 min-w-0 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
