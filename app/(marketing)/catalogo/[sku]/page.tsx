import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft, ArrowRight, ShieldAlert, FileText, Download } from "lucide-react"

export const revalidate = 3600

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

type Producto = {
  sku: string
  descripcion: string
  descripcion_corta: string | null
  descripcion_larga: string | null
  categoria: string
  precio: number
  precio_oferta: number | null
  imagen_url: string | null
  imagenes_galeria: string[] | null
  ingredientes: string | null
  modo_uso: string | null
  advertencias: string | null
  presentacion: string | null
  peso_g: number | null
  ficha_url: string | null
  coa_url: string | null
  tags: string[] | null
  requiere_receta: boolean
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>
}): Promise<Metadata> {
  const { sku } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("productos")
    .select("descripcion, descripcion_corta, imagen_url")
    .eq("sku", sku)
    .single()

  if (!data) return { title: "Producto no encontrado — Organnical" }

  return {
    title: `${data.descripcion} — Organnical`,
    description:
      data.descripcion_corta ??
      `${data.descripcion} disponible en Organnical. Producto certificado bajo Ley 30681.`,
    openGraph: {
      images: data.imagen_url ? [{ url: data.imagen_url }] : [],
    },
  }
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ sku: string }>
}) {
  const { sku } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from("productos")
    .select("*")
    .eq("sku", sku)
    .eq("activo", true)
    .single()

  if (!data) notFound()

  const p = data as Producto
  const allImages = [p.imagen_url, ...(p.imagenes_galeria ?? [])].filter(Boolean) as string[]

  return (
    <main className="bg-white pt-24">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Back */}
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#A78BFA] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* ── Imágenes ── */}
          <div className="space-y-3">
            <div className="aspect-square bg-[#F8FAFC] rounded-3xl overflow-hidden border border-zinc-100 relative">
              {allImages[0] ? (
                <Image
                  src={allImages[0]}
                  alt={p.descripcion}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl text-zinc-200">
                  🌿
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {allImages.map((url, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-100 relative bg-[#F8FAFC]"
                  >
                    <Image
                      src={url}
                      alt={`${p.descripcion} ${i + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              {p.categoria}
            </p>
            <h1 className="font-display text-3xl font-black text-[#0B1D35] mb-3">
              {p.descripcion}
            </h1>
            {p.descripcion_corta && (
              <p className="text-zinc-500 leading-relaxed mb-5">{p.descripcion_corta}</p>
            )}

            {/* Precio */}
            <div className="flex items-baseline gap-3 mb-6">
              {p.precio_oferta ? (
                <>
                  <span className="font-display text-4xl font-black text-[#059669]">
                    S/ {p.precio_oferta.toFixed(2)}
                  </span>
                  <span className="text-xl text-zinc-400 line-through">
                    S/ {p.precio.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-display text-4xl font-black text-[#0B1D35]">
                  S/ {p.precio.toFixed(2)}
                </span>
              )}
            </div>

            {/* Rx Warning */}
            {p.requiere_receta && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800 text-sm mb-1">
                      Requiere receta médica
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Este producto es de venta exclusiva bajo receta médica, conforme a la Ley
                      30681 (cannabis medicinal Perú). Para comprarlo necesitas una receta vigente
                      emitida por un médico habilitado.
                    </p>
                    <Link
                      href="/agendar"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-amber-800 underline underline-offset-2"
                    >
                      Agendar consulta para obtener receta{" "}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Documentos */}
            {(p.ficha_url || p.coa_url) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {p.ficha_url && (
                  <a
                    href={p.ficha_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:border-violet-300 hover:text-[#A78BFA] transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> Ficha técnica
                  </a>
                )}
                {p.coa_url && (
                  <a
                    href={p.coa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:border-violet-300 hover:text-[#A78BFA] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Certificado COA
                  </a>
                )}
              </div>
            )}

            {/* Presentación y peso */}
            {(p.presentacion || p.peso_g) && (
              <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mb-6">
                {p.presentacion && (
                  <span className="bg-zinc-50 rounded-lg px-3 py-1.5 border border-zinc-100 font-medium">
                    {p.presentacion}
                  </span>
                )}
                {p.peso_g && (
                  <span className="bg-zinc-50 rounded-lg px-3 py-1.5 border border-zinc-100 font-medium">
                    {p.peso_g}g
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <Link
              href={p.requiere_receta ? "/agendar" : "/registro"}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: G }}
            >
              {p.requiere_receta ? "Agendar consulta" : "Acceder al catálogo"}{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!p.requiere_receta && (
              <p className="text-xs text-zinc-400 text-center mt-2">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-[#A78BFA] hover:underline">
                  Inicia sesión
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* ── Descripción extendida ── */}
        {(p.descripcion_larga || p.ingredientes || p.modo_uso || p.advertencias) && (
          <div className="mt-16 border-t border-zinc-100 pt-12">
            <div className="grid md:grid-cols-2 gap-10">
              {p.descripcion_larga && (
                <div>
                  <h2 className="font-display font-black text-xl text-[#0B1D35] mb-4">
                    Descripción
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-line">
                    {p.descripcion_larga}
                  </p>
                </div>
              )}
              {p.ingredientes && (
                <div>
                  <h2 className="font-display font-black text-xl text-[#0B1D35] mb-4">
                    Ingredientes activos
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-line">
                    {p.ingredientes}
                  </p>
                </div>
              )}
              {p.modo_uso && (
                <div>
                  <h2 className="font-display font-black text-xl text-[#0B1D35] mb-4">
                    Modo de uso
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-line">
                    {p.modo_uso}
                  </p>
                </div>
              )}
              {p.advertencias && (
                <div>
                  <h2 className="font-display font-black text-xl text-[#0B1D35] mb-4">
                    Advertencias
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-line">
                    {p.advertencias}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
