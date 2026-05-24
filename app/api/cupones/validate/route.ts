import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { validarCupon } from "@/lib/cupones"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await rateLimit("cupon-validate", ip, 20, "60 s")
  if (!rl.ok) return tooManyRequestsResponse(rl.reset)

  const code = req.nextUrl.searchParams.get("code") ?? ""
  const subtotal = Number(req.nextUrl.searchParams.get("subtotal") ?? 0)
  const email = req.nextUrl.searchParams.get("email") ?? null

  if (!code.trim()) {
    return NextResponse.json({ valid: false, error: "Código vacío" })
  }

  const supabase = createAdminClient()
  const result = await validarCupon(supabase, code, subtotal, email)
  return NextResponse.json(result)
}
