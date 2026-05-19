import type { User } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function requireAdmin(
  request: Request
): Promise<{ user: User | null } | Response> {
  // Modo legacy (curl/Postman/scripts): header x-admin-secret válido pasa sin JWT.
  const adminSecret = process.env.ADMIN_SECRET ?? process.env.ADMIN_RETRY_SECRET
  const secretHeader = request.headers.get("x-admin-secret")
  if (adminSecret && secretHeader && secretHeader === adminSecret) {
    return { user: null }
  }

  // Modo session (browser): usuario logueado con app_role='admin'.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  if (user.user_metadata?.app_role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }
  return { user }
}

// requireCron: Vercel Cron usa Bearer CRON_SECRET en rutas dedicadas.
export function requireCron(request: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    console.error("admin-auth: CRON_SECRET no configurado")
    return NextResponse.json(
      { error: "Endpoint no configurado" },
      { status: 503 }
    )
  }
  const auth = request.headers.get("authorization")
  if (!auth || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  return null
}
