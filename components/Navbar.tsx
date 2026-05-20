"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ShoppingCart, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart, CART_ADDED_EVENT } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const navLinks = [
  { href: "/tienda", label: "Tienda" },
  { href: "/agendar", label: "Consultas" },
  { href: "/blog", label: "Blog" },
];
const EXPRESS_HREF = "/consulta-express";

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

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

  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener(CART_ADDED_EVENT, handler);
    return () => window.removeEventListener(CART_ADDED_EVENT, handler);
  }, []);

  const solid = !isLanding || scrolled;

  return (
    <>
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
          className={`hidden gap-8 text-sm font-medium md:flex items-center transition-colors ${
            solid ? "text-zinc-500" : "text-white/75"
          }`}
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hover:text-[#A78BFA] transition-colors ${
                pathname.startsWith(l.href) ? "text-[#A78BFA]" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={EXPRESS_HREF}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-white transition-all hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 100%)" }}
          >
            <Zap className="w-3 h-3" /> Express S/30
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Carrito${totalItems > 0 ? ` (${totalItems})` : ""}`}
            className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-full relative transition-colors ${
              solid
                ? "text-zinc-500 hover:text-[#A78BFA] hover:bg-violet-50"
                : "text-white/75 hover:text-white"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#A78BFA] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <Link
              href="/cuenta"
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 hidden sm:inline-flex items-center gap-2"
              style={{ background: G }}
            >
              Mi cuenta <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium hidden sm:block transition-colors ${
                  solid ? "text-zinc-500 hover:text-zinc-900" : "text-white/75 hover:text-white"
                }`}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/agendar"
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90"
                style={{ background: G }}
              >
                Agendar
              </Link>
            </>
          )}
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
              className="py-3 text-sm font-medium text-zinc-700 border-b border-zinc-50 hover:text-[#A78BFA] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={EXPRESS_HREF}
            onClick={() => setMenuOpen(false)}
            className="py-3 text-sm font-bold text-[#F472B6] border-b border-zinc-50 flex items-center gap-2 hover:text-[#A78BFA] transition-colors"
          >
            <Zap className="w-4 h-4" /> Express S/30 — orientación hoy
          </Link>
          {isLoggedIn ? (
            <Link
              href="/cuenta"
              onClick={() => setMenuOpen(false)}
              className="mt-3 mb-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white"
              style={{ background: G }}
            >
              Mi cuenta <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-medium text-zinc-700 hover:text-[#A78BFA] transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/agendar"
                onClick={() => setMenuOpen(false)}
                className="mt-3 mb-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white"
                style={{ background: G }}
              >
                Agendar consulta <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>

    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
