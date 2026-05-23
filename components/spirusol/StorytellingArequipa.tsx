import Image from "next/image"
import type { PublicBrand } from "@/lib/types"
import { Sun, Sprout, MapPin } from "lucide-react"

/**
 * Sección 3 — Storytelling Arequipa. Split image/text. Copy literal del spec §5.3.
 *
 * Si `marca.hero_image` existe (asset subido a Supabase Storage), usa la foto.
 * Si no, renderiza una "data card" hero con los 3 datos clave del IIN sobre un
 * gradiente verde→sun. Se siente intencional, no un placeholder roto.
 */
export default function StorytellingArequipa({ marca }: { marca: PublicBrand }) {
  const hasHero = Boolean(marca.hero_image)

  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: "var(--brand-green-100)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Imagen o data-card según haya foto subida */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            {hasHero ? (
              <Image
                src={marca.hero_image!}
                alt="Cultivo de espirulina bajo el sol del Misti, Arequipa"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ArequipaDataCard marca={marca} />
            )}
          </div>

          {/* Texto */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.7)",
                color: "var(--brand-green-900)",
              }}
            >
              <Sprout size={14} style={{ color: "var(--brand-green-700)" }} />
              {marca.origen ?? "Arequipa, Perú"}
            </div>

            <h2
              className="font-bold tracking-tight mb-5 text-balance leading-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                color: "var(--brand-green-900)",
                fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.75rem)",
              }}
            >
              Donde el sol trabaja para ti
            </h2>

            <div
              className="space-y-4 text-pretty"
              style={{
                color: "var(--brand-green-900)",
                opacity: 0.85,
                fontSize: "clamp(0.95rem, 1vw + 0.5rem, 1.0625rem)",
                lineHeight: 1.7,
                maxWidth: "60ch",
              }}
            >
              <p>
                Arequipa recibe una de las radiaciones solares más altas del Perú. Esa luz no es un detalle estético: es lo que permite que nuestras microalgas sinteticen más clorofila, más proteína y más antioxidantes que las que crecen en otros climas.
              </p>
              <p>
                <span className="font-semibold">{marca.productor ?? "Greenner SAC"}</span>, productora local, cosecha y seca a baja temperatura para preservar lo que el sol construyó. Sin atajos industriales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * "Data card" — reemplazo del placeholder con icono Sun gigante. Usa el mismo
 * lenguaje visual del hero (gradiente verde→sun + rayos sutiles) pero con
 * contenido informativo arriba: location chip + 3 stats clave del IIN + footer.
 * Se siente diseñado, no roto.
 */
function ArequipaDataCard({ marca }: { marca: PublicBrand }) {
  const stats = [
    { valor: "2,335 m", label: "Altitud Arequipa" },
    { valor: "8.5 h", label: "Sol diario promedio" },
    { valor: "67.33%", label: "Proteína verificada IIN" },
  ]

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-8 md:p-10"
      style={{
        background:
          "linear-gradient(160deg, var(--brand-green-900) 0%, var(--brand-green-700) 55%, var(--brand-sun-500) 130%)",
      }}
    >
      {/* Rayos del sol decorativos en esquina superior derecha */}
      <svg
        aria-hidden="true"
        className="absolute -top-12 -right-12 w-[280px] h-[280px] opacity-30"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="85" fill="var(--brand-sun-100)" fillOpacity="0.25" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const x1 = 200 + Math.cos(angle) * 100
          const y1 = 200 + Math.sin(angle) * 100
          const x2 = 200 + Math.cos(angle) * 175
          const y2 = 200 + Math.sin(angle) * 175
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--brand-sun-100)"
              strokeOpacity="0.5"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      {/* Top — location chip */}
      <div className="relative">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "var(--brand-cream)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <MapPin size={12} aria-hidden="true" />
          {marca.origen ?? "Arequipa, Perú"}
        </div>
      </div>

      {/* Middle — 3 stats verticales */}
      <div className="relative space-y-6 mt-8">
        {stats.map((s, i) => (
          <div key={i}>
            <p
              className="font-bold leading-none mb-1.5"
              style={{
                fontFamily: "var(--font-fraunces)",
                color: "var(--brand-cream)",
                fontSize: "clamp(2rem, 3vw + 0.5rem, 3rem)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {s.valor}
            </p>
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--brand-cream)", opacity: 0.75 }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom — footer pequeño con productor */}
      <div className="relative flex items-center gap-2 mt-8">
        <Sun size={14} style={{ color: "var(--brand-sun-100)" }} aria-hidden="true" />
        <p
          className="text-xs font-medium"
          style={{ color: "var(--brand-cream)", opacity: 0.8 }}
        >
          Cultivado por {marca.productor ?? "Greenner SAC"}
        </p>
      </div>
    </div>
  )
}
