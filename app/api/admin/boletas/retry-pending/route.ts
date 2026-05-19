import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"
import { retryPendingBoletas } from "@/lib/sunat"

const MAX_BATCH = 10

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("admin-boletas-retry-pending", ip, 6, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const authCheck = await requireAdmin(request)
    if (authCheck instanceof Response) return authCheck

    const result = await retryPendingBoletas(undefined, MAX_BATCH)
    if (result.procesadas.length === 0 && result.errores.length === 0) {
      return NextResponse.json({ ok: true, procesadas: [], errores: [], msg: "Sin boletas pendientes" })
    }
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("retry-pending: unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
