import { createAdminClient } from "@/lib/supabase/server"
import { registrarYEmitirBoleta } from "@/lib/sunat"
import { createVentaEnRuby } from "@/lib/ruby-integration"
import { sendStoreSaleNotification } from "@/lib/emails"
import { getStoreSaleNotifyEmails } from "@/lib/store-notify"
import type { CartItem, DireccionEntrega } from "@/lib/types"

/**
 * Efectos post-pago de una orden de tienda ya marcada `pagado`. Idempotente.
 * 1. Boleta SUNAT (idempotencia propia del lifecycle; fuera del claim).
 * 2. Claim atómico (fulfillment_claimed_at) → solo un runner sigue.
 * 3. Crear venta en Ruby + 4. correo a coordinadores.
 * Cada paso es no-fatal respecto a los otros.
 */
export async function fulfillPaidOrder(ordenId: string): Promise<void> {
  const supabase = createAdminClient()

  // 1. Boleta — independiente, idempotente por su propio lifecycle. El link
  //    queda persistido en ordenes_tienda.boleta_link; lo leemos abajo.
  try {
    await registrarYEmitirBoleta(ordenId, supabase)
  } catch (err) {
    console.error("fulfillPaidOrder: boleta error (non-fatal):", err)
  }

  // 2. Claim atómico de venta+correo
  const { data: claimed } = await supabase
    .from("ordenes_tienda")
    .update({ fulfillment_claimed_at: new Date().toISOString() })
    .eq("id", ordenId)
    .is("fulfillment_claimed_at", null)
    .select("id")
  if (!claimed || claimed.length === 0) return // ya procesada por el otro runner

  // Leer la orden para mapear venta + correo (incluye boleta_link ya persistido)
  const { data: orden, error: ordenErr } = await supabase
    .from("ordenes_tienda")
    .select("id, items, cliente_snapshot, total, delivery, boleta_link")
    .eq("id", ordenId)
    .single()
  if (ordenErr || !orden) {
    console.error("fulfillPaidOrder: no se pudo leer la orden:", ordenErr?.message)
    return
  }

  const items = orden.items as unknown as CartItem[]
  const direccion = orden.cliente_snapshot as unknown as DireccionEntrega
  const boletaLink = (orden.boleta_link as string | null) ?? null

  // 3. Crear venta en Ruby
  let numOrden: number | string = ""
  try {
    const venta = await createVentaEnRuby({
      items,
      direccion,
      deliveryCost: Number(orden.delivery),
      boletaLink,
    })
    numOrden = venta.numOrden
    await supabase.from("ordenes_tienda").update({ id_venta_ruby: venta.ventaId }).eq("id", ordenId)
  } catch (err) {
    console.error("fulfillPaidOrder: createVentaEnRuby error (non-fatal):", err)
  }

  // 4. Correo a coordinadores
  try {
    await sendStoreSaleNotification({
      to: getStoreSaleNotifyEmails(),
      numOrden,
      clienteNombre: `${direccion.nombre ?? ""} ${direccion.apellido ?? ""}`.trim(),
      celular: direccion.celular ?? "",
      distrito: direccion.distrito ?? "",
      direccion: direccion.direccion ?? "",
      items: items.map((it) => ({
        descripcion: it.producto.descripcion,
        qty: it.cantidad,
        precio: it.producto.precio_oferta ?? it.producto.precio_publico,
      })),
      total: Number(orden.total),
      boletaLink,
    })
  } catch (err) {
    console.error("fulfillPaidOrder: correo coordinadores error (non-fatal):", err)
  }
}
