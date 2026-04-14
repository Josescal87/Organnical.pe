import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/database.types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Leer rol desde JWT metadata — sin DB call adicional
  // Escrito por medical.handle_new_user() trigger y 02c_backfill_roles.sql
  const role = user.user_metadata?.role as UserRole | undefined;

  if (role === "doctor" || role === "admin") {
    redirect("/dashboard/medico");
  }
  redirect("/dashboard/paciente");
}
