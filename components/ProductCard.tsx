"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Check } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory"
import { useCart } from "@/contexts/CartContext"
import type { PublicProduct } from "@/lib/types"

export default function ProductCard({ producto }: { producto: PublicProduct }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const precio = producto.precio_oferta ?? producto.precio_publico
  const tieneOferta = Boolean(producto.precio_oferta)
  const stockKnown = producto.stock != null
  const agotado = stockKnown && producto.stock === 0
  const stockBajo = stockKnown && producto.stock! > 0 && producto.stock! <= LOW_STOCK_THRESHOLD

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (agotado || added) return
    add(producto, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <article className="group relative bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      {tieneOferta && !agotado && (
        <div className="absolute top-3 left-3 z-10 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          OFERTA
        </div>
      )}
      {agotado && (
        <div className="absolute top-3 left-3 z-10 bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          AGOTADO
        </div>
      )}
      {stockBajo && !agotado && (
        <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          Solo {producto.stock}
        </div>
      )}

      <Link
        href={`/productos/${producto.slug_publico}`}
        className={`block relative aspect-square bg-gray-50 overflow-hidden ${agotado ? "opacity-60" : ""}`}
      >
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.descripcion}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🌿</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {producto.categoria && (
          <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide">
            {producto.categoria}
          </span>
        )}
        <Link href={`/productos/${producto.slug_publico}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-purple-700">
            {producto.descripcion}
          </h3>
        </Link>

        {producto.descripcion_corta && (
          <p className="text-xs text-gray-500 line-clamp-2">{producto.descripcion_corta}</p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div>
            <p className="font-bold text-gray-900 text-base">{formatPrice(precio)}</p>
            {tieneOferta && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(producto.precio_publico)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={agotado}
            aria-label={agotado ? "Agotado" : `Agregar ${producto.descripcion} al carrito`}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
              agotado
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : added
                ? "bg-green-100 text-green-700"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            }`}
          >
            {added ? <Check size={14} /> : <ShoppingCart size={14} />}
            {agotado ? "Agotado" : added ? "¡Agregado!" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  )
}
