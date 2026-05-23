"use client"
import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { CheckCircle, Clock, Package, ArrowRight, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { trackPurchase } from "@/lib/analytics"

type EstadoUI =
  | { kind: "polling"; intento: number }
  | { kind: "pagado" }
  | { kind: "pendiente" }
  | { kind: "rechazado" }

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 5

function SuccessContent() {
  const params = useSearchParams()
  const { clear } = useCart()
  const ordenId = params.get("orden_id")
  const clearedRef = useRef(false)
  const [isGuest, setIsGuest] = useState(false)
  const [estado, setEstado] = useState<EstadoUI>(() =>
    ordenId ? { kind: "polling", intento: 0 } : { kind: "pendiente" }
  )
  const purchaseFired = useRef(false)

  useEffect(() => {
    if (!clearedRef.current) { clear(); clearedRef.current = true }
  }, [clear])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsGuest(!data.user))
  }, [])

  useEffect(() => {
    if (!ordenId) return
    let cancelled = false
    let intento = 0
    async function poll() {
      while (!cancelled && intento < POLL_MAX_ATTEMPTS) {
        intento++
        if (!cancelled) setEstado({ kind: "polling", intento })
        try {
          const res = await fetch(`/api/ordenes/${ordenId}/status`, { cache: "no-store" })
          if (res.ok) {
            const data = await res.json()
            if (cancelled) return
            const e: string = data?.estado ?? "pendiente"
            const mp: string | null = data?.mp_status ?? null
            if (e === "pagado") { setEstado({ kind: "pagado" }); return }
            if (mp === "rejected" || mp === "cancelled" || e === "cancelado") { setEstado({ kind: "rechazado" }); return }
          }
        } catch (err) { console.warn("success: polling error:", err) }
        if (intento < POLL_MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
      }
      if (!cancelled) setEstado({ kind: "pendiente" })
    }
    poll()
    return () => { cancelled = true }
  }, [ordenId])

  useEffect(() => {
    if (estado.kind !== "pagado" || purchaseFired.current || !ordenId) return
    purchaseFired.current = true
    fetch(`/api/ordenes/${ordenId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.items)) return
        trackPurchase({ transactionId: data.id, value: Number(data.total), shipping: Number(data.delivery), items: data.items })
      })
      .catch((err) => console.warn("success: trackPurchase fetch failed:", err))
  }, [estado.kind, ordenId])

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <StatusVisual estado={estado} />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{titleFor(estado)}</h1>
      <p className="text-gray-500 mb-2">{subtitleFor(estado)}</p>
      {ordenId && (
        <p className="text-xs text-gray-400 mb-8">Orden: <span className="font-mono">{ordenId.slice(0, 8).toUpperCase()}</span></p>
      )}

      {estado.kind === "pagado" && (
        <div className="flex justify-center gap-2 mb-10">
          {[
            { icon: CheckCircle, label: "Pago confirmado", done: true },
            { icon: Package, label: "En preparación", done: false },
            { icon: ArrowRight, label: "En camino", done: false },
          ].map(({ icon: Icon, label, done }, i) => (
            <div key={i} className="flex flex-col items-center gap-1 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-purple-100" : "bg-gray-100"}`}>
                <Icon size={18} className={done ? "text-purple-600" : "text-gray-400"} />
              </div>
              <span className="text-[10px] text-gray-500 max-w-16 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      )}

      {estado.kind === "rechazado" && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6 text-sm text-left space-y-2">
          <p className="font-semibold text-red-800">Tu pago fue rechazado</p>
          <p className="text-red-700">La pasarela rechazó la transacción. Esto suele pasar por saldo insuficiente, datos de tarjeta incorrectos o restricciones del banco emisor.</p>
          <Link href="/checkout" className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl mt-1">
            Reintentar pago <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {estado.kind === "pendiente" && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 text-sm text-left space-y-2">
          <p className="font-semibold text-amber-800">Pago pendiente de confirmación</p>
          <p className="text-amber-700">La pasarela aún no nos confirmó el pago. Si elegiste un método con confirmación diferida, el proceso puede tomar unas horas. Te avisaremos por email cuando se confirme.</p>
        </div>
      )}

      {isGuest && estado.kind === "pagado" && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-6 text-sm text-left space-y-2">
          <p className="font-semibold text-purple-800">¿Quieres guardar tu pedido?</p>
          <p className="text-purple-700">Crea tu cuenta en 30 segundos y revisa el estado de tus pedidos cuando quieras.</p>
          <Link href="/registro?next=/cuenta" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-xl mt-1">
            Crear cuenta <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-8 text-sm text-left space-y-1">
        <p className="font-semibold text-purple-800">¿Necesitas ayuda con tu pedido?</p>
        <p className="text-purple-700">
          Escríbenos por{" "}
          <a href="https://wa.me/51952476574" target="_blank" rel="noopener noreferrer" className="underline font-medium">WhatsApp</a>
          {" "}o a{" "}
          <a href="mailto:reservas@organnical.com" className="underline font-medium">reservas@organnical.com</a>
        </p>
      </div>

      <Link href="/tienda" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
        Seguir comprando <ArrowRight size={16} />
      </Link>
    </div>
  )
}

function StatusVisual({ estado }: { estado: EstadoUI }) {
  if (estado.kind === "polling") return <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-purple-100"><Loader2 size={40} className="text-purple-600 animate-spin" /></div>
  if (estado.kind === "pagado") return <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100"><CheckCircle size={40} className="text-green-600" /></div>
  if (estado.kind === "rechazado") return <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-100"><XCircle size={40} className="text-red-600" /></div>
  return <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-100"><Clock size={40} className="text-amber-500" /></div>
}

function titleFor(e: EstadoUI): string {
  switch (e.kind) {
    case "polling": return "Confirmando tu pago..."
    case "pagado": return "¡Pedido confirmado!"
    case "pendiente": return "Pago pendiente"
    case "rechazado": return "Pago rechazado"
  }
}

function subtitleFor(e: EstadoUI): string {
  switch (e.kind) {
    case "polling": return `Consultando con la pasarela (intento ${e.intento}/${POLL_MAX_ATTEMPTS})...`
    case "pagado": return "Tu pedido fue recibido y ya está en preparación."
    case "pendiente": return "Aún no nos confirmaron el pago. Revisa tu email en los próximos minutos."
    case "rechazado": return "La pasarela no aceptó tu pago. Puedes reintentar abajo."
  }
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
