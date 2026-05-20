"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Package, Plus, Minus, ShoppingCart, Sparkles } from "lucide-react"
import type { RxItem } from "@/lib/prescriptions"

type UpsellProduct = {
  sku: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  categoria: string
  imagen_url: string | null
}

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

export default function BoticaCart({
  recetaId,
  rxItems,
  upsellProducts,
}: {
  recetaId: string
  rxItems: RxItem[]
  upsellProducts: UpsellProduct[]
}) {
  const router = useRouter()
  const [upsellCart, setUpsellCart] = useState<Record<string, number>>({})

  const rxTotal = rxItems.reduce((s, i) => {
    const precio = i.producto?.precio_oferta ?? i.producto?.precio ?? 0
    return s + precio * i.quantity
  }, 0)

  const upsellTotal = Object.entries(upsellCart).reduce((s, [sku, qty]) => {
    const p = upsellProducts.find((u) => u.sku === sku)
    return s + (p?.precio_oferta ?? p?.precio ?? 0) * qty
  }, 0)

  const total = rxTotal + upsellTotal

  function handleAddUpsell(sku: string) {
    setUpsellCart((prev) => ({ ...prev, [sku]: (prev[sku] ?? 0) + 1 }))
  }

  function handleRemoveUpsell(sku: string) {
    setUpsellCart((prev) => {
      const next = { ...prev }
      if ((next[sku] ?? 0) <= 1) delete next[sku]
      else next[sku]--
      return next
    })
  }

  function handlePagar() {
    const cart = [
      ...rxItems
        .filter((i) => i.producto)
        .map((i) => ({
          sku: i.producto!.sku,
          descripcion: i.producto!.descripcion,
          precio: i.producto!.precio_oferta ?? i.producto!.precio,
          qty: i.quantity,
        })),
      ...Object.entries(upsellCart).map(([sku, qty]) => {
        const p = upsellProducts.find((u) => u.sku === sku)!
        return {
          sku,
          descripcion: p.descripcion,
          precio: p.precio_oferta ?? p.precio,
          qty,
        }
      }),
    ]
    sessionStorage.setItem("mp_cart", JSON.stringify(cart))
    sessionStorage.setItem("botica_receta_id", recetaId)
    router.push("/dashboard/paciente/catalogo/checkout")
  }

  return (
    <div className="space-y-6">
      {/* Prescription items (read-only) */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="p-5 border-b border-zinc-50">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Productos de tu receta ({rxItems.length})
          </p>
        </div>
        <div className="p-5 space-y-3">
          {rxItems.map((item) => {
            const precio = item.producto?.precio_oferta ?? item.producto?.precio
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(167,139,250,0.12)" }}
                >
                  <Package className="w-4 h-4 text-[#A78BFA]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0B1D35]">
                    {item.producto?.descripcion ?? item.producto_sku}
                    <span className="ml-2 text-xs font-normal text-zinc-400">×{item.quantity}</span>
                  </p>
                  {item.dosage_instructions && (
                    <p className="text-xs text-zinc-400 mt-0.5">{item.dosage_instructions}</p>
                  )}
                </div>
                {precio != null && (
                  <p className="text-sm font-bold text-[#0B1D35] flex-shrink-0">
                    S/ {(precio * item.quantity).toFixed(2)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upsell */}
      {upsellProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="p-5 border-b border-zinc-50 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Complementa tu tratamiento
            </p>
          </div>
          <div className="p-5 space-y-3">
            {upsellProducts.map((p) => {
              const qty = upsellCart[p.sku] ?? 0
              const precio = p.precio_oferta ?? p.precio
              return (
                <div key={p.sku} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(244,114,182,0.10)" }}
                  >
                    <Package className="w-4 h-4 text-[#F472B6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0B1D35]">{p.descripcion}</p>
                    <p className="text-xs text-zinc-400">S/ {precio.toFixed(2)}</p>
                  </div>
                  {qty === 0 ? (
                    <button
                      onClick={() => handleAddUpsell(p.sku)}
                      className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold border border-zinc-200 text-zinc-600 hover:border-[#A78BFA] hover:text-[#A78BFA] transition-colors flex-shrink-0"
                    >
                      <Plus className="w-3 h-3" /> Agregar
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRemoveUpsell(p.sku)}
                        className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-red-300 hover:text-red-500 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-[#0B1D35] w-4 text-center">{qty}</span>
                      <button
                        onClick={() => handleAddUpsell(p.sku)}
                        className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-[#A78BFA] hover:text-[#A78BFA] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Total + CTA */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-zinc-500">Total</span>
          <span className="font-black text-xl text-[#0B1D35]">S/ {total.toFixed(2)}</span>
        </div>
        <button
          onClick={handlePagar}
          disabled={rxItems.filter((i) => i.producto).length === 0}
          className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-50 transition-opacity"
          style={{ background: G }}
        >
          <span className="flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Pagar S/ {total.toFixed(2)}
          </span>
        </button>
        <p className="text-xs text-zinc-400 text-center mt-3">
          Pago seguro · Delivery incluido en tu plan de tratamiento
        </p>
      </div>
    </div>
  )
}
