import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { PublicBrand, PublicProduct } from "@/lib/types"
import { getStockBySkus } from "@/lib/inventory"

/**
 * Helpers compartidos entre `app/marcas/[brand]/layout.tsx` y `page.tsx`.
 * `cache()` de React deduplica la query cuando layout y page se renderizan en el mismo
 * request — la sub-tarea queda en una sola ida a Supabase por render.
 */

const PUBLIC_BRAND_FIELDS =
  "id, slug, nombre, tagline, logo_url, hero_image, descripcion, origen, productor, certificados, theme_tokens"

export const getMarcaBySlug = cache(async (slug: string): Promise<PublicBrand | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("marcas")
    .select(PUBLIC_BRAND_FIELDS)
    .eq("slug", slug)
    .eq("visible", true)
    .maybeSingle()

  if (error || !data) return null
  return data as PublicBrand
})

/**
 * Productos publicados de una marca, con stock resuelto, ordenados por precio asc.
 * Excluye SKUs con stock 0 si querés ocultar sin stock — por ahora los incluye
 * para que la página muestre "Agotado" y mantenga indexación SEO.
 */
const PUBLIC_PRODUCT_FIELDS =
  "id, sku, descripcion, descripcion_corta, descripcion_larga, ingredientes, modo_uso, advertencias, presentacion, categoria, precio_publico, precio_oferta, slug_publico, imagen_url, imagenes_galeria, tags, peso_g, nutrition_facts, registro_sanitario, vida_util_meses, laboratorio, origen"

export const getProductosByMarcaId = cache(
  async (marcaId: string): Promise<PublicProduct[]> => {
    const supabase = await createClient()
    const { data } = await supabase
      .from("productos")
      .select(PUBLIC_PRODUCT_FIELDS)
      .eq("marca_id", marcaId)
      .eq("visible_publico", true)
      .eq("activo", true)
      .order("precio_publico", { ascending: true })

    const productos = (data as PublicProduct[]) ?? []
    if (productos.length === 0) return []

    const stockMap = await getStockBySkus(supabase, productos.map((p) => p.sku))
    for (const p of productos) {
      p.stock = stockMap.has(p.sku) ? stockMap.get(p.sku)! : null
    }
    return productos
  }
)
