"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

/**
 * Sección 4 — Tabla comparativa con tabs entre Proteína, Hierro, Antioxidantes.
 * Client Component porque usa framer-motion para animar las barras (con
 * `useReducedMotion()` que respeta `prefers-reduced-motion`).
 *
 * Cifras del spec §5.4 — Spirusol del Informe IIN, referencias de Collazos 1993.
 * Disclaimer al pie es obligatorio (spec §5.4).
 */
type Tab = "proteina" | "hierro" | "antioxidantes"

interface Bar {
  alimento: string
  valor: number
  spirusol?: boolean
}

const DATA: Record<Tab, { unidad: string; titulo: string; max: number; bars: Bar[] }> = {
  proteina: {
    titulo: "Proteína",
    unidad: "g por 100 g",
    max: 70,
    bars: [
      { alimento: "Spirusol", valor: 67, spirusol: true },
      { alimento: "Carne",    valor: 23 },
      { alimento: "Lentejas", valor: 9 },
      { alimento: "Quinua",   valor: 4 },
    ],
  },
  hierro: {
    titulo: "Hierro",
    unidad: "mg por 100 g",
    max: 10,
    bars: [
      { alimento: "Spirusol", valor: 9.7, spirusol: true },
      { alimento: "Quinua",   valor: 4.6 },
      { alimento: "Lentejas", valor: 3.3 },
      { alimento: "Espinaca", valor: 2.7 },
    ],
  },
  antioxidantes: {
    titulo: "Antioxidantes",
    unidad: "µmol Trolox por 100 g",
    max: 14000,
    bars: [
      { alimento: "Spirusol",  valor: 13648, spirusol: true },
      { alimento: "Cacao",     valor: 6824 },
      { alimento: "Arándanos", valor: 4549 },
    ],
  },
}

const TABS: { id: Tab; label: string }[] = [
  { id: "proteina", label: "Proteína" },
  { id: "hierro", label: "Hierro" },
  { id: "antioxidantes", label: "Antioxidantes" },
]

export default function NutritionComparison() {
  const [tab, setTab] = useState<Tab>("proteina")
  const reduced = useReducedMotion()
  const current = DATA[tab]

  const fmt = (n: number) => (n >= 1000 ? n.toLocaleString("es-PE") : n.toString())

  return (
    <section className="py-20 md:py-28" style={{ background: "var(--brand-cream)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--brand-green-700)" }}
          >
            Comparado con otros alimentos
          </p>
          <h2
            className="font-bold tracking-tight text-balance leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--brand-green-900)",
              fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",
            }}
          >
            Misma porción, distinta densidad nutricional.
          </h2>
        </div>

        {/* Tabs */}
        <div
          className="inline-flex p-1 rounded-full mb-8 mx-auto block w-fit"
          style={{ background: "var(--brand-green-100)" }}
          role="tablist"
          aria-label="Selecciona el nutriente a comparar"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className="px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? "var(--brand-green-700)" : "transparent",
                color: tab === t.id ? "var(--brand-cream)" : "var(--brand-green-900)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bars */}
        <div
          id={`panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          className="space-y-4"
        >
          {current.bars.map((bar, i) => {
            const pct = Math.min(100, (bar.valor / current.max) * 100)
            return (
              <div key={`${tab}-${bar.alimento}`}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: bar.spirusol ? "var(--brand-green-700)" : "var(--brand-green-900)",
                      opacity: bar.spirusol ? 1 : 0.7,
                    }}
                  >
                    {bar.alimento}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: "var(--brand-green-900)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmt(bar.valor)} <span className="text-xs font-normal opacity-60">{current.unidad.split(" ")[0]}</span>
                  </span>
                </div>
                <div
                  className="h-9 rounded-lg overflow-hidden relative"
                  style={{ background: "rgba(255,255,255,0.6)" }}
                >
                  <motion.div
                    key={`${tab}-${bar.alimento}-${i}`}
                    initial={{ width: reduced ? `${pct}%` : 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: reduced ? 0 : 0.8,
                      delay: reduced ? 0 : i * 0.1,
                      ease: [0, 0, 0.2, 1],
                    }}
                    className="h-full rounded-lg"
                    style={{
                      background: bar.spirusol
                        ? "linear-gradient(90deg, var(--brand-green-700) 0%, var(--brand-green-500) 100%)"
                        : "var(--brand-sand-500)",
                      opacity: bar.spirusol ? 1 : 0.5,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <p
          className="text-xs mt-8 text-center"
          style={{ color: "var(--brand-green-900)", opacity: 0.5, maxWidth: "55ch", margin: "2rem auto 0" }}
        >
          Valores referenciales según informe IIN N° 000114-2025 (Spirusol) y bibliografía Collazos 1993. No reemplaza una dieta variada.
        </p>
      </div>
    </section>
  )
}
