"use client"

import CartDrawer from "@/components/CartDrawer"
import { useCart } from "@/contexts/CartContext"

/**
 * Renderiza el `CartDrawer` una sola vez en toda la app, leyendo
 * `cartOpen` del `CartContext`. Va montado en `app/layout.tsx` para
 * que cualquier `HeaderCartButton` en cualquier página lo abra.
 */
export default function GlobalCartDrawer() {
  const { cartOpen, closeCart } = useCart()
  return <CartDrawer open={cartOpen} onClose={closeCart} />
}
