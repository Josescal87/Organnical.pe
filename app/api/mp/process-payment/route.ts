import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { createPayment } from "@/lib/mercadopago"
import { createVentaAndDespacho } from "@/lib/ruby-integration"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("process-payment", ip, 5, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const body = await request.json()
    const { formData, ordenId } = body as {
      formData: {
        token: string
        payment_method_id: string
        installments: number
        issuer_id: number | null
        payer?: { email: string; identification?: { type: string; number: string } }
      }
      ordenId: string
    }

    if (!formData?.token || !ordenId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: orden, error: ordenError } = await supabase
      .from("ordenes_tienda")
      .select("*")
      .eq("id", ordenId)
      .single()

    if (ordenError || !orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    if (orden.estado !== "pendiente") {
      return NextResponse.json({ status: "approved", ordenId })
    }

    const clienteSnapshot = orden.cliente_snapshot as {
      email?: string
      dni?: string
    } | null

    const payment = await createPayment({
      token: formData.token,
      paymentMethodId: formData.payment_method_id,
      installments: formData.installments ?? 1,
      issuerId: formData.issuer_id ?? null,
      transactionAmount: orden.total,
      payer: {
        email: formData.payer?.email ?? clienteSnapshot?.email ?? "",
        identification: formData.payer?.identification ??
          (clienteSnapshot?.dni
            ? { type: "DNI", number: clienteSnapshot.dni }
            : undefined),
      },
      ordenId,
    })

    const paymentId = String(payment.id)
    const status = payment.status

    if (status === "approved") {
      // Atomic update — only first winner (process-payment vs webhook) syncs to Ruby
      const { data: updated, error: updateErr } = await supabase
        .from("ordenes_tienda")
        .update({ estado: "pagado", mp_payment_id: paymentId, mp_status: status })
        .eq("id", ordenId)
        .eq("estado", "pendiente")
        .select("id")
        .maybeSingle()

      if (updateErr) {
        console.error("process-payment: update error:", updateErr)
      }

      if (updated) {
        try {
          const idVentaRuby = await createVentaAndDespacho(
            ordenId,
            orden.items as unknown as import("@/lib/types").CartItem[],
            orden.cliente_snapshot as unknown as import("@/lib/types").DireccionEntrega,
            paymentId,
            orden.total,
            orden.delivery
          )
          if (idVentaRuby) {
            await supabase
              .from("ordenes_tienda")
              .update({ id_venta_ruby: idVentaRuby })
              .eq("id", ordenId)
          }
        } catch (rubyErr) {
          console.error("Ruby sync error (non-fatal):", rubyErr)
        }
      }

      return NextResponse.json({ status: "approved", ordenId, paymentId })
    }

    if (status === "pending") {
      await supabase
        .from("ordenes_tienda")
        .update({ mp_payment_id: paymentId, mp_status: status })
        .eq("id", ordenId)
      return NextResponse.json({ status: "pending", ordenId, paymentId })
    }

    return NextResponse.json(
      { status: "rejected", error: payment.status_detail ?? "Pago rechazado" },
      { status: 400 }
    )
  } catch (err) {
    console.error("process-payment error:", err)
    return NextResponse.json(
      { error: "Error procesando el pago. Intentá de nuevo o contactá a reservas@organnical.com." },
      { status: 500 }
    )
  }
}
