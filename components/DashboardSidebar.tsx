"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Calendar, FileText, Package,
  User, LogOut, Menu, X, Stethoscope,
} from "lucide-react";
import type { UserRole } from "@/lib/supabase/database.types";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";

const PATIENT_LINKS = [
  { href: "/dashboard/paciente",           label: "Inicio",      icon: LayoutDashboard },
  { href: "/dashboard/paciente/citas",     label: "Mis citas",   icon: Calendar },
  { href: "/dashboard/paciente/recetas",   label: "Mis recetas", icon: FileText },
  { href: "/dashboard/paciente/catalogo",  label: "Catálogo",    icon: Package },
  { href: "/dashboard/paciente/perfil",    label: "Mi perfil",   icon: User },
];

const DOCTOR_LINKS = [
  { href: "/dashboard/medico",             label: "Inicio",        icon: LayoutDashboard },
  { href: "/dashboard/medico/consultas",   label: "Consultas",     icon: Stethoscope },
  { href: "/dashboard/medico/recetas",     label: "Recetas",       icon: FileText },
  { href: "/dashboard/medico/perfil",      label: "Mi perfil",     icon: User },
];

interface Props {
  role: UserRole;
  fullName: string;
  email: string;
}

export default function DashboardSidebar({ role, fullName, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = role === "doctor" || role === "admin" ? DOCTOR_LINKS : PATIENT_LINKS;
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : email[0]?.toUpperCase() ?? "U";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" onClick={() => setOpen(false)}>
          <Image src="/logo-white.png" alt="Organnical" width={130} height={32} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard/paciente" && href !== "/dashboard/medico" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: G }} />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.06]">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: G }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{fullName || "Usuario"}</p>
            <p className="text-[10px] text-white/40 truncate">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0 min-h-screen"
        style={{ background: NAVY }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/5"
        style={{ background: NAVY }}
      >
        <Link href="/">
          <Image src="/logo-white.png" alt="Organnical" width={110} height={28} />
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 text-white/70 hover:text-white"
          aria-label="Menú"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div
            className="w-64 flex flex-col pt-14"
            style={{ background: NAVY }}
          >
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Mobile top-bar spacer */}
      <div className="md:hidden h-14 w-full fixed top-0 pointer-events-none" />
    </>
  );
}
