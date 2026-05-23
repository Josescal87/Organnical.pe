import type { PublicBrand } from "@/lib/types"
import { Sprout } from "lucide-react"
import BrandVideo from "./BrandVideo"

/**
 * Sección 3 — Storytelling Arequipa. Split video/text. Copy literal del spec §5.3.
 *
 * Antes esta sección tenía una "data card" decorativa como fallback cuando no
 * había foto. Ahora ese slot lo ocupa el video de marca de 31s (drone Arequipa →
 * cultivo → lab → producto → tagline "VIVE"). El texto a la derecha sigue
 * explicando — el video demuestra. Decisión 2026-05-22 con usuario.
 *
 * Container `aspect-video` (16:9) porque el archivo es widescreen. Si se cambia
 * por uno vertical en el futuro, ajustar a `aspect-[9/16]` o `[4/5]`.
 */
const VIDEO_SRC = "/brands/spirusol/brand-video.mp4"
const VIDEO_POSTER = "/brands/spirusol/brand-video-poster.jpg"
const VIDEO_DURATION = 31

export default function StorytellingArequipa({ marca }: { marca: PublicBrand }) {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: "var(--brand-green-100)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Video — reemplaza la data card decorativa */}
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
            <BrandVideo
              src={VIDEO_SRC}
              poster={VIDEO_POSTER}
              duration={VIDEO_DURATION}
              ariaLabel={`Reproducir video de ${marca.nombre} — ${VIDEO_DURATION} segundos`}
            />
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
