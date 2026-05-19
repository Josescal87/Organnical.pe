import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getStockBySkus } from "@/lib/inventory"
import ProductCard from "@/components/ProductCard"
import type { PublicProduct } from "@/lib/types"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

export default async function ProductTeaserSection() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("productos")
    .select(
      "id, sku, descripcion, descripcion_corta, categoria, precio_publico, precio_oferta, slug_publico, imagen_url, tags, peso_g"
    )
    .eq("visible_publico", true)
    .eq("activo", true)
    .order("orden", { ascending: true })
    .limit(8)

  const productos = (data as PublicProduct[]) ?? []

  if (productos.length > 0) {
    const stockMap = await getStockBySkus(supabase, productos.map((p) => p.sku))
    for (const p of productos) {
      p.stock = stockMap.has(p.sku) ? stockMap.get(p.sku)! : null
    }
  }

  if (productos.length === 0) return null

  return (
    <section className="px-6 py-20 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">
              Tienda
            </p>
            <h2 className="font-display text-4xl font-black text-[#0B1D35] md:text-5xl">
              Productos{" "}
              <span
                style={{
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  backgroundImage: G,
                }}
              >
                destacados
              </span>
            </h2>
          </div>
          <Link
            href="/tienda"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#A78BFA] hover:gap-3 transition-all"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {productos.map((p) => (
            <ProductCard key={p.sku} producto={p} />
          ))}
        </div>

        <div className="reveal flex justify-center sm:hidden">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: G }}
          >
            Ver todos los productos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
