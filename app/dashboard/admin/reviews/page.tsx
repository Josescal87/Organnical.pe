import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"
import RatingStars from "@/components/RatingStars"

export const dynamic = "force-dynamic"
export const revalidate = 0

const ESTADOS_VALIDOS = ["pendiente", "aprobada", "rechazada", "oculta"] as const

async function approveReview(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  if (!id) return
  const supabase = createAdminClient()
  await supabase
    .from("reviews")
    .update({ estado: "aprobada", approved_at: new Date().toISOString(), rejected_reason: null })
    .eq("id", id)
  revalidatePath("/dashboard/admin/reviews")
}

async function rejectReview(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  const reason = (formData.get("reason") as string | null)?.trim() ?? ""
  if (!id) return
  const supabase = createAdminClient()
  await supabase
    .from("reviews")
    .update({ estado: "rechazada", rejected_reason: reason || null })
    .eq("id", id)
  revalidatePath("/dashboard/admin/reviews")
}

async function hideReview(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  if (!id) return
  const supabase = createAdminClient()
  await supabase.from("reviews").update({ estado: "oculta" }).eq("id", id)
  revalidatePath("/dashboard/admin/reviews")
}

interface SearchParamsShape {
  estado?: string
  limit?: string
  offset?: string
}

interface Props {
  searchParams: Promise<SearchParamsShape>
}

async function loadReviews(estado: string, limit: number, offset: number) {
  const supabase = createAdminClient()
  const { data, count, error } = await supabase
    .from("reviews")
    .select(
      "id, producto_id, user_id, rating, estado, is_verified_purchase, approved_at, rejected_reason, created_at, updated_at",
      { count: "exact" }
    )
    .eq("estado", estado)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("admin/reviews page query error:", error)
    return { rows: [], total: 0 }
  }

  const productoIds = [...new Set((data ?? []).map((r) => r.producto_id as string))]
  const userIds = [...new Set((data ?? []).map((r) => r.user_id))]
  const [productosRes, usersRes] = await Promise.all([
    productoIds.length > 0
      ? supabase.from("productos").select("id, sku, descripcion").in("id", productoIds)
      : Promise.resolve({ data: [] as Array<{ id: string; sku: string; descripcion: string }> }),
    userIds.length > 0
      ? supabase.auth.admin.listUsers({ perPage: 1000 })
      : Promise.resolve({ data: { users: [] as Array<{ id: string; email?: string | null }> } }),
  ])
  const productoMap = new Map<string, { sku: string; descripcion: string }>()
  for (const p of (productosRes.data ?? []) as Array<{ id: string; sku: string; descripcion: string }>) {
    productoMap.set(p.id, { sku: p.sku, descripcion: p.descripcion })
  }
  const emailMap = new Map<string, string | null>()
  const usersList = (usersRes.data as { users?: Array<{ id: string; email?: string | null }> })?.users ?? []
  for (const u of usersList) emailMap.set(u.id, u.email ?? null)

  const enriched = (data ?? []).map((r) => ({
    ...r,
    producto_sku: productoMap.get(r.producto_id)?.sku ?? null,
    producto_descripcion: productoMap.get(r.producto_id)?.descripcion ?? null,
    user_email: emailMap.get(r.user_id) ?? null,
  }))
  return { rows: enriched, total: count ?? enriched.length }
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const params = await searchParams
  const estado =
    params.estado && (ESTADOS_VALIDOS as readonly string[]).includes(params.estado)
      ? params.estado
      : "pendiente"
  const limit = Math.min(Math.max(1, Number(params.limit ?? 50)), 100)
  const offset = Math.max(0, Number(params.offset ?? 0))

  const { rows, total } = await loadReviews(estado, limit, offset)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Moderación de reseñas</h1>
      <p className="text-sm text-gray-500 mb-6">
        {total} {total === 1 ? "reseña" : "reseñas"} en estado <strong>{estado}</strong>.
      </p>

      <nav className="flex gap-2 mb-6">
        {ESTADOS_VALIDOS.map((e) => (
          <a
            key={e}
            href={`/dashboard/admin/reviews?estado=${e}`}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
              e === estado
                ? "bg-purple-600 text-white border-purple-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {e}
          </a>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Sin reseñas en este estado.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="border border-gray-200 rounded-xl p-4 bg-white text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <RatingStars rating={r.rating} size="md" />
                  <span className="text-xs font-mono text-gray-400">{r.id.slice(0, 8)}</span>
                </div>
                <span className="text-[11px] text-gray-500">
                  {new Date(r.created_at).toLocaleString("es-PE")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <p>
                  <span className="font-semibold text-gray-700">Producto:</span>{" "}
                  {r.producto_descripcion ?? "(no encontrado)"}{" "}
                  <span className="text-gray-400 font-mono">[{r.producto_sku ?? "—"}]</span>
                </p>
                <p>
                  <span className="font-semibold text-gray-700">User:</span>{" "}
                  {r.user_email ?? "(no encontrado)"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Compra verificada:</span>{" "}
                  {r.is_verified_purchase ? "Sí" : "No"}
                </p>
                {r.rejected_reason && (
                  <p>
                    <span className="font-semibold text-gray-700">Motivo rechazo:</span>{" "}
                    {r.rejected_reason}
                  </p>
                )}
              </div>

              {estado === "pendiente" && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <form action={approveReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                  </form>
                  <form action={hideReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Ocultar
                    </button>
                  </form>
                  <form action={rejectReview} className="flex gap-2 items-center">
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      type="text"
                      name="reason"
                      placeholder="Motivo de rechazo"
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-48"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              )}

              {estado !== "pendiente" && (
                <div className="flex gap-2 mt-2">
                  <form action={hideReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Ocultar
                    </button>
                  </form>
                  {estado !== "aprobada" && (
                    <form action={approveReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Aprobar
                      </button>
                    </form>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-4 mt-6 text-xs text-gray-500">
        {offset > 0 && (
          <a
            href={`/dashboard/admin/reviews?estado=${estado}&limit=${limit}&offset=${Math.max(0, offset - limit)}`}
            className="text-purple-700 hover:underline"
          >
            ← Anterior
          </a>
        )}
        {rows.length === limit && (
          <a
            href={`/dashboard/admin/reviews?estado=${estado}&limit=${limit}&offset=${offset + limit}`}
            className="text-purple-700 hover:underline"
          >
            Siguiente →
          </a>
        )}
      </div>
    </div>
  )
}
