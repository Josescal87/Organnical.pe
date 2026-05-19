import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"
import { anularBoleta } from "@/lib/sunat"
import type { NotaCreditoTipo } from "@/lib/sunat"

const TIPOS_NC_VALIDOS: ReadonlySet<NotaCreditoTipo> = new Set([
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
])

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("admin-boletas-anular", ip, 10, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const authCheck = await requireAdmin(request)
    if (authCheck instanceof Response) return authCheck

    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: "id inválido" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const motivo = typeof body?.motivo === "string" ? body.motivo.trim() : ""
    if (motivo.length < 5) {
      return NextResponse.json(
        { error: "motivo es requerido (mínimo 5 caracteres)" },
        { status: 400 }
      )
    }
    const tipoRaw = typeof body?.tipoNotaCredito === "string" ? body.tipoNotaCredito : "01"
    if (!TIPOS_NC_VALIDOS.has(tipoRaw as NotaCreditoTipo)) {
      return NextResponse.json(
        { error: `tipoNotaCredito inválido: ${tipoRaw}` },
        { status: 400 }
      )
    }
    const tipoNotaCredito = tipoRaw as NotaCreditoTipo

    const result = await anularBoleta(id, motivo, { tipoNotaCredito })
    if (!result.ok) {
      const status = result.motivo.startsWith("boleta_original_no_encontrada")
        ? 404
        : result.motivo.startsWith("boleta_original_estado_invalido") ||
          result.motivo === "no_se_anula_una_nota_de_credito" ||
          result.motivo === "boleta_original_sin_numero"
          ? 409
          : 502
      return NextResponse.json(
        { ok: false, motivo: result.motivo, nota_credito: result.boleta },
        { status }
      )
    }
    return NextResponse.json({ ok: true, nota_credito: result.boleta })
  } catch (err) {
    console.error("admin-boletas-anular: unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
