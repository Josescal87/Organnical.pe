import { MercadoPagoConfig, Preference, Payment } from "mercadopago"
import type { CartItem, DireccionEntrega } from "@/lib/types"

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function createPreference(
  items: CartItem[],
  direccion: DireccionEntrega,
  ordenId: string,
  deliveryCost: number
) {
  const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://organnical.pe").trim()
  const isLocalhost = siteUrl.includes("localhost")
  const preference = new Preference(mp)

  const mpItems = items.map((item) => ({
    id: item.producto.sku,
    title: item.producto.descripcion,
    quantity: item.cantidad,
    unit_price: item.producto.precio_oferta ?? item.producto.precio_publico,
    currency_id: "PEN",
    picture_url: item.producto.imagen_url ?? undefined,
  }))

  if (deliveryCost > 0) {
    mpItems.push({ id: "delivery", title: "Costo de envío", quantity: 1, unit_price: deliveryCost, currency_id: "PEN", picture_url: undefined })
  }

  const result = await preference.create({
    body: {
      items: mpItems,
      payer: {
        name: direccion.nombre,
        surname: direccion.apellido,
        email: direccion.email,
        phone: { area_code: "51", number: direccion.celular },
        identification: { type: "DNI", number: direccion.dni },
      },
      back_urls: {
        success: `${siteUrl}/checkout/success?orden_id=${ordenId}`,
        failure: `${siteUrl}/checkout?error=pago_fallido`,
        pending: `${siteUrl}/checkout/success?orden_id=${ordenId}&pending=1`,
      },
      ...(isLocalhost ? {} : { auto_return: "approved" as const }),
      external_reference: ordenId,
      notification_url: isLocalhost ? undefined : `${siteUrl}/api/mp/webhook`,
      statement_descriptor: "ORGANNICAL",
      expires: false,
    },
  })

  return result
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(mp)
  return payment.get({ id: paymentId })
}

export async function createPayment(params: {
  token: string
  paymentMethodId: string
  installments: number
  issuerId: number | null
  transactionAmount: number
  payer: { email: string; identification?: { type: string; number: string } }
  ordenId: string
}) {
  const payment = new Payment(mp)
  const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://organnical.pe").trim()
  const isLocalhost = siteUrl.includes("localhost")

  return payment.create({
    body: {
      token: params.token,
      issuer_id: params.issuerId ?? undefined,
      payment_method_id: params.paymentMethodId,
      transaction_amount: params.transactionAmount,
      installments: params.installments,
      description: `Organnical orden ${params.ordenId.slice(0, 8)}`,
      payer: params.payer,
      external_reference: params.ordenId,
      notification_url: isLocalhost ? undefined : `${siteUrl}/api/mp/webhook`,
      statement_descriptor: "ORGANNICAL",
    },
    requestOptions: { idempotencyKey: `orden-${params.ordenId}` },
  })
}
