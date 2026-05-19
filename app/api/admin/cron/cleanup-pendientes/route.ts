import { NextResponse } from "next/server"
import { requireCron } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"

const STALE_HOURS = 24

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

    const supabase = createAdminClient()
    const cutoffIso = new Date(Date.now() - STALE_HOURS * 3600 * 1000).toISOString()

    const { data, error } = await supabase
      .from("ordenes_tienda")
      .update({ estado: "cancelado" })
      .eq("estado", "pendiente")
      .lt("created_at", cutoffIso)
      .select("id")

    if (error) {
      console.error("[cron cleanup-pendientes] update error:", error.message)
      return NextResponse.json({ error: "Error actualizando órdenes" }, { status: 500 })
    }

    const count = (data ?? []).length
    console.info(`[cron cleanup-pendientes] canceladas ${count} órdenes con > ${STALE_HOURS}h`)
    return NextResponse.json({ ok: true, canceladas: count, cutoff: cutoffIso })
  } catch (err) {
    console.error("[cron cleanup-pendientes] unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
