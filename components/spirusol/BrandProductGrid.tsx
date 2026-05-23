import Image from "next/image"
import AddToCartButton from "@/components/AddToCartButton"
import type { PublicProduct } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

/**
 * Sección 6 — Grid de 2 productos Spirusol.
 *
 * Decisión: no reusamos `<ProductCard>` global porque la skin del catálogo
 * (gradientes pink/purple, fondo oscuro) no encaja con la paleta Spirusol.
 * En cambio diseñamos cards específicas de marca pero usamos el MISMO
 * `<AddToCartButton>` (reutiliza CartContext + analytics existentes).
 *
 * Link "Ver ficha" usa host absoluto a organnical.pe (spec §6) — la PDP global
 * con bloques de marca extendidos vive ahí.
 */
const ORGANNICAL = "https://organnical.pe"

export default function BrandProductGrid({ productos }: { productos: PublicProduct[] }) {
  if (productos.length === 0) {
    return (
      <section className="py-20" style={{ background: "var(--brand-cream)" }}>
        <p className="text-center text-sm" style={{ color: "var(--brand-green-900)", opacity: 0.6 }}>
          Productos próximamente.
        </p>
      </section>
    )
  }

  return (
    <section
      id="productos"
      className="py-20 md:py-28"
      style={{ background: "var(--brand-green-100)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--brand-green-700)" }}
          >
            Productos
          </p>
          <h2
            className="font-bold tracking-tight text-balance leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--brand-green-900)",
              fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",
            }}
          >
            La misma espirulina, en dos formatos.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productos.map((p) => {
            const precio = p.precio_oferta ?? p.precio_publico
            const tieneOferta = Boolean(p.precio_oferta)
            const agotado = p.stock != null && p.stock === 0
            const fichaUrl = `${ORGANNICAL}/productos/${p.slug_publico}?utm_source=spirusol_subdomain&utm_medium=product_grid&utm_campaign=landing`

            return (
              <article
                key={p.sku}
                className="rounded-3xl overflow-hidden bg-white"
                style={{ border: "1px solid var(--brand-green-100)" }}
              >
                <a
                  href={fichaUrl}
                  className="block aspect-square relative overflow-hidden"
                  style={{ background: "var(--brand-cream)" }}
                >
                  {p.imagen_url && (
                    <Image
                      src={p.imagen_url}
                      alt={p.descripcion}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-contain p-8 transition-transform hover:scale-105"
                    />
                  )}
                  {tieneOferta && (
                    <span
                      className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: "var(--brand-sun-500)",
                        color: "var(--brand-green-900)",
                      }}
                    >
                      OFERTA
                    </span>
                  )}
                </a>

                <div className="p-6 md:p-7">
                  <h3
                    className="font-bold mb-2 leading-tight"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      color: "var(--brand-green-900)",
                      fontSize: "clamp(1.125rem, 1.5vw + 0.25rem, 1.375rem)",
                    }}
                  >
                    {p.descripcion}
                  </h3>

                  {p.descripcion_corta && (
                    <p
                      className="text-sm leading-relaxed mb-5"
                      style={{ color: "var(--brand-green-900)", opacity: 0.7 }}
                    >
                      {p.descripcion_corta}
                    </p>
                  )}

                  <div className="flex items-end gap-3 mb-5">
                    <p
                      className="font-bold"
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        color: "var(--brand-green-900)",
                        fontSize: "clamp(1.5rem, 2vw + 0.25rem, 1.875rem)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatPrice(precio)}
                    </p>
                    {tieneOferta && (
                      <p
                        className="text-sm line-through mb-1"
                        style={{ color: "var(--brand-green-900)", opacity: 0.4 }}
                      >
                        {formatPrice(p.precio_publico)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {agotado ? (
                      <button
                        disabled
                        className="flex-1 px-5 py-2.5 rounded-full text-sm font-semibold cursor-not-allowed"
                        style={{
                          background: "var(--brand-green-100)",
                          color: "var(--brand-green-900)",
                          opacity: 0.5,
                        }}
                      >
                        Agotado
                      </button>
                    ) : (
                      <div className="flex-1">
                        <AddToCartButton producto={p} />
                      </div>
                    )}
                    <a
                      href={fichaUrl}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                      style={{
                        border: "1px solid var(--brand-green-700)",
                        color: "var(--brand-green-900)",
                      }}
                    >
                      Ver ficha →
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
