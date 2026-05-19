import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin(request)
  if (result instanceof Response) return result
  const { id } = await params

  let body: { reason?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : ""
  if (!reason) {
    return NextResponse.json({ error: "El motivo de rechazo es obligatorio." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .update({
      estado: "rechazada",
      rejected_reason: reason.slice(0, 500),
      approved_at: null,
    })
    .eq("id", id)
    .select("id, estado, rejected_reason")
    .single()

  if (error) {
    console.error("admin/reviews reject error:", error)
    return NextResponse.json({ error: "Error al rechazar la reseña." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 })
  }
  return NextResponse.json({ ok: true, review: data })
}
