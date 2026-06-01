// ventas: PK = id (uuid); num_orden = TEXT, asignado por RPC siguiente_num_orden_ruby()
// (atómica, maneja la columna text + auto-resync; evita el constraint UNIQUE(num_orden,item)).
// Confirmado vivo en introspección 2026-06-02. Una fila por item (espejo de kommo-parser-ruby).
import { createAdminClient } from "@/lib/supabase/server"
import type { CartItem, DireccionEntrega } from "@/lib/types"

export async function createVentaEnRuby({
  items,
  direccion,
  deliveryCost,
  boletaLink,
}: {
  items: CartItem[]
  direccion: DireccionEntrega
  deliveryCost: number
  boletaLink: string | null
}): Promise<{ ventaId: string; numOrden: string }> {
  const supabase = createAdminClient()

  // num_orden atómico vía la función de Ruby (la columna es TEXT; max+1 en JS está roto)
  const { data: numOrden, error: numErr } = await supabase.rpc("siguiente_num_orden_ruby")
  if (numErr || !numOrden) {
    throw new Error(`siguiente_num_orden_ruby: ${numErr?.message ?? "sin valor"}`)
  }
  const hoy = new Date().toISOString().split("T")[0]

  // Una fila por item. precio_delivery solo en la primera fila para no duplicar.
  const rows = items.map((it, idx) => {
    const unitPrice = it.producto.precio_oferta ?? it.producto.precio_publico
    return {
      num_orden:        numOrden as string,
      nombre:           direccion.nombre ?? null,
      apellido:         direccion.apellido ?? null,
      dni:              direccion.dni ?? null,
      celular:          direccion.celular ?? null,
      farmacia:         null,
      item:             it.producto.descripcion,
      sku:              it.producto.sku ?? null,
      unidades:         it.cantidad,
      fecha_compra:     hoy,
      fecha_entrega:    null,
      distrito:         direccion.distrito ?? null,
      direccion:        direccion.direccion ?? null,
      precio_item:      unitPrice,
      precio_delivery:  idx === 0 ? deliveryCost : 0,
      total:            unitPrice * it.cantidad + (idx === 0 ? deliveryCost : 0),
      metodo_pago:      "MercadoPago (web)",
      comentarios:      null,
      tipo_cliente:     "Nuevo",
      campana:          "Tienda Web",
      vendedor:         "Tienda Web",
      link_comprobante: boletaLink,
      hash_comprobante: null,
    }
  })

  const { data, error } = await supabase.from("ventas").insert(rows).select("id")
  if (error) throw new Error(`ventas insert: ${error.message}`)

  return { ventaId: (data as { id: string }[])[0].id, numOrden: numOrden as string }
}
