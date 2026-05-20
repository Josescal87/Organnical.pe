"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Check, Package } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory"
import { useCart } from "@/contexts/CartContext"
import type { PublicProduct } from "@/lib/types"

const G    = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY = "#0B1D35"

export default function ProductCard({ producto }: { producto: PublicProduct }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const precio     = producto.precio_oferta ?? producto.precio_publico
  const tieneOferta = Boolean(producto.precio_oferta)
  const stockKnown  = producto.stock != null
  const agotado     = stockKnown && producto.stock === 0
  const stockBajo   = stockKnown && producto.stock! > 0 && producto.stock! <= LOW_STOCK_THRESHOLD

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (agotado || added) return
    add(producto, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <article className="group bg-white rounded-3xl border border-zinc-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200">

      {/* Imagen */}
      <Link
        href={`/productos/${producto.slug_publico}`}
        className={`block relative aspect-square bg-zinc-50 overflow-hidden ${agotado ? "opacity-60" : ""}`}
      >
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.descripcion}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-zinc-200" />
          </div>
        )}

        {/* Badges */}
        {tieneOferta && !agotado && (
          <div
            className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: G }}
          >
            Oferta
          </div>
        )}
        {agotado && (
          <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold bg-zinc-700 text-white">
            Agotado
          </div>
        )}
        {stockBajo && !agotado && (
          <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white">
            Solo {producto.stock}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        {producto.categoria && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA]">
            {producto.categoria}
          </span>
        )}

        <Link href={`/productos/${producto.slug_publico}`}>
          <h3
            className="text-xs font-semibold leading-snug line-clamp-2"
            style={{ color: NAVY }}
          >
            {producto.descripcion}
          </h3>
        </Link>

        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-sm font-black" style={{ color: NAVY }}>
            {formatPrice(precio)}
          </span>
          {tieneOferta && (
            <span className="text-xs text-zinc-400 line-through">
              {formatPrice(producto.precio_publico)}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={agotado}
          aria-label={agotado ? "Agotado" : `Agregar ${producto.descripcion} al carrito`}
          className="w-full rounded-xl py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          style={
            agotado
              ? { background: "#e4e4e7", color: "#a1a1aa" }
              : added
              ? { background: "#10b981" }
              : { background: G }
          }
        >
          {added
            ? <><Check size={13} /> ¡Agregado!</>
            : agotado
            ? "Agotado"
            : <><ShoppingCart size={13} /> Agregar</>}
        </button>
      </div>
    </article>
  )
}
