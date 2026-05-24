"use client"

import ProductCard from "@/components/ProductCard"
import type { PublicProduct } from "@/lib/types"

interface Props {
  productos: PublicProduct[]
  /** Velocidad: segundos para completar un loop de TODOS los productos. Default 6s × productos. */
  secondsPerProduct?: number
}

/**
 * Carrusel marquee infinito. Renderiza los productos duplicados y se desplaza
 * con CSS animation. Cuando llega al 50% del track (que es donde termina la
 * primera copia), salta visualmente sin corte gracias al duplicado.
 *
 * Pausa en hover por accesibilidad y respeta `prefers-reduced-motion`.
 * Las clases y keyframes viven en `app/globals.css` (`.marquee-track`).
 *
 * Mostrar ~4 cards a la vez en desktop usando `w-[260px]` con gap-4 dentro
 * de un contenedor `max-w-6xl` (~1152px → 4 × 260 + 3 × 16 = ~1088, encaja).
 */
export default function ProductCarousel({ productos, secondsPerProduct = 6 }: Props) {
  if (productos.length === 0) return null

  const doubled = [...productos, ...productos]
  const duration = `${productos.length * secondsPerProduct}s`

  return (
    <div className="relative overflow-hidden">
      {/* Fade lateral para evitar el corte abrupto en los bordes */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, white, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, white, transparent)" }}
      />

      <div className="marquee-track flex gap-4" style={{ ["--marquee-duration" as string]: duration }}>
        {doubled.map((p, i) => (
          <div
            key={`${p.sku}-${i}`}
            className="flex-shrink-0 w-[220px] sm:w-[260px]"
            // aria-hidden en la segunda mitad para no duplicar contenido para screen readers
            aria-hidden={i >= productos.length ? "true" : undefined}
          >
            <ProductCard producto={p} />
          </div>
        ))}
      </div>
    </div>
  )
}
