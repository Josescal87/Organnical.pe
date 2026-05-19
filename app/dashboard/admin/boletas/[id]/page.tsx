import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { registrarYEmitirBoleta, anularBoleta } from "@/lib/sunat"
import type { NotaCreditoTipo } from "@/lib/sunat"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function retryBoleta(formData: FormData) {
  "use server"
  const ordenId = formData.get("orden_id") as string
  const boletaId = formData.get("boleta_id") as string
  if (!ordenId) return
  const supabase = createAdminClient()
  await registrarYEmitirBoleta(ordenId, supabase)
  revalidatePath(`/dashboard/admin/boletas/${boletaId}`)
  revalidatePath("/dashboard/admin/boletas")
}

async function anularBoletaAction(formData: FormData) {
  "use server"
  const boletaId = formData.get("boleta_id") as string
  const motivo = (formData.get("motivo") as string | null)?.trim() ?? ""
  const tipo = (formData.get("tipo_nc") as NotaCreditoTipo | null) ?? "01"
  if (!boletaId || motivo.length < 5) return
  await anularBoleta(boletaId, motivo, { tipoNotaCredito: tipo })
  revalidatePath(`/dashboard/admin/boletas/${boletaId}`)
  revalidatePath("/dashboard/admin/boletas")
}

interface Props {
  params: Promise<{ id: string }>
}

type Boleta = {
  id: string
  tipo: string
  estado: string
  orden_id: string | null
  intentos: number
  serie: string
  numero: number | null
  created_at: string
  updated_at: string | null
  anula_a_boleta_id: string | null
}

const estadoClass: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  emitida: "bg-blue-100 text-blue-800",
  aceptada_sunat: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  anulada: "bg-gray-100 text-gray-600",
}

export default async function AdminBoletaDetailPage({ params }: Props) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("boletas")
    .select("id, tipo, estado, orden_id, intentos, serie, numero, created_at, updated_at, anula_a_boleta_id")
    .eq("id", id)
    .single()

  if (error || !data) notFound()
  const boleta = data as Boleta

  const canRetry =
    boleta.tipo === "boleta" &&
    (boleta.estado === "pendiente" || boleta.estado === "rechazada") &&
    !!boleta.orden_id

  const canAnular =
    boleta.tipo === "boleta" &&
    (boleta.estado === "emitida" || boleta.estado === "aceptada_sunat")

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-4">
        <Link href="/dashboard/admin/boletas" className="text-xs text-purple-700 hover:underline">
          ← Volver a comprobantes
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {boleta.numero !== null ? `${boleta.serie}-${String(boleta.numero).padStart(8, "0")}` : "Sin número"}
      </h1>

      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-6 ${estadoClass[boleta.estado] ?? "bg-gray-100 text-gray-600"}`}>
        {boleta.estado}
      </span>

      <dl className="grid grid-cols-2 gap-4 text-sm mb-8">
        <div>
          <dt className="text-xs text-gray-500">ID</dt>
          <dd className="font-mono text-xs text-gray-700 mt-0.5">{boleta.id}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Tipo</dt>
          <dd className="capitalize text-gray-700 mt-0.5">{boleta.tipo}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Orden</dt>
          <dd className="font-mono text-xs text-gray-700 mt-0.5">{boleta.orden_id ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Intentos</dt>
          <dd className="text-gray-700 mt-0.5">{boleta.intentos}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Creado</dt>
          <dd className="text-gray-700 mt-0.5">{new Date(boleta.created_at).toLocaleString("es-PE")}</dd>
        </div>
        {boleta.updated_at && (
          <div>
            <dt className="text-xs text-gray-500">Actualizado</dt>
            <dd className="text-gray-700 mt-0.5">{new Date(boleta.updated_at).toLocaleString("es-PE")}</dd>
          </div>
        )}
        {boleta.anula_a_boleta_id && (
          <div className="col-span-2">
            <dt className="text-xs text-gray-500">Anula a</dt>
            <dd className="mt-0.5">
              <Link href={`/dashboard/admin/boletas/${boleta.anula_a_boleta_id}`} className="font-mono text-xs text-purple-700 hover:underline">
                {boleta.anula_a_boleta_id}
              </Link>
            </dd>
          </div>
        )}
      </dl>

      {canRetry && (
        <div className="border border-gray-200 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Reintentar emisión</h2>
          <form action={retryBoleta}>
            <input type="hidden" name="orden_id" value={boleta.orden_id!} />
            <input type="hidden" name="boleta_id" value={boleta.id} />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              Reintentar
            </button>
          </form>
        </div>
      )}

      {canAnular && (
        <div className="border border-red-100 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Anular boleta</h2>
          <form action={anularBoletaAction} className="space-y-3">
            <input type="hidden" name="boleta_id" value={boleta.id} />
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Motivo (mínimo 5 caracteres)</label>
              <input
                type="text"
                name="motivo"
                required
                minLength={5}
                placeholder="Motivo de anulación"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Tipo nota de crédito</label>
              <select name="tipo_nc" className="text-sm border border-gray-200 rounded-lg px-3 py-2">
                <option value="01">01 — Anulación de la operación</option>
                <option value="02">02 — Anulación por error en RUC</option>
                <option value="03">03 — Corrección por error en la descripción</option>
                <option value="07">07 — Bonificación</option>
                <option value="13">13 — Ajuste en operaciones de exportación</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              Emitir nota de crédito
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
