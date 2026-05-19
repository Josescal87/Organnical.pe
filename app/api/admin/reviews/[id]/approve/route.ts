import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin(request)
  if (result instanceof Response) return result
  const approvedBy = result.user?.id ?? null
  const { id } = await params

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .update({
      estado: "aprobada",
      approved_at: new Date().toISOString(),
      rejected_reason: null,
      approved_by: approvedBy,
    })
    .eq("id", id)
    .select("id, estado, approved_at")
    .single()

  if (error) {
    console.error("admin/reviews approve error:", error)
    return NextResponse.json({ error: "Error al aprobar la reseña." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 })
  }
  return NextResponse.json({ ok: true, review: data })
}
