import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import type { BlogRelatedProduct } from "@/lib/blog"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

type FetchedProduct = {
  slug_publico: string
  descripcion: string
  descripcion_corta: string | null
  precio_publico: number
  precio_oferta: number | null
  imagen_url: string | null
}

export default async function RelatedProducts({
  products,
}: {
  products: BlogRelatedProduct[]
}) {
  if (!products?.length) return null

  const slugs = products.map((p) => p.slug)
  const supabase = await createClient()
  const { data } = await supabase
    .from("productos")
    .select("slug_publico, descripcion, descripcion_corta, precio_publico, precio_oferta, imagen_url")
    .in("slug_publico", slugs)
    .eq("visible_publico", true)
    .eq("activo", true)

  const bySlug = new Map<string, FetchedProduct>(
    ((data as FetchedProduct[]) ?? []).map((p) => [p.slug_publico, p]),
  )

  // Conserva orden y reason del autor del post; descarta los que ya no existen/no son visibles.
  const items = products
    .map((rp) => ({ rp, product: bySlug.get(rp.slug) }))
    .filter((x): x is { rp: BlogRelatedProduct; product: FetchedProduct } => Boolean(x.product))

  if (items.length === 0) return null

  return (
    <section
      className="mt-10 pt-8 border-t border-zinc-100"
      aria-labelledby="blog-related-products-heading"
    >
      <h2
        id="blog-related-products-heading"
        className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-5"
      >
        Productos mencionados
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ rp, product }) => {
          const price = product.precio_oferta ?? product.precio_publico
          const hasOffer = product.precio_oferta != null && product.precio_oferta < product.precio_publico
          return (
            <Link
              key={rp.slug}
              href={`/productos/${product.slug_publico}`}
              className="group flex gap-4 rounded-2xl border border-zinc-100 bg-white p-4 transition-all hover:border-violet-200 hover:shadow-sm"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-50">
                {product.imagen_url ? (
                  <Image
                    src={product.imagen_url}
                    alt={product.descripcion}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <p className="font-semibold text-sm text-[#0B1D35] leading-snug line-clamp-2 group-hover:text-[#7c6fed] transition-colors">
                    {product.descripcion}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 leading-snug line-clamp-2">
                    {rp.reason}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-[#0B1D35]">{formatPrice(price)}</span>
                    {hasOffer && (
                      <span className="text-[11px] text-zinc-400 line-through">
                        {formatPrice(product.precio_publico)}
                      </span>
                    )}
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                    style={{ background: G }}
                  >
                    Ver <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
