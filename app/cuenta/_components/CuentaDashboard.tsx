"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Package, Calendar, FileText, MapPin, Settings,
  ShoppingBag, FileDown, Clock, CheckCircle, AlertCircle,
  ChevronRight, LogOut,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { DISTRITOS, PICKUP_DISTRITO } from "@/lib/pricing"
import { SPECIALTY_LABELS } from "@/lib/specialty-labels"
import type { OrdenTienda } from "@/lib/types"
import type { AppointmentRow, PrescriptionRow, DireccionData } from "../page"

// ── constants ─────────────────────────────────────────────────────────────────

const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")"
const G    = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY = "#0B1D35"

// ── helpers ───────────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, { label: string; color: string }> = {
  pagado:      { label: "Pagado",    color: "bg-sky-100 text-sky-700" },
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
  nombre:            string
  email:             string
  ordenes:           OrdenTienda[]
  citas:             AppointmentRow[]
  recetas:           PrescriptionRow[]
  direccionGuardada: DireccionData | null
}

// ── CuentaDashboard ───────────────────────────────────────────────────────────

export default function CuentaDashboard({ nombre, email, ordenes, citas, recetas, direccionGuardada }: Props) {
  const [tab, setTab] = useState<Tab>("resumen")
  const router = useRouter()

  const firstName = nombre.split(" ")[0] || nombre
  const initials  = nombre
    ? nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : email[0]?.toUpperCase() ?? "U"

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
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>

      {/* ── Header compacto ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)" }}
      >
        {/* Noise */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{ backgroundImage: NOISE, backgroundRepeat: "repeat", backgroundSize: "180px 180px" }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blob */}
        <div
          className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: G }}
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-5 pb-5">

          {/* Logo + nav + logout */}
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-white.png"
                alt="Organnical"
                width={100}
                height={24}
                className="opacity-75 hover:opacity-100 transition-opacity"
              />
            </Link>
            {/* Nav central — desktop */}
            <nav className="hidden sm:flex items-center gap-5 flex-1 justify-center">
              <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>Mi cuenta</span>
              <Link href="/cuenta/botica" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Botica</Link>
              <Link href="/tienda" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Tienda</Link>
              <Link href="/blog" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Blog</Link>
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

          {/* Greeting */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: G }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-black text-white leading-tight">
                Hola, {firstName}
              </h1>
              <p className="text-white/40 text-xs truncate">{email}</p>
            </div>
          </div>

          {/* Nav mobile */}
          <div className="flex sm:hidden items-center gap-3 mb-3">
            <Link href="/cuenta/botica" className="text-white/45 hover:text-white/75 text-xs font-medium transition-colors">Botica</Link>
            <span className="text-white/20 text-xs">·</span>
            <Link href="/tienda" className="text-white/45 hover:text-white/75 text-xs font-medium transition-colors">Tienda</Link>
            <span className="text-white/20 text-xs">·</span>
            <Link href="/blog" className="text-white/45 hover:text-white/75 text-xs font-medium transition-colors">Blog</Link>
          </div>

          {/* KPI strip compacto */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Pedidos",          value: ordenes.length },
              { label: "Citas activas",    value: citas.length },
              { label: "Recetas vigentes", value: recetasVigentes.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl px-3 py-2.5 border border-white/10 flex items-center gap-2.5"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <p className="text-xl font-black text-white leading-none">{value}</p>
                <p className="text-[11px] text-white/40 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-zinc-100 rounded-2xl p-1 mb-6 overflow-x-auto shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                tab === id ? "text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
              style={tab === id ? { background: G } : undefined}
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
      <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: NAVY }}>
            <Package size={16} className="text-[#A78BFA]" /> Último pedido
          </h3>
          <button onClick={() => setTab("pedidos")} className="text-xs text-[#A78BFA] hover:underline">
            Ver todos →
          </button>
        </div>
        {ultimoPedido ? (
          <div>
            <div className="flex justify-between items-start text-sm mb-2">
              <span className="text-zinc-400 font-mono text-xs">{ultimoPedido.id.slice(0, 8).toUpperCase()}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(ESTADO_BADGE[ultimoPedido.estado] ?? { color: "bg-zinc-100 text-zinc-600" }).color}`}>
                {ESTADO_BADGE[ultimoPedido.estado]?.label ?? ultimoPedido.estado}
              </span>
            </div>
            <p className="text-sm text-zinc-500">{formatFecha(ultimoPedido.created_at)}</p>
            <p className="text-sm font-bold mt-1" style={{ color: NAVY }}>{formatPrice(ultimoPedido.total)}</p>
            <Link href={`/cuenta/${ultimoPedido.id}`} className="mt-3 inline-flex items-center gap-1 text-sm text-[#A78BFA] hover:underline">
              Ver detalle <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400">
            <p className="text-sm">Aún no tienes pedidos.</p>
            <Link href="/tienda" className="text-[#A78BFA] text-sm mt-1 inline-block hover:underline">Explorar tienda →</Link>
          </div>
        )}
      </div>

      {/* Próxima cita */}
      <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: NAVY }}>
            <Calendar size={16} className="text-sky-400" /> Próxima cita
          </h3>
          <button onClick={() => setTab("citas")} className="text-xs text-[#A78BFA] hover:underline">
            Ver todas →
          </button>
        </div>
        {proximaCita ? (
          <div className="text-sm">
            <p className="font-medium" style={{ color: NAVY }}>{SPECIALTY_LABELS[proximaCita.specialty] ?? proximaCita.specialty}</p>
            <p className="text-zinc-500 mt-0.5">{formatSlot(proximaCita.slot_start)}</p>
            {proximaCita.meeting_link && (
              <a
                href={proximaCita.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
                style={{ background: G }}
              >
                Unirse a la consulta
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400">
            <p className="text-sm">No tienes citas próximas.</p>
            <Link href="/agendar" className="text-[#A78BFA] text-sm mt-1 inline-block hover:underline">Agendar consulta →</Link>
          </div>
        )}
      </div>

      {/* Receta activa */}
      {recetaActiva && (
        <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2" style={{ color: NAVY }}>
              <FileText size={16} className="text-emerald-400" /> Receta vigente
            </h3>
            <button onClick={() => setTab("recetas")} className="text-xs text-[#A78BFA] hover:underline">
              Ver todas →
            </button>
          </div>
          <p className="text-sm text-zinc-500">
            Emitida el {formatFecha(recetaActiva.issued_at)} · Válida hasta {formatFecha(recetaActiva.valid_until)}
          </p>
          <div className="flex gap-3 mt-3 flex-wrap">
            {recetaActiva.pdf_url && (
              <a href={recetaActiva.pdf_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#A78BFA] hover:underline">
                <FileDown size={14} /> Descargar PDF
              </a>
            )}
            <Link
              href="/cuenta/botica"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
              style={{ background: G }}
            >
              <ShoppingBag size={12} /> Ir a la Botica
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
      <div className="text-center py-16 text-zinc-400">
        <Package size={40} className="mx-auto mb-3 text-zinc-200" />
        <p className="text-sm">Aún no tienes pedidos.</p>
        <Link href="/tienda" className="text-[#A78BFA] text-sm mt-2 inline-block hover:underline">
          Explorar productos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ordenes.map((orden) => {
        const badge = ESTADO_BADGE[orden.estado] ?? { label: orden.estado, color: "bg-zinc-100 text-zinc-600" }
        const items = orden.items as unknown as Array<{ producto: { descripcion: string }; cantidad: number }>
        return (
          <div key={orden.id} className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs text-zinc-400 font-mono">{orden.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{formatFecha(orden.created_at)}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <div className="space-y-0.5 text-sm text-zinc-600">
              {items.map((it, i) => (
                <p key={i}>{it.producto.descripcion} ×{it.cantidad}</p>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
              <p className="text-sm font-bold" style={{ color: NAVY }}>{formatPrice(orden.total)}</p>
              <p className="text-xs text-zinc-400">
                Envío: {orden.delivery === 0 ? "Gratis" : formatPrice(orden.delivery)}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
              {orden.boleta_link ? (
                <a href={orden.boleta_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#A78BFA] hover:underline">
                  <FileDown size={14} /> Descargar boleta
                </a>
              ) : <span />}
              <Link href={`/cuenta/${orden.id}`} className="text-sm text-zinc-400 hover:text-[#A78BFA] transition-colors">
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
      <div className="text-center py-16 text-zinc-400">
        <Calendar size={40} className="mx-auto mb-3 text-zinc-200" />
        <p className="text-sm">No tienes citas activas.</p>
        <Link href="/agendar" className="text-[#A78BFA] text-sm mt-2 inline-block hover:underline">
          Agendar una consulta
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {citas.map((cita) => {
        const badge     = STATUS_BADGE[cita.status] ?? STATUS_BADGE.pending
        const BadgeIcon = badge.icon
        return (
          <div key={cita.id} className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium" style={{ color: NAVY }}>{SPECIALTY_LABELS[cita.specialty] ?? cita.specialty}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{formatSlot(cita.slot_start)}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                <BadgeIcon size={12} /> {badge.label}
              </span>
            </div>
            {cita.meeting_link && (
              <a
                href={cita.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
                style={{ background: G }}
              >
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
      <div className="text-center py-16 text-zinc-400">
        <FileText size={40} className="mx-auto mb-3 text-zinc-200" />
        <p className="text-sm">No tienes recetas aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recetas.map((rx) => {
        const vigente = new Date(rx.valid_until) > new Date()
        return (
          <div key={rx.id} className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Emitida: {formatFecha(rx.issued_at)}</p>
                <p className="text-sm text-zinc-500">Vence: {formatFecha(rx.valid_until)}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${vigente ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                {vigente ? "Vigente" : "Vencida"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              {rx.pdf_url && (
                <a href={rx.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#A78BFA] hover:underline">
                  <FileDown size={14} /> Descargar PDF
                </a>
              )}
              {vigente && (
                <Link
                  href="/cuenta/botica"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
                  style={{ background: G }}
                >
                  <ShoppingBag size={13} /> Ir a la Botica
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── DireccionTab ──────────────────────────────────────────────────────────────

function DireccionTab({ direccionGuardada }: { direccionGuardada: DireccionData | null }) {
  const [distrito,   setDistrito]   = useState(direccionGuardada?.distrito   ?? "")
  const [direccion,  setDireccion]  = useState(direccionGuardada?.direccion  ?? "")
  const [referencia, setReferencia] = useState(direccionGuardada?.referencia ?? "")
  const [saving,     setSaving]     = useState(false)

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
      <p className="text-sm text-zinc-500">Tu dirección se pre-llenará automáticamente en el checkout.</p>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: NAVY }}>Distrito</label>
        <select
          value={distrito}
          onChange={(e) => setDistrito(e.target.value)}
          className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/40 transition-shadow"
        >
          <option value="">Selecciona un distrito</option>
          {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: NAVY }}>Dirección</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Calle, número, dpto."
          className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/40 transition-shadow"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: NAVY }}>Referencia</label>
        <input
          type="text"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          placeholder="Cerca al mercado, frente al parque..."
          className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/40 transition-shadow"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="text-white font-semibold px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: G }}
      >
        {saving ? "Guardando..." : "Guardar dirección"}
      </button>
    </form>
  )
}

// ── CuentaSettingsTab ─────────────────────────────────────────────────────────

function CuentaSettingsTab({ nombre, email }: { nombre: string; email: string }) {
  const router = useRouter()
  const [nuevoNombre,    setNuevoNombre]    = useState(nombre)
  const [passwordNueva,  setPasswordNueva]  = useState("")
  const [savingNombre,   setSavingNombre]   = useState(false)
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
        <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Nombre</h3>
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/40 transition-shadow"
        />
        <button
          type="submit"
          disabled={savingNombre}
          className="text-white text-sm font-semibold px-5 py-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: NAVY }}
        >
          {savingNombre ? "Guardando..." : "Guardar nombre"}
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Correo electrónico</h3>
        <p className="text-sm text-zinc-500 bg-zinc-50 rounded-xl px-4 py-2.5">{email}</p>
      </div>

      <form onSubmit={handleSavePassword} className="space-y-3">
        <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Cambiar contraseña</h3>
        <input
          type="password"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          placeholder="Nueva contraseña (mín. 8 caracteres)"
          className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/40 transition-shadow"
        />
        <button
          type="submit"
          disabled={savingPassword || passwordNueva.length === 0}
          className="text-white text-sm font-semibold px-5 py-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: NAVY }}
        >
          {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  )
}
