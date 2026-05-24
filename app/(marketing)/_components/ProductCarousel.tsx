"use client"

import ProductCard from "@/components/ProductCard"
import type { PublicProduct } from "@/lib/types"

interface Props {
  productos: PublicProduct[]
  /** Segundos para que cada card cruce el viewport. Más bajo = más rápido. Default 9s. */
  secondsPerProduct?: number
}

/**
 * Carrusel marquee infinito con fade lateral. La idea visual:
 * - Centro: ~3 cards 100% opacas
 * - Cada lado: ~1.25 card en fade (entrando/saliendo) — 2.5 cards en fade total
 * - Total: ~5.5 cards visibles en cualquier momento
 *
 * Cards más anchas (280px desktop) con gap mayor (32px) para que las 3
 * centrales respiren más. Velocidad calibrada en 9s/producto (50% más lenta
 * que la versión inicial).
 *
 * Animation y mask viven en `globals.css` (`.marquee-track` + `.marquee-mask`).
 */
export default function ProductCarousel({ productos, secondsPerProduct = 9 }: Props) {
  if (productos.length === 0) return null

  const doubled = [...productos, ...productos]
  const duration = `${productos.length * secondsPerProduct}s`

  return (
    <div className="marquee-mask relative overflow-hidden">
      <div
        className="marquee-track flex gap-6 sm:gap-8"
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {doubled.map((p, i) => (
          <div
            key={`${p.sku}-${i}`}
            className="flex-shrink-0 w-[220px] sm:w-[280px]"
            aria-hidden={i >= productos.length ? "true" : undefined}
          >
            <ProductCard producto={p} />
          </div>
        ))}
      </div>
    </div>
  )
}
