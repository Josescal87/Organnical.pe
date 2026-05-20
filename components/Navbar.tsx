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
        solid ? "shadow-lg" : "bg-transparent"
      }`}
      style={solid ? { background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)" } : undefined}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 h-[60px]">

        {/* Logo — flex-shrink-0, igual que tienda/blog/botica */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo-white.png"
            alt="organnical.pe"
            width={100}
            height={24}
            priority
            className="opacity-75 hover:opacity-100 transition-opacity"
          />
        </Link>

        {/* Nav central — flex-1 justify-center, idéntico a tienda/blog/botica */}
        <nav className="hidden sm:flex items-center gap-5 flex-1 justify-center">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-xs font-medium transition-colors ${
                pathname.startsWith(l.href)
                  ? "font-semibold"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={pathname.startsWith(l.href) ? { color: "#A78BFA" } : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={EXPRESS_HREF}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold text-white transition-all hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 100%)" }}
          >
            <Zap className="w-3 h-3" /> Express S/30
          </Link>
        </nav>

        {/* Derecha — mismo peso visual que LogoutButton */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Carrito${totalItems > 0 ? ` (${totalItems})` : ""}`}
            className="flex items-center justify-center relative text-white/35 hover:text-white/70 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#A78BFA] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <Link
              href="/cuenta"
              className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
            >
              <ArrowRight size={13} />
              <span className="hidden sm:inline">Mi cuenta</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-white/35 hover:text-white/70 hidden sm:block transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/agendar"
                className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
              >
                <ArrowRight size={13} />
                <span className="hidden sm:inline">Agendar</span>
              </Link>
            </>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden p-2 rounded-lg text-white/75 hover:text-white transition-colors"
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
        }`}
        style={{ background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="px-6 py-3 flex flex-col">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm font-medium text-white/60 border-b border-white/[0.06] hover:text-white/90 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={EXPRESS_HREF}
            onClick={() => setMenuOpen(false)}
            className="py-3 text-sm font-bold text-[#F472B6] border-b border-white/[0.06] flex items-center gap-2 hover:text-[#A78BFA] transition-colors"
          >
            <Zap className="w-4 h-4" /> Express S/30 — orientación hoy
          </Link>
          <button
            onClick={() => { setMenuOpen(false); setCartOpen(true); }}
            className="py-3 text-sm font-medium text-white/60 border-b border-white/[0.06] flex items-center gap-2 hover:text-white/90 transition-colors w-full text-left"
          >
            <ShoppingCart className="w-4 h-4" />
            Carrito{totalItems > 0 && <span className="ml-1 rounded-full bg-[#A78BFA] px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">{totalItems}</span>}
          </button>
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
                className="py-3 text-sm font-medium text-white/60 hover:text-white transition-colors"
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
