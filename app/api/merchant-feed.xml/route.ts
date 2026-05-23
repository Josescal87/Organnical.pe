import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * Merchant feed para Google Merchant Center + Meta Catalog.
 *
 * Spec Spirusol §13 — sumar los 2 SKUs al feed dinámico `/api/merchant-feed.xml`.
 * Implementación generalizada: cualquier producto con `visible_publico=true,
 * activo=true, slug_publico, precio_publico` aparece. La marca queda mapeada via
 * embed `marca:marcas(slug,nombre)` (null cuando el producto no tiene marca).
 *
 * Spec del formato:
 *   https://support.google.com/merchants/answer/7052112 (Google Merchant)
 *   https://developers.facebook.com/docs/marketing-api/catalog/reference (Meta)
 */

export const dynamic = "force-dynamic"
export const revalidate = 3600 // 1 hora — el feed se refresca por crawler de Google c/24h

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://organnical.pe"

// Mapeo categoría interna → Google product category numeric ID (más confiable que strings).
// 2660 = Food, Beverages & Tobacco > Food Items > Health Foods (cubre superalimentos)
// 502984 = Health & Beauty > Health Care > Fitness & Nutrition > Nutritional Foods
// 8367 = Food, Beverages & Tobacco > Food Items > Snack Foods
const CATEGORIA_TO_GOOGLE: Record<string, number> = {
  Superalimentos: 2660,
  Alimentos:      2660,
  Bebidas:        2660,
  Gomitas:        2660,
  Topicos:        469,   // Health & Beauty > Personal Care
  Accesorios:     537,   // Health & Beauty > Personal Care > Massage & Relaxation
}

function escapeXml(s: string | null | undefined): string {
  if (!s) return ""
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function priceCents(n: number | null | undefined): string {
  if (n == null) return ""
  return `${n.toFixed(2)} PEN`
}

export async function GET() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("productos")
    .select(
      "sku, descripcion, descripcion_corta, descripcion_larga, categoria, precio_publico, precio_oferta, slug_publico, imagen_url, marca:marcas(slug,nombre)"
    )
    .eq("visible_publico", true)
    .eq("activo", true)
    .not("slug_publico", "is", null)
    .not("precio_publico", "is", null)

  if (error) {
    return new NextResponse("<error>feed unavailable</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    })
  }

  type Row = {
    sku: string
    descripcion: string
    descripcion_corta: string | null
    descripcion_larga: string | null
    categoria: string
    precio_publico: number
    precio_oferta: number | null
    slug_publico: string
    imagen_url: string | null
    marca: { slug: string; nombre: string } | null
  }

  const productos = (data ?? []) as Row[]

  // Stock check — opcional, agotados quedan `out of stock` en el feed.
  // La columna es `quantity` (no `stock_actual`).
  const skus = productos.map((p) => p.sku)
  let stockMap: Map<string, number> = new Map()
  if (skus.length > 0) {
    const { data: stockRows } = await admin
      .from("productos_stock")
      .select("sku, quantity")
      .in("sku", skus)
    stockMap = new Map(
      ((stockRows ?? []) as Array<{ sku: string; quantity: number }>).map((s) => [
        s.sku,
        s.quantity,
      ])
    )
  }

  const items = productos.map((p) => {
    const descripcionLarga = p.descripcion_larga ?? p.descripcion_corta ?? p.descripcion
    const googleCat = CATEGORIA_TO_GOOGLE[p.categoria] ?? 2660
    const stock = stockMap.get(p.sku)
    const availability = stock != null && stock === 0 ? "out of stock" : "in stock"
    const link = `${BASE}/productos/${p.slug_publico}?utm_source=google&utm_medium=cpc&utm_campaign=shopping`

    const salePrice =
      p.precio_oferta != null && p.precio_oferta < p.precio_publico ? p.precio_oferta : null

    return `
    <item>
      <g:id>${escapeXml(p.sku)}</g:id>
      <g:title>${escapeXml(p.descripcion)}</g:title>
      <g:description>${escapeXml(descripcionLarga)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(p.imagen_url ?? "")}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${priceCents(p.precio_publico)}</g:price>
      ${salePrice != null ? `<g:sale_price>${priceCents(salePrice)}</g:sale_price>` : ""}
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(p.marca?.nombre ?? "Organnical")}</g:brand>
      <g:mpn>${escapeXml(p.sku)}</g:mpn>
      <g:google_product_category>${googleCat}</g:google_product_category>
      <g:product_type>${escapeXml(p.categoria)}</g:product_type>
      <g:identifier_exists>${p.marca ? "false" : "false"}</g:identifier_exists>
      <g:adult>no</g:adult>
    </item>`.trim()
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Organnical — Catálogo</title>
    <link>${BASE}</link>
    <description>Catálogo de productos Organnical para Google Merchant Center y Meta Catalog</description>
    ${items.join("\n    ")}
  </channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
