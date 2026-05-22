# Force Password Change — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Forzar al usuario a cambiar su contraseña temporal la primera vez que entra al dashboard, usando un flag `force_password_change` en `raw_user_meta_data` de Supabase Auth.

**Architecture:** El middleware lee `user.user_metadata.force_password_change` del JWT (sin DB call) y redirige a `/dashboard/cambiar-contrasena` antes de que cargue cualquier otra ruta del dashboard. La página de cambio usa el patrón cliente de Supabase ya establecido en `nueva-password/page.tsx` — `supabase.auth.updateUser()` directo desde el cliente. Al guardar exitosamente, se limpia el flag y se redirige al dashboard según el rol.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase Auth (`@/lib/supabase/client`), Tailwind CSS 4, Lucide React, Vitest + React Testing Library

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `middleware.ts` | Modificar | Agregar guard de `force_password_change` antes del guard de roles |
| `app/dashboard/cambiar-contrasena/layout.tsx` | Crear | Layout limpio sin sidebar (fondo navy, centrado) |
| `app/dashboard/cambiar-contrasena/page.tsx` | Crear | Formulario: nueva contraseña + confirmar + botón cerrar sesión |
| `__tests__/cambiar-contrasena.test.tsx` | Crear | Tests de validación cliente (sin mocks de Supabase) |

---

## Task 1: Guard en middleware

**Files:**
- Modify: `middleware.ts:96-124`

- [ ] **Step 1: Agregar el guard en middleware.ts**

Abrir `middleware.ts`. Localizar el comentario `// ── Guard de rol ──` (línea ~96). Insertar el siguiente bloque **inmediatamente antes** de ese comentario:

```typescript
  // ── Guard de force_password_change ─────────────────────────────────────────
  // El flag viaja en el JWT — sin DB call adicional.
  // La ruta /dashboard/cambiar-contrasena está excluida para evitar loop.
  const forceChange = user.user_metadata?.force_password_change === true
  const isChangePasswordRoute = pathname === "/dashboard/cambiar-contrasena"

  if (forceChange && !isChangePasswordRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard/cambiar-contrasena"
    return NextResponse.redirect(url)
  }

```

El bloque completo del middleware, después de la inserción, debe tener este orden:
1. Guard de autenticación (ya existente)
2. Guard de `force_password_change` ← nuevo
3. Guard de rol (ya existente)

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): guard force_password_change en middleware"
```

---

## Task 2: Layout limpio

**Files:**
- Create: `app/dashboard/cambiar-contrasena/layout.tsx`

- [ ] **Step 1: Crear el layout**

```typescript
// app/dashboard/cambiar-contrasena/layout.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function CambiarContrasenaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0B1D35] flex items-center justify-center px-6 py-16">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/cambiar-contrasena/layout.tsx
git commit -m "feat(auth): layout limpio para cambiar-contrasena"
```

---

## Task 3: Tests de validación (escribir primero)

**Files:**
- Create: `__tests__/cambiar-contrasena.test.tsx`

Estos tests validan la lógica de validación del formulario sin necesitar mocks de Supabase. El componente completo aún no existe — los tests van a fallar hasta el Task 4.

- [ ] **Step 1: Crear el archivo de test**

```typescript
// __tests__/cambiar-contrasena.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock de next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock de Supabase client — solo necesitamos que exista para el import
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { user_metadata: { role: "doctor" } } },
      }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  }),
}))

// Importar después de los mocks
const { default: CambiarContrasenaPage } = await import(
  "@/app/dashboard/cambiar-contrasena/page"
)

describe("CambiarContrasenaPage — validaciones cliente", () => {
  beforeEach(() => {
    render(<CambiarContrasenaPage />)
  })

  it("muestra error si la contraseña tiene menos de 8 caracteres", async () => {
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: "abc123" },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: "abc123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /guardar contraseña/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/al menos 8 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  it("muestra error si las contraseñas no coinciden", async () => {
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: "contraseña123" },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: "contraseña456" },
    })
    fireEvent.click(screen.getByRole("button", { name: /guardar contraseña/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/no coinciden/i)
      ).toBeInTheDocument()
    })
  })

  it("muestra el botón de cerrar sesión", () => {
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i })
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar tests — deben fallar**

```bash
npx vitest run __tests__/cambiar-contrasena.test.tsx
```

Esperado: FAIL — `Cannot find module '@/app/dashboard/cambiar-contrasena/page'`

- [ ] **Step 3: Commit**

```bash
git add __tests__/cambiar-contrasena.test.tsx
git commit -m "test(auth): tests validación cambiar-contrasena (red)"
```

---

## Task 4: Página de cambio de contraseña

**Files:**
- Create: `app/dashboard/cambiar-contrasena/page.tsx`

Sigue el mismo patrón que `app/(auth)/nueva-password/page.tsx` con tres diferencias: redirige al dashboard en lugar de `/login`, limpia el flag `force_password_change`, y agrega el botón de cerrar sesión.

- [ ] **Step 1: Crear la página**

```typescript
// app/dashboard/cambiar-contrasena/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from "lucide-react"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

export default function CambiarContrasenaPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError("No se pudo actualizar la contraseña. Intenta de nuevo.")
      setLoading(false)
      return
    }

    await supabase.auth.updateUser({ data: { force_password_change: false } })

    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role

    setDone(true)
    setTimeout(() => {
      router.push(role === "doctor" || role === "admin"
        ? "/dashboard/medico"
        : "/dashboard/paciente"
      )
    }, 1800)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="w-full max-w-md bg-[#F8FAFC] rounded-2xl p-8 shadow-xl">
      <div className="mb-8 text-center">
        <Link href="/">
          <Image
            src="/logo-color.png"
            alt="Organnical"
            width={140}
            height={34}
            className="inline-block mb-6"
          />
        </Link>

        {done ? (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">
              Contraseña guardada
            </h1>
            <p className="text-zinc-500 text-sm">Redirigiendo a tu dashboard...</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">
              Crea tu contraseña
            </h1>
            <p className="text-zinc-500 text-sm">
              Por seguridad, debes establecer una contraseña personal antes de continuar.
            </p>
          </>
        )}
      </div>

      {!done && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              type={showPass ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: G }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Guardar contraseña <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-sm text-zinc-400 hover:text-zinc-600 py-2 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Ejecutar tests — deben pasar**

```bash
npx vitest run __tests__/cambiar-contrasena.test.tsx
```

Esperado: 3 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/cambiar-contrasena/page.tsx
git commit -m "feat(auth): página cambiar-contrasena obligatoria"
```

---

## Task 5: Activar flag para la Dra. Prialé y verificar flujo completo

- [ ] **Step 1: Activar el flag en Supabase**

Correr en Supabase Dashboard → SQL Editor:

```sql
UPDATE auth.users
SET
  raw_user_meta_data = raw_user_meta_data || '{"force_password_change": true}'::jsonb,
  updated_at = now()
WHERE email = 'citasdrapriale@gmail.com';
```

Verificar:
```sql
SELECT email, raw_user_meta_data->>'force_password_change' AS flag
FROM auth.users
WHERE email = 'citasdrapriale@gmail.com';
```

Esperado: `flag = true`

- [ ] **Step 2: Probar el flujo en el navegador**

1. Abrir `http://localhost:3000/login`
2. Entrar con `citasdrapriale@gmail.com` / `OrgannicalDra2026!`
3. Verificar que redirige a `/dashboard/cambiar-contrasena` (no al dashboard)
4. Intentar navegar manualmente a `/dashboard/medico` — debe volver a `/dashboard/cambiar-contrasena`
5. Ingresar contraseña < 8 chars → ver mensaje de error
6. Ingresar contraseñas que no coinciden → ver mensaje de error
7. Ingresar contraseña válida → ver pantalla de éxito → redirige a `/dashboard/medico`
8. Verificar que el flag fue limpiado: hacer logout y login nuevamente — debe entrar directo al dashboard

- [ ] **Step 3: Probar cerrar sesión**

1. Repetir el login con la nueva contraseña establecida en step 2
2. Activar el flag nuevamente con el SQL del step 1
3. Hacer logout + login → llegar a `/dashboard/cambiar-contrasena`
4. Hacer clic en "Cerrar sesión" → debe redirigir a `/login`

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat(auth): force-password-change completo — middleware + página + tests"
```

---

## Snippet reutilizable: activar flag para cualquier usuario nuevo

Para futuros usuarios creados con contraseña temporal, correr este SQL antes de compartir las credenciales:

```sql
UPDATE auth.users
SET
  raw_user_meta_data = raw_user_meta_data || '{"force_password_change": true}'::jsonb,
  updated_at = now()
WHERE email = 'email-del-usuario@ejemplo.com';
```
