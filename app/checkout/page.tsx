"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { useCart } from "@/contexts/CartContext"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { isPickup, MP_MIN_AMOUNT, FREE_DELIVERY_THRESHOLD, DELIVERY_FALLBACK } from "@/lib/pricing"
import { trackBeginCheckout, trackAddPaymentInfo } from "@/lib/analytics"
import { isValidDni, isValidCelular, sanitizeDigits } from "@/lib/validators"
import { ShoppingCart, Lock, CreditCard, Store } from "lucide-react"
import Link from "next/link"
import DistritoCombobox from "@/components/DistritoCombobox"
import type { DireccionEntrega } from "@/lib/types"

const MercadoPagoBrick = dynamic(
  () => import("@/components/MercadoPagoBrick"),
  { ssr: false, loading: () => <BrickSkeleton /> }
)

type FormData = DireccionEntrega

const empty: FormData = {
  nombre: "", apellido: "", celular: "", email: "", dni: "",
  distrito: "", direccion: "", referencia: "",
}

const ERR_CELULAR = "El celular debe empezar con 9 y tener 9 dígitos en total."
const ERR_DNI = "El DNI debe tener 8 dígitos."

export default function CheckoutPage() {
  const { items, subtotal } = useCart()
  const router = useRouter()
  const [form, setForm] = useState<FormData>(empty)
  const [step, setStep] = useState<"form" | "payment">("form")
  const [preference, setPreference] = useState<{ ordenId: string; preferenceId: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ celular?: string; dni?: string }>({})
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesError, setRatesError] = useState(false)
  const defaultAddressRef = useRef<{ distrito: string; direccion: string; referencia: string } | null>(null)
  const toastOfferedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/delivery-rates")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data: { rates: Record<string, number> }) => {
        if (!cancelled) setRates(data.rates ?? {})
      })
      .catch((err) => {
        console.error("checkout: error cargando tarifas:", err)
        if (!cancelled) { setRates({}); setRatesError(true) }
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { data: addr } = await supabase
        .from("addresses")
        .select("distrito, direccion, referencia")
        .eq("user_id", user.id)
        .eq("es_default", true)
        .maybeSingle()
      if (cancelled) return
      if (addr) {
        defaultAddressRef.current = {
          distrito: addr.distrito ?? "",
          direccion: addr.direccion ?? "",
          referencia: addr.referencia ?? "",
        }
      }
      const fullName = (user.user_metadata?.nombre_completo ?? "").trim()
      const [firstName, ...rest] = fullName.split(/\s+/)
      const lastName = rest.join(" ")
      setForm((current) => {
        if (current.distrito || current.direccion || current.nombre) return current
        return {
          ...current,
          nombre: current.nombre || (firstName ?? ""),
          apellido: current.apellido || lastName,
          email: current.email || (user.email ?? ""),
          distrito: addr?.distrito ?? "",
          direccion: addr?.direccion ?? "",
          referencia: addr?.referencia ?? "",
        }
      })
    })()
    return () => { cancelled = true }
  }, [])

  async function saveAddressFromToast() {
    try {
      const res = await fetch("/api/cuenta/addresses/default", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distrito: form.distrito, direccion: form.direccion, referencia: form.referencia }),
      })
      if (!res.ok) { toast.error("No se pudo guardar la dirección."); return }
      toast.success("Dirección guardada en tu cuenta.")
      defaultAddressRef.current = { distrito: form.distrito, direccion: form.direccion, referencia: form.referencia }
    } catch {
      toast.error("Error de conexión al guardar la dirección.")
    }
  }

  const pickup = isPickup(form.distrito)
  const ratesLoaded = rates !== null
  let deliveryCost = 0
  if (pickup) {
    deliveryCost = 0
  } else if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    deliveryCost = 0
  } else if (!form.distrito || !ratesLoaded) {
    deliveryCost = 0
  } else if (rates && form.distrito in rates) {
    deliveryCost = rates[form.distrito]
  } else {
    deliveryCost = DELIVERY_FALLBACK
  }
  const total = subtotal + deliveryCost
  const showCalculando = !pickup && Boolean(form.distrito) && !ratesLoaded && subtotal < FREE_DELIVERY_THRESHOLD

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingCart size={56} className="mx-auto text-gray-200 mb-4" />
        <h1 className="text-xl font-bold text-gray-700 mb-4">Tu carrito está vacío</h1>
        <Link href="/tienda" className="text-purple-700 font-medium hover:underline">Ir a la tienda</Link>
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const cleaned = name === "celular" || name === "dni" ? sanitizeDigits(value) : value
    setForm((f) => ({ ...f, [name]: cleaned }))
    if (fieldErrors[name as "celular" | "dni"]) {
      setFieldErrors((errs) => ({ ...errs, [name]: undefined }))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target
    if (name === "celular" && value && !isValidCelular(value)) {
      setFieldErrors((errs) => ({ ...errs, celular: ERR_CELULAR }))
    } else if (name === "dni" && value && !isValidDni(value)) {
      setFieldErrors((errs) => ({ ...errs, dni: ERR_DNI }))
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const required: (keyof FormData)[] = pickup
      ? ["nombre", "apellido", "celular", "email", "distrito"]
      : ["nombre", "apellido", "celular", "email", "distrito", "direccion"]
    for (const field of required) {
      if (!form[field].trim()) {
        setError("Por favor completa todos los campos obligatorios.")
        setLoading(false)
        return
      }
    }
    if (!isValidCelular(form.celular)) {
      setFieldErrors((errs) => ({ ...errs, celular: ERR_CELULAR }))
      setError(ERR_CELULAR)
      setLoading(false)
      return
    }
    if (form.dni && !isValidDni(form.dni)) {
      setFieldErrors((errs) => ({ ...errs, dni: ERR_DNI }))
      setError(ERR_DNI)
      setLoading(false)
      return
    }
    if (total < MP_MIN_AMOUNT) {
      setError(`El monto mínimo para procesar el pago es S/ ${MP_MIN_AMOUNT.toFixed(2)}.`)
      setLoading(false)
      return
    }
    trackBeginCheckout(items, total)
    try {
      const itemsPayload = items.map((i) => ({ sku: i.producto.sku, cantidad: i.cantidad }))
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload, direccion: form }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al iniciar el pago. Inténtalo de nuevo.")
        setLoading(false)
        return
      }
      setPreference({ ordenId: data.orden_id, preferenceId: data.preference_id })
      trackAddPaymentInfo(items, typeof data.total === "number" ? data.total : total)

      const saved = defaultAddressRef.current
      const editedAddress = saved && !pickup && !toastOfferedRef.current &&
        (saved.distrito !== form.distrito || saved.direccion !== form.direccion || saved.referencia !== form.referencia) &&
        form.distrito && form.direccion
      if (editedAddress) {
        toastOfferedRef.current = true
        toast("¿Guardar esta dirección en tu cuenta?", {
          description: "La próxima vez que compres se autocompletará.",
          action: { label: "Guardar", onClick: () => { void saveAddressFromToast() } },
          duration: 8000,
        })
      }
      setStep("payment")
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {step === "form" ? "Finalizar compra" : "Pago seguro"}
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {step === "form" ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-800">Datos personales</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} />
                  <Input label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} />
                </div>
                <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Celular *" name="celular" type="tel" value={form.celular} onChange={handleChange} onBlur={handleBlur} error={fieldErrors.celular} placeholder="9XXXXXXXX" inputMode="numeric" maxLength={9} />
                  <Input label="DNI" name="dni" value={form.dni} onChange={handleChange} onBlur={handleBlur} error={fieldErrors.dni} placeholder="Opcional — 8 dígitos" inputMode="numeric" maxLength={8} />
                </div>
              </section>

              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-800">Modalidad de entrega</h2>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1" htmlFor="distrito">Distrito *</label>
                  <DistritoCombobox id="distrito" value={form.distrito} onChange={(next) => setForm((f) => ({ ...f, distrito: next }))} required />
                </div>
                {pickup ? (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <Store size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-purple-800">Recojo en tienda — Sin costo de envío</p>
                      <p className="text-purple-700 text-xs mt-1">Te contactamos por WhatsApp con la dirección y horarios de recojo después del pago.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Dirección *</label>
                      <textarea name="direccion" value={form.direccion} onChange={handleChange} rows={2} placeholder="Av. / Jr. / Calle, número, piso/dpto" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" required />
                    </div>
                    <Input label="Referencia" name="referencia" value={form.referencia} onChange={handleChange} placeholder="Ej. Frente al parque" />
                  </>
                )}
              </section>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                {loading ? "Preparando pago..." : <><CreditCard size={16} /> Continuar al pago {formatPrice(total)}</>}
              </button>
            </form>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
              {preference && (
                <MercadoPagoBrick
                  amount={total}
                  preferenceId={preference.preferenceId}
                  ordenId={preference.ordenId}
                  payer={{ firstName: form.nombre, lastName: form.apellido, email: form.email }}
                  onApproved={() => router.push(`/checkout/success?orden_id=${preference.ordenId}`)}
                  onPending={() => router.push(`/checkout/success?orden_id=${preference.ordenId}&pending=1`)}
                  onBack={() => { setStep("form"); setPreference(null); setError(null) }}
                  onErrorMessage={(msg) => setError(msg)}
                />
              )}
            </div>
          )}
        </div>

        <aside className="lg:w-80 h-fit space-y-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800">Tu pedido</h2>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.producto.sku} className="flex justify-between text-gray-600">
                <span className="truncate flex-1 mr-2">{item.producto.descripcion} ×{item.cantidad}</span>
                <span className="font-medium">{formatPrice((item.producto.precio_oferta ?? item.producto.precio_publico) * item.cantidad)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                {showCalculando ? (
                  <span className="text-xs text-gray-400 italic">Calculando...</span>
                ) : (
                  <span>{deliveryCost === 0 ? (pickup ? "Gratis (recojo)" : "Gratis") : formatPrice(deliveryCost)}</span>
                )}
              </div>
              {ratesError && <p className="text-[11px] text-amber-600">Tarifa estimada — el total final se confirma al pagar.</p>}
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{showCalculando ? formatPrice(subtotal) + " + envío" : formatPrice(total)}</span>
              </div>
            </div>
          </div>
          {step === "form" && (
            <>
              <p className="text-xs text-gray-400 text-center">Yape · Plin · Visa · Mastercard · Amex</p>
              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                <Lock size={11} /> Pago procesado de forma segura
              </p>
            </>
          )}
          {step === "payment" && form.nombre && (
            <div className="text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-3">
              <p className="font-medium text-gray-700">{form.nombre} {form.apellido}</p>
              <p>{form.distrito}</p>
              <p className="truncate">{form.direccion}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function BrickSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-12 bg-gray-200 rounded-xl" />
    </div>
  )
}

function Input({ label, name, value, onChange, onBlur, type = "text", placeholder, error, inputMode, maxLength }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} inputMode={inputMode} maxLength={maxLength}
        aria-invalid={Boolean(error)}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${error ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-purple-500"}`}
      />
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  )
}
