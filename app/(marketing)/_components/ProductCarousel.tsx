"use client"

import ProductCard from "@/components/ProductCard"
import type { PublicProduct } from "@/lib/types"

interface Props {
  productos: PublicProduct[]
  /** Segundos para que cada card cruce el viewport. Más bajo = más rápido. Default 6s. */
  secondsPerProduct?: number
}

/**
 * Carrusel marquee infinito con fade lateral. La idea visual:
 * - Centro: ~4 cards 100% opacas
 * - Cada lado: ~1.25 card en fade (entrando/saliendo)
 * - Total: ~6.5 cards visibles en cualquier momento
 *
 * El track total mide `cardsTotal * cardSize` (≈1664px en desktop), que es
 * un poco más ancho que el viewport típico (1366–1500px). El `.marquee-mask`
 * de globals.css hace que los bordes se desvanezcan en gradient. En viewports
 * más angostos se ven proporcionalmente menos cards, pero el efecto fade
 * sigue centrado.
 *
 * Animation y mask viven en `globals.css` (`.marquee-track` + `.marquee-mask`).
 */
export default function ProductCarousel({ productos, secondsPerProduct = 6 }: Props) {
  if (productos.length === 0) return null

  const doubled = [...productos, ...productos]
  const duration = `${productos.length * secondsPerProduct}s`

  return (
    <div className="marquee-mask relative overflow-hidden">
      <div
        className="marquee-track flex gap-4"
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {doubled.map((p, i) => (
          <div
            key={`${p.sku}-${i}`}
            className="flex-shrink-0 w-[200px] sm:w-[240px]"
            aria-hidden={i >= productos.length ? "true" : undefined}
          >
            <ProductCard producto={p} />
          </div>
        ))}
      </div>
    </div>
  )
}
