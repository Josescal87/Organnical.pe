"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"

const KEY = "welcome_banner_dismissed_until"
const TTL_MS = 7 * 24 * 60 * 60 * 1000
const HIDE_ON = [
  "/checkout",
  "/dashboard",
  "/login",
  "/registro",
  "/recuperar",
  "/agendar",
  "/cuenta",
  "/sami",
  "/consulta-express",
]
const HEIGHT_PX = 36

/**
 * Barra fixed top-0 que anuncia BIENVENIDO10. Coordina con el Navbar mediante
 * la CSS variable `--promo-banner-h`: cuando el banner está visible se setea
 * a 36px, y el Navbar lee esa variable en su `top` para acomodarse abajo.
 * Cuando se cierra (X) se vuelve 0px y el navbar regresa a top:0.
 *
 * Diseño minimalista: 36px de alto, una sola línea, gradiente de marca,
 * dismiss con cookie de 7 días. Oculto en flows transaccionales y auth.
 */
export default function PromoBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (HIDE_ON.some((p) => pathname?.startsWith(p))) {
      setVisible(false)
      return
    }
    const until = Number(localStorage.getItem(KEY) ?? "0")
    setVisible(Date.now() > until)
  }, [pathname])

  // Mantener sincronizada la CSS var con la visibilidad real para que el Navbar
  // se acomode automáticamente sin necesidad de context ni re-render forzado.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--promo-banner-h",
      visible ? `${HEIGHT_PX}px` : "0px"
    )
    return () => {
      document.documentElement.style.setProperty("--promo-banner-h", "0px")
    }
  }, [visible])

  if (!visible) return null

  const handleDismiss = () => {
    localStorage.setItem(KEY, String(Date.now() + TTL_MS))
    setVisible(false)
  }

  return (
    <div
      className="fixed top-0 inset-x-0 z-[60] text-white"
      style={{
        height: `${HEIGHT_PX}px`,
        background: "linear-gradient(90deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
      }}
      role="region"
      aria-label="Promoción de bienvenida"
    >
      <div className="relative h-full max-w-5xl mx-auto px-12 sm:px-14 flex items-center justify-center">
        <p className="text-[12px] sm:text-[13px] leading-none tracking-tight text-center font-medium">
          <span className="hidden sm:inline opacity-90 mr-1.5">🎁</span>
          <span className="font-bold">10% de descuento</span>
          <span className="hidden sm:inline opacity-90"> en tu primera compra con el código </span>
          <span className="sm:hidden opacity-90"> con </span>
          <Link
            href="/tienda"
            className="font-bold tracking-wide underline decoration-white/60 decoration-1 underline-offset-[3px] hover:decoration-white transition-colors"
          >
            BIENVENIDO10
          </Link>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          aria-label="Cerrar promoción"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
