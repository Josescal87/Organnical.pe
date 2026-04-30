import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight, ShieldAlert } from "lucide-react"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Catálogo de Productos — Organnical | Suplementos y Bienestar",
  description:
    "Productos certificados para sueño, dolor, ansiedad y salud femenina. Bajo supervisión médica especializada.",
  alternates: { canonical: "https://organnical.pe/catalogo" },
}

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY = "#0B1D35"

type Producto = {
  sku: string
  descripcion: string
  descripcion_corta: string | null
  categoria: string
  precio: number
  precio_oferta: number | null
  imagen_url: string | null
  requiere_receta: boolean
  tags: string[] | null
}

export default async function CatalogoPublicoPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("productos")
    .select(
      "sku, descripcion, descripcion_corta, categoria, precio, precio_oferta, imagen_url, requiere_receta, tags"
    )
    .eq("activo", true)
    .order("orden")
    .order("descripcion")

  const productos = (data ?? []) as Producto[]
  const categorias = [
    ...new Set(productos.map((p) => p.categoria).filter(Boolean)),
  ].sort()

  return (
    <main className="bg-white">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: NAVY }}>
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 50% 0%, #1a3a6e 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-sm font-medium text-white/80">
              Productos verificados · Ley 30681
            </span>
          </div>
          <h1 className="font-display text-5xl font-black text-white leading-tight md:text-6xl mb-5">
            Catálogo de{" "}
            <span
              style={{
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                backgroundImage: G,
              }}
            >
              Productos
            </span>
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            Suplementos y productos certificados para tu bienestar, bajo supervisión médica.
          </p>
        </div>
      </section>

      {/* ── Nota legal ── */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Algunos productos son de venta exclusiva bajo receta médica (Ley 30681).{" "}
            <Link href="/agendar" className="font-semibold underline">
              Agenda una consulta
            </Link>{" "}
            para obtener la tuya.
          </p>
        </div>
      </div>

      {/* ── Grid de productos ── */}
      <section className="px-6 py-16 bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl">
          {/* Filtro de categorías (decorativo, sin JS para SEO) */}
          {categorias.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {categorias.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold bg-white border border-zinc-200 text-zinc-600"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {productos.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-3xl mb-4">🌿</p>
              <p className="text-zinc-500 font-semibold">Catálogo en preparación</p>
              <p className="text-sm text-zinc-400 mt-1">Pronto tendremos productos disponibles para ti.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((p) => (
                <Link
                  key={p.sku}
                  href={`/catalogo/${p.sku}`}
                  className="group bg-white rounded-3xl border border-zinc-100 overflow-hidden hover:border-violet-200 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  {/* Imagen */}
                  <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
                    {p.imagen_url ? (
                      <Image
                        src={p.imagen_url}
                        alt={p.descripcion}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-zinc-200">
                        🌿
                      </div>
                    )}
                    {p.requiere_receta && (
                      <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                        Rx
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                      {p.categoria}
                    </p>
                    <h3 className="font-bold text-sm text-[#0B1D35] mb-1 group-hover:text-[#A78BFA] transition-colors line-clamp-2">
                      {p.descripcion}
                    </h3>
                    {p.descripcion_corta && (
                      <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{p.descripcion_corta}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div>
                        {p.precio_oferta ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-[#059669]">
                              S/ {p.precio_oferta.toFixed(2)}
                            </span>
                            <span className="text-xs text-zinc-400 line-through">
                              S/ {p.precio.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-black text-[#0B1D35]">
                            S/ {p.precio.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#A78BFA] transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">
            Orientación médica
          </p>
          <h2 className="font-display text-3xl font-black text-[#0B1D35] mb-4">
            ¿No sabes qué producto necesitas?
          </h2>
          <p className="text-zinc-500 mb-8">
            Nuestros médicos especializados te ayudan a elegir el producto correcto y emiten tu
            receta si la necesitas.
          </p>
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: G, boxShadow: "0 16px 36px rgba(167,139,250,0.25)" }}
          >
            Agendar consulta médica <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
