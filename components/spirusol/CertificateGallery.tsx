"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, ShieldCheck, Leaf, FlaskConical, X } from "lucide-react"

/**
 * Sección 7 — Galería de certificaciones. Click → modal con PDF embebido.
 *
 * Patrón motion-design: AnimatePresence + scale-from-95 + overlay fade, focus
 * trap manual (botón close recibe foco al abrir, Esc cierra). Cumple a11y
 * básica (`role="dialog"`, `aria-modal`, `aria-labelledby`).
 *
 * Las URLs de PDF apuntan a `/public/brands/spirusol/*.pdf` — si los archivos
 * aún no están subidos, el iframe muestra 404 dentro del modal (avisado en
 * `/public/brands/spirusol/README.md`).
 */
const CERTS = [
  {
    id: "vegan",
    titulo: "Vegan Verified",
    sub: "Certificación internacional",
    descripcion: "ID 05-260281-1 · VeganVerified.org · Vigencia 01/03/2026 – 28/02/2027",
    pdf: "/brands/spirusol/cert-vegan-verified.pdf",
    icon: Leaf,
    color: "var(--brand-green-500)",
  },
  {
    id: "minsa",
    titulo: "Registro Sanitario MINSA",
    sub: "Autorización DIGESA",
    descripcion: "M5828924N · Vigencia hasta 30/09/2029",
    pdf: "/brands/spirusol/registro-sanitario.pdf",
    icon: ShieldCheck,
    color: "var(--brand-green-700)",
  },
  {
    id: "iin",
    titulo: "Análisis IIN 2025",
    sub: "Instituto de Investigación Nutricional",
    descripcion: "Informe N° 000114-2025 · La Molina, 28/08/2025",
    pdf: "/brands/spirusol/informe-iin-2025.pdf",
    icon: FlaskConical,
    color: "var(--brand-water-600)",
  },
] as const

export default function CertificateGallery() {
  const [open, setOpen] = useState<(typeof CERTS)[number] | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  // Esc para cerrar + focus al botón close al abrir
  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <section className="py-20 md:py-28" style={{ background: "var(--brand-cream)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--brand-green-700)" }}
          >
            Certificaciones
          </p>
          <h2
            className="font-bold tracking-tight text-balance leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--brand-green-900)",
              fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",
            }}
          >
            Cada afirmación tiene un papel detrás.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CERTS.map((c) => {
            const Icon = c.icon
            return (
              <button
                key={c.id}
                onClick={() => setOpen(c)}
                className="text-left rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5 group"
                style={{
                  background: "white",
                  border: "1px solid var(--brand-green-100)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                  style={{ background: c.color, color: "var(--brand-cream)" }}
                >
                  <Icon size={18} />
                </div>
                <h3
                  className="font-bold mb-1"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    color: "var(--brand-green-900)",
                    fontSize: "1.125rem",
                  }}
                >
                  {c.titulo}
                </h3>
                <p
                  className="text-xs font-medium mb-3"
                  style={{ color: "var(--brand-green-700)" }}
                >
                  {c.sub}
                </p>
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: "var(--brand-green-900)", opacity: 0.65 }}
                >
                  {c.descripcion}
                </p>
                <span
                  className="text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: "var(--brand-green-700)" }}
                >
                  <FileText size={12} /> Ver documento →
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setOpen(null)}
            />
            <motion.div
              key="dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cert-dialog-title"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
              className="fixed inset-4 md:inset-12 z-50 rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              <header
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: "var(--brand-green-100)" }}
              >
                <h3
                  id="cert-dialog-title"
                  className="font-bold"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    color: "var(--brand-green-900)",
                  }}
                >
                  {open.titulo}
                </h3>
                <button
                  ref={closeBtn}
                  onClick={() => setOpen(null)}
                  aria-label="Cerrar"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </header>
              <iframe
                src={open.pdf}
                title={open.titulo}
                className="flex-1 w-full"
                style={{ border: 0 }}
              />
              <a
                href={open.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-center py-3 border-t"
                style={{
                  borderColor: "var(--brand-green-100)",
                  color: "var(--brand-green-700)",
                }}
              >
                Abrir en pestaña nueva ↗
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
