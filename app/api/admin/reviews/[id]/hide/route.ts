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

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .update({ estado: "oculta" })
    .eq("id", id)
    .select("id, estado")
    .single()

  if (error) {
    console.error("admin/reviews hide error:", error)
    return NextResponse.json({ error: "Error al ocultar la reseña." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 })
  }
  return NextResponse.json({ ok: true, review: data })
}
