import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const rl = await rateLimit("addresses-default", user.id, 20, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const body = await request.json()
    const distrito  = typeof body.distrito  === "string" ? body.distrito.trim()  : ""
    const direccion = typeof body.direccion === "string" ? body.direccion.trim() : ""
    const referencia = typeof body.referencia === "string" ? body.referencia.trim() : ""

    if (!distrito || !direccion) {
      return NextResponse.json({ error: "distrito y dirección son requeridos" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id)
      .eq("es_default", true)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("addresses")
        .update({ distrito, direccion, referencia })
        .eq("id", existing.id)
        .eq("user_id", user.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from("addresses")
        .insert({ user_id: user.id, distrito, direccion, referencia, es_default: true })
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("addresses-default: error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
