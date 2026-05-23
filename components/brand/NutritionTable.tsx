import type { NutritionFacts } from "@/lib/supabase/database.types"

/**
 * Tabla nutricional desplegable. Renderiza solo las claves presentes en
 * `por_100g`. Tabular-nums para alinear columnas.
 *
 * Spec Spirusol §6.2 (extensión PDP) — los valores se citan textualmente
 * del Informe IIN N° 000114-2025 (§19, no modificar).
 */
const LABELS: Record<string, { label: string; unidad: string }> = {
  proteina_g:                          { label: "Proteína",              unidad: "g" },
  grasa_g:                             { label: "Grasa total",           unidad: "g" },
  carbohidratos_g:                     { label: "Carbohidratos",         unidad: "g" },
  energia_kcal:                        { label: "Energía",               unidad: "kcal" },
  humedad_g:                           { label: "Humedad",               unidad: "g" },
  ceniza_g:                            { label: "Cenizas",               unidad: "g" },
  sodio_mg:                            { label: "Sodio",                 unidad: "mg" },
  hierro_mg:                           { label: "Hierro",                unidad: "mg" },
  calcio_mg:                           { label: "Calcio",                unidad: "mg" },
  capacidad_antioxidante_umol_trolox:  { label: "Capacidad antioxidante", unidad: "µmol Trolox" },
  vitamina_b2_mg:                      { label: "Vitamina B2",           unidad: "mg" },
  vitamina_b6_mg:                      { label: "Vitamina B6",           unidad: "mg" },
}

const FORMAT_ORDER = [
  "proteina_g",
  "grasa_g",
  "carbohidratos_g",
  "energia_kcal",
  "humedad_g",
  "ceniza_g",
  "sodio_mg",
  "hierro_mg",
  "calcio_mg",
  "capacidad_antioxidante_umol_trolox",
  "vitamina_b2_mg",
  "vitamina_b6_mg",
]

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString("es-PE")
  if (n >= 100) return n.toFixed(1)
  return n.toFixed(2).replace(/\.?0+$/, "")
}

export default function NutritionTable({ facts }: { facts: NutritionFacts }) {
  const entries = FORMAT_ORDER
    .filter((k) => facts.por_100g[k] != null)
    .map((k) => ({ key: k, value: facts.por_100g[k]!, ...LABELS[k] }))

  return (
    <details className="group rounded-xl border border-gray-100 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-600"
          >
            <path d="M9 11H1l8-8 8 8h-8" />
            <path d="M9 22V11" />
          </svg>
          Tabla nutricional
          <span className="text-gray-400 font-normal">· por 100 g</span>
        </span>
        <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
      </summary>

      <div className="px-4 pb-4">
        <p className="text-xs text-gray-500 mb-3">
          Porción: <span className="font-medium text-gray-700">{facts.porcion}</span>
          {facts.porciones_por_envase != null && (
            <span> · {facts.porciones_por_envase} porciones por envase</span>
          )}
        </p>

        <table className="w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          <tbody>
            {entries.map(({ key, value, label, unidad }) => (
              <tr key={key} className="border-t border-gray-100">
                <td className="py-2 text-gray-600">{label}</td>
                <td className="py-2 text-right font-semibold text-gray-800">
                  {fmt(value)} <span className="text-gray-400 font-normal text-xs">{unidad}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {facts.fuente && (
          <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">{facts.fuente}</p>
        )}
      </div>
    </details>
  )
}
