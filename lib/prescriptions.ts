import { createClient } from "@/lib/supabase/server"

export type RxItem = {
  id: string
  quantity: number
  dosage_instructions: string | null
  producto_sku: string
  producto: {
    sku: string
    descripcion: string
    precio: number
    precio_oferta: number | null
    categoria: string
    imagen_url: string | null
  } | null
}

export type PrescriptionWithItems = {
  id: string
  issued_at: string
  valid_until: string
  prescription_number: string | null
  doctor_name: string | null
  items: RxItem[]
}

export async function getPrescriptionWithItems(
  prescriptionId: string,
  userId: string
): Promise<PrescriptionWithItems | null> {
  const supabase = await createClient()

  const { data: rx } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select("id, issued_at, valid_until, prescription_number, doctor_id, prescription_items(id, quantity, dosage_instructions, producto_sku)")
    .eq("id", prescriptionId)
    .eq("patient_id", userId)
    .single()

  if (!rx) return null
  if (new Date((rx as { valid_until: string }).valid_until) <= new Date()) return null

  const rxTyped = rx as {
    id: string
    issued_at: string
    valid_until: string
    prescription_number: string | null
    doctor_id: string | null
    prescription_items: Array<{ id: string; quantity: number; dosage_instructions: string | null; producto_sku: string }>
  }

  let doctor_name: string | null = null
  if (rxTyped.doctor_id) {
    const { data: doc } = await supabase
      .schema("medical")
      .from("profiles")
      .select("full_name")
      .eq("id", rxTyped.doctor_id)
      .single()
    doctor_name = (doc as { full_name: string | null } | null)?.full_name ?? null
  }

  const items = rxTyped.prescription_items ?? []
  const skus = items.map((i) => i.producto_sku)

  const { data: productos } = skus.length > 0
    ? await supabase
        .from("productos")
        .select("sku, descripcion, precio, precio_oferta, categoria, imagen_url")
        .in("sku", skus)
        .eq("activo", true)
    : { data: [] }

  type ProductoRow = { sku: string; descripcion: string; precio: number; precio_oferta: number | null; categoria: string; imagen_url: string | null }
  const bySku: Record<string, ProductoRow> = Object.fromEntries(
    (productos ?? []).map((p) => [(p as ProductoRow).sku, p as ProductoRow])
  )

  return {
    id: rxTyped.id,
    issued_at: rxTyped.issued_at,
    valid_until: rxTyped.valid_until,
    prescription_number: rxTyped.prescription_number,
    doctor_name,
    items: items.map((item) => ({
      ...item,
      producto: bySku[item.producto_sku] ?? null,
    })),
  }
}
