import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("orden-detail", ip, 60, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const { id } = await params
    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cookieOrden = cookieStore.get("last_orden_id")?.value

    let allowed = false
    let userEmail: string | null = null

    if (cookieOrden && cookieOrden === id) {
      allowed = true
    } else {
      const supabase = await createClient()
      const { data: userData } = await supabase.auth.getUser()
      userEmail = userData.user?.email ?? null
      if (userEmail) allowed = true
    }

    if (!allowed) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 })
    }

    const admin = createAdminClient()
    const { data: orden, error } = await admin
      .from("ordenes_tienda")
      .select("id, total, subtotal, delivery, items, estado, created_at, cliente_snapshot, boleta_link")
      .eq("id", id)
      .maybeSingle()

    if (error || !orden) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 })
    }

    if (!cookieOrden || cookieOrden !== id) {
      const ownerEmail = ((orden.cliente_snapshot?.email as string | null | undefined) ?? "").toLowerCase()
      if (!userEmail || ownerEmail !== userEmail.toLowerCase()) {
        return NextResponse.json({ error: "No encontrada" }, { status: 404 })
      }
    }

    type ItemFila = {
      producto?: { sku?: string; descripcion?: string; categoria?: string | null; precio_publico?: number; precio_oferta?: number | null }
      cantidad?: number
    }
    const itemsRaw = Array.isArray(orden.items)
      ? (orden.items as ItemFila[]).map((it) => ({
          sku: it.producto?.sku ?? "",
          descripcion: it.producto?.descripcion ?? "",
          categoria: it.producto?.categoria ?? null,
          cantidad: Number(it.cantidad ?? 0),
          precio: Number(it.producto?.precio_oferta ?? it.producto?.precio_publico ?? 0),
        }))
      : []

    // Enriquecemos cada item con marca.slug haciendo lookup actual en `productos`.
    // No tocamos el snapshot histórico (`ordenes_tienda.items`) — esto solo es
    // para enviar `content_brand` al Pixel cuando el browser dispare Purchase.
    // Si el SKU desapareció del catálogo, `marca` queda null y el evento no incluye brand.
    const skus = itemsRaw.map((i) => i.sku).filter(Boolean)
    let marcaPorSku: Record<string, string | null> = {}
    if (skus.length > 0) {
      const { data: prods } = await admin
        .from("productos")
        .select("sku, marca:marcas(slug)")
        .in("sku", skus)
      marcaPorSku = Object.fromEntries(
        ((prods ?? []) as Array<{ sku: string; marca: { slug: string } | null }>).map(
          (p) => [p.sku, p.marca?.slug ?? null]
        )
      )
    }
    const items = itemsRaw.map((it) => ({ ...it, marca: marcaPorSku[it.sku] ?? null }))

    return NextResponse.json({
      id: orden.id,
      total: Number(orden.total),
      subtotal: Number(orden.subtotal),
      delivery: Number(orden.delivery),
      estado: orden.estado,
      created_at: orden.created_at,
      items,
      boleta_link: orden.boleta_link ?? null,
    })
  } catch (err) {
    console.error("orden-detail: unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
