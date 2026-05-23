import { Dumbbell, Zap, ShieldCheck, Sparkles } from "lucide-react"

/**
 * Sección 2 — 4 stat cards en grid 2×2 desktop / 1×4 mobile.
 * Cifras del Informe IIN N° 000114-2025 (spec §5.2 + §19). No modificar.
 */
const STATS = [
  {
    icon: Dumbbell,
    valor: "67%",
    label: "Proteína",
    desc: "Proteína vegetal completa con todos los aminoácidos esenciales",
    fuente: "IIN",
    color: "green-700",
  },
  {
    icon: Sparkles,
    valor: "13,648",
    label: "Antioxidantes",
    desc: "µmol Trolox/100g — 3× más que arándanos",
    fuente: "IIN",
    color: "water-600",
  },
  {
    icon: Zap,
    valor: "9.7 mg",
    label: "Hierro",
    desc: "por cada 100g — fuente vegetal concentrada",
    fuente: "IIN",
    color: "sun-500",
  },
  {
    icon: ShieldCheck,
    valor: "100%",
    label: "Pureza",
    desc: "Sin azúcar añadida, sin aditivos, sin gluten",
    fuente: "Vegan Verified",
    color: "green-500",
  },
] as const

export default function NutrientStatGrid() {
  return (
    <section
      id="beneficios"
      className="py-20 md:py-28"
      style={{ background: "var(--brand-cream)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--brand-green-700)" }}
          >
            Por qué Spirusol
          </p>
          <h2
            className="font-bold tracking-tight text-balance leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--brand-green-900)",
              fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",
            }}
          >
            Lo que el laboratorio midió — no lo que decimos nosotros.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="relative rounded-3xl p-7 md:p-8 transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid var(--brand-green-100)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-5"
                  style={{
                    background: `var(--brand-${stat.color})`,
                    color: "var(--brand-cream)",
                  }}
                >
                  <Icon size={20} />
                </div>

                <div
                  className="font-bold leading-none mb-2"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    color: "var(--brand-green-900)",
                    fontSize: "clamp(2rem, 3vw + 0.5rem, 3rem)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stat.valor}
                </div>

                <p
                  className="text-sm font-bold uppercase tracking-wide mb-2"
                  style={{ color: "var(--brand-green-700)" }}
                >
                  {stat.label}
                </p>

                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{ color: "var(--brand-green-900)", opacity: 0.75 }}
                >
                  {stat.desc}
                </p>

                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--brand-green-900)", opacity: 0.5 }}
                >
                  Fuente: {stat.fuente}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
