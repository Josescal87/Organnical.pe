import Link from "next/link"
import Image from "next/image"
import { Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

type TeaserProduct = {
  sku: string
  descripcion: string
  categoria: string
  imagen_url: string | null
}

const PLACEHOLDERS: TeaserProduct[] = [
  { sku: "p1", descripcion: "Suplemento de bienestar", categoria: "Bienestar", imagen_url: null },
  { sku: "p2", descripcion: "Apoyo para el sueño", categoria: "Sueño", imagen_url: null },
  { sku: "p3", descripcion: "Alivio del estrés", categoria: "Ansiedad", imagen_url: null },
  { sku: "p4", descripcion: "Bienestar femenino", categoria: "Salud Femenina", imagen_url: null },
]

const WA_TEXT = encodeURIComponent(
  "Hola, me interesa conocer sus suplementos de bienestar. ¿Me pueden orientar?"
)

export default async function ProductTeaserSection() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("productos")
    .select("sku, descripcion, categoria, imagen_url")
    .eq("activo", true)
    .order("orden")
    .limit(4)

  const items: TeaserProduct[] =
    data && data.length > 0 ? (data as TeaserProduct[]) : PLACEHOLDERS

  return (
    <section className="px-6 py-24 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">
            Nuestros productos
          </p>
          <h2 className="font-display text-4xl font-black text-[#0B1D35] md:text-5xl mb-4">
            Descubre nuestros{" "}
            <span
              style={{
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                backgroundImage: G,
              }}
            >
              suplementos
            </span>
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg">
            Productos de bienestar respaldados por médicos especializados. Crea tu cuenta
            gratuita para ver el catálogo completo con precios y disponibilidad.
          </p>
        </div>

        <div className="reveal grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {items.map((p) => (
            <div
              key={p.sku}
              className="bg-white rounded-3xl border border-zinc-100 overflow-hidden"
            >
              <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
                {p.imagen_url ? (
                  <Image
                    src={p.imagen_url}
                    alt={p.descripcion}
                    fill
                    className="object-contain p-4 blur-sm scale-110"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
                    🌿
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                  <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                    <Lock className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  {p.categoria}
                </p>
                <p className="font-bold text-sm text-[#0B1D35] mb-2 line-clamp-2">
                  {p.descripcion}
                </p>
                <p className="text-xs font-semibold text-zinc-300">Ver precio →</p>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/registro?ref=catalogo"
            className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: G,
              boxShadow: "0 16px 36px rgba(167,139,250,0.25)",
            }}
          >
            Crear cuenta gratis →
          </Link>
          <a
            href={`https://wa.me/51952476574?text=${WA_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-10 py-4 text-sm font-semibold text-zinc-600 hover:border-violet-300 hover:text-[#A78BFA] transition-all"
          >
            Hablar con un asesor
          </a>
        </div>
      </div>
    </section>
  )
}
