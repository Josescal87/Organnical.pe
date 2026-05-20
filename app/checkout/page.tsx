"use client"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useCart } from "@/contexts/CartContext"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { isPickup, MP_MIN_AMOUNT, FREE_DELIVERY_THRESHOLD, DELIVERY_FALLBACK, PICKUP_DISTRITO } from "@/lib/pricing"
import { trackBeginCheckout, trackAddPaymentInfo } from "@/lib/analytics"
import { isValidCelular, sanitizeDigits } from "@/lib/validators"
import DocumentInput, { type DocType, validateDocId } from "@/components/DocumentInput"
import { ShoppingCart, Lock, CreditCard, Store, Tag, CheckCircle2, X } from "lucide-react"
import Link from "next/link"
import DistritoCombobox from "@/components/DistritoCombobox"
import type { DireccionEntrega } from "@/lib/types"

type FormData = DireccionEntrega

const empty: FormData = {
  nombre: "", apellido: "", celular: "", email: "", doc_type: "DNI", dni: "",
  distrito: "", direccion: "", referencia: "",
}

const ERR_CELULAR = "El celular debe empezar con 9 y tener 9 dígitos en total."

type CuponState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "applied"; descuento: number; descripcion: string; code: string }
  | { status: "error"; message: string }

export default function CheckoutPage() {
  const { items, subtotal } = useCart()
  const [form, setForm] = useState<FormData>(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error") === "pago_fallido") {
      setError("Tu pago fue rechazado o cancelado. Por favor intenta de nuevo.")
    }
  }, [])

  const [fieldErrors, setFieldErrors] = useState<{ celular?: string; dni?: string }>({})
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesError, setRatesError] = useState(false)
  const defaultAddressRef = useRef<{ distrito: string; direccion: string; referencia: string } | null>(null)
  const toastOfferedRef = useRef(false)

  const [couponInput, setCouponInput] = useState("")
  const [cupon, setCupon] = useState<CuponState>({ status: "idle" })

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

  const descuento = cupon.status === "applied" ? cupon.descuento : 0
  const total = Math.max(MP_MIN_AMOUNT, subtotal + deliveryCost - descuento)
  const showCalculando = !pickup && Boolean(form.distrito) && !ratesLoaded && subtotal < FREE_DELIVERY_THRESHOLD

  async function handleCouponApply() {
    const code = couponInput.trim()
    if (!code) return
    setCupon({ status: "loading" })
    try {
      const params = new URLSearchParams({ code, subtotal: String(subtotal) })
      const res = await fetch(`/api/cupones/validate?${params.toString()}`)
      const data = await res.json() as { valid: boolean; error?: string; descuento?: number; descripcion?: string }
      if (data.valid) {
        setCupon({ status: "applied", descuento: data.descuento!, descripcion: data.descripcion!, code: code.toUpperCase() })
      } else {
        setCupon({ status: "error", message: data.error ?? "Código no válido" })
      }
    } catch {
      setCupon({ status: "error", message: "Error al validar el cupón. Inténtalo de nuevo." })
    }
  }

  function handleRemoveCoupon() {
    setCupon({ status: "idle" })
  }

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
    const cleaned = name === "celular" ? sanitizeDigits(value) : value
    setForm((f) => ({ ...f, [name]: cleaned }))
    if (fieldErrors[name as "celular" | "dni"]) {
      setFieldErrors((errs) => ({ ...errs, [name]: undefined }))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target
    if (name === "celular" && value && !isValidCelular(value)) {
      setFieldErrors((errs) => ({ ...errs, celular: ERR_CELULAR }))
    } else if (name === "dni" && value) {
      const docErr = validateDocId(form.doc_type as DocType, value)
      if (docErr) setFieldErrors((errs) => ({ ...errs, dni: docErr }))
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
    if (form.dni) {
      const docErr = validateDocId((form.doc_type as DocType) || "DNI", form.dni)
      if (docErr) {
        setFieldErrors((errs) => ({ ...errs, dni: docErr }))
        setError(docErr)
        setLoading(false)
        return
      }
    }
    if (subtotal + deliveryCost < MP_MIN_AMOUNT) {
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
        body: JSON.stringify({
          items: itemsPayload,
          direccion: form,
          couponCode: cupon.status === "applied" ? cupon.code : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al iniciar el pago. Inténtalo de nuevo.")
        setLoading(false)
        return
      }
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

      window.location.href = data.init_point
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar compra</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">Datos personales</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} />
                <Input label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} />
              </div>
              <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} />
              <Input label="Celular *" name="celular" type="tel" value={form.celular} onChange={handleChange} onBlur={handleBlur} error={fieldErrors.celular} placeholder="9XXXXXXXX" inputMode="numeric" maxLength={9} />
              <div>
                <DocumentInput
                  docType={(form.doc_type as DocType) || "DNI"}
                  docId={form.dni}
                  onDocTypeChange={(t) => setForm((f) => ({ ...f, doc_type: t, dni: "" }))}
                  onDocIdChange={(v) => setForm((f) => ({ ...f, dni: v }))}
                  error={fieldErrors.dni}
                />
                <p className="text-xs text-gray-400 mt-1">Opcional — para incluir en tu boleta.</p>
              </div>
            </section>

            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">Modalidad de entrega</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, distrito: PICKUP_DISTRITO }))}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                    pickup ? "bg-purple-50 border-purple-400 text-purple-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Store size={15} />
                  Recojo en tienda
                </button>
                <button
                  type="button"
                  onClick={() => { if (pickup) setForm((f) => ({ ...f, distrito: "" })) }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                    !pickup ? "bg-purple-50 border-purple-400 text-purple-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  Envío a domicilio
                </button>
              </div>
              {!pickup && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1" htmlFor="distrito">Distrito *</label>
                <DistritoCombobox id="distrito" value={form.distrito} onChange={(next) => setForm((f) => ({ ...f, distrito: next }))} required />
              </div>
              )}
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
              {loading ? "Preparando pago..." : <><CreditCard size={16} /> Ir a pagar {formatPrice(total)}</>}
            </button>
          </form>
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

            {/* Cupón de descuento */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Código de descuento
              </p>
              {cupon.status === "applied" ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-700">{cupon.code}</p>
                      <p className="text-[11px] text-emerald-600">{cupon.descripcion}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-400 hover:text-emerald-600 transition-colors ml-2 flex-shrink-0"
                    aria-label="Quitar cupón"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase())
                        if (cupon.status === "error") setCupon({ status: "idle" })
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleCouponApply() } }}
                      placeholder="CODIGO10"
                      maxLength={30}
                      className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase placeholder:normal-case"
                    />
                    <button
                      type="button"
                      onClick={() => void handleCouponApply()}
                      disabled={cupon.status === "loading" || !couponInput.trim()}
                      className="px-3 py-2 rounded-xl bg-purple-100 text-purple-700 text-sm font-semibold hover:bg-purple-200 disabled:opacity-50 transition-all whitespace-nowrap"
                    >
                      {cupon.status === "loading" ? "..." : "Aplicar"}
                    </button>
                  </div>
                  {cupon.status === "error" && (
                    <p className="text-[11px] text-red-600">{cupon.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-2 space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                {showCalculando ? (
                  <span className="text-xs text-gray-400 italic">Calculando...</span>
                ) : (
                  <span>{deliveryCost === 0 ? (pickup ? "Gratis (recojo)" : "Gratis") : formatPrice(deliveryCost)}</span>
                )}
              </div>
              {cupon.status === "applied" && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento</span>
                  <span>−{formatPrice(cupon.descuento)}</span>
                </div>
              )}
              {ratesError && <p className="text-[11px] text-amber-600">Tarifa estimada — el total final se confirma al pagar.</p>}
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{showCalculando ? formatPrice(subtotal - descuento) + " + envío" : formatPrice(total)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">Yape · Plin · Visa · Mastercard · Amex</p>
          <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
            <Lock size={11} /> Pago procesado de forma segura
          </p>
        </aside>
      </div>
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
