"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/CartContext"

interface Props {
  /** Variante de color del icono. `dark` para fondos navy/dark, `light` para fondos claros. */
  variant?: "dark" | "light"
  className?: string
}

/**
 * Botón de carrito reusable para cualquier header. Solo el ícono + badge —
 * el drawer está montado globalmente en `app/layout.tsx`, controlado por
 * el `cartOpen` del CartContext. Esto permite tener cart icon en cualquier
 * página sin duplicar drawers.
 */
export default function HeaderCartButton({ variant = "dark", className = "" }: Props) {
  const { totalItems, openCart } = useCart()

  const colorIdle = variant === "dark" ? "text-white/35" : "text-gray-500"
  const colorHover = variant === "dark" ? "hover:text-white/70" : "hover:text-gray-800"

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Carrito${totalItems > 0 ? ` (${totalItems})` : ""}`}
      className={`flex items-center justify-center relative ${colorIdle} ${colorHover} transition-colors ${className}`}
    >
      <ShoppingCart className="w-4 h-4" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#A78BFA] text-white text-[9px] font-bold flex items-center justify-center leading-none">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  )
}
