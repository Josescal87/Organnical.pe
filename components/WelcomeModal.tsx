"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gift, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const MODAL_KEY = "welcome_modal_seen"
const SHOW_DELAY_MS = 4000

const HIDE_ON = ["/checkout", "/dashboard", "/login", "/registro", "/recuperar", "/agendar/pago"]

/**
 * Popup de bienvenida con el cupón BIENVENIDO10. Aparece UNA SOLA VEZ por
 * dispositivo (localStorage), 4s después del primer visit a una página
 * marketing. No vuelve a aparecer aunque el usuario borre cookies (es
 * localStorage). Cerrarlo cuenta como "visto" — no se persigue al usuario.
 *
 * No vivirá en /checkout / /dashboard / auth flows: ahí el aviso sería ruido.
 */
export default function WelcomeModal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (HIDE_ON.some((p) => pathname?.startsWith(p))) return
    if (localStorage.getItem(MODAL_KEY)) return
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleClose() {
    localStorage.setItem(MODAL_KEY, "1")
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[calc(100%-2rem)] max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
        <button
          ref={closeBtn}
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 w-9 h-9 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center z-10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div
          className="px-8 pt-10 pb-6 text-center text-white"
          style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Gift className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2
            id="welcome-modal-title"
            className="font-black leading-tight"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            ¡Bienvenido a Organnical!
          </h2>
          <p className="mt-2 text-sm text-white/90">
            10% de descuento en tu primera compra
          </p>
        </div>

        <div className="px-8 pt-6 pb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
            Usa este código en el checkout
          </p>
          <div className="inline-block bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-6 py-3 mb-5">
            <p className="font-bold text-2xl tracking-wider text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
              BIENVENIDO10
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Válido en pedidos desde S/ 50 · Una sola vez por persona
          </p>
          <Link
            href="/tienda"
            onClick={handleClose}
            className="block w-full text-white font-bold py-3.5 rounded-full text-sm shadow-md hover:shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
          >
            Empezar a comprar →
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Tal vez después
          </button>
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
