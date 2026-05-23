import Image from "next/image"
import type { PublicBrand } from "@/lib/types"

/**
 * Sección 1 del spec — Hero.
 *
 * Headline display 56–72px, subhead 20px max-w 60ch, CTA primario + secundario,
 * trust strip debajo con los 3 certificados.
 *
 * Copy literal del spec §5.1 — no inventar afirmaciones nutricionales.
 *
 * El navbar es `sticky` (no `fixed`) → ocupa espacio en el documento por sí mismo,
 * así que el hero arranca con `pt-12 md:pt-20` (sólo separación visual respecto
 * a la fila inferior del header).
 *
 * Si `marca.hero_image` existe (subida real a Supabase Storage), la usamos como
 * background con opacity 20. Si no, el fallback decorativo (gradiente radial +
 * SVG con rayos de sol) se diseñó para verse intencional, no como placeholder.
 */
const ORGANNICAL = "https://organnical.pe"
const SHOP_URL = `${ORGANNICAL}/tienda?marca=spirusol&utm_source=spirusol_subdomain&utm_medium=landing&utm_campaign=launch`

export default function BrandHero({ marca }: { marca: PublicBrand }) {
  const hasHeroImage = Boolean(marca.hero_image)

  return (
    <section
      className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28"
      style={{ background: "var(--brand-cream)" }}
    >
      {/* Background photo — solo si está subida a Storage */}
      {hasHeroImage && (
        <Image
          src={marca.hero_image!}
          alt="Cultivo de espirulina bajo el sol de Arequipa"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20"
        />
      )}

      {/* Fallback decorativo — visible siempre; cuando hay hero_image actúa como
          enriquecedor del color por encima de la foto, sino es el background completo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 25%, var(--brand-sun-100) 0%, transparent 55%), radial-gradient(ellipse 60% 70% at 15% 90%, var(--brand-green-100) 0%, transparent 60%), radial-gradient(ellipse 50% 55% at 85% 80%, var(--brand-sun-100) 0%, transparent 55%)",
        }}
      />

      {/* SVG decorativo — solo cuando no hay foto real. Rayos sutiles que
          evocan sol del Misti sin depender de un asset externo. */}
      {!hasHeroImage && (
        <>
          <SunRaysDecoration />
          <LeavesScatterDecoration />
        </>
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Eyebrow badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-8"
          style={{
            background: "rgba(255,255,255,0.75)",
            color: "var(--brand-green-900)",
            border: "1px solid var(--brand-green-100)",
            backdropFilter: "blur(4px)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--brand-green-500)" }}
            aria-hidden="true"
          />
          Espirulina 100% peruana · Arequipa · Greenner SAC
        </div>

        {/* Headline display — Fraunces, text-balance, clamp para fluid type */}
        <h1
          className="font-bold leading-[1.05] mb-6 text-balance"
          style={{
            fontFamily: "var(--font-fraunces)",
            color: "var(--brand-green-900)",
            fontSize: "clamp(2.25rem, 6vw + 0.5rem, 4.5rem)",
            letterSpacing: "-0.03em",
          }}
        >
          Espirulina cultivada bajo el sol del Misti.
        </h1>

        {/* Subhead — body con max-w 60ch */}
        <p
          className="mx-auto mb-10 leading-relaxed text-pretty"
          style={{
            color: "var(--brand-green-900)",
            opacity: 0.8,
            fontSize: "clamp(1rem, 1.5vw + 0.5rem, 1.25rem)",
            maxWidth: "60ch",
          }}
        >
          67% proteína vegetal completa, hierro biodisponible y antioxidantes verificados por el IIN. Hecha en Arequipa por Greenner.
        </p>

        {/* Dual CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={SHOP_URL}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{
              background: "var(--brand-green-700)",
              color: "var(--brand-cream)",
              minWidth: "200px",
            }}
          >
            Comprar en la tienda →
          </a>
          <a
            href="#beneficios"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-medium transition-colors"
            style={{
              border: "1px solid var(--brand-green-700)",
              color: "var(--brand-green-900)",
              minWidth: "200px",
            }}
          >
            Conocer la espirulina ↓
          </a>
        </div>

        {/* Trust strip — los 3 certificados como texto compacto */}
        <p
          className="mt-10 text-xs"
          style={{ color: "var(--brand-green-900)", opacity: 0.6 }}
        >
          Certificado vegano internacional · Registro Sanitario M5828924N · Análisis IIN 2025
        </p>
      </div>
    </section>
  )
}

/**
 * Rayos del sol — SVG decorativo posicionado arriba a la derecha. Sin animación
 * (motion-design: respeta reduce-motion por default al ser estático). Pulse muy
 * sutil en CSS por si se quiere agregar después.
 */
function SunRaysDecoration() {
  return (
    <svg
      aria-hidden="true"
      className="absolute -top-20 -right-20 w-[400px] h-[400px] md:w-[600px] md:h-[600px] opacity-30 -z-10"
      viewBox="0 0 400 400"
      fill="none"
    >
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--brand-sun-500)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--brand-sun-500)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill="url(#sun-glow)" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x1 = 200 + Math.cos(angle) * 95
        const y1 = 200 + Math.sin(angle) * 95
        const x2 = 200 + Math.cos(angle) * 175
        const y2 = 200 + Math.sin(angle) * 175
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--brand-sun-500)"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )
      })}
      <circle
        cx="200"
        cy="200"
        r="80"
        fill="none"
        stroke="var(--brand-sun-500)"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
    </svg>
  )
}

/**
 * Hojas/clorofila esparcidas en bottom-left. Insinúa el cultivo sin mostrar
 * foto real (que aún no se subió a Storage).
 */
function LeavesScatterDecoration() {
  const leaves = [
    { cx: 60, cy: 320, size: 22, rotate: 35 },
    { cx: 105, cy: 360, size: 16, rotate: -15 },
    { cx: 145, cy: 305, size: 14, rotate: 50 },
    { cx: 30, cy: 380, size: 18, rotate: 110 },
  ]
  return (
    <svg
      aria-hidden="true"
      className="absolute bottom-0 left-0 w-[280px] h-[420px] md:w-[400px] md:h-[600px] opacity-25 -z-10"
      viewBox="0 0 200 420"
      fill="none"
    >
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.cx}
          cy={l.cy}
          rx={l.size}
          ry={l.size * 0.45}
          transform={`rotate(${l.rotate} ${l.cx} ${l.cy})`}
          fill="var(--brand-green-500)"
          fillOpacity="0.55"
        />
      ))}
    </svg>
  )
}
