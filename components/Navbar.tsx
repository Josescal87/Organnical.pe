"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const navLinks = [
  { href: "/#especialidades", label: "Especialidades" },
  { href: "/#medicos", label: "Médicos" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = () => setMenuOpen(false);
    window.addEventListener("scroll", fn, { once: true, passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [menuOpen]);

  // On landing: transparent until scroll. On all other pages: always solid.
  const solid = !isLanding || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-zinc-100"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-[70px]">
        <Link href="/">
          <Image
            src={solid ? "/logo-color.png" : "/logo-white.png"}
            alt="organnical.pe"
            width={170}
            height={40}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav
          className={`hidden gap-8 text-sm font-medium md:flex transition-colors ${
            solid ? "text-zinc-500" : "text-white/75"
          }`}
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hover:text-[#A78BFA] transition-colors ${
                pathname === l.href ? "text-[#A78BFA]" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm font-medium hidden sm:block transition-colors ${
              solid ? "text-zinc-500 hover:text-zinc-900" : "text-white/75 hover:text-white"
            }`}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90"
            style={{ background: G }}
          >
            Agendar consulta
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={`md:hidden p-2 rounded-lg ${solid ? "text-zinc-600" : "text-white"}`}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        } bg-white border-b border-zinc-100`}
      >
        <div className="px-6 py-3 flex flex-col">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm font-medium text-zinc-700 border-b border-zinc-50 last:border-0 hover:text-[#A78BFA] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="py-3 text-sm font-medium text-zinc-700 hover:text-[#A78BFA] transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            onClick={() => setMenuOpen(false)}
            className="mt-3 mb-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white"
            style={{ background: G }}
          >
            Agendar consulta <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
