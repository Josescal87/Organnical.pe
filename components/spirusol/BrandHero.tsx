import Image from "next/image"
import type { PublicBrand } from "@/lib/types"

/**
 * Sección 1 del spec — Hero.
 *
 * Headline display 56–72px, subhead 20px max-w 60ch, CTA primario + secundario,
 * trust strip debajo con los 3 certificados.
 *
 * Copy literal del spec §5.1 — no inventar afirmaciones nutricionales.
 */
const ORGANNICAL = "https://organnical.pe"
const SHOP_URL = `${ORGANNICAL}/tienda?marca=spirusol&utm_source=spirusol_subdomain&utm_medium=landing&utm_campaign=launch`

export default function BrandHero({ marca }: { marca: PublicBrand }) {
  return (
    <section
      className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
      style={{ background: "var(--brand-cream)" }}
    >
      {/* Background photo — Misti / Arequipa. Si la imagen no cargó (asset pendiente),
          el gradiente decorativo abajo le da textura al hero igual. */}
      {marca.hero_image && (
        <Image
          src={marca.hero_image}
          alt="Cultivo de espirulina bajo el sol de Arequipa"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20"
        />
      )}

      {/* Gradiente decorativo verde/cream — visible aunque el hero_image no exista */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 20% 30%, var(--brand-green-100) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 90% 80%, var(--brand-sun-100) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Eyebrow badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-8"
          style={{
            background: "rgba(255,255,255,0.7)",
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
