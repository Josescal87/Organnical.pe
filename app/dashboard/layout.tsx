import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { UserRole } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Leer rol y nombre desde JWT metadata (sin query a DB)
  // El rol fue escrito por medical.handle_new_user() o por 02c_backfill_roles.sql
  const role = (user.user_metadata?.role ?? "patient") as UserRole;
  const fullName = (user.user_metadata?.full_name as string | null) ?? "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <DashboardSidebar role={role} fullName={fullName} email={user.email ?? ""} />
      <main className="flex-1 min-w-0 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
