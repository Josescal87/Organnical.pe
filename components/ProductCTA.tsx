"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

type Props = {
  sku: string
  descripcion: string
  precio: number
  requiere_receta: boolean
}

export default function ProductCTA({ sku, descripcion, precio, requiere_receta }: Props) {
  function handleClick() {
    if (requiere_receta) {
      window.gtag?.("event", "begin_checkout", { item_id: sku, item_name: descripcion, value: precio, currency: "PEN" })
      window.fbq?.("track", "InitiateCheckout", { content_ids: [sku], value: precio, currency: "PEN" })
    } else {
      window.gtag?.("event", "add_to_cart", { item_id: sku, item_name: descripcion, value: precio, currency: "PEN" })
      window.fbq?.("track", "AddToCart", { content_ids: [sku], value: precio, currency: "PEN" })
    }
  }

  return (
    <>
      <Link
        href={requiere_receta ? "/agendar" : "/registro"}
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: G }}
      >
        {requiere_receta ? "Agendar consulta" : "Acceder al catálogo"}{" "}
        <ArrowRight className="w-4 h-4" />
      </Link>
      {!requiere_receta && (
        <p className="text-xs text-zinc-400 text-center mt-2">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#A78BFA] hover:underline">
            Inicia sesión
          </Link>
        </p>
      )}
    </>
  )
}
