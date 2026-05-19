import { NextResponse } from "next/server"
import { requireCron } from "@/lib/admin-auth"
import { retryPendingBoletas } from "@/lib/sunat"

const MAX_BATCH = 10

export async function GET(request: Request) {
  return handle(request)
}

export async function POST(request: Request) {
  return handle(request)
}

async function handle(request: Request): Promise<NextResponse> {
  try {
    const guard = requireCron(request)
    if (guard) return guard

    const result = await retryPendingBoletas(undefined, MAX_BATCH)
    console.info(
      `[cron retry-boletas] procesadas=${result.procesadas.length} errores=${result.errores.length}`
    )
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[cron retry-boletas] unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
