import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("orden-status", ip, 60, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const { id } = await params
    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("ordenes_tienda")
      .select("estado, mp_status, updated_at, created_at")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      console.error("orden-status: query error:", error)
      return NextResponse.json({ error: "Error consultando estado" }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    return NextResponse.json(
      {
        estado: data.estado,
        mp_status: data.mp_status ?? null,
        ultima_actualizacion: data.updated_at ?? data.created_at,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch (err) {
    console.error("orden-status: unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
