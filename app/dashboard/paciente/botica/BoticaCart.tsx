"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, Plus, Minus, MessageCircle, Lock, Zap } from "lucide-react"
import { WA_NUMBER } from "@/lib/whatsapp-messages"

type Product = {
  sku: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  categoria: string
  imagen_url: string | null
}

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

export default function BoticaCatalog({
  allProducts,
  prescribedSkus,
}: {
  allProducts: Product[]
  prescribedSkus: string[]
}) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [showLockedModal, setShowLockedModal] = useState(false)

  const prescribedSet = new Set(prescribedSkus)

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

  const cartItems = Object.entries(cart)
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
    const lines = cartItems
      .map(
        ({ qty, product }) =>
          `• ${product.descripcion} x${qty} — S/ ${((product.precio_oferta ?? product.precio) * qty).toFixed(2)}`
      )
      .join("\n")

    const message = [
      "Hola, soy paciente de Organnical y quiero hacer un pedido de mi botica:",
      "",
      lines,
      "",
      `*Total: S/ ${total.toFixed(2)}*`,
      "",
      "Por favor confirmar disponibilidad y coordinar el envío. ¡Gracias!",
    ].join("\n")

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (allProducts.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400 text-sm">
        No hay productos disponibles en este momento.
      </div>
    )
  }

  return (
    <>
      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-28">
        {allProducts.map((product) => {
          const hasRx = prescribedSet.has(product.sku)
          const qty = cart[product.sku] ?? 0
          const precio = product.precio_oferta ?? product.precio

          return (
            <div
              key={product.sku}
              className={`bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col transition-all ${
                !hasRx ? "grayscale opacity-50" : ""
              }`}
            >
              {/* Image */}
              <div className="aspect-square bg-zinc-50 flex items-center justify-center relative overflow-hidden">
                {product.imagen_url ? (
                  <Image
                    src={product.imagen_url}
                    alt={product.descripcion}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Package className="w-10 h-10 text-zinc-200" />
                )}
                {!hasRx && (
                  <div className="absolute inset-0 bg-white/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-zinc-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col gap-2">
                <p className="text-xs font-semibold text-[#0B1D35] leading-tight line-clamp-2">
                  {product.descripcion}
                </p>
                <div className="flex items-baseline gap-1.5 mt-auto">
                  <span className="text-sm font-black text-[#0B1D35]">
                    S/ {precio.toFixed(2)}
                  </span>
                  {product.precio_oferta != null && (
                    <span className="text-xs text-zinc-400 line-through">
                      S/ {product.precio.toFixed(2)}
                    </span>
                  )}
                </div>

                {hasRx ? (
                  qty === 0 ? (
                    <button
                      onClick={() => addToCart(product.sku)}
                      className="w-full rounded-xl py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: G }}
                    >
                      Agregar
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-1">
                      <button
                        onClick={() => removeFromCart(product.sku)}
                        className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-red-300 hover:text-red-500 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-[#0B1D35]">{qty}</span>
                      <button
                        onClick={() => addToCart(product.sku)}
                        className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-[#A78BFA] hover:text-[#A78BFA] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => setShowLockedModal(true)}
                    className="w-full rounded-xl py-2 text-xs font-semibold text-zinc-400 border border-zinc-200 hover:border-zinc-300 transition-colors"
                  >
                    Necesito receta
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating cart bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-sm border-t border-zinc-100 z-20">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500">
                {cartItems.length} producto{cartItems.length !== 1 ? "s" : ""} seleccionado{cartItems.length !== 1 ? "s" : ""}
              </p>
              <p className="text-base font-black text-[#0B1D35]">Total: S/ {total.toFixed(2)}</p>
            </div>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ background: G }}
            >
              <MessageCircle className="w-4 h-4" />
              Pedir por WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Modal: producto sin receta */}
      {showLockedModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLockedModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(167,139,250,0.12)" }}
            >
              <Lock className="w-6 h-6 text-[#A78BFA]" />
            </div>
            <h2 className="font-display text-xl font-black text-[#0B1D35] mb-2">
              Necesitas una receta
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              Este producto requiere prescripción médica. Agenda una Consulta Express por{" "}
              <span className="font-bold text-[#0B1D35]">S/ 30</span> y recibe tu receta hoy.
            </p>
            <Link
              href="/consulta-express"
              className="flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-sm font-bold text-white mb-3 transition-opacity hover:opacity-90"
              style={{ background: G }}
            >
              <Zap className="w-4 h-4" />
              Consulta Express S/ 30
            </Link>
            <button
              onClick={() => setShowLockedModal(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
