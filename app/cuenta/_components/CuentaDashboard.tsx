"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Package, Calendar, FileText, MapPin, Settings,
  ShoppingBag, CalendarPlus, FileDown, Clock, CheckCircle, AlertCircle,
  ChevronRight, LogOut,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { DISTRITOS, PICKUP_DISTRITO } from "@/lib/pricing"
import { SPECIALTY_LABELS } from "@/lib/specialty-labels"
import type { OrdenTienda } from "@/lib/types"
import type { AppointmentRow, PrescriptionRow, DireccionData } from "../page"

// ── helpers ───────────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, { label: string; color: string }> = {
  pagado:      { label: "Pagado",    color: "bg-blue-100 text-blue-700" },
  en_despacho: { label: "En camino", color: "bg-amber-100 text-amber-700" },
  entregado:   { label: "Entregado", color: "bg-emerald-100 text-emerald-700" },
  cancelado:   { label: "Cancelado", color: "bg-red-100 text-red-700" },
}

const STATUS_BADGE: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending:   { label: "Pendiente",  color: "bg-amber-50 text-amber-600",     icon: Clock },
  confirmed: { label: "Confirmada", color: "bg-sky-50 text-sky-600",         icon: CheckCircle },
  completed: { label: "Completada", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
  cancelled: { label: "Cancelada",  color: "bg-zinc-100 text-zinc-500",      icon: AlertCircle },
}

function formatSlot(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
    + " · " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })
}

// ── types ─────────────────────────────────────────────────────────────────────

type Tab = "resumen" | "pedidos" | "citas" | "recetas" | "direccion" | "cuenta"

interface Props {
  nombre:           string
  email:            string
  ordenes:          OrdenTienda[]
  citas:            AppointmentRow[]
  recetas:          PrescriptionRow[]
  direccionGuardada: DireccionData | null
}

// ── CuentaDashboard ───────────────────────────────────────────────────────────

export default function CuentaDashboard({ nombre, email, ordenes, citas, recetas, direccionGuardada }: Props) {
  const [tab, setTab] = useState<Tab>("resumen")
  const router = useRouter()

  const firstName = nombre.split(" ")[0] || nombre

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }
  const recetasVigentes = recetas.filter((r) => new Date(r.valid_until) > new Date())

  const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: "resumen",   label: "Resumen",      icon: ShoppingBag },
    { id: "pedidos",   label: "Mis pedidos",  icon: Package },
    { id: "citas",     label: "Mis citas",    icon: Calendar },
    { id: "recetas",   label: "Mis recetas",  icon: FileText },
    { id: "direccion", label: "Direcciones",  icon: MapPin },
    { id: "cuenta",    label: "Mi cuenta",    icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hola, {firstName}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{email}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/tienda"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <ShoppingBag size={15} /> Ir a la tienda
              </Link>
              <Link
                href="/agendar"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <CalendarPlus size={15} /> Agendar consulta
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={15} /> Salir
              </button>
            </div>
          </div>

          {/* Banner promocional */}
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-3 flex items-center justify-between">
            <p className="text-white text-sm font-medium">¿Ya viste los productos nuevos?</p>
            <Link href="/tienda" className="text-white text-sm font-bold hover:underline flex items-center gap-1">
              Ver tienda <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <KpiCard label="Pedidos" value={ordenes.length} icon={Package} color="text-purple-600" />
          <KpiCard label="Citas activas" value={citas.length} icon={Calendar} color="text-sky-600" />
          <KpiCard label="Recetas vigentes" value={recetasVigentes.length} icon={FileText} color="text-emerald-600" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6 overflow-x-auto shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "resumen"   && <ResumenTab ordenes={ordenes} citas={citas} recetasVigentes={recetasVigentes} setTab={setTab} />}
        {tab === "pedidos"   && <PedidosTab ordenes={ordenes} />}
        {tab === "citas"     && <CitasTab citas={citas} />}
        {tab === "recetas"   && <RecetasTab recetas={recetas} />}
        {tab === "direccion" && <DireccionTab direccionGuardada={direccionGuardada} />}
        {tab === "cuenta"    && <CuentaSettingsTab nombre={nombre} email={email} />}
      </div>
    </div>
  )
}

// ── KpiCard ───────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Package; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
      <Icon size={20} className={`${color} mx-auto mb-1`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

// ── ResumenTab ────────────────────────────────────────────────────────────────

function ResumenTab({
  ordenes, citas, recetasVigentes, setTab,
}: {
  ordenes: OrdenTienda[]
  citas: AppointmentRow[]
  recetasVigentes: PrescriptionRow[]
  setTab: (t: Tab) => void
}) {
  const ultimoPedido = ordenes[0]
  const proximaCita  = citas[0]
  const recetaActiva = recetasVigentes[0]

  return (
    <div className="space-y-4">
      {/* Último pedido */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Package size={16} className="text-purple-500" /> Último pedido
          </h3>
          <button onClick={() => setTab("pedidos")} className="text-xs text-purple-600 hover:underline">
            Ver todos →
          </button>
        </div>
        {ultimoPedido ? (
          <div>
            <div className="flex justify-between items-start text-sm mb-2">
              <span className="text-gray-400 font-mono text-xs">{ultimoPedido.id.slice(0, 8).toUpperCase()}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(ESTADO_BADGE[ultimoPedido.estado] ?? { color: "bg-gray-100 text-gray-600" }).color}`}>
                {ESTADO_BADGE[ultimoPedido.estado]?.label ?? ultimoPedido.estado}
              </span>
            </div>
            <p className="text-sm text-gray-600">{formatFecha(ultimoPedido.created_at)}</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(ultimoPedido.total)}</p>
            <Link href={`/cuenta/${ultimoPedido.id}`} className="mt-3 inline-flex items-center gap-1 text-sm text-purple-600 hover:underline">
              Ver detalle <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm">Aún no tienes pedidos.</p>
            <Link href="/tienda" className="text-purple-600 text-sm mt-1 inline-block hover:underline">Explorar tienda →</Link>
          </div>
        )}
      </div>

      {/* Próxima cita */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-sky-500" /> Próxima cita
          </h3>
          <button onClick={() => setTab("citas")} className="text-xs text-sky-600 hover:underline">
            Ver todas →
          </button>
        </div>
        {proximaCita ? (
          <div className="text-sm">
            <p className="font-medium text-gray-900">{SPECIALTY_LABELS[proximaCita.specialty] ?? proximaCita.specialty}</p>
            <p className="text-gray-500 mt-0.5">{formatSlot(proximaCita.slot_start)}</p>
            {proximaCita.meeting_link && (
              <a href={proximaCita.meeting_link} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors">
                Unirse a la consulta
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm">No tienes citas próximas.</p>
            <Link href="/agendar" className="text-sky-600 text-sm mt-1 inline-block hover:underline">Agendar consulta →</Link>
          </div>
        )}
      </div>

      {/* Receta activa */}
      {recetaActiva && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={16} className="text-emerald-500" /> Receta vigente
            </h3>
            <button onClick={() => setTab("recetas")} className="text-xs text-emerald-600 hover:underline">
              Ver todas →
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Emitida el {formatFecha(recetaActiva.issued_at)} · Válida hasta {formatFecha(recetaActiva.valid_until)}
          </p>
          <div className="flex gap-3 mt-3">
            {recetaActiva.pdf_url && (
              <a href={recetaActiva.pdf_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline">
                <FileDown size={14} /> Descargar PDF
              </a>
            )}
            <Link href="/tienda" className="text-sm text-emerald-600 hover:underline">
              Comprar producto →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── PedidosTab ────────────────────────────────────────────────────────────────

function PedidosTab({ ordenes }: { ordenes: OrdenTienda[] }) {
  if (ordenes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Package size={40} className="mx-auto mb-3 text-gray-200" />
        <p className="text-sm">Aún no tienes pedidos.</p>
        <Link href="/tienda" className="text-purple-600 text-sm mt-2 inline-block hover:underline">
          Explorar productos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ordenes.map((orden) => {
        const badge  = ESTADO_BADGE[orden.estado] ?? { label: orden.estado, color: "bg-gray-100 text-gray-600" }
        const items  = orden.items as unknown as Array<{ producto: { descripcion: string }; cantidad: number }>
        return (
          <div key={orden.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400 font-mono">{orden.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatFecha(orden.created_at)}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <div className="space-y-0.5 text-sm text-gray-600">
              {items.map((it, i) => (
                <p key={i}>{it.producto.descripcion} ×{it.cantidad}</p>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-900">{formatPrice(orden.total)}</p>
              <p className="text-xs text-gray-400">
                Envío: {orden.delivery === 0 ? "Gratis" : formatPrice(orden.delivery)}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              {orden.boleta_link ? (
                <a href={orden.boleta_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline">
                  <FileDown size={14} /> Descargar boleta
                </a>
              ) : <span />}
              <Link href={`/cuenta/${orden.id}`} className="text-sm text-gray-500 hover:text-purple-600">
                Ver detalle →
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── CitasTab ──────────────────────────────────────────────────────────────────

function CitasTab({ citas }: { citas: AppointmentRow[] }) {
  if (citas.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Calendar size={40} className="mx-auto mb-3 text-gray-200" />
        <p className="text-sm">No tienes citas activas.</p>
        <Link href="/agendar" className="text-sky-600 text-sm mt-2 inline-block hover:underline">
          Agendar una consulta
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {citas.map((cita) => {
        const badge  = STATUS_BADGE[cita.status] ?? STATUS_BADGE.pending
        const BadgeIcon = badge.icon
        return (
          <div key={cita.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{SPECIALTY_LABELS[cita.specialty] ?? cita.specialty}</p>
                <p className="text-sm text-gray-500 mt-0.5">{formatSlot(cita.slot_start)}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                <BadgeIcon size={12} /> {badge.label}
              </span>
            </div>
            {cita.meeting_link && (
              <a href={cita.meeting_link} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors">
                Unirse a la consulta
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── RecetasTab ────────────────────────────────────────────────────────────────

function RecetasTab({ recetas }: { recetas: PrescriptionRow[] }) {
  if (recetas.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <FileText size={40} className="mx-auto mb-3 text-gray-200" />
        <p className="text-sm">No tienes recetas aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recetas.map((rx) => {
        const vigente = new Date(rx.valid_until) > new Date()
        return (
          <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Emitida: {formatFecha(rx.issued_at)}</p>
                <p className="text-sm text-gray-500">Vence: {formatFecha(rx.valid_until)}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${vigente ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                {vigente ? "Vigente" : "Vencida"}
              </span>
            </div>
            {rx.pdf_url && (
              <a href={rx.pdf_url} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline">
                <FileDown size={14} /> Descargar PDF
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── DireccionTab ──────────────────────────────────────────────────────────────

function DireccionTab({ direccionGuardada }: { direccionGuardada: DireccionData | null }) {
  const [distrito,  setDistrito]  = useState(direccionGuardada?.distrito  ?? "")
  const [direccion, setDireccion] = useState(direccionGuardada?.direccion ?? "")
  const [referencia, setReferencia] = useState(direccionGuardada?.referencia ?? "")
  const [saving, setSaving] = useState(false)

  const distritos = DISTRITOS.filter((d) => d !== PICKUP_DISTRITO)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/cuenta/addresses/default", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distrito, direccion, referencia }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Dirección guardada correctamente.")
    } catch {
      toast.error("Error al guardar la dirección.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-4">
      <p className="text-sm text-gray-500">Tu dirección se pre-llenará automáticamente en el checkout.</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
        <select
          value={distrito}
          onChange={(e) => setDistrito(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Selecciona un distrito</option>
          {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Calle, número, dpto."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
        <input
          type="text"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          placeholder="Cerca al mercado, frente al parque..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Guardar dirección"}
      </button>
    </form>
  )
}

// ── CuentaSettingsTab ─────────────────────────────────────────────────────────

function CuentaSettingsTab({ nombre, email }: { nombre: string; email: string }) {
  const router = useRouter()
  const [nuevoNombre, setNuevoNombre] = useState(nombre)
  const [passwordNueva, setPasswordNueva] = useState("")
  const [savingNombre, setSavingNombre] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleSaveNombre(e: React.FormEvent) {
    e.preventDefault()
    setSavingNombre(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { nombre_completo: nuevoNombre } })
    setSavingNombre(false)
    if (error) { toast.error("Error al actualizar el nombre.") }
    else        { toast.success("Nombre actualizado."); router.refresh() }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordNueva.length < 8) { toast.error("La contraseña debe tener al menos 8 caracteres."); return }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: passwordNueva })
    setSavingPassword(false)
    if (error) { toast.error("Error al cambiar la contraseña. Vuelve a iniciar sesión e intenta de nuevo.") }
    else        { toast.success("Contraseña actualizada correctamente."); setPasswordNueva("") }
  }

  return (
    <div className="max-w-md space-y-8">
      <form onSubmit={handleSaveNombre} className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Nombre</h3>
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          type="submit"
          disabled={savingNombre}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          {savingNombre ? "Guardando..." : "Guardar nombre"}
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Correo electrónico</h3>
        <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5">{email}</p>
      </div>

      <form onSubmit={handleSavePassword} className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Cambiar contraseña</h3>
        <input
          type="password"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          placeholder="Nueva contraseña (mín. 8 caracteres)"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          type="submit"
          disabled={savingPassword || passwordNueva.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  )
}
