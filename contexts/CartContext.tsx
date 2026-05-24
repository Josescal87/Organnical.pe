"use client"
import { createContext, useContext, useEffect, useReducer, useState } from "react"
import type { CartItem, PublicProduct } from "@/lib/types"

interface CartState {
  items: CartItem[]
}

export const CART_ADDED_EVENT = "organnical:cart-added"

type CartAction =
  | { type: "ADD"; producto: PublicProduct; cantidad?: number }
  | { type: "REMOVE"; sku: string }
  | { type: "UPDATE_QTY"; sku: string; cantidad: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items }
    case "ADD": {
      const qty = action.cantidad ?? 1
      const existing = state.items.find((i) => i.producto.sku === action.producto.sku)
      if (existing) {
        return { items: state.items.map((i) => i.producto.sku === action.producto.sku ? { ...i, cantidad: i.cantidad + qty } : i) }
      }
      return { items: [...state.items, { producto: action.producto, cantidad: qty }] }
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.producto.sku !== action.sku) }
    case "UPDATE_QTY":
      if (action.cantidad <= 0) {
        return { items: state.items.filter((i) => i.producto.sku !== action.sku) }
      }
      return { items: state.items.map((i) => i.producto.sku === action.sku ? { ...i, cantidad: action.cantidad } : i) }
    case "CLEAR":
      return { items: [] }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  add: (producto: PublicProduct, cantidad?: number) => void
  remove: (sku: string) => void
  updateQty: (sku: string, cantidad: number) => void
  clear: () => void
  /** Estado global del drawer — único en toda la app, controlado desde aquí. */
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "organnical_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) dispatch({ type: "HYDRATE", items: JSON.parse(stored) })
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {}
  }, [state.items])

  // Auto-abrir el drawer cuando se agrega algo al carrito.
  // Antes lo escuchaba el Navbar — ahora vive acá para que cualquier botón
  // de carrito en cualquier header lo herede sin duplicar listeners.
  useEffect(() => {
    const handler = () => setCartOpen(true)
    window.addEventListener(CART_ADDED_EVENT, handler)
    return () => window.removeEventListener(CART_ADDED_EVENT, handler)
  }, [])

  const subtotal = state.items.reduce(
    (acc, i) => acc + (i.producto.precio_oferta ?? i.producto.precio_publico) * i.cantidad,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems: state.items.reduce((acc, i) => acc + i.cantidad, 0),
        subtotal,
        add: (producto, cantidad) => {
          dispatch({ type: "ADD", producto, cantidad })
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent(CART_ADDED_EVENT))
          }
        },
        remove: (sku) => dispatch({ type: "REMOVE", sku }),
        updateQty: (sku, cantidad) => dispatch({ type: "UPDATE_QTY", sku, cantidad }),
        clear: () => dispatch({ type: "CLEAR" }),
        cartOpen,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
