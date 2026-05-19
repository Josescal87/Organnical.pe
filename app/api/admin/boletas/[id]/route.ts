import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("admin-boletas-detail", ip, 60, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const result = await requireAdmin(request)
    if (result instanceof Response) return result

    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: "id inválido" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: boleta, error } = await supabase
      .from("boletas")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !boleta) {
      return NextResponse.json({ error: "Boleta no encontrada" }, { status: 404 })
    }

    let nota_credito: unknown = null
    if (boleta.estado === "anulada") {
      const { data: nc } = await supabase
        .from("boletas")
        .select("id, serie, numero, link_pdf, hash, estado, motivo_anulacion, emitida_at, created_at")
        .eq("anula_a_boleta_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      nota_credito = nc ?? null
    }

    let boleta_original: unknown = null
    if (boleta.tipo === "nota_credito" && boleta.anula_a_boleta_id) {
      const { data: orig } = await supabase
        .from("boletas")
        .select("id, tipo, serie, numero, link_pdf, hash, estado, total")
        .eq("id", boleta.anula_a_boleta_id)
        .maybeSingle()
      boleta_original = orig ?? null
    }

    return NextResponse.json({ ok: true, boleta, nota_credito, boleta_original })
  } catch (err) {
    console.error("admin-boletas-detail: unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
