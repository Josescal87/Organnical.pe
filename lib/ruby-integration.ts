import { createAdminClient } from "@/lib/supabase/server"
import type { CartItem, DireccionEntrega } from "@/lib/types"
import { registrarYEmitirBoleta } from "@/lib/sunat"

export async function createVentaAndDespacho(
  ordenId: string,
  items: CartItem[],
  direccion: DireccionEntrega,
  mpPaymentId: string,
  total: number,
  deliveryCost: number
): Promise<string | null> {
  const supabase = createAdminClient()

  const { data: idVentaRuby, error: rpcError } = await supabase.rpc(
    "crear_venta_y_despacho",
    {
      p_orden_id:   ordenId,
      p_items:      items as unknown as Record<string, unknown>[],
      p_direccion:  direccion as unknown as Record<string, unknown>,
      p_payment_id: mpPaymentId,
      p_total:      total,
      p_delivery:   deliveryCost,
    }
  )

  if (rpcError) {
    console.error("createVentaAndDespacho rpc error:", rpcError.message)
    throw new Error(`crear_venta_y_despacho: ${rpcError.message}`)
  }

  await registrarYEmitirBoleta(ordenId, supabase).catch((err) =>
    console.error("sunat: unexpected error (non-fatal):", err)
  )

  return (idVentaRuby as string | null) ?? null
}
