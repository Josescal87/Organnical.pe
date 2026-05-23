import Image from "next/image"
import type { PublicBrand } from "@/lib/types"
import { Sun, Sprout } from "lucide-react"

/**
 * Sección 3 — Storytelling Arequipa. Split image/text con `lg:grid-flow-col-dense`
 * para invertir orden en desktop. Copy literal del spec §5.3.
 */
export default function StorytellingArequipa({ marca }: { marca: PublicBrand }) {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: "var(--brand-green-100)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Imagen — Misti / cultivo */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            {marca.hero_image ? (
              <Image
                src={marca.hero_image}
                alt="Cultivo de espirulina bajo el sol del Misti, Arequipa"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              /* Fallback decorativo si el asset aún no se subió a Storage */
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-green-700) 0%, var(--brand-green-500) 50%, var(--brand-sun-500) 100%)",
                }}
              >
                <Sun size={96} className="text-white/40" />
              </div>
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
