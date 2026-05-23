import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import ProductGallery from "@/components/ProductGallery"
import AddToCartButton from "@/components/AddToCartButton"
import ProductCard from "@/components/ProductCard"
import TrackViewItem from "@/components/analytics/TrackViewItem"
import BrandHeaderChip from "@/components/brand/BrandHeaderChip"
import NutritionTable from "@/components/brand/NutritionTable"
import CertificateBadges from "@/components/brand/CertificateBadges"
import { getStockBySkus, LOW_STOCK_THRESHOLD } from "@/lib/inventory"
import { formatPrice } from "@/lib/utils"
import type { PublicProduct } from "@/lib/types"
import { Package, CheckCircle, AlertTriangle, MapPin } from "lucide-react"

const RELATED_LIMIT = 4
// `marca:marcas(...)` embeds la marca via FK productos.marca_id → marcas.id.
// Devuelve `marca: null` cuando el producto no tiene marca asignada.
const PRODUCT_FIELDS =
  "id, sku, descripcion, descripcion_corta, descripcion_larga, ingredientes, modo_uso, advertencias, presentacion, categoria, precio_publico, precio_oferta, slug_publico, imagen_url, imagenes_galeria, tags, peso_g, marca_id, nutrition_facts, registro_sanitario, vida_util_meses, laboratorio, origen, marca:marcas(id, slug, nombre, tagline, logo_url, hero_image, descripcion, origen, productor, certificados, theme_tokens)"

export const dynamic = "force-dynamic"

// Disclaimer al pie del detalle. El texto por defecto (suplemento) se preserva
// para no alterar categorías existentes; solo se sobreescriben las categorías
// donde la frase "Suplemento alimenticio" es claramente incorrecta.
const DEFAULT_DISCLAIMER =
  "Suplemento alimenticio. No es un medicamento. Consulta a tu médico si tienes condiciones preexistentes."
const DISCLAIMERS_POR_CATEGORIA: Record<string, string> = {
  Accesorios: "Producto de uso externo. No es un dispositivo médico. Sigue las instrucciones de uso indicadas.",
  Topicos: "Producto de uso tópico externo. No es un medicamento. Suspender el uso si se presenta irritación.",
}
function getDisclaimer(categoria: string | null | undefined): string {
  if (!categoria) return DEFAULT_DISCLAIMER
  return DISCLAIMERS_POR_CATEGORIA[categoria] ?? DEFAULT_DISCLAIMER
}

interface Props {
  params: Promise<{ slug: string }>
}

async function getProducto(slug: string): Promise<PublicProduct | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("productos")
    .select(PRODUCT_FIELDS)
    .eq("slug_publico", slug)
    .eq("visible_publico", true)
    .eq("activo", true)
    .single()

  if (error || !data) return null
  const producto = data as PublicProduct
  const stockMap = await getStockBySkus(supabase, [producto.sku])
  producto.stock = stockMap.has(producto.sku) ? stockMap.get(producto.sku)! : null
  return producto
}

async function getRelacionados(
  supabase: SupabaseClient,
  currentId: string,
  currentCategoria: string,
  currentTags: string[] | null
): Promise<PublicProduct[]> {
  const collected: PublicProduct[] = []
  const seen = new Set<string>([currentId])

  function take(rows: unknown): void {
    for (const p of (rows as PublicProduct[]) ?? []) {
      if (collected.length >= RELATED_LIMIT) break
      if (seen.has(p.id)) continue
      seen.add(p.id)
      collected.push(p)
    }
  }

  if (currentCategoria) {
    const { data } = await supabase
      .from("productos")
      .select(PRODUCT_FIELDS)
      .eq("visible_publico", true)
      .eq("activo", true)
      .eq("categoria", currentCategoria)
      .neq("id", currentId)
      .order("orden", { ascending: true })
      .limit(RELATED_LIMIT)
    take(data)
  }

  if (collected.length < RELATED_LIMIT && currentTags && currentTags.length > 0) {
    const { data } = await supabase
      .from("productos")
      .select(PRODUCT_FIELDS)
      .eq("visible_publico", true)
      .eq("activo", true)
      .neq("id", currentId)
      .overlaps("tags", currentTags)
      .order("orden", { ascending: true })
      .limit(RELATED_LIMIT * 2)
    take(data)
  }

  if (collected.length < RELATED_LIMIT) {
    const need = RELATED_LIMIT - collected.length
    const excludeIds = Array.from(seen).map((id) => `"${id}"`).join(",")
    const { data } = await supabase
      .from("productos")
      .select(PRODUCT_FIELDS)
      .eq("visible_publico", true)
      .eq("activo", true)
      .not("id", "in", `(${excludeIds})`)
      .order("created_at", { ascending: false })
      .limit(need)
    take(data)
  }

  return collected.slice(0, RELATED_LIMIT)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProducto(slug)
  if (!producto) return { title: "Producto no encontrado" }
  return {
    title: producto.descripcion,
    description: producto.descripcion_corta ?? `Compra ${producto.descripcion} en Organnical. Suplementos naturales con envío a Lima.`,
    alternates: { canonical: `https://organnical.pe/productos/${slug}` },
    ...(producto.imagen_url ? { openGraph: { images: [producto.imagen_url] } } : {}),
  }
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const producto = await getProducto(slug)
  if (!producto) notFound()

  const precio = producto.precio_oferta ?? producto.precio_publico
  const tieneOferta = Boolean(producto.precio_oferta)

  const supabase = await createClient()
  const relacionados = await getRelacionados(supabase, producto.id, producto.categoria, producto.tags)

  // JSON-LD ampliado con brand + nutrition + additionalProperty para riquecer los
  // rich results en Google. Spec §6.6 — solo añade campos cuando el producto los tiene.
  const additionalProperty: Array<{ "@type": "PropertyValue"; name: string; value: string }> = []
  if (producto.registro_sanitario) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Registro Sanitario MINSA",
      value: producto.registro_sanitario,
    })
  }
  if (producto.laboratorio) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Análisis de laboratorio",
      value: producto.laboratorio,
    })
  }
  if (producto.origen) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Origen",
      value: producto.origen,
    })
  }

  const nutritionLd = producto.nutrition_facts
    ? {
        "@type": "NutritionInformation",
        servingSize: producto.nutrition_facts.porcion,
        ...(producto.nutrition_facts.por_100g.energia_kcal != null && {
          calories: `${producto.nutrition_facts.por_100g.energia_kcal} kcal`,
        }),
        ...(producto.nutrition_facts.por_100g.proteina_g != null && {
          proteinContent: `${producto.nutrition_facts.por_100g.proteina_g} g`,
        }),
        ...(producto.nutrition_facts.por_100g.grasa_g != null && {
          fatContent: `${producto.nutrition_facts.por_100g.grasa_g} g`,
        }),
        ...(producto.nutrition_facts.por_100g.carbohidratos_g != null && {
          carbohydrateContent: `${producto.nutrition_facts.por_100g.carbohidratos_g} g`,
        }),
        ...(producto.nutrition_facts.por_100g.sodio_mg != null && {
          sodiumContent: `${producto.nutrition_facts.por_100g.sodio_mg} mg`,
        }),
      }
    : undefined

  const stockAvailability =
    producto.stock != null && producto.stock === 0
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock"

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.descripcion,
    description: producto.descripcion_corta ?? "",
    image: producto.imagen_url ?? "",
    sku: producto.sku,
    ...(producto.categoria && { category: producto.categoria }),
    ...(producto.marca && {
      brand: {
        "@type": "Brand",
        name: producto.marca.nombre,
        ...(producto.marca.logo_url && { logo: producto.marca.logo_url }),
      },
    }),
    ...(nutritionLd && { nutrition: nutritionLd }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: precio,
      availability: stockAvailability,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackViewItem producto={producto} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-gray-600">Inicio</Link>
          <span>/</span>
          <Link href="/tienda" className="hover:text-gray-600">Tienda</Link>
          <span>/</span>
          <span className="text-gray-600">{producto.descripcion}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery
            imagenPrincipal={producto.imagen_url}
            galeria={producto.imagenes_galeria}
            nombre={producto.descripcion}
          />

          <div className="space-y-6">
            {/* Header de marca + categoría. Con marca poblada damos prioridad visual al chip. */}
            <div className="flex flex-wrap items-center gap-3">
              {producto.marca && <BrandHeaderChip marca={producto.marca} />}
              {producto.categoria && (
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                  {producto.categoria}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {producto.descripcion}
            </h1>

            {producto.descripcion_corta && (
              <p className="text-gray-500 text-base leading-relaxed">{producto.descripcion_corta}</p>
            )}

            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-gray-900">{formatPrice(precio)}</p>
              {tieneOferta && (
                <p className="text-lg text-gray-400 line-through mb-0.5">{formatPrice(producto.precio_publico)}</p>
              )}
              {tieneOferta && (
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">OFERTA</span>
              )}
            </div>

            {producto.stock != null && producto.stock === 0 && (
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-xl">
                <AlertTriangle size={16} />
                <span>Agotado — sin stock disponible</span>
              </div>
            )}
            {producto.stock != null && producto.stock > 0 && producto.stock <= LOW_STOCK_THRESHOLD && (
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50 px-4 py-2 rounded-xl">
                <Package size={16} />
                <span>Solo quedan {producto.stock} {producto.stock === 1 ? "unidad" : "unidades"}</span>
              </div>
            )}

            <AddToCartButton producto={producto} />

            {producto.presentacion && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
                <Package size={16} />
                <span>{producto.presentacion}</span>
                {producto.peso_g && <span>· {producto.peso_g}g</span>}
              </div>
            )}

            {/* Origen + productor — para productos con marca de procedencia trazada. */}
            {(producto.origen || producto.marca?.productor) && (
              <div className="flex items-start gap-2 text-sm text-gray-500 bg-emerald-50/40 px-4 py-2 rounded-xl border border-emerald-100">
                <MapPin size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {producto.origen && <span>{producto.origen}</span>}
                  {producto.origen && producto.marca?.productor && <span> · </span>}
                  {producto.marca?.productor && (
                    <span className="font-medium text-gray-700">{producto.marca.productor}</span>
                  )}
                </div>
              </div>
            )}

            {producto.modo_uso && (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-purple-600" /> Modo de uso
                </p>
                <p className="text-sm text-gray-500 ml-5">{producto.modo_uso}</p>
              </div>
            )}

            {producto.nutrition_facts && <NutritionTable facts={producto.nutrition_facts} />}

            {producto.marca?.certificados && producto.marca.certificados.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Certificaciones y respaldos
                </p>
                <CertificateBadges certificados={producto.marca.certificados} />
              </div>
            )}

            {producto.ingredientes && (
              <details className="group">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer list-none flex items-center justify-between py-3 border-t border-gray-100">
                  Ingredientes
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{producto.ingredientes}</p>
              </details>
            )}

            {producto.advertencias && (
              <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">{producto.advertencias}</p>
              </div>
            )}

            {producto.descripcion_larga && (
              <div className="prose prose-sm max-w-none text-gray-600 border-t border-gray-100 pt-6 whitespace-pre-line">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Descripción</h3>
                {producto.descripcion_larga}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">
              {getDisclaimer(producto.categoria)}
            </p>
          </div>
        </div>

        {relacionados.length > 0 && (
          <section className="mt-16 border-t border-gray-100 pt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relacionados.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
