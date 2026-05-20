import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import ProductCard from "@/components/ProductCard"
import { getStockBySkus } from "@/lib/inventory"
import type { PublicProduct } from "@/lib/types"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Tienda Organnical — Suplementos naturales y bienestar",
  description: "Explora nuestros suplementos naturales: gomitas de melatonina, vitaminas, green juice y más. Avalados por médicos especializados. Envío gratis desde S/300.",
  alternates: { canonical: "https://organnical.pe/tienda" },
}

interface Props {
  searchParams: Promise<{ categoria?: string }>
}

async function getProductos(categoria?: string): Promise<PublicProduct[]> {
  const supabase = await createClient()
  let query = supabase
    .from("productos")
    .select(
      "id, sku, descripcion, descripcion_corta, descripcion_larga, ingredientes, modo_uso, advertencias, presentacion, categoria, precio_publico, precio_oferta, slug_publico, imagen_url, imagenes_galeria, tags, peso_g"
    )
    .eq("visible_publico", true)
    .eq("activo", true)
    .order("orden", { ascending: true })

  if (categoria) query = query.eq("categoria", categoria)
  const { data } = await query
  const productos = (data as PublicProduct[]) ?? []

  if (productos.length > 0) {
    const stockMap = await getStockBySkus(supabase, productos.map((p) => p.sku))
    for (const p of productos) {
      p.stock = stockMap.has(p.sku) ? stockMap.get(p.sku)! : null
    }
  }

  return productos
}

async function getCategorias(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("productos")
    .select("categoria")
    .eq("visible_publico", true)
    .eq("activo", true)
  const cats = [
    ...new Set((data ?? []).map((r: { categoria: string }) => r.categoria).filter(Boolean)),
  ] as string[]
  return cats.sort()
}

export default async function TiendaPage({ searchParams }: Props) {
  const params = await searchParams
  const categoriaActual = params.categoria

  const [productos, categorias] = await Promise.all([
    getProductos(categoriaActual),
    getCategorias(),
  ])

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <nav className="text-xs text-zinc-400 mb-3">
            <a href="/" className="hover:text-[#A78BFA]">Inicio</a>
            <span className="mx-2">›</span>
            <span className="text-zinc-600">Tienda</span>
          </nav>
          <h1 className="text-3xl font-black text-[#0B1D35] mb-1">Tienda</h1>
          <p className="text-zinc-500 text-sm">
            {productos.length} {productos.length === 1 ? "producto" : "productos"} disponibles
            · Envío gratis desde S/300
          </p>
        </div>

        <div className="flex gap-8">
          {categorias.length > 0 && (
            <aside className="hidden md:block w-44 flex-shrink-0">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Categorías</p>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/tienda"
                    className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      !categoriaActual
                        ? "bg-violet-50 text-[#7c3aed] font-semibold"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    Todos
                  </a>
                </li>
                {categorias.map((cat) => (
                  <li key={cat}>
                    <a
                      href={`/tienda?categoria=${encodeURIComponent(cat)}`}
                      className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        categoriaActual === cat
                          ? "bg-violet-50 text-[#7c3aed] font-semibold"
                          : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <div className="flex-1">
            {categorias.length > 0 && (
              <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
                <a
                  href="/tienda"
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border ${
                    !categoriaActual
                      ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                      : "border-zinc-200 text-zinc-600"
                  }`}
                >
                  Todos
                </a>
                {categorias.map((cat) => (
                  <a
                    key={cat}
                    href={`/tienda?categoria=${encodeURIComponent(cat)}`}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border ${
                      categoriaActual === cat
                        ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                        : "border-zinc-200 text-zinc-600"
                    }`}
                  >
                    {cat}
                  </a>
                ))}
              </div>
            )}

            {productos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productos.map((p) => (
                  <ProductCard key={p.sku} producto={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-zinc-400">
                <p className="text-lg">Sin productos en esta categoría</p>
                <a href="/tienda" className="text-sm text-[#A78BFA] mt-2 inline-block hover:underline">
                  Ver todos
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
