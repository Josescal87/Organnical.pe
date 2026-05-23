"use client"

import { useState } from "react"
import { Plus, AlertTriangle } from "lucide-react"

/**
 * Sección 9 — FAQ acordeón.
 *
 * Las 8 preguntas iniciales del spec §5.9 + contraindicaciones obligatorias
 * (anticoagulantes, autoinmunes, fenilcetonuria) que mencionar es compliance §8.
 *
 * `aria-expanded` + `aria-controls` correctos para a11y. El acordeón es Client
 * para mantener el estado del expandido.
 *
 * El JSON-LD `FAQPage` se renderiza desde page.tsx (server-side) usando los mismos
 * datos exportados — Google necesita verlo en el SSR.
 */
export const FAQ_ITEMS: { q: string; a: string; safety?: boolean }[] = [
  {
    q: "¿Qué es la espirulina y por qué se considera un superalimento?",
    a: "La espirulina (Arthrospira platensis) es una microalga acuática. Se considera superalimento por su densidad nutricional: aporta proteína vegetal completa con todos los aminoácidos esenciales, hierro biodisponible, B-complex, clorofila y antioxidantes. En el caso de Spirusol, el Informe IIN N° 000114-2025 verificó 67.33% de proteína, 9.69 mg/100g de hierro y 13,648 µmol Trolox/100g de capacidad antioxidante.",
  },
  {
    q: "¿Cuál es la diferencia entre el Polvo y el Crunchie?",
    a: "Ambos son 100% espirulina con el mismo perfil nutricional — sale del mismo cultivo en Arequipa. Cambia el formato: el Polvo se disuelve bien en líquidos (smoothies, jugos, masas), mientras que el Crunchie son gránulos crocantes ideales como topping para yogurt, bowls y ensaladas, o para comer puro como snack.",
  },
  {
    q: "¿Cuánto debo tomar al día?",
    a: "El uso culinario habitual es 1 cucharadita (5 g) por porción. Para ajustar la cantidad a tu rutina específica — sobre todo si tienes anemia diagnosticada, fatiga crónica o estás bajo seguimiento médico — conversa con un médico integrativo de Organnical para que te oriente.",
  },
  {
    q: "¿Tiene efectos secundarios? ¿Quién no debería tomarla?",
    a: "La espirulina es bien tolerada por la mayoría de personas. Sin embargo, debes consultar con un médico antes de incorporarla si: tomas anticoagulantes (la espirulina aporta vitamina K y puede interferir con warfarina); tienes una enfermedad autoinmune (lupus, artritis reumatoide, esclerosis múltiple), porque puede estimular el sistema inmune; o tienes fenilcetonuria (PKU), porque contiene fenilalanina. En todos esos casos, la indicación médica es obligatoria.",
    safety: true,
  },
  {
    q: "¿Por qué Spirusol vs otras espirulinas en el mercado?",
    a: "Spirusol se cultiva en Arequipa bajo radiación solar excepcionalmente alta, lo que favorece densidad nutricional. Greenner SAC seca a baja temperatura para preservar nutrientes. Cada lote tiene Registro Sanitario MINSA vigente (M5828924N), certificación Vegan Verified internacional y análisis del IIN — todos los valores nutricionales del rotulado y del marketing están respaldados por estos documentos, que están disponibles para revisión en esta misma página.",
  },
  {
    q: "¿Cómo guardo el producto y cuánto dura abierto?",
    a: "Vida útil: 12 meses desde la fecha de fabricación, indicada en el envase. Guarda el doypack cerrado en un lugar seco, fresco y protegido de la luz directa. Una vez abierto, mantén el cierre hermético del doypack y consume preferentemente en 60 días para conservar color y sabor óptimos.",
  },
  {
    q: "¿De dónde viene? ¿Cómo se certifica que es vegana?",
    a: "Spirusol es producida por Greenner SAC en Moquegua, con cultivos en Arequipa (Perú). La certificación vegana es VeganVerified.org (ID 05-260281-1), una entidad internacional independiente que audita la cadena de producción para confirmar ausencia de ingredientes animales y que ningún proceso involucra testeo en animales. Vigencia hasta febrero 2027.",
  },
  {
    q: "¿Hacen envío a todo el Perú?",
    a: "Sí. Organnical hace envío a todo el Perú vía courier. Envío gratis desde S/300 de compra; debajo de ese monto se cobra delivery según destino. Los pedidos en Lima Metropolitana llegan en 24–48 h; provincias en 3–6 días hábiles.",
  },
]

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
