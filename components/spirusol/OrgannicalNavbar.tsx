"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LogOut, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

/**
 * Header para el subdominio Spirusol — replica el patrón visual de `/tienda`
 * (sticky de 2 filas: logo Organnical arriba + identidad de la página/marca abajo)
 * porque el usuario pidió "que salga igualito" a esa captura (2026-05-22).
 *
 * Decisiones:
 *   • Sticky (no fixed): el contenido fluye naturalmente debajo sin necesidad
 *     de pt-* artificial en el hero. Mismo comportamiento que /tienda.
 *   • Fila 1 = logo `/logo-white.png` + nav Organnical (Mi cuenta · Botica ·
 *     Tienda · Blog) + Salir/Agendar según sesión. Hrefs absolutos a
 *     organnical.pe + UTM `utm_source=spirusol_subdomain`.
 *   • Fila 2 = avatar redondeado con el logo Spirusol blanco + "Spirusol" en
 *     Fraunces 2xl + tagline corto debajo.
 *
 * Sin chip Express ni icono carrito — los quita la captura referencia.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")"
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const SPIRUSOL_AVATAR_BG =
  "linear-gradient(135deg, #154734 0%, #2c8a4a 55%, #ed9c2b 130%)"

const ORGANNICAL = "https://organnical.pe"
const UTM = "utm_source=spirusol_subdomain&utm_medium=header"

const NAV = [
  { label: "Mi cuenta", href: `${ORGANNICAL}/cuenta?${UTM}` },
  { label: "Botica", href: `${ORGANNICAL}/cuenta/botica?${UTM}` },
  { label: "Tienda", href: `${ORGANNICAL}/tienda?marca=spirusol&${UTM}` },
  { label: "Blog", href: `${ORGANNICAL}/blog?${UTM}` },
]

export default function OrgannicalNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
    })
  }, [])

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    // En el subdominio el login vive en organnical.pe — navegamos full-page
    // para mantener el dominio del cookie de sesión consistente.
    window.location.href = `${ORGANNICAL}/login?${UTM}`
  }

  return (
    <header
      className="sticky top-0 z-50 relative overflow-hidden shadow-lg"
      style={{ background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)" }}
    >
      {/* Noise */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{ backgroundImage: NOISE, backgroundRepeat: "repeat", backgroundSize: "180px 180px" }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(167,139,250,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow blob */}
      <div
        className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: G }}
      />

      <div className="relative max-w-5xl mx-auto px-4 pt-5 pb-5">
        {/* ── Fila 1: logo Organnical + nav central + auth ─────────────── */}
        <div className="flex items-center gap-4 mb-4">
          <a
            href={`${ORGANNICAL}/?${UTM}&utm_content=logo`}
            className="flex-shrink-0"
            aria-label="organnical.pe — home"
          >
            <Image
              src="/logo-white.png"
              alt="Organnical"
              width={100}
              height={24}
              priority
              className="opacity-75 hover:opacity-100 transition-opacity"
            />
          </a>

          <nav className="hidden sm:flex items-center gap-5 flex-1 justify-center">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Auth slot — Salir cuando logueado, Agendar cuando no. Misma estética
              que LogoutButton/Navbar para mantener la línea visual. */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          ) : (
            <a
              href={`${ORGANNICAL}/agendar?${UTM}`}
              className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
            >
              <ArrowRight size={13} />
              <span className="hidden sm:inline">Agendar</span>
            </a>
          )}
        </div>

        {/* ── Fila 2: avatar logo Spirusol + título + tagline ──────────── */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 p-1.5 shadow-md"
            style={{ background: SPIRUSOL_AVATAR_BG }}
          >
            <Image
              src="/brands/spirusol/logo-white.png"
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-black text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Spirusol
            </h1>
            <p className="text-white/40 text-xs">
              Espirulina del sol del sur · Arequipa
            </p>
          </div>
        </div>

        {/* Nav mobile — abajo de la fila 2 cuando no hay espacio horizontal */}
        <nav className="sm:hidden mt-4 -mb-1 flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
