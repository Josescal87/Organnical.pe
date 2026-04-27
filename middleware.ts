import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database, UserRole } from "@/lib/supabase/database.types"

/**
 * Rutas protegidas y los roles que tienen acceso.
 * Evaluadas en orden — más específicas primero.
 */
const ROLE_ROUTES: Array<{ prefix: string; allowed: UserRole[] }> = [
  { prefix: "/dashboard/medico",   allowed: ["doctor", "admin"] },
  { prefix: "/dashboard/paciente", allowed: ["patient", "admin"] },
  { prefix: "/dashboard",          allowed: ["patient", "doctor", "admin"] },
]

/** Prefijos que requieren autenticación (sin importar rol) */
const AUTH_REQUIRED_PREFIXES = ["/dashboard"]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // ── Detección de subdominio Sami ────────────────────────────────────────────
  // sami.organnical.pe → rewrite interno a /sami/* para separar rutas sin
  // conflicto con app/(marketing)/. Las rutas /api/* no se reescriben.
  const hostname = request.headers.get("host") ?? ""
  const isSami = hostname.startsWith("sami.")

  // ── Paso obligatorio de Supabase SSR ────────────────────────────────────────
  // createServerClient + getUser() refresca el cookie de sesión en cada request.
  // getUser() valida el JWT localmente — NO hace query a la base de datos.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Guard de autenticación ──────────────────────────────────────────────────
  // Sami es público: las cookies de organnical.pe no se comparten con el subdominio.
  // La sesión se usa en los Server Components para personalización, pero no es obligatoria.
  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p))

  if (requiresAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (!user) {
    // Rewrite sami subdomain requests before returning (no-auth routes)
    if (isSami && !pathname.startsWith("/sami") && !pathname.startsWith("/api/") && pathname !== "/login") {
      const url = request.nextUrl.clone()
      url.pathname = `/sami${pathname === "/" ? "" : pathname}`
      return NextResponse.rewrite(url)
    }
    return supabaseResponse
  }

  // ── Guard de rol ────────────────────────────────────────────────────────────
  // El rol se lee de user_metadata (parte del JWT — sin DB call adicional).
  // Es escrito por el trigger medical.handle_new_user() en el signup
  // y por el backfill 02c_backfill_roles.sql para usuarios existentes.
  const role = user.user_metadata?.role as UserRole | undefined

  for (const route of ROLE_ROUTES) {
    if (!pathname.startsWith(route.prefix)) continue

    if (!role || !route.allowed.includes(role)) {
      // Redirigir al dashboard correcto según su rol real
      const url = request.nextUrl.clone()
      if (role === "doctor" || role === "admin") {
        url.pathname = "/dashboard/medico"
      } else {
        url.pathname = "/dashboard/paciente"
      }
      return NextResponse.redirect(url)
    }

    break // La ruta más específica ya fue encontrada
  }

  // ── Rewrite de subdominio Sami ──────────────────────────────────────────────
  // Usuarios autenticados en sami.organnical.pe: /foo → /sami/foo (interno).
  // No se reescriben rutas /api/* (van a los API routes de Organnical normales).
  if (isSami && !pathname.startsWith("/sami") && !pathname.startsWith("/api/") && pathname !== "/login") {
    const url = request.nextUrl.clone()
    url.pathname = `/sami${pathname === "/" ? "" : pathname}`
    const rewriteResponse = NextResponse.rewrite(url)
    // Propagar cookies de sesión al response de rewrite
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      rewriteResponse.cookies.set(name, value)
    })
    return rewriteResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
