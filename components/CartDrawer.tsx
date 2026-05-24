"use client"
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, subtotal, remove, updateQty } = useCart()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "var(--promo-banner-h, 0px)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-purple-700" />
            <h2 className="font-semibold text-gray-800">Tu carrito</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <ShoppingCart size={40} className="text-gray-200" />
              <p className="text-gray-400 text-sm">Tu carrito está vacío</p>
              <button onClick={onClose} className="text-purple-700 text-sm font-medium hover:underline">
                Explorar productos
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.producto.sku} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative">
                  {item.producto.imagen_url ? (
                    <Image
                      src={item.producto.imagen_url}
                      alt={item.producto.descripcion}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.producto.descripcion}</p>
                  <p className="text-sm text-purple-700 font-semibold mt-0.5">
                    {formatPrice((item.producto.precio_oferta ?? item.producto.precio_publico) * item.cantidad)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.producto.sku, item.cantidad - 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-5 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateQty(item.producto.sku, item.cantidad + 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus size={12} />
                    </button>
                    <button onClick={() => remove(item.producto.sku)} className="ml-2 text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-400">Envío calculado al finalizar</p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-center py-3 rounded-xl font-semibold transition-all"
            >
              Finalizar compra
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
