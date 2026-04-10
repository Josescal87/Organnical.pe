/**
 * Cliente Supabase para uso en Server Components, Server Actions y Route Handlers.
 * Lee las cookies de la sesión de forma segura en el servidor.
 */
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // El método setAll es llamado desde un Server Component.
            // Se puede ignorar si el middleware refresca la sesión.
          }
        },
      },
    }
  )
}
