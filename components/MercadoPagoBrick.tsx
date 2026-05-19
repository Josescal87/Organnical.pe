"use client"
import { useState } from "react"
import { initMercadoPago, Payment } from "@mercadopago/sdk-react"
import type { IPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/payment/type"
import { ArrowLeft } from "lucide-react"
import PaymentErrorModal from "@/components/PaymentErrorModal"

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "es-PE" })

interface Props {
  amount: number
  preferenceId: string
  ordenId: string
  payer: { firstName: string; lastName: string; email: string }
  onApproved: () => void
  onPending: () => void
  onBack: () => void
  onErrorMessage?: (msg: string) => void
}

function friendlyError(raw: unknown): string {
  const msg = (raw && typeof raw === "object" && "message" in raw
    ? String((raw as { message?: unknown }).message ?? "")
    : String(raw ?? "")).toLowerCase()
  if (!msg) return "Ocurrió un error al procesar el pago. Intenta de nuevo."
  if (msg.includes("invalid_payment_method") || msg.includes("invalid card")) return "El método de pago no es válido. Verifica los datos de tu tarjeta."
  if (msg.includes("insufficient") || msg.includes("cc_rejected_insufficient")) return "Fondos insuficientes en la tarjeta."
  if (msg.includes("min_amount") || msg.includes("monto m")) return "El monto es menor al mínimo aceptado por la pasarela. Agrega más productos."
  if (msg.includes("rejected") || msg.includes("rechazad")) return "El pago fue rechazado. Intenta con otro método de pago."
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout")) return "Error de conexión. Verifica tu internet e intenta de nuevo."
  return "No pudimos procesar el pago. Intenta de nuevo o usa otro método."
}

export default function MercadoPagoBrick({ amount, preferenceId, ordenId, payer, onApproved, onPending, onBack, onErrorMessage }: Props) {
  const [errorState, setErrorState] = useState<{ code?: string } | null>(null)

  return (
    <div className="space-y-4">
      <PaymentErrorModal
        open={errorState !== null}
        errorCode={errorState?.code}
        onRetry={() => setErrorState(null)}
        onClose={() => setErrorState(null)}
      />
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={15} /> Volver y editar datos
      </button>
      <Payment
        initialization={{
          amount,
          preferenceId,
          payer: { firstName: payer.firstName, lastName: payer.lastName, email: payer.email, entityType: "individual" },
        }}
        customization={{
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            mercadoPago: ["wallet_purchase"],
            maxInstallments: 1,
          },
        }}
        onSubmit={async (paymentFormData: IPaymentFormData) => {
          try {
            const res = await fetch("/api/mp/process-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ formData: paymentFormData.formData, ordenId }),
            })
            const data = await res.json()
            if (!res.ok) {
              const msg = friendlyError(data.error ?? "Error al procesar el pago")
              onErrorMessage?.(msg)
              throw new Error(msg)
            }
            if (data.status === "approved") {
              onApproved()
            } else if (data.status === "pending") {
              onPending()
            } else {
              const code = data.status_detail as string | undefined
              setErrorState({ code })
              onErrorMessage?.(friendlyError(data.error ?? code ?? "rejected"))
              throw new Error(code ?? "rejected")
            }
          } catch (err) {
            throw err
          }
        }}
        onError={(error) => {
          console.error("Payment brick error:", error)
          const rawCause = (error as unknown as { cause?: unknown })?.cause
          const code: string | undefined =
            Array.isArray(rawCause) ? (rawCause[0] as { code?: string })?.code
            : typeof rawCause === "string" ? rawCause
            : (error as unknown as { code?: string })?.code
          setErrorState({ code })
          onErrorMessage?.(friendlyError(error))
          const gtag = typeof window !== "undefined"
            ? (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag
            : undefined
          gtag?.("event", "payment_error", { error_code: code ?? "unknown" })
        }}
      />
    </div>
  )
}
