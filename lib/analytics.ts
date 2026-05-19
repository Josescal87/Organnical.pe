import type { CartItem, PublicProduct } from "@/lib/types"

interface GA4Item {
  item_id: string
  item_name: string
  item_category?: string
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

function fbq(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return
  const fn = window.fbq
  if (!fn) return
  try {
    if (params) fn("track", eventName, params)
    else fn("track", eventName)
  } catch (err) {
    console.warn("analytics: fbq dispatch failed:", err)
  }
}

function unitPrice(p: PublicProduct): number {
  return p.precio_oferta ?? p.precio_publico
}

function toGa4Item(p: PublicProduct, cantidad = 1): GA4Item {
  return { item_id: p.sku, item_name: p.descripcion, item_category: p.categoria, price: unitPrice(p), quantity: cantidad }
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
  ga4("view_item", { currency: CURRENCY, value: price, items: [toGa4Item(producto)] })
  fbq("ViewContent", { content_ids: [producto.sku], content_name: producto.descripcion, content_category: producto.categoria, content_type: "product", currency: CURRENCY, value: price })
}

export function trackAddToCart(producto: PublicProduct, cantidad = 1): void {
  const price = unitPrice(producto)
  const value = price * cantidad
  ga4("add_to_cart", { currency: CURRENCY, value, items: [toGa4Item(producto, cantidad)] })
  fbq("AddToCart", { content_ids: [producto.sku], content_name: producto.descripcion, content_type: "product", currency: CURRENCY, value })
}

export function trackRemoveFromCart(producto: PublicProduct, cantidad = 1): void {
  ga4("remove_from_cart", { currency: CURRENCY, value: unitPrice(producto) * cantidad, items: [toGa4Item(producto, cantidad)] })
}

export function trackViewCart(items: CartItem[]): void {
  if (items.length === 0) return
  ga4("view_cart", { currency: CURRENCY, value: cartValue(items), items: cartToGa4Items(items) })
}

export function trackBeginCheckout(items: CartItem[], total: number): void {
  ga4("begin_checkout", { currency: CURRENCY, value: total, items: cartToGa4Items(items) })
  fbq("InitiateCheckout", { content_ids: cartContentIds(items), contents: items.map((i) => ({ id: i.producto.sku, quantity: i.cantidad })), content_type: "product", currency: CURRENCY, value: total, num_items: items.reduce((acc, i) => acc + i.cantidad, 0) })
}

export function trackAddPaymentInfo(items: CartItem[], total: number): void {
  ga4("add_payment_info", { currency: CURRENCY, value: total, payment_type: "MercadoPago", items: cartToGa4Items(items) })
  fbq("AddPaymentInfo", { content_ids: cartContentIds(items), currency: CURRENCY, value: total })
}

export interface PurchaseArgs {
  transactionId: string
  value: number
  items: Array<{ sku: string; descripcion: string; categoria?: string | null; cantidad: number; precio: number }>
  shipping?: number
  tax?: number
}

export function trackPurchase(args: PurchaseArgs): void {
  const ga4Items: GA4Item[] = args.items.map((i) => ({ item_id: i.sku, item_name: i.descripcion, item_category: i.categoria ?? undefined, price: i.precio, quantity: i.cantidad }))
  ga4("purchase", { transaction_id: args.transactionId, currency: CURRENCY, value: args.value, shipping: args.shipping, tax: args.tax, items: ga4Items })
  fbq("Purchase", { content_ids: args.items.map((i) => i.sku), contents: args.items.map((i) => ({ id: i.sku, quantity: i.cantidad })), content_type: "product", currency: CURRENCY, value: args.value, num_items: args.items.reduce((acc, i) => acc + i.cantidad, 0) })
}
