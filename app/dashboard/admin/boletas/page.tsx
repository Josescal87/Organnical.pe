import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

const ESTADOS = ["pendiente", "emitida", "aceptada_sunat", "rechazada", "anulada"] as const

interface SearchParams {
  estado?: string
  limit?: string
  offset?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

type BoletaRow = {
  id: string
  tipo: string
  estado: string
  numero_documento: string | null
  cliente_nombre: string | null
  created_at: string
  intentos: number
}

export default async function AdminBoletasPage({ searchParams }: Props) {
  const params = await searchParams
  const estado = params.estado && (ESTADOS as readonly string[]).includes(params.estado)
    ? params.estado
    : undefined
  const limit = Math.min(Math.max(1, Number(params.limit ?? 50)), 100)
  const offset = Math.max(0, Number(params.offset ?? 0))

  const supabase = createAdminClient()
  let query = supabase
    .from("v_boletas")
    .select("id, tipo, estado, numero_documento, cliente_nombre, created_at, intentos", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (estado) query = query.eq("estado", estado)

  const { data, count, error } = await query
  if (error) console.error("admin/boletas page query error:", error)

  const rows = (data ?? []) as BoletaRow[]
  const total = count ?? rows.length

  const estadoClass: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-800",
    emitida: "bg-blue-100 text-blue-800",
    aceptada_sunat: "bg-green-100 text-green-800",
    rechazada: "bg-red-100 text-red-800",
    anulada: "bg-gray-100 text-gray-600",
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Comprobantes</h1>
      <p className="text-sm text-gray-500 mb-6">
        {total} {total === 1 ? "comprobante" : "comprobantes"}
        {estado ? ` en estado ${estado}` : " en total"}.
      </p>

      <nav className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/dashboard/admin/boletas"
          className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
            !estado
              ? "bg-purple-600 text-white border-purple-600"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Todos
        </Link>
        {ESTADOS.map((e) => (
          <Link
            key={e}
            href={`/dashboard/admin/boletas?estado=${e}`}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
              e === estado
                ? "bg-purple-600 text-white border-purple-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {e}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Sin comprobantes{estado ? ` en estado ${estado}` : ""}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="pb-2 pr-4">Nro.</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2 pr-4">Estado</th>
                <th className="pb-2 pr-4">Cliente</th>
                <th className="pb-2 pr-4">Fecha</th>
                <th className="pb-2">Intentos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/dashboard/admin/boletas/${b.id}`}
                      className="font-mono text-xs text-purple-700 hover:underline"
                    >
                      {b.numero_documento ?? b.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-600 capitalize">{b.tipo}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${estadoClass[b.estado] ?? "bg-gray-100 text-gray-600"}`}>
                      {b.estado}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-600 max-w-[160px] truncate">
                    {b.cliente_nombre ?? "—"}
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-400">
                    {new Date(b.created_at).toLocaleDateString("es-PE")}
                  </td>
                  <td className="py-2 text-xs text-gray-500">{b.intentos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-4 mt-6 text-xs text-gray-500">
        {offset > 0 && (
          <Link
            href={`/dashboard/admin/boletas?${estado ? `estado=${estado}&` : ""}limit=${limit}&offset=${Math.max(0, offset - limit)}`}
            className="text-purple-700 hover:underline"
          >
            ← Anterior
          </Link>
        )}
        {rows.length === limit && (
          <Link
            href={`/dashboard/admin/boletas?${estado ? `estado=${estado}&` : ""}limit=${limit}&offset=${offset + limit}`}
            className="text-purple-700 hover:underline"
          >
            Siguiente →
          </Link>
        )}
      </div>
    </div>
  )
}
