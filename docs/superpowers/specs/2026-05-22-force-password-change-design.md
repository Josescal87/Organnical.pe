# Force Password Change — Spec
*Fecha: 2026-05-22*

## Problema

Los admins crean cuentas con contraseña temporal vía SQL. No hay mecanismo que obligue al usuario a cambiarla en el primer login. El usuario podría operar indefinidamente con la contraseña que conoce el admin.

## Solución

Flag `force_password_change: true` en `raw_user_meta_data` de Supabase Auth. El middleware lo detecta y redirige a una página de cambio obligatorio antes de que el usuario acceda a cualquier ruta del dashboard.

## Flujo

```
Login
  └─► Middleware lee user.user_metadata.force_password_change
        ├─ true  → redirect /dashboard/cambiar-contrasena
        └─ false → flujo normal (guard de roles existente)

/dashboard/cambiar-contrasena
  └─► Usuario ingresa nueva contraseña (mín. 8 chars)
        └─► Server action:
              1. supabase.auth.updateUser({ password: nuevaContrasena })
              2. supabase.auth.updateUser({ data: { force_password_change: false } })
              3. redirect() → /dashboard/medico o /dashboard/paciente según rol del JWT

  └─► Usuario hace clic en "Cerrar sesión"
        └─► supabase.auth.signOut() → redirect /login
```

## Activar el flag para un usuario

```sql
UPDATE auth.users
SET
  raw_user_meta_data = raw_user_meta_data || '{"force_password_change": true}'::jsonb,
  updated_at = now()
WHERE email = 'usuario@ejemplo.com';
```

## Componentes

### 1. `middleware.ts` — guard de force_password_change

Agregar **antes** del guard de roles existente:

```ts
const forceChange = user.user_metadata?.force_password_change === true
const isChangePasswordRoute = pathname === '/dashboard/cambiar-contrasena'

if (forceChange && !isChangePasswordRoute) {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard/cambiar-contrasena'
  return NextResponse.redirect(url)
}
```

### 2. `app/dashboard/cambiar-contrasena/layout.tsx`

Layout limpio sin `DashboardSidebar`. Fondo y centrado idéntico al resto del sitio. El usuario no ve links de navegación que no puede usar.

```tsx
export default function ChangePasswordLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      {children}
    </div>
  )
}
```

### 3. `app/dashboard/cambiar-contrasena/page.tsx`

Client Component. Contiene:
- Logo/marca Organnical
- Título: "Crea tu contraseña"
- Subtítulo explicativo: "Por seguridad, debes establecer una contraseña personal antes de continuar."
- Campo: Nueva contraseña (tipo password, toggle mostrar/ocultar)
- Campo: Confirmar contraseña
- Botón primario: "Guardar contraseña"
- Botón secundario/link: "Cerrar sesión" → llama `supabase.auth.signOut()` y redirige a `/login`
- Mensajes de error inline (contraseña corta, no coinciden, error de red)
- Estado de carga en el botón mientras se procesa

Validaciones en cliente:
- Mínimo 8 caracteres
- Los dos campos coinciden
- No vacíos

### 4. `app/dashboard/cambiar-contrasena/actions.ts`

Server action `cambiarContrasena(nuevaContrasena: string)`:

1. Obtener sesión con `createClient()` (SSR)
2. Llamar `supabase.auth.updateUser({ password: nuevaContrasena })`
3. Si hay error → retornar `{ error: 'mensaje' }`
4. Llamar `supabase.auth.updateUser({ data: { force_password_change: false } })`
5. Leer rol del JWT (`user.user_metadata.role`) y llamar `redirect('/dashboard/medico')` o `redirect('/dashboard/paciente')` directamente desde el server action

La validación de mínimo 8 chars ocurre en el cliente antes de llamar al action.

## Seguridad

- La página `/dashboard/cambiar-contrasena` está dentro de rutas protegidas por autenticación. Un usuario no logueado es redirigido a `/login` por el guard existente antes de llegar al check de `force_password_change`.
- El flag se limpia vía `auth.updateUser` (que actualiza `raw_user_meta_data` y reemite el JWT), no por SQL directo desde el cliente.
- El middleware evalúa el flag en cada request: si alguien intenta navegar directamente a otra ruta del dashboard con el flag activo, es redirigido de vuelta.

## Exclusiones de scope

- No hay expiración del flag (YAGNI — el admin puede limpiar el flag manualmente si es necesario).
- No se envía email de confirmación tras el cambio.
- No se aplica historial de contraseñas anteriores.
