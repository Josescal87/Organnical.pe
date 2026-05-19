import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"
import { registrarYEmitirBoleta } from "@/lib/sunat"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("admin-boletas-retry", ip, 10, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const authCheck = await requireAdmin(request)
    if (authCheck instanceof Response) return authCheck

    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: "id inválido" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: boleta, error: getErr } = await supabase
      .from("boletas")
      .select("id, tipo, estado, orden_id, intentos")
      .eq("id", id)
      .single()

    if (getErr || !boleta) {
      return NextResponse.json({ error: "Boleta no encontrada" }, { status: 404 })
    }
    if (boleta.estado !== "pendiente" && boleta.estado !== "rechazada") {
      return NextResponse.json(
        { error: `No se puede reintentar boleta en estado '${boleta.estado}'` },
        { status: 409 }
      )
    }
    if (boleta.tipo === "nota_credito") {
      return NextResponse.json(
        { error: "Retry de notas de crédito no implementado — usar /anular nuevamente" },
        { status: 501 }
      )
    }
    if (!boleta.orden_id) {
      return NextResponse.json(
        { error: "Boleta sin orden_id (huérfana) — no se puede reintentar" },
        { status: 409 }
      )
    }

    const result = await registrarYEmitirBoleta(boleta.orden_id, supabase)
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, motivo: result.motivo, boleta: result.boleta },
        { status: 502 }
      )
    }
    return NextResponse.json({ ok: true, boleta: result.boleta })
  } catch (err) {
    console.error("admin-boletas-retry: unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
