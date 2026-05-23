"use client"

import { useState } from "react"
import { Plus, AlertTriangle } from "lucide-react"
import { FAQ_ITEMS } from "./faq-data"

/**
 * Sección 9 — FAQ acordeón.
 *
 * Los datos (`FAQ_ITEMS`) viven en `faq-data.ts` aparte para que el server
 * component `JsonLdScripts.tsx` también los importe sin pasar por la barrera
 * `"use client"` (que convertiría el const en un client reference proxy y
 * rompería `.map()` en SSR).
 *
 * `aria-expanded` + `aria-controls` correctos para a11y. El acordeón es Client
 * para mantener el estado del expandido.
 */

export default function BrandFAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-20 md:py-28" style={{ background: "var(--brand-cream)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--brand-green-700)" }}
          >
            Preguntas frecuentes
          </p>
          <h2
            className="font-bold tracking-tight text-balance leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--brand-green-900)",
              fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",
            }}
          >
            Todo lo que querés saber antes de probarla.
          </h2>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: "white",
                  border: `1px solid ${
                    isOpen ? "var(--brand-green-700)" : "var(--brand-green-100)"
                  }`,
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-btn-${i}`}
                  className="w-full flex items-start justify-between gap-4 p-5 text-left"
                >
                  <span className="flex items-start gap-2 flex-1">
                    {item.safety && (
                      <AlertTriangle
                        size={16}
                        className="flex-shrink-0 mt-1"
                        style={{ color: "var(--brand-sun-500)" }}
                        aria-label="Información de seguridad"
                      />
                    )}
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--brand-green-900)" }}
                    >
                      {item.q}
                    </span>
                  </span>
                  <Plus
                    size={18}
                    aria-hidden="true"
                    className="flex-shrink-0 mt-1 transition-transform"
                    style={{
                      color: "var(--brand-green-700)",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    className="px-5 pb-5 -mt-1"
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--brand-green-900)", opacity: 0.78 }}
                    >
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
