"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gift, X } from "lucide-react"

const BANNER_KEY = "welcome_banner_dismissed_until"
const BANNER_TTL_MS = 7 * 24 * 60 * 60 * 1000

const HIDE_ON = ["/checkout", "/dashboard", "/login", "/registro", "/recuperar"]

/**
 * Barra sticky arriba del Navbar global anunciando BIENVENIDO10. Dismissable
 * con localStorage (TTL 7 días, vuelve a aparecer pasado ese tiempo). Oculto
 * en checkout/dashboard/auth — esas rutas tienen flows que no quieren ruido.
 *
 * No incluye el flag del cupón en el copy; quien hace click va a /tienda y
 * después aplica el código en el checkout. El hint del input checkout es el
 * que materializa la promesa.
 */
export default function PromoBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (HIDE_ON.some((p) => pathname?.startsWith(p))) {
      setVisible(false)
      return
    }
    const until = Number(localStorage.getItem(BANNER_KEY) ?? "0")
    setVisible(Date.now() > until)
  }, [pathname])

  if (!visible) return null

  const handleDismiss = () => {
    localStorage.setItem(BANNER_KEY, String(Date.now() + BANNER_TTL_MS))
    setVisible(false)
  }

  return (
    <div
      className="relative w-full text-white text-xs sm:text-sm"
      style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
      role="region"
      aria-label="Promoción de bienvenida"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 pr-10 sm:pr-4">
        <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium">
          <span className="hidden sm:inline">¡Bienvenido! </span>
          <span className="font-bold">10% de descuento</span> en tu primera compra con el código{" "}
          <Link href="/tienda" className="font-bold underline decoration-2 underline-offset-2 hover:no-underline">
            BIENVENIDO10
          </Link>
        </span>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-white/15 transition-colors flex items-center justify-center"
        aria-label="Cerrar promoción"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
