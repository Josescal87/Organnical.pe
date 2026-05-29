"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import { Package, Plus, Minus, MessageCircle, Info, ShieldCheck, ShoppingBag } from "lucide-react"
import { buildWaUrl } from "@/lib/whatsapp-messages"
import { buildBoticaMessage, type CartItem } from "./whatsapp-templates"

type Product = {
  sku: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  categoria: string
  imagen_url: string | null
}

const G_PRIMARY = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY = "#0B1D35"
const RED_BADGE = "#DC2626"
const GREEN_BADGE = "#059669"
const AMBER_BG = "#FEF3C7"
const AMBER_TEXT = "#78350F"
const AMBER_BORDER = "#FCD34D"

const LOCAL_STORAGE_KEY = "botica_intro_seen"

export default function BoticaCatalog({
  allProducts,
  prescribedSkus,
}: {
  allProducts: Product[]
  prescribedSkus: string[]
}) {
  const [cart, setCart] = useState<Record<string, number>>({})
  // Tri-state: null = aún no leí localStorage; true = mostrar modal; false = no mostrar
  const [showIntroModal, setShowIntroModal] = useState<boolean | null>(null)

  // Lectura de localStorage solo en el cliente, después del mount (previene SSR flash)
  useEffect(() => {
    if (typeof window === "undefined") return
    const seen = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    setShowIntroModal(seen !== "1")
  }, [])

  // Memo: Set para lookup O(1) de SKUs prescritos
  const prescribedSet = useMemo(() => new Set(prescribedSkus), [prescribedSkus])

  function dismissIntroModal() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, "1")
    }
    setShowIntroModal(false)
  }

  function addToCart(sku: string) {
    setCart((prev) => ({ ...prev, [sku]: (prev[sku] ?? 0) + 1 }))
  }

  function removeFromCart(sku: string) {
    setCart((prev) => {
      const next = { ...prev }
      if ((next[sku] ?? 0) <= 1) delete next[sku]
      else next[sku]--
      return next
    })
  }

  const cartItems: CartItem[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([sku, qty]) => ({
      sku,
      qty,
      product: allProducts.find((p) => p.sku === sku)!,
    }))
    .filter((item) => item.product)

  const total = cartItems.reduce(
    (sum, { qty, product }) => sum + (product.precio_oferta ?? product.precio) * qty,
    0
  )

  function handleWhatsApp() {
    const message = buildBoticaMessage({ cartItems, prescribedSet })
    if (!message) return
    window.open(buildWaUrl(message), "_blank")
  }

  if (allProducts.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <Package className="w-12 h-12 mx-auto mb-4 text-zinc-200" />
        <p className="text-sm">No hay productos disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <>
      {showIntroModal === true && <IntroModal onDismiss={dismissIntroModal} />}
      <RegulatoryBanner />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 pb-28">
        {allProducts.map((product) => (
          <ProductCard
            key={product.sku}
            product={product}
            hasRx={prescribedSet.has(product.sku)}
            qty={cart[product.sku] ?? 0}
            onAdd={() => addToCart(product.sku)}
            onRemove={() => removeFromCart(product.sku)}
          />
        ))}
      </div>
      {cartItems.length > 0 && (
        <FloatingCartBar
          cartItems={cartItems}
          total={total}
          onWhatsAppClick={handleWhatsApp}
        />
      )}
    </>
  )
}

/**
 * Tarjeta de producto individual.
 * Badge top-right indica si el usuario tiene receta vigente para ESTE SKU.
 * No bloquea agregar al carrito independientemente del estado del badge.
 */
function ProductCard({
  product,
  hasRx,
  qty,
  onAdd,
  onRemove,
}: {
  product: Product
  hasRx: boolean
  qty: number
  onAdd: () => void
  onRemove: () => void
}) {
  const precio = product.precio_oferta ?? product.precio
  const badgeLabel = hasRx ? "Disponible con tu receta" : "Requiere receta médica"
  const badgeColor = hasRx ? GREEN_BADGE : RED_BADGE
  const ariaLabel = `${badgeLabel} para ${product.descripcion}`

  return (
    <div className="group bg-white rounded-3xl border border-zinc-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200">
      <div className="aspect-square bg-zinc-50 relative overflow-hidden">
        {product.imagen_url ? (
          <Image
            src={product.imagen_url}
            alt={product.descripcion}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-zinc-200" />
          </div>
        )}
        <div
          className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ background: badgeColor }}
          aria-label={ariaLabel}
        >
          {badgeLabel}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-2">
        <p className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: NAVY }}>
          {product.descripcion}
        </p>
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-sm font-black" style={{ color: NAVY }}>
            S/ {precio.toFixed(2)}
          </span>
          {product.precio_oferta != null && (
            <span className="text-xs text-zinc-400 line-through">
              S/ {product.precio.toFixed(2)}
            </span>
          )}
        </div>

        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="w-full rounded-xl py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: G_PRIMARY }}
          >
            Agregar
          </button>
        ) : (
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-red-300 hover:text-red-500 transition-colors"
              aria-label={`Quitar uno de ${product.descripcion}`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-black" style={{ color: NAVY }}>{qty}</span>
            <button
              onClick={onAdd}
              className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-[#A78BFA] hover:text-[#A78BFA] transition-colors"
              aria-label={`Agregar uno más de ${product.descripcion}`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Modal first-visit que explica la regulación Ley 30681.
 * Se muestra solo si localStorage["botica_intro_seen"] !== "1".
 * Dismiss: setea el flag + cierra. Esc key también cierra.
 * Click en backdrop NO cierra (regulatorio, requiere acknowledgment explícito).
 */
function IntroModal({ onDismiss }: { onDismiss: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Focus inicial al botón principal
  useEffect(() => {
    buttonRef.current?.focus()
  }, [])

  // Esc key cierra
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(11,29,53,0.85)", backdropFilter: "blur(8px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="botica-intro-title"
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(167,139,250,0.12)" }}
        >
          <ShieldCheck className="w-7 h-7 text-[#A78BFA]" aria-hidden="true" />
        </div>
        <h2 id="botica-intro-title" className="font-display text-2xl font-black mb-2" style={{ color: NAVY }}>
          Tu botica funciona por WhatsApp
        </h2>
        <p className="text-sm text-zinc-500 mb-2 leading-relaxed">
          Por regulación de la Ley 30681, la venta de cannabis medicinal y productos con receta se gestiona por WhatsApp con validación de tu receta médica.
        </p>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          Sigues navegando aquí; al confirmar tu pedido te llevamos a WhatsApp con todo preparado.
        </p>
        <button
          ref={buttonRef}
          onClick={onDismiss}
          className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: G_PRIMARY }}
        >
          Entendido — empezar
        </button>
      </div>
    </div>
  )
}

/**
 * Banner ámbar persistente debajo del header navy.
 * No dismissible — contexto regulatorio permanente para la sesión.
 */
function RegulatoryBanner() {
  return (
    <div
      className="mb-6 rounded-2xl px-4 py-3 flex items-center gap-3 border"
      style={{
        background: AMBER_BG,
        color: AMBER_TEXT,
        borderColor: AMBER_BORDER,
      }}
      role="status"
    >
      <Info className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs font-semibold leading-tight">
        Por regulación, tu pedido se confirma por WhatsApp con tu receta médica.
      </p>
    </div>
  )
}

/**
 * Cart bar flotante abajo del viewport.
 * Visible solo si el carrito tiene items.
 * Click en "Pedir por WhatsApp" llama buildBoticaMessage() y abre wa.me.
 */
function FloatingCartBar({
  cartItems,
  total,
  onWhatsAppClick,
}: {
  cartItems: CartItem[]
  total: number
  onWhatsAppClick: () => void
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-20 px-4 py-4">
      <div
        className="max-w-lg mx-auto rounded-2xl p-4 flex items-center gap-4 shadow-2xl"
        style={{ background: NAVY }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(167,139,250,0.2)" }}
        >
          <ShoppingBag className="w-4 h-4 text-[#A78BFA]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/50">
            {cartItems.length} producto{cartItems.length !== 1 ? "s" : ""}
          </p>
          <p className="text-base font-black text-white">S/ {total.toFixed(2)}</p>
        </div>
        <button
          onClick={onWhatsAppClick}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: G_PRIMARY }}
        >
          <MessageCircle className="w-4 h-4" />
          Pedir por WhatsApp
        </button>
      </div>
    </div>
  )
}
