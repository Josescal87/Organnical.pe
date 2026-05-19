"use client"
import { useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { trackAddToCart } from "@/lib/analytics"
import type { PublicProduct } from "@/lib/types"

export default function AddToCartButton({ producto }: { producto: PublicProduct }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)

  const stockKnown = producto.stock != null
  const agotado = stockKnown && producto.stock === 0
  const maxQty = stockKnown && producto.stock! > 0 ? producto.stock! : Infinity

  function handleAdd() {
    if (agotado) return
    const finalQty = Math.min(qty, maxQty)
    add(producto, finalQty)
    trackAddToCart(producto, finalQty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (agotado) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm bg-gray-200 text-gray-400 cursor-not-allowed"
      >
        <ShoppingCart size={18} /> Agotado
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-10 h-11 text-gray-500 hover:bg-gray-50 text-lg"
          aria-label="Disminuir cantidad"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-semibold">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          disabled={qty >= maxQty}
          className="w-10 h-11 text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-transparent text-lg"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
          added
            ? "bg-purple-100 text-purple-700"
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        }`}
      >
        {added ? (
          <><Check size={18} /> ¡Agregado!</>
        ) : (
          <><ShoppingCart size={18} /> Agregar al carrito</>
        )}
      </button>
    </div>
  )
}
