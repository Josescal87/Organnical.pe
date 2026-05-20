import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import BoticaCatalog from "./BoticaCart"

export const dynamic = "force-dynamic"

type ProductoRow = {
  sku: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  categoria: string
  imagen_url: string | null
}

export default async function BoticaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Todas las recetas vigentes del paciente con sus items
  const { data: activeRxs } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select("id, prescription_items(producto_sku)")
    .eq("patient_id", user.id)
    .gte("valid_until", new Date().toISOString())

  const prescribedSkus = [
    ...new Set(
      (activeRxs ?? []).flatMap((rx: { prescription_items: { producto_sku: string }[] }) =>
        rx.prescription_items.map((item) => item.producto_sku)
      )
    ),
  ]

  // Catálogo completo activo
  const { data: productos } = await supabase
    .from("productos")
    .select("sku, descripcion, precio, precio_oferta, categoria, imagen_url")
    .eq("activo", true)
    .order("descripcion")

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mi Botica</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {prescribedSkus.length > 0
            ? `${prescribedSkus.length} producto${prescribedSkus.length !== 1 ? "s" : ""} disponible${prescribedSkus.length !== 1 ? "s" : ""} con tu receta vigente`
            : "Agenda una consulta para recibir tu receta y acceder a los productos"}
        </p>
      </div>

      <BoticaCatalog
        allProducts={(productos ?? []) as ProductoRow[]}
        prescribedSkus={prescribedSkus}
      />
    </div>
  )
}
