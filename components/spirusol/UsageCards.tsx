import { Coffee, Salad, BookOpen } from "lucide-react"

/**
 * Sección 5 — "Cómo se toma". 3 cards: Polvo, Crunchie, Link a recetas.
 * Copy literal del spec §5.5. Sin afirmaciones medicinales — uso culinario.
 */
const USOS_POLVO = [
  "1 cucharadita (5 g) en smoothie verde matinal",
  "Disolver en jugo de naranja para enmascarar el sabor a alga",
  "Mezclar en masa de panqueques o pan casero",
]

const USOS_CRUNCHIE = [
  "Espolvorear sobre yogurt o granola",
  "Mezclar en ensaladas como topping crocante",
  "Comer puro como snack funcional",
]

export default function UsageCards() {
  return (
    <section className="py-20 md:py-24" style={{ background: "var(--brand-cream)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--brand-green-700)" }}
          >
            Cómo se toma
          </p>
          <h2
            className="font-bold tracking-tight text-balance leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--brand-green-900)",
              fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",
            }}
          >
            Dos formatos, mismas posibilidades en la cocina.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <UsageCard icon={Coffee} titulo="Polvo" subtitulo="Para bebidas y masas" items={USOS_POLVO} />
          <UsageCard icon={Salad} titulo="Crunchie" subtitulo="Para toppings y snacks" items={USOS_CRUNCHIE} />

          {/* Tercera card — link a recetas (que aún no existen como ruta separada;
              dejamos el link comentado y mostramos un placeholder que linkea al blog) */}
          <a
            href="https://organnical.pe/blog?tag=espirulina&utm_source=spirusol_subdomain&utm_medium=usage_card"
            className="block rounded-3xl p-7 md:p-8 transition-all hover:shadow-lg hover:-translate-y-0.5 group"
            style={{
              background: "var(--brand-green-700)",
              color: "var(--brand-cream)",
            }}
          >
            <BookOpen size={28} className="mb-5 opacity-90" />
            <h3
              className="font-bold mb-2"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "clamp(1.25rem, 1.5vw + 0.5rem, 1.5rem)",
              }}
            >
              Más recetas
            </h3>
            <p className="text-sm opacity-80 mb-5 leading-relaxed">
              Combinaciones, dosis y trucos para que la espirulina entre en tu rutina sin esfuerzo.
            </p>
            <span className="text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-2 transition-all">
              Ver recetas en el blog →
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

function UsageCard({
  icon: Icon,
  titulo,
  subtitulo,
  items,
}: {
  icon: typeof Coffee
  titulo: string
  subtitulo: string
  items: string[]
}) {
  return (
    <div
      className="rounded-3xl p-7 md:p-8"
      style={{
        background: "rgba(255,255,255,0.7)",
        border: "1px solid var(--brand-green-100)",
      }}
    >
      <Icon size={28} className="mb-5" style={{ color: "var(--brand-green-700)" }} />
      <h3
        className="font-bold mb-1"
        style={{
          fontFamily: "var(--font-fraunces)",
          color: "var(--brand-green-900)",
          fontSize: "clamp(1.25rem, 1.5vw + 0.5rem, 1.5rem)",
        }}
      >
        {titulo}
      </h3>
      <p
        className="text-xs font-medium uppercase tracking-wide mb-5"
        style={{ color: "var(--brand-green-700)", opacity: 0.7 }}
      >
        {subtitulo}
      </p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm leading-relaxed flex gap-2.5"
            style={{ color: "var(--brand-green-900)", opacity: 0.8 }}
          >
            <span
              aria-hidden="true"
              className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--brand-green-500)" }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
