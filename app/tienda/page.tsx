import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import LogoutButton from "@/components/LogoutButton"
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

const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")"
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

interface Props {
  searchParams: Promise<{ categoria?: string; marca?: string }>
}

interface MarcaChip {
  id: string
  slug: string
  nombre: string
  logo_url: string | null
}

async function getProductos(categoria?: string, marcaSlug?: string): Promise<PublicProduct[]> {
  const supabase = await createClient()
  let query = supabase
    .from("productos")
    .select(
      // marca:marcas(...) hace embed via FK productos.marca_id → marcas.id; null si el producto no tiene marca.
      "id, sku, descripcion, descripcion_corta, descripcion_larga, ingredientes, modo_uso, advertencias, presentacion, categoria, precio_publico, precio_oferta, slug_publico, imagen_url, imagenes_galeria, tags, peso_g, marca_id, marca:marcas(id, slug, nombre, logo_url)"
    )
    .eq("visible_publico", true)
    .eq("activo", true)
    .order("orden", { ascending: true })

  if (categoria) query = query.eq("categoria", categoria)
  // Filtro marca: resolvemos slug→id antes para mantener PostgREST simple.
  if (marcaSlug) {
    const { data: m } = await supabase.from("marcas").select("id").eq("slug", marcaSlug).maybeSingle()
    if (m?.id) query = query.eq("marca_id", m.id)
    else return []  // marca inexistente → catálogo vacío en vez de fallar silencioso
  }

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

async function getMarcas(): Promise<MarcaChip[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("marcas")
    .select("id, slug, nombre, logo_url")
    .eq("visible", true)
    .order("nombre", { ascending: true })
  return (data ?? []) as MarcaChip[]
}

/** Helper para preservar params al cambiar de filtro (categoria pasa, se cambia solo marca, etc.). */
function buildHref(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) qs.set(k, v)
  }
  const s = qs.toString()
  return s ? `/tienda?${s}` : "/tienda"
}

export default async function TiendaPage({ searchParams }: Props) {
  const params = await searchParams
  const categoriaActual = params.categoria
  const marcaActual = params.marca

  const [productos, categorias, marcas] = await Promise.all([
    getProductos(categoriaActual, marcaActual),
    getCategorias(),
    getMarcas(),
  ])

  // Banner "Mundo Spirusol" cuando se filtra por esa marca — link al subdominio.
  const marcaActualObj = marcaActual ? marcas.find((m) => m.slug === marcaActual) : null
  const showSpirusolBanner = marcaActualObj?.slug === "spirusol"

  return (
    <main className="min-h-screen" style={{ background: "#F8FAFC" }}>

      {/* ── Header sticky ───────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30"
        style={{ background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)" }}
      >
        {/* Noise */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{ backgroundImage: NOISE, backgroundRepeat: "repeat", backgroundSize: "180px 180px" }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blob */}
        <div
          className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: G }}
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-5 pb-5">

          {/* Fila 1: logo + nav central + envío gratis */}
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-white.png"
                alt="Organnical"
                width={100}
                height={24}
                className="opacity-75 hover:opacity-100 transition-opacity"
              />
            </Link>
            {/* Nav central — desktop */}
            <nav className="hidden sm:flex items-center gap-5 flex-1 justify-center">
              <Link href="/cuenta" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Mi cuenta</Link>
              <Link href="/cuenta/botica" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Botica</Link>
              <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>Tienda</span>
              <Link href="/blog" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Blog</Link>
            </nav>
            <LogoutButton />
          </div>

          {/* Fila 2: avatar + título + producto count */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: G }}
            >
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-black text-white leading-tight">Tienda</h1>
              <p className="text-white/40 text-xs">
                {productos.length} {productos.length === 1 ? "producto disponible" : "productos disponibles"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-8">

          {/* Sidebar categorías + marcas — desktop */}
          {(categorias.length > 0 || marcas.length > 0) && (
            <aside className="hidden md:block w-44 flex-shrink-0 pt-1 space-y-6">
              {categorias.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#A78BFA] mb-3">Categorías</p>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href={buildHref({ marca: marcaActual })}
                        className="block text-sm px-3 py-1.5 rounded-xl font-medium transition-all"
                        style={!categoriaActual
                          ? { background: G, color: "#fff" }
                          : { color: "#71717a" }}
                      >
                        Todas
                      </a>
                    </li>
                    {categorias.map((cat) => (
                      <li key={cat}>
                        <a
                          href={buildHref({ categoria: cat, marca: marcaActual })}
                          className="block text-sm px-3 py-1.5 rounded-xl font-medium transition-all"
                          style={categoriaActual === cat
                            ? { background: G, color: "#fff" }
                            : { color: "#71717a" }}
                        >
                          {cat}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {marcas.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#A78BFA] mb-3">Marcas</p>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href={buildHref({ categoria: categoriaActual })}
                        className="block text-sm px-3 py-1.5 rounded-xl font-medium transition-all"
                        style={!marcaActual
                          ? { background: G, color: "#fff" }
                          : { color: "#71717a" }}
                      >
                        Todas
                      </a>
                    </li>
                    {marcas.map((m) => (
                      <li key={m.slug}>
                        <a
                          href={buildHref({ categoria: categoriaActual, marca: m.slug })}
                          className="block text-sm px-3 py-1.5 rounded-xl font-medium transition-all"
                          style={marcaActual === m.slug
                            ? { background: G, color: "#fff" }
                            : { color: "#71717a" }}
                        >
                          {m.nombre}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}

          <div className="flex-1">

            {/* Chips categorías — mobile */}
            {categorias.length > 0 && (
              <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-3 -mx-4 px-4">
                <a
                  href={buildHref({ marca: marcaActual })}
                  className="flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
                  style={!categoriaActual
                    ? { background: G, color: "#fff" }
                    : { border: "1px solid #e4e4e7", color: "#71717a", background: "transparent" }}
                >
                  Todas
                </a>
                {categorias.map((cat) => (
                  <a
                    key={cat}
                    href={buildHref({ categoria: cat, marca: marcaActual })}
                    className="flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
                    style={categoriaActual === cat
                      ? { background: G, color: "#fff" }
                      : { border: "1px solid #e4e4e7", color: "#71717a", background: "transparent" }}
                  >
                    {cat}
                  </a>
                ))}
              </div>
            )}

            {/* Chips marcas — mobile */}
            {marcas.length > 0 && (
              <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
                <a
                  href={buildHref({ categoria: categoriaActual })}
                  className="flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
                  style={!marcaActual
                    ? { background: G, color: "#fff" }
                    : { border: "1px solid #e4e4e7", color: "#71717a", background: "transparent" }}
                >
                  Todas las marcas
                </a>
                {marcas.map((m) => (
                  <a
                    key={m.slug}
                    href={buildHref({ categoria: categoriaActual, marca: m.slug })}
                    className="flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
                    style={marcaActual === m.slug
                      ? { background: G, color: "#fff" }
                      : { border: "1px solid #e4e4e7", color: "#71717a", background: "transparent" }}
                  >
                    {m.nombre}
                  </a>
                ))}
              </div>
            )}

            {/* Banner "Mundo Spirusol" — link al subdominio cuando se filtra por marca=spirusol */}
            {showSpirusolBanner && (
              <a
                href="https://spirusol.organnical.pe/?utm_source=organnical_tienda&utm_medium=marca_filter&utm_campaign=cross"
                className="block mb-5 rounded-2xl border border-[#6DA94C]/30 bg-gradient-to-br from-[#94C975]/15 via-white to-[#F2A93B]/10 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {marcaActualObj.logo_url && (
                    <Image
                      src={marcaActualObj.logo_url}
                      alt="Spirusol"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1E5E3D]">Conoce el mundo Spirusol</p>
                    <p className="text-xs text-[#1E5E3D]/70">
                      Espirulina del sol del sur · IIN 67% proteína · Vegan Verified
                    </p>
                  </div>
                  <span className="text-[#1E5E3D] font-bold text-lg" aria-hidden="true">→</span>
                </div>
              </a>
            )}

            {/* Grid de productos */}
            {productos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productos.map((p) => (
                  <ProductCard key={p.sku} producto={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-zinc-400">
                <p className="text-base">Sin productos en esta categoría</p>
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
