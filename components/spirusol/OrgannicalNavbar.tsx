"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, ArrowRight, ShoppingCart, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

/**
 * Navbar para el subdominio Spirusol — copia visual 1:1 de `components/Navbar.tsx`
 * pero con todos los hrefs en absoluto a `https://organnical.pe/...` porque desde
 * `spirusol.organnical.pe` el middleware rewritea cualquier path interno a
 * `/marcas/spirusol/<path>` (rutas que no existen). Decisión 2026-05-22 con
 * usuario: paridad visual con la home + UX coherente para el carrito.
 *
 * Diferencias funcionales del global:
 *   • Hrefs absolutos a organnical.pe + UTMs `utm_source=spirusol_subdomain`.
 *   • Icono carrito NO abre drawer: redirige a `/tienda?marca=spirusol` en el
 *     host principal (los carts viven por hostname en localStorage; añadir
 *     productos en el subdominio significaría perderlos al hacer checkout).
 *   • Sin pathname-active state (acá siempre estamos en home del subdominio).
 *
 * Si actualizas el Navbar global, recordá replicar acá las clases/estilos para
 * mantener paridad.
 */
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const ORGANNICAL = "https://organnical.pe"
const UTM = "utm_source=spirusol_subdomain&utm_medium=header"

const navLinks = [
  { href: `${ORGANNICAL}/tienda?marca=spirusol&${UTM}`, label: "Tienda" },
  { href: `${ORGANNICAL}/agendar?${UTM}`, label: "Consultas" },
  { href: `${ORGANNICAL}/blog?${UTM}`, label: "Blog" },
]
const EXPRESS_HREF = `${ORGANNICAL}/consulta-express?${UTM}`
const CART_HREF = `${ORGANNICAL}/tienda?marca=spirusol&${UTM}&utm_content=cart_icon`

export default function OrgannicalNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
    })
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const fn = () => setMenuOpen(false)
    window.addEventListener("scroll", fn, { once: true, passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [menuOpen])

  // En el subdominio Spirusol el navbar está siempre sólido (sin transición scroll),
  // igual que tienda/blog/botica del global. No hay landing transparente en marcas.

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 shadow-lg"
      style={{ background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 h-[80px]">
        {/* Cobrand Spirusol primario + atribución a Organnical. La marca del
            subdominio domina visualmente; Organnical aparece como subline para
            mantener trazabilidad al ecosistema. Decisión 2026-05-22 con usuario. */}
        <Link
          href="/"
          className="flex-shrink-0 flex items-center gap-3 group"
          aria-label="Spirusol — por organnical.pe"
        >
          <Image
            src="/brands/spirusol/logo-white.png"
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
            priority
            className="w-12 h-12 object-contain"
          />
          <span className="flex flex-col leading-none">
            <span
              className="text-white font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "1.375rem",
              }}
            >
              Spirusol
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45 mt-1">
              por organnical.pe
            </span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-5 flex-1 justify-center">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-medium transition-colors text-white/40 hover:text-white/70"
            >
              {l.label}
            </a>
          ))}
          <a
            href={EXPRESS_HREF}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold text-white transition-all hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 100%)" }}
          >
            <Zap className="w-3 h-3" /> Express S/30
          </a>
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Cart icon → redirect a tienda (no abre drawer, ver doc del componente) */}
          <a
            href={CART_HREF}
            aria-label="Ir a la tienda"
            className="flex items-center justify-center text-white/35 hover:text-white/70 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </a>

          {isLoggedIn ? (
            <a
              href={`${ORGANNICAL}/cuenta?${UTM}`}
              className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
            >
              <ArrowRight size={13} />
              <span className="hidden sm:inline">Mi cuenta</span>
            </a>
          ) : (
            <>
              <a
                href={`${ORGANNICAL}/login?${UTM}`}
                className="text-xs font-medium text-white/35 hover:text-white/70 hidden sm:block transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href={`${ORGANNICAL}/agendar?${UTM}`}
                className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
              >
                <ArrowRight size={13} />
                <span className="hidden sm:inline">Agendar</span>
              </a>
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
        className={`sm:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="px-6 py-3 flex flex-col">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm font-medium text-white/60 border-b border-white/[0.06] hover:text-white/90 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={EXPRESS_HREF}
            onClick={() => setMenuOpen(false)}
            className="py-3 text-sm font-bold text-[#F472B6] border-b border-white/[0.06] flex items-center gap-2 hover:text-[#A78BFA] transition-colors"
          >
            <Zap className="w-4 h-4" /> Express S/30 — orientación hoy
          </a>
          <a
            href={CART_HREF}
            onClick={() => setMenuOpen(false)}
            className="py-3 text-sm font-medium text-white/60 border-b border-white/[0.06] flex items-center gap-2 hover:text-white/90 transition-colors w-full text-left"
          >
            <ShoppingCart className="w-4 h-4" />
            Ir a la tienda
          </a>
          {isLoggedIn ? (
            <a
              href={`${ORGANNICAL}/cuenta?${UTM}`}
              onClick={() => setMenuOpen(false)}
              className="mt-3 mb-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white"
              style={{ background: G }}
            >
              Mi cuenta <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <>
              <a
                href={`${ORGANNICAL}/login?${UTM}`}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href={`${ORGANNICAL}/agendar?${UTM}`}
                onClick={() => setMenuOpen(false)}
                className="mt-3 mb-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white"
                style={{ background: G }}
              >
                Agendar consulta <ArrowRight className="w-4 h-4" />
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
