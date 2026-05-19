"use client"
import { useEffect } from "react"
import { X, MessageCircle, RefreshCw } from "lucide-react"

interface Props {
  open: boolean
  errorCode?: string
  onRetry: () => void
  onClose: () => void
}

const ERROR_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount: "Tu tarjeta no tiene fondos suficientes para esta compra.",
  cc_rejected_bad_filled_security_code: "El código de seguridad de la tarjeta es incorrecto.",
  cc_rejected_bad_filled_date: "La fecha de vencimiento de la tarjeta es incorrecta.",
  cc_rejected_bad_filled_other: "Algún dato de la tarjeta está mal. Revisalo e intentá de nuevo.",
  cc_rejected_call_for_authorize: "Tu banco necesita autorizar este pago. Llamá al teléfono detrás de tu tarjeta.",
  cc_rejected_card_disabled: "Tu tarjeta está desactivada. Contactá a tu banco.",
  cc_rejected_card_error: "No pudimos procesar tu tarjeta. Probá con otra.",
  cc_rejected_duplicated_payment: "Ya hiciste este pago. Si pensás que es un error, contactanos.",
  cc_rejected_high_risk: "Tu pago fue rechazado por motivos de seguridad. Probá con otro método.",
  cc_rejected_max_attempts: "Llegaste al máximo de intentos permitidos. Probá más tarde o con otra tarjeta.",
  cc_rejected_other_reason: "Tu tarjeta rechazó el pago. Probá con otra.",
  cc_rejected_blacklist: "Esta tarjeta no puede ser usada para pagar.",
  default: "No pudimos procesar tu pago. Intentá de nuevo o contactanos.",
}

const WHATSAPP_URL = `https://wa.me/51952476574?text=${encodeURIComponent("Hola, tuve un problema al pagar en la tienda. ¿Me ayudan?")}`

export default function PaymentErrorModal({ open, errorCode, onRetry, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const friendlyMessage = errorCode && ERROR_MESSAGES[errorCode] ? ERROR_MESSAGES[errorCode] : ERROR_MESSAGES.default

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-error-title"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" aria-label="Cerrar">
          <X size={20} />
        </button>
        <h2 id="payment-error-title" className="text-lg font-bold text-gray-900 mb-2">Hubo un problema con el pago</h2>
        <p className="text-gray-700 text-sm mb-4">{friendlyMessage}</p>
        {errorCode && <p className="text-xs text-gray-400 font-mono mb-4">Código: {errorCode}</p>}
        <div className="flex flex-col gap-2">
          <button onClick={onRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
            <RefreshCw size={16} /> Intentar de nuevo
          </button>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
            <MessageCircle size={16} /> Hablar con soporte
          </a>
          <button onClick={onClose} className="w-full text-gray-500 hover:text-gray-700 py-1 text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
