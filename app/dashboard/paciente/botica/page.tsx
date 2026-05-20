import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getPrescriptionWithItems } from "@/lib/prescriptions"
import { BackLink } from "@/components/BackLink"
import BoticaCart from "./BoticaCart"
import { FileText } from "lucide-react"

type ProductoRow = {
  sku: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  categoria: string
  imagen_url: string | null
}

export default async function BoticaPage({
  searchParams,
}: {
  searchParams: Promise<{ receta?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { receta: recetaId } = await searchParams
  if (!recetaId) notFound()

  const prescription = await getPrescriptionWithItems(recetaId, user.id)
  if (!prescription) notFound()

  const { items } = prescription

  // Categories from prescription items for upsell relevance
  const categorias = [...new Set(
    items.filter((i) => i.producto?.categoria).map((i) => i.producto!.categoria)
  )]
  const rxSkus = items.map((i) => i.producto_sku)

  // Upsell: same category, not already in rx, no prescription required
  let upsellProducts: ProductoRow[] = []

  if (categorias.length > 0) {
    const { data: byCat } = await supabase
      .from("productos")
      .select("sku, descripcion, precio, precio_oferta, categoria, imagen_url")
      .in("categoria", categorias)
      .eq("activo", true)
      .eq("requiere_receta", false)
      .limit(20)

    upsellProducts = (byCat ?? [] as ProductoRow[]).filter(
      (p) => !rxSkus.includes((p as ProductoRow).sku)
    ).slice(0, 4) as ProductoRow[]
  }

  // Pad to 4 with any other free products
  if (upsellProducts.length < 4) {
    const seen = new Set([...rxSkus, ...upsellProducts.map((p) => p.sku)])
    const { data: extra } = await supabase
      .from("productos")
      .select("sku, descripcion, precio, precio_oferta, categoria, imagen_url")
      .eq("activo", true)
      .eq("requiere_receta", false)
      .limit(20)

    const extraFiltered = (extra ?? [] as ProductoRow[])
      .filter((p) => !seen.has((p as ProductoRow).sku))
      .slice(0, 4 - upsellProducts.length) as ProductoRow[]

    upsellProducts = [...upsellProducts, ...extraFiltered]
  }

  const issued = new Date(prescription.issued_at)
  const validUntil = new Date(prescription.valid_until)

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <BackLink href="/dashboard/paciente/recetas" label="Volver a mis recetas" className="mb-6" />

      <div className="mb-8">
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Comprar receta</h1>
        <div className="flex items-start gap-2 mt-2">
          <FileText className="w-4 h-4 text-[#A78BFA] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-zinc-500">
            {prescription.doctor_name ? `Recetado por ${prescription.doctor_name} · ` : ""}
            Emitida el {issued.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
            {" · "}Válida hasta {validUntil.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <BoticaCart recetaId={recetaId} rxItems={items} upsellProducts={upsellProducts} />
    </div>
  )
}
