import type { CartItem, PublicProduct } from "@/lib/types"

/**
 * Meta Pixel + GA4 client-side. Sumamos `content_brand` (slug de la marca) cuando
 * el producto la tiene — habilita Custom Conversions en Ads Manager filtradas por
 * marca (spec Spirusol §9: "ROAS de Spirusol sin contaminar Yumi Gumi").
 *
 * TODO CAPI: el server-side via Conversions API queda pendiente — requiere
 * `META_ACCESS_TOKEN` env var y modificar el webhook de MercadoPago, que está
 * fuera del scope de esta fase. Cuando se sume, usar `event_id = purchase_${orderId}`
 * idéntico en browser y server para deduplicación.
 */

interface GA4Item {
  item_id: string
  item_name: string
  item_category?: string
  item_brand?: string
  price: number
  quantity: number
}

type GtagFn = (...args: unknown[]) => void
type FbqFn = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: GtagFn
    fbq?: FbqFn
  }
}

const CURRENCY = "PEN"

function ga4(eventName: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined") return
  const fn = window.gtag
  if (!fn) return
  try {
    fn("event", eventName, params)
  } catch (err) {
    console.warn("analytics: ga4 dispatch failed:", err)
  }
}

function fbq(
  eventName: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
): void {
  if (typeof window === "undefined") return
  const fn = window.fbq
  if (!fn) return
  try {
    // Meta Pixel acepta: fbq('track', name, params, { eventID }) — el 4to arg
    // habilita deduplicación browser↔CAPI cuando se envía el mismo event_id desde server.
    if (params && options) fn("track", eventName, params, options)
    else if (params) fn("track", eventName, params)
    else fn("track", eventName)
  } catch (err) {
    console.warn("analytics: fbq dispatch failed:", err)
  }
}

function unitPrice(p: PublicProduct): number {
  return p.precio_oferta ?? p.precio_publico
}

function toGa4Item(p: PublicProduct, cantidad = 1): GA4Item {
  return {
    item_id: p.sku,
    item_name: p.descripcion,
    item_category: p.categoria,
    ...(p.marca?.slug && { item_brand: p.marca.slug }),
    price: unitPrice(p),
    quantity: cantidad,
  }
}

function brandOf(p: PublicProduct): string | undefined {
  return p.marca?.slug
}

function cartToGa4Items(items: CartItem[]): GA4Item[] {
  return items.map((i) => toGa4Item(i.producto, i.cantidad))
}

function cartContentIds(items: CartItem[]): string[] {
  return items.map((i) => i.producto.sku)
}

function cartValue(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + unitPrice(i.producto) * i.cantidad, 0)
}

export function trackViewItem(producto: PublicProduct): void {
  const price = unitPrice(producto)
  const brand = brandOf(producto)
  ga4("view_item", { currency: CURRENCY, value: price, items: [toGa4Item(producto)] })
  fbq("ViewContent", {
    content_ids: [producto.sku],
    content_name: producto.descripcion,
    content_category: producto.categoria,
    content_type: "product",
    ...(brand && { content_brand: brand }),
    currency: CURRENCY,
    value: price,
  })
}

export function trackAddToCart(producto: PublicProduct, cantidad = 1): void {
  const price = unitPrice(producto)
  const value = price * cantidad
  const brand = brandOf(producto)
  ga4("add_to_cart", { currency: CURRENCY, value, items: [toGa4Item(producto, cantidad)] })
  fbq("AddToCart", {
    content_ids: [producto.sku],
    content_name: producto.descripcion,
    content_type: "product",
    ...(brand && { content_brand: brand }),
    currency: CURRENCY,
    value,
  })
}

export function trackRemoveFromCart(producto: PublicProduct, cantidad = 1): void {
  ga4("remove_from_cart", { currency: CURRENCY, value: unitPrice(producto) * cantidad, items: [toGa4Item(producto, cantidad)] })
}

export function trackViewCart(items: CartItem[]): void {
  if (items.length === 0) return
  ga4("view_cart", { currency: CURRENCY, value: cartValue(items), items: cartToGa4Items(items) })
}

export function trackBeginCheckout(items: CartItem[], total: number): void {
  // content_brand a nivel de evento: si TODOS los items son de la misma marca,
  // lo sumamos; si está mezclado, lo omitimos (Meta no soporta múltiples brands
  // por evento). Para purchases mezcladas, el seguimiento por marca queda al
  // nivel de item via `contents[].brand` (no estándar pero ignorado por Meta sin error).
  const brands = new Set(items.map((i) => i.producto.marca?.slug).filter(Boolean))
  const singleBrand = brands.size === 1 ? items[0]?.producto.marca?.slug : undefined

  ga4("begin_checkout", { currency: CURRENCY, value: total, items: cartToGa4Items(items) })
  fbq("InitiateCheckout", {
    content_ids: cartContentIds(items),
    contents: items.map((i) => ({
      id: i.producto.sku,
      quantity: i.cantidad,
      ...(i.producto.marca?.slug && { brand: i.producto.marca.slug }),
    })),
    content_type: "product",
    ...(singleBrand && { content_brand: singleBrand }),
    currency: CURRENCY,
    value: total,
    num_items: items.reduce((acc, i) => acc + i.cantidad, 0),
  })
}

export function trackAddPaymentInfo(items: CartItem[], total: number): void {
  ga4("add_payment_info", { currency: CURRENCY, value: total, payment_type: "MercadoPago", items: cartToGa4Items(items) })
  fbq("AddPaymentInfo", { content_ids: cartContentIds(items), currency: CURRENCY, value: total })
}

export interface PurchaseArgs {
  transactionId: string
  value: number
  items: Array<{
    sku: string
    descripcion: string
    categoria?: string | null
    marca?: string | null  // slug de la marca (spec Spirusol §9)
    cantidad: number
    precio: number
  }>
  shipping?: number
  tax?: number
}

export function trackPurchase(args: PurchaseArgs): void {
  const ga4Items: GA4Item[] = args.items.map((i) => ({
    item_id: i.sku,
    item_name: i.descripcion,
    item_category: i.categoria ?? undefined,
    ...(i.marca && { item_brand: i.marca }),
    price: i.precio,
    quantity: i.cantidad,
  }))

  // content_brand a nivel evento solo si toda la orden es de una sola marca.
  const brands = new Set(args.items.map((i) => i.marca).filter(Boolean))
  const singleBrand = brands.size === 1 ? args.items[0]?.marca ?? undefined : undefined

  ga4("purchase", {
    transaction_id: args.transactionId,
    currency: CURRENCY,
    value: args.value,
    shipping: args.shipping,
    tax: args.tax,
    items: ga4Items,
  })
  fbq("Purchase", {
    content_ids: args.items.map((i) => i.sku),
    contents: args.items.map((i) => ({
      id: i.sku,
      quantity: i.cantidad,
      ...(i.marca && { brand: i.marca }),
    })),
    content_type: "product",
    ...(singleBrand && { content_brand: singleBrand }),
    currency: CURRENCY,
    value: args.value,
    num_items: args.items.reduce((acc, i) => acc + i.cantidad, 0),
  }, {
    // event_id = purchase_${orderId}: cuando se sume CAPI server-side (TODO arriba),
    // este eventID debe ser idéntico para que Meta deduplique browser ↔ server.
    eventID: `purchase_${args.transactionId}`,
  })
}
