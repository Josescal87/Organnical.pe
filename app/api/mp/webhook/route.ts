import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { createAdminClient } from "@/lib/supabase/server"
import { getPayment } from "@/lib/mercadopago"
import { createVentaAndDespacho } from "@/lib/ruby-integration"

function verifyMpSignature(
  signatureHeader: string | null,
  requestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!signatureHeader || !requestId) return false

  const parts: Record<string, string> = {}
  for (const part of signatureHeader.split(",")) {
    const [k, v] = part.split("=")
    if (k && v) parts[k.trim()] = v.trim()
  }
  const ts = parts["ts"]
  const v1 = parts["v1"]
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex")

  if (expected.length !== v1.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"))
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type !== "payment" || !data?.id) {
      return NextResponse.json({ ok: true })
    }

    const dataId = String(data.id)

    const secret = process.env.MP_WEBHOOK_SECRET
    if (!secret) {
      console.error("webhook: MP_WEBHOOK_SECRET no configurado")
      return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 })
    }
    const signatureHeader = request.headers.get("x-signature")
    const requestId = request.headers.get("x-request-id")
    if (!verifyMpSignature(signatureHeader, requestId, dataId, secret)) {
      console.warn("webhook: firma inválida", { requestId, hasSignature: !!signatureHeader })
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
    }

    const payment = await getPayment(dataId)

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true, status: payment.status })
    }

    const ordenId = payment.external_reference
    if (!ordenId) {
      return NextResponse.json({ error: "Sin external_reference" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: orden, error: ordenError } = await supabase
      .from("ordenes_tienda")
      .select("id, estado, total, items, cliente_snapshot, delivery")
      .eq("id", ordenId)
      .single()

    if (ordenError || !orden) {
      console.error("webhook: orden no encontrada:", ordenId)
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    if (Math.abs(Number(payment.transaction_amount) - Number(orden.total)) > 0.01) {
      console.error("webhook: monto MP distinto al de orden", {
        ordenId,
        ordenTotal: orden.total,
        mpAmount: payment.transaction_amount,
      })
      return NextResponse.json({ error: "Monto inconsistente" }, { status: 400 })
    }

    // Atomic update — only first winner executes Ruby sync
    const { data: updated, error: updateError } = await supabase
      .from("ordenes_tienda")
      .update({
        estado: "pagado",
        mp_payment_id: dataId,
        mp_status: payment.status,
      })
      .eq("id", ordenId)
      .eq("estado", "pendiente")
      .select("id")
      .maybeSingle()

    if (updateError) {
      console.error("webhook: update error:", updateError)
      return NextResponse.json({ error: "Error actualizando orden" }, { status: 500 })
    }

    if (!updated) {
      return NextResponse.json({ ok: true, msg: "Ya procesado" })
    }

    try {
      const idVentaRuby = await createVentaAndDespacho(
        ordenId,
        orden.items as unknown as import("@/lib/types").CartItem[],
        orden.cliente_snapshot as unknown as import("@/lib/types").DireccionEntrega,
        dataId,
        Number(orden.total),
        Number(orden.delivery)
      )
      if (idVentaRuby) {
        await supabase
          .from("ordenes_tienda")
          .update({ id_venta_ruby: idVentaRuby })
          .eq("id", ordenId)
      }
    } catch (rubyErr) {
      console.error("webhook: Ruby integration error (non-fatal):", rubyErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("webhook: unexpected error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
