import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"

const MAX_LIMIT = 200
const DEFAULT_LIMIT = 50

const ESTADOS_VALIDOS = new Set([
  "pendiente", "emitida", "aceptada_sunat", "rechazada", "anulada",
])
const TIPOS_VALIDOS = new Set(["boleta", "factura", "nota_credito"])

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("admin-boletas-list", ip, 60, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const result = await requireAdmin(request)
    if (result instanceof Response) return result

    const url = new URL(request.url)
    const estados = url.searchParams.getAll("estado").filter((e) => ESTADOS_VALIDOS.has(e))
    const tipo = url.searchParams.get("tipo")
    const desde = url.searchParams.get("desde")
    const hasta = url.searchParams.get("hasta")
    const q = url.searchParams.get("q")?.trim()

    const limitRaw = parseInt(url.searchParams.get("limit") ?? "", 10)
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT)
      : DEFAULT_LIMIT
    const offsetRaw = parseInt(url.searchParams.get("offset") ?? "", 10)
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0

    const supabase = createAdminClient()
    let query = supabase
      .from("v_boletas")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (estados.length > 0) query = query.in("estado", estados)
    if (tipo && TIPOS_VALIDOS.has(tipo)) query = query.eq("tipo", tipo)
    if (desde) query = query.gte("created_at", `${desde}T00:00:00Z`)
    if (hasta) {
      const next = new Date(`${hasta}T00:00:00Z`)
      next.setUTCDate(next.getUTCDate() + 1)
      query = query.lt("created_at", next.toISOString())
    }
    if (q) {
      const safe = q.replace(/[%_]/g, (c) => `\\${c}`)
      query = query.or(
        `cliente_doc_numero.ilike.%${safe}%,cliente_nombre.ilike.%${safe}%,proveedor_documento_id.ilike.%${safe}%,numero_documento.ilike.%${safe}%`
      )
    }

    const { data, error, count } = await query
    if (error) {
      console.error("admin-boletas: query error:", error)
      return NextResponse.json({ error: "Error consultando boletas" }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      total: count ?? data?.length ?? 0,
      limit,
      offset,
      items: data ?? [],
    })
  } catch (err) {
    console.error("admin-boletas: unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
