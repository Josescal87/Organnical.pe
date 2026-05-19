import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"

const MAX_LIMIT = 100

export async function GET(request: Request) {
  const result = await requireAdmin(request)
  if (result instanceof Response) return result

  const url = new URL(request.url)
  const estado = url.searchParams.get("estado")
  const limitRaw = Number(url.searchParams.get("limit") ?? "50")
  const offsetRaw = Number(url.searchParams.get("offset") ?? "0")
  const limit = Math.min(Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 50), MAX_LIMIT)
  const offset = Math.max(0, Number.isFinite(offsetRaw) ? offsetRaw : 0)

  const supabase = createAdminClient()
  let query = supabase
    .from("reviews")
    .select(
      "id, producto_id, user_id, rating, estado, is_verified_purchase, approved_at, rejected_reason, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (estado) {
    if (!["pendiente", "aprobada", "rechazada", "oculta"].includes(estado)) {
      return NextResponse.json({ error: "estado inválido" }, { status: 400 })
    }
    query = query.eq("estado", estado)
  }

  const { data, error, count } = await query
  if (error) {
    console.error("admin/reviews GET error:", error)
    return NextResponse.json({ error: "Error al listar reviews." }, { status: 500 })
  }

  const productoIds = [...new Set((data ?? []).map((r) => r.producto_id as string))]
  const userIds = [...new Set((data ?? []).map((r) => r.user_id))]

  const [productosRes, usersRes] = await Promise.all([
    productoIds.length > 0
      ? supabase.from("productos").select("id, sku, descripcion").in("id", productoIds)
      : Promise.resolve({ data: [] as Array<{ id: string; sku: string; descripcion: string }>, error: null }),
    userIds.length > 0
      ? supabase.auth.admin.listUsers({ perPage: 1000 })
      : Promise.resolve({ data: { users: [] as Array<{ id: string; email?: string }> }, error: null }),
  ])

  const productoMap = new Map<string, { sku: string; descripcion: string }>()
  for (const p of (productosRes.data ?? []) as Array<{ id: string; sku: string; descripcion: string }>) {
    productoMap.set(p.id, { sku: p.sku, descripcion: p.descripcion })
  }
  const emailMap = new Map<string, string | null>()
  const usersList = (usersRes.data as { users?: Array<{ id: string; email?: string | null }> })?.users ?? []
  for (const u of usersList) {
    if (userIds.includes(u.id)) emailMap.set(u.id, u.email ?? null)
  }

  const enriched = (data ?? []).map((r) => ({
    ...r,
    producto_sku: productoMap.get(r.producto_id)?.sku ?? null,
    producto_descripcion: productoMap.get(r.producto_id)?.descripcion ?? null,
    user_email: emailMap.get(r.user_id) ?? null,
  }))

  return NextResponse.json({
    reviews: enriched,
    total: count ?? enriched.length,
    limit,
    offset,
  })
}
