# Fulfillment de venta de producto (checkout web) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que una venta de producto pagada por MercadoPago emita su boleta SUNAT, se registre en la tabla `ventas` de Ruby, y notifique a 3 coordinadores con los datos de envío para que despachen.

**Architecture:** Una función `fulfillPaidOrder(ordenId)` orquesta 3 efectos post-pago. La boleta se dispara primero (idempotencia propia del lifecycle SUNAT). Venta + correo van bajo un claim atómico (columna `fulfillment_claimed_at`) para que webhook y process-payment no dupliquen. La venta se inserta directo en `ventas` (mismo patrón que `kommo-parser-ruby`, sin RPC). El correo de producto incluye dirección/distrito/celular + `num_orden`.

**Tech Stack:** Next.js 16, TypeScript, Supabase (service role), Resend, Vitest. Spec: `docs/superpowers/specs/2026-06-02-checkout-producto-fulfillment-design.md`.

---

## File Structure

- **Create** `lib/store-notify.ts` — lista explícita de destinatarios de aviso de venta de producto.
- **Create** `lib/store-fulfillment.ts` — `fulfillPaidOrder(ordenId)` orquestador + claim atómico + mapeo orden→`ventas`.
- **Modify** `lib/ruby-integration.ts` — reescribir `createVentaAndDespacho` a insert directo en `ventas`, devolviendo el id de la venta. (Supersede el parche `throw`→`warn`.)
- **Modify** `lib/emails.ts` — agregar `sendStoreSaleNotification` (correo de producto con datos de envío).
- **Modify** `app/api/mp/webhook/route.ts` — reemplazar el bloque actual por `fulfillPaidOrder(ordenId)`.
- **Modify** `app/api/mp/process-payment/route.ts` — idem.
- **Modify** `app/api/mercadopago/webhook/route.ts` y `app/api/mercadopago/process-payment/route.ts` — neutralizar la rama de producto (early return) para evitar doble-disparo.
- **Create** `supabase/migrations/23_ordenes_tienda_fulfillment_claim.sql` — columna `fulfillment_claimed_at`.
- **Create** `__tests__/lib/store-fulfillment.test.ts` — tests unitarios.
- **Create** `scripts/smoke-test-fulfillment.ts` — e2e manual local.

**Convención de tests:** Vitest, corre con `npx vitest run <path>`. Mocks con `vi.mock`, patrón en `__tests__/api/appointments.test.ts`.

---

## Task 1: Verificar esquema vivo de `ventas` (paso 0)

Confirma 3 supuestos contra la DB de producción ANTES de escribir el mapeo. No escribe código de la feature; produce hechos que las tareas siguientes asumen.

**Files:**
- Create (temporal): `scripts/introspect-ventas.ts`

- [ ] **Step 1: Escribir el script de introspección**

```typescript
// scripts/introspect-ventas.ts
// Uso: npx tsx scripts/introspect-ventas.ts
import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
config({ path: ".env.local" })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  // 1. Columnas reales de `ventas` + cuál es el PK (mirar una fila real)
  const { data: ventaRow, error: vErr } = await sb.from("ventas").select("*").limit(1).single()
  console.log("=== ventas (fila ejemplo) ===")
  if (vErr) console.log("error/sin filas:", vErr.message)
  else console.log("columnas:", Object.keys(ventaRow), "\nfila:", ventaRow)

  // 2. Mayor num_orden actual (para confirmar tipo y mecanismo max+1)
  const { data: maxRows } = await sb.from("ventas").select("num_orden").order("num_orden", { ascending: false }).limit(1)
  console.log("=== num_orden máximo ===", maxRows?.[0]?.num_orden, "tipo:", typeof maxRows?.[0]?.num_orden)

  // 3. Columnas de ordenes_tienda (confirmar que NO existe fulfillment_claimed_at todavía)
  const { data: ordenRow } = await sb.from("ordenes_tienda").select("*").limit(1).single()
  console.log("=== ordenes_tienda columnas ===", ordenRow ? Object.keys(ordenRow) : "sin filas")
}
main()
```

- [ ] **Step 2: Correr el script y registrar hallazgos**

Run: `npx tsx scripts/introspect-ventas.ts`

Registrar y confirmar:
- **PK de `ventas`**: ¿existe columna `id` (uuid)? → es lo que se guarda en `ordenes_tienda.id_venta_ruby` (UUID por migración P0-4). Si el PK no es `id` uuid, ajustar Task 5/6.
- **`num_orden`**: confirmar tipo (entero) y que `max+1` es el mecanismo vivo (igual que `kommo-parser-ruby`).
- **Semántica de `total` por fila** en ventas multi-ítem: ¿cada fila lleva su total de línea, o el total de la orden replicado? Mirar filas existentes con mismo `num_orden`. Esto define el mapeo en Task 5.
- **`ordenes_tienda`**: confirmar que `fulfillment_claimed_at` NO existe aún (Task 2 lo crea).

- [ ] **Step 3: Borrar el script temporal y commitear los hallazgos en el plan**

```bash
rm scripts/introspect-ventas.ts
```

Anotar los 4 hallazgos como comentario al inicio de `lib/store-fulfillment.ts` cuando se cree (Task 5), p.ej. `// ventas PK = id (uuid); num_orden = max+1 int; total por fila = línea`. No se commitea el script temporal.

> **Si algún hallazgo contradice los supuestos** (PK distinto, `num_orden` por secuencia obligatoria, `total` = total de orden replicado), ajustar el código concreto de Task 5/6 antes de seguir. El resto del plan no cambia.

---

## Task 2: Migración — columna de claim `fulfillment_claimed_at`

**Files:**
- Create: `supabase/migrations/23_ordenes_tienda_fulfillment_claim.sql`

- [ ] **Step 1: Escribir la migración**

```sql
-- 23: claim atómico de fulfillment para ordenes_tienda.
-- Webhook y process-payment de MP pueden dispararse a la vez para la misma
-- orden. Esta columna actúa de candado: solo el runner que la setea de NULL
-- a NOW() procede a crear la venta en Ruby + enviar el correo a coordinadores.
-- La boleta SUNAT NO usa este candado (tiene su propia idempotencia).
-- Idempotente.

ALTER TABLE public.ordenes_tienda
  ADD COLUMN IF NOT EXISTS fulfillment_claimed_at TIMESTAMPTZ;
```

- [ ] **Step 2: Aplicar a la DB compartida**

Run (con el entorno conectado a la DB de producción/staging según práctica del equipo):
`supabase db push` (o aplicar el SQL manual vía el panel de Supabase si así se opera).

Expected: columna `fulfillment_claimed_at` presente en `ordenes_tienda`, todas las filas con valor NULL.

- [ ] **Step 3: Regenerar tipos (si aplica) y commitear**

Si el repo regenera `lib/supabase/database.types.ts` desde la DB, agregar la columna ahí (`fulfillment_claimed_at: string | null` en Row/Insert/Update de `ordenes_tienda`). Si no, agregarla a mano.

```bash
git add supabase/migrations/23_ordenes_tienda_fulfillment_claim.sql lib/supabase/database.types.ts
git commit -m "feat(checkout): columna fulfillment_claimed_at para claim atómico"
```

---

## Task 3: Lista de destinatarios de aviso (`lib/store-notify.ts`)

**Files:**
- Create: `lib/store-notify.ts`
- Test: `__tests__/lib/store-notify.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```typescript
// __tests__/lib/store-notify.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { getStoreSaleNotifyEmails } from "@/lib/store-notify"

describe("getStoreSaleNotifyEmails", () => {
  const original = process.env.STORE_SALE_NOTIFY_EMAILS
  afterEach(() => { process.env.STORE_SALE_NOTIFY_EMAILS = original })

  it("usa el default de 3 socios cuando no hay env var", () => {
    delete process.env.STORE_SALE_NOTIFY_EMAILS
    expect(getStoreSaleNotifyEmails()).toEqual([
      "jose@futura-farms.com",
      "raul@futura-farms.com",
      "michel@futura-farms.com",
    ])
  })

  it("parsea la env var separada por comas y limpia espacios/vacíos", () => {
    process.env.STORE_SALE_NOTIFY_EMAILS = " a@x.com , b@x.com ,, "
    expect(getStoreSaleNotifyEmails()).toEqual(["a@x.com", "b@x.com"])
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run __tests__/lib/store-notify.test.ts`
Expected: FAIL — `getStoreSaleNotifyEmails` no existe.

- [ ] **Step 3: Implementar**

```typescript
// lib/store-notify.ts

const DEFAULT_NOTIFY = [
  "jose@futura-farms.com",
  "raul@futura-farms.com",
  "michel@futura-farms.com", // Michel Llontop (socio)
]

/**
 * Destinatarios del aviso de venta de producto (coordinación de despacho).
 * Lista explícita de negocio — NO usar getAdminEmails(): "coordinador de
 * despacho" es un concepto distinto de "admin del sistema".
 * Override por env var STORE_SALE_NOTIFY_EMAILS (CSV).
 */
export function getStoreSaleNotifyEmails(): string[] {
  const raw = process.env.STORE_SALE_NOTIFY_EMAILS
  if (!raw?.trim()) return DEFAULT_NOTIFY
  return raw.split(",").map((e) => e.trim()).filter(Boolean)
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run __tests__/lib/store-notify.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/store-notify.ts __tests__/lib/store-notify.test.ts
git commit -m "feat(checkout): lista explícita de avisos de venta de producto"
```

---

## Task 4: Correo de producto con datos de envío (`sendStoreSaleNotification`)

**Files:**
- Modify: `lib/emails.ts` (agregar función al final, antes del cierre del archivo)
- Test: `__tests__/lib/emails-store-sale.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```typescript
// __tests__/lib/emails-store-sale.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

const sendMock = vi.fn().mockResolvedValue({ error: null })
vi.mock("resend", () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}))

import { sendStoreSaleNotification } from "@/lib/emails"

describe("sendStoreSaleNotification", () => {
  beforeEach(() => sendMock.mockClear())

  it("no manda nada si la lista de destinatarios está vacía", async () => {
    await sendStoreSaleNotification({
      to: [], numOrden: 1, clienteNombre: "x", celular: "9", distrito: "y",
      direccion: "z", items: [], total: 0, boletaLink: null,
    })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it("incluye dirección, distrito, celular y num_orden en el HTML", async () => {
    await sendStoreSaleNotification({
      to: ["a@x.com"], numOrden: 42, clienteNombre: "Ana Pérez",
      celular: "987654321", distrito: "Miraflores", direccion: "Av. Lima 123",
      items: [{ descripcion: "Spirusol", qty: 2, precio: 50 }],
      total: 110, boletaLink: "https://b.pe/1",
    })
    expect(sendMock).toHaveBeenCalledTimes(1)
    const arg = sendMock.mock.calls[0][0]
    expect(arg.to).toEqual(["a@x.com"])
    expect(arg.subject).toContain("#42")
    expect(arg.html).toContain("Av. Lima 123")
    expect(arg.html).toContain("Miraflores")
    expect(arg.html).toContain("987654321")
    expect(arg.html).toContain("Spirusol")
    expect(arg.html).toContain("https://b.pe/1")
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run __tests__/lib/emails-store-sale.test.ts`
Expected: FAIL — `sendStoreSaleNotification` no existe.

- [ ] **Step 3: Implementar** (agregar al final de `lib/emails.ts`)

```typescript
export async function sendStoreSaleNotification({
  to,
  numOrden,
  clienteNombre,
  celular,
  distrito,
  direccion,
  items,
  total,
  boletaLink,
}: {
  to: string[];
  numOrden: number | string;
  clienteNombre: string;
  celular: string;
  distrito: string;
  direccion: string;
  items: { descripcion: string; qty: number; precio: number }[];
  total: number;
  boletaLink: string | null;
}) {
  if (!to.length) return;

  const itemsHtml = items.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #F4F4F5">
        <p style="margin:0;color:#1A1A1A;font-size:14px;font-weight:600">${i.descripcion} <span style="color:#A1A1AA;font-weight:400">×${i.qty}</span></p>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #F4F4F5;text-align:right">
        <p style="margin:0;color:#1A1A1A;font-size:14px;font-weight:700">S/ ${(i.precio * i.qty).toFixed(2)}</p>
      </td>
    </tr>`).join("");

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;color:#1A1A1A;font-size:22px;font-weight:900">🛍 Nueva venta — Productos · Orden #${numOrden}</h1>
    <p style="margin:0 0 28px;color:#71717A;font-size:15px">Coordinar despacho con los datos de envío.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px;border-left:3px solid #00DBB1">
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Cliente</p>
        <p style="margin:4px 0 0;color:#1A1A1A;font-size:14px;font-weight:600">${clienteNombre}</p>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Celular</p>
        <p style="margin:4px 0 0;color:#1A1A1A;font-size:14px;font-weight:600">${celular}</p>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Distrito</p>
        <p style="margin:4px 0 0;color:#1A1A1A;font-size:14px;font-weight:600">${distrito}</p>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Dirección</p>
        <p style="margin:4px 0 0;color:#1A1A1A;font-size:14px;font-weight:600">${direccion}</p>
      </td></tr>
      <tr><td style="padding:8px 0">
        <p style="margin:0 0 12px;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Detalle</p>
        <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">
          <tr>
            <td style="color:#71717A;font-size:13px;font-weight:700;text-transform:uppercase">Total</td>
            <td style="text-align:right;color:#1A1A1A;font-size:18px;font-weight:900">S/ ${total.toFixed(2)}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${boletaLink ? `<p style="margin:0 0 24px"><a href="${boletaLink}" style="color:#968DEF;font-weight:600">Ver boleta</a></p>` : ""}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#1A1A1A;color:white;text-decoration:none;padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;font-family:'Inter','Helvetica Neue',Arial,sans-serif">
          Ver en Ruby
        </a>
      </td></tr>
    </table>
  `);

  return sendWithRetry({
    from: FROM,
    to,
    subject: `🛍 Nueva venta #${numOrden} — ${clienteNombre} · S/ ${total.toFixed(2)}`,
    html,
  });
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run __tests__/lib/emails-store-sale.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/emails.ts __tests__/lib/emails-store-sale.test.ts
git commit -m "feat(checkout): correo de venta de producto con datos de despacho"
```

---

## Task 5: Reescribir `createVentaAndDespacho` → insert directo en `ventas`

Reemplaza la llamada a la RPC inexistente por un insert directo (patrón `kommo-parser-ruby`). Devuelve el id (uuid) de la venta para guardarlo en `id_venta_ruby`. **Esta tarea supersede el parche `throw`→`warn`.**

**Files:**
- Modify: `lib/ruby-integration.ts` (reescribir el cuerpo completo)
- Test: `__tests__/lib/ruby-integration.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```typescript
// __tests__/lib/ruby-integration.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

const insertMock = vi.fn().mockResolvedValue({ data: [{ id: "venta-uuid-1" }], error: null })
const maxSelectMock = vi.fn().mockResolvedValue({ data: [{ num_orden: 99 }], error: null })

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "ventas") {
        return {
          select: () => ({ order: () => ({ limit: () => maxSelectMock() }) }),
          insert: (rows: unknown) => ({ select: () => insertMock(rows) }),
        }
      }
      throw new Error("tabla inesperada: " + table)
    },
  }),
}))

import { createVentaEnRuby } from "@/lib/ruby-integration"
import type { CartItem, DireccionEntrega } from "@/lib/types"

const direccion: DireccionEntrega = {
  email: "ana@x.com", nombre: "Ana", apellido: "Pérez", celular: "987654321",
  dni: "12345678", distrito: "Miraflores", direccion: "Av. Lima 123",
}
const items: CartItem[] = [
  { producto: { sku: "SP1", descripcion: "Spirusol", precio_publico: 50, precio_oferta: null } as never, cantidad: 2 },
]

describe("createVentaEnRuby", () => {
  beforeEach(() => { insertMock.mockClear(); maxSelectMock.mockClear() })

  it("inserta una fila por item con num_orden = max+1 y devuelve {ventaId, numOrden}", async () => {
    const res = await createVentaEnRuby({
      items, direccion, total: 110, deliveryCost: 10, boletaLink: "https://b.pe/1",
    })
    expect(res).toEqual({ ventaId: "venta-uuid-1", numOrden: 100 })
    const rows = insertMock.mock.calls[0][0] as Record<string, unknown>[]
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      num_orden: 100, item: "Spirusol", unidades: 2, precio_item: 50,
      precio_delivery: 10, nombre: "Ana", celular: "987654321",
      distrito: "Miraflores", direccion: "Av. Lima 123",
      vendedor: "Tienda Web", metodo_pago: "MercadoPago (web)",
      link_comprobante: "https://b.pe/1",
    })
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run __tests__/lib/ruby-integration.test.ts`
Expected: FAIL — `createVentaEnRuby` no existe (hoy el archivo exporta `createVentaAndDespacho`).

- [ ] **Step 3: Reescribir `lib/ruby-integration.ts`**

```typescript
// ventas: PK = id (uuid); num_orden = max+1 (int); una fila por item.
// Confirmado vivo en Task 1. Patrón espejo de supabase/functions/kommo-parser-ruby.
import { createAdminClient } from "@/lib/supabase/server"
import type { CartItem, DireccionEntrega } from "@/lib/types"

export async function createVentaEnRuby({
  items,
  direccion,
  total,
  deliveryCost,
  boletaLink,
}: {
  items: CartItem[]
  direccion: DireccionEntrega
  total: number
  deliveryCost: number
  boletaLink: string | null
}): Promise<{ ventaId: string; numOrden: number }> {
  const supabase = createAdminClient()

  // num_orden = max+1 (mismo mecanismo que kommo-parser-ruby)
  const { data: maxRows } = await supabase
    .from("ventas")
    .select("num_orden")
    .order("num_orden", { ascending: false })
    .limit(1)
  const numOrden = Number(maxRows?.[0]?.num_orden ?? 0) + 1
  const hoy = new Date().toISOString().split("T")[0]

  // Una fila por item. precio_delivery solo en la primera fila para no duplicar.
  const rows = items.map((it, idx) => {
    const unitPrice = it.producto.precio_oferta ?? it.producto.precio_publico
    return {
      num_orden:        numOrden,
      nombre:           direccion.nombre ?? null,
      apellido:         direccion.apellido ?? null,
      dni:              direccion.dni ?? null,
      celular:          direccion.celular ?? null,
      farmacia:         null,
      item:             it.producto.descripcion,
      unidades:         it.cantidad,
      fecha_compra:     hoy,
      fecha_entrega:    null,
      distrito:         direccion.distrito ?? null,
      direccion:        direccion.direccion ?? null,
      precio_item:      unitPrice,
      precio_delivery:  idx === 0 ? deliveryCost : 0,
      total:            unitPrice * it.cantidad + (idx === 0 ? deliveryCost : 0),
      metodo_pago:      "MercadoPago (web)",
      comentarios:      null,
      tipo_cliente:     "Nuevo",
      campana:          "Tienda Web",
      vendedor:         "Tienda Web",
      link_comprobante: boletaLink,
      hash_comprobante: null,
    }
  })

  const { data, error } = await supabase.from("ventas").insert(rows).select("id")
  if (error) throw new Error(`ventas insert: ${error.message}`)

  return { ventaId: (data as { id: string }[])[0].id, numOrden }
}
```

> Nota: se elimina la export anterior `createVentaAndDespacho` (llamaba la RPC inexistente). Los call-sites se actualizan en Tasks 6/7. El parámetro `total` se mantiene en la firma del orquestador por si Task 1 reveló que el `total` por fila debe ser el de la orden; con la convención por-línea de arriba no se usa directamente aquí (se calcula por fila).

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run __tests__/lib/ruby-integration.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/ruby-integration.ts __tests__/lib/ruby-integration.test.ts
git commit -m "feat(checkout): createVentaEnRuby inserta directo en ventas (sin RPC)"
```

---

## Task 6: Orquestador `fulfillPaidOrder` con claim atómico

**Files:**
- Create: `lib/store-fulfillment.ts`
- Test: `__tests__/lib/store-fulfillment.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```typescript
// __tests__/lib/store-fulfillment.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

// --- mocks de dependencias ---
const boletaMock = vi.fn().mockResolvedValue({ link: "https://b.pe/1" })
vi.mock("@/lib/sunat", () => ({ registrarYEmitirBoleta: (...a: unknown[]) => boletaMock(...a) }))

const createVentaMock = vi.fn().mockResolvedValue({ ventaId: "venta-1", numOrden: 100 })
vi.mock("@/lib/ruby-integration", () => ({ createVentaEnRuby: (...a: unknown[]) => createVentaMock(...a) }))

const emailMock = vi.fn().mockResolvedValue(undefined)
vi.mock("@/lib/emails", () => ({ sendStoreSaleNotification: (...a: unknown[]) => emailMock(...a) }))
vi.mock("@/lib/store-notify", () => ({ getStoreSaleNotifyEmails: () => ["a@x.com"] }))

// --- mock supabase: claim + lectura de orden + update id_venta_ruby ---
const claimResult = { rowsClaimed: 1 }
const ordenRow = {
  id: "ord-1", items: [{ producto: { descripcion: "Spirusol", precio_publico: 50, precio_oferta: null }, cantidad: 2 }],
  cliente_snapshot: { nombre: "Ana", apellido: "Pérez", celular: "987654321", distrito: "Miraflores", direccion: "Av. Lima 123", dni: "12345678" },
  total: 110, delivery: 10,
}
const updateIdVentaMock = vi.fn().mockResolvedValue({ error: null })
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from: () => ({
      // claim: update().eq().is().select()
      update: (vals: Record<string, unknown>) => {
        if ("fulfillment_claimed_at" in vals) {
          return { eq: () => ({ is: () => ({ select: () => Promise.resolve({ data: claimResult.rowsClaimed ? [{ id: "ord-1" }] : [], error: null }) }) }) }
        }
        return { eq: () => updateIdVentaMock() } // update id_venta_ruby
      },
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: ordenRow, error: null }) }) }),
    }),
  }),
}))

import { fulfillPaidOrder } from "@/lib/store-fulfillment"

beforeEach(() => {
  boletaMock.mockClear(); createVentaMock.mockClear(); emailMock.mockClear(); updateIdVentaMock.mockClear()
  claimResult.rowsClaimed = 1
})

describe("fulfillPaidOrder", () => {
  it("emite boleta, crea venta y envía correo cuando gana el claim", async () => {
    await fulfillPaidOrder("ord-1")
    expect(boletaMock).toHaveBeenCalledTimes(1)
    expect(createVentaMock).toHaveBeenCalledTimes(1)
    expect(emailMock).toHaveBeenCalledTimes(1)
    const emailArg = emailMock.mock.calls[0][0]
    expect(emailArg.numOrden).toBe(100)
    expect(emailArg.direccion).toBe("Av. Lima 123")
  })

  it("si NO gana el claim, igual emite boleta pero NO crea venta ni correo", async () => {
    claimResult.rowsClaimed = 0
    await fulfillPaidOrder("ord-1")
    expect(boletaMock).toHaveBeenCalledTimes(1)
    expect(createVentaMock).not.toHaveBeenCalled()
    expect(emailMock).not.toHaveBeenCalled()
  })

  it("un fallo en la boleta no impide venta+correo", async () => {
    boletaMock.mockRejectedValueOnce(new Error("sunat caído"))
    await fulfillPaidOrder("ord-1")
    expect(createVentaMock).toHaveBeenCalledTimes(1)
    expect(emailMock).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run __tests__/lib/store-fulfillment.test.ts`
Expected: FAIL — `fulfillPaidOrder` no existe.

- [ ] **Step 3: Implementar `lib/store-fulfillment.ts`**

```typescript
import { createAdminClient } from "@/lib/supabase/server"
import { registrarYEmitirBoleta } from "@/lib/sunat"
import { createVentaEnRuby } from "@/lib/ruby-integration"
import { sendStoreSaleNotification } from "@/lib/emails"
import { getStoreSaleNotifyEmails } from "@/lib/store-notify"
import type { CartItem, DireccionEntrega } from "@/lib/types"

/**
 * Efectos post-pago de una orden de tienda ya marcada `pagado`. Idempotente.
 * 1. Boleta SUNAT (idempotencia propia del lifecycle; fuera del claim).
 * 2. Claim atómico (fulfillment_claimed_at) → solo un runner sigue.
 * 3. Crear venta en Ruby + 4. correo a coordinadores.
 * Cada paso es no-fatal respecto a los otros.
 */
export async function fulfillPaidOrder(ordenId: string): Promise<void> {
  const supabase = createAdminClient()

  // 1. Boleta — independiente, idempotente por su lifecycle. Devuelve link si hay.
  let boletaLink: string | null = null
  try {
    const res = await registrarYEmitirBoleta(ordenId, supabase)
    boletaLink = (res as { link?: string } | null)?.link ?? null
  } catch (err) {
    console.error("fulfillPaidOrder: boleta error (non-fatal):", err)
  }

  // 2. Claim atómico de venta+correo
  const { data: claimed } = await supabase
    .from("ordenes_tienda")
    .update({ fulfillment_claimed_at: new Date().toISOString() })
    .eq("id", ordenId)
    .is("fulfillment_claimed_at", null)
    .select("id")
  if (!claimed || claimed.length === 0) return // ya procesada por el otro runner

  // Leer la orden para mapear venta + correo
  const { data: orden, error: ordenErr } = await supabase
    .from("ordenes_tienda")
    .select("id, items, cliente_snapshot, total, delivery")
    .eq("id", ordenId)
    .single()
  if (ordenErr || !orden) {
    console.error("fulfillPaidOrder: no se pudo leer la orden:", ordenErr?.message)
    return
  }

  const items = orden.items as unknown as CartItem[]
  const direccion = orden.cliente_snapshot as unknown as DireccionEntrega

  // 3. Crear venta en Ruby
  let numOrden: number | string = ""
  try {
    const venta = await createVentaEnRuby({
      items, direccion, total: Number(orden.total), deliveryCost: Number(orden.delivery), boletaLink,
    })
    numOrden = venta.numOrden
    await supabase.from("ordenes_tienda").update({ id_venta_ruby: venta.ventaId }).eq("id", ordenId)
  } catch (err) {
    console.error("fulfillPaidOrder: createVentaEnRuby error (non-fatal):", err)
  }

  // 4. Correo a coordinadores
  try {
    await sendStoreSaleNotification({
      to: getStoreSaleNotifyEmails(),
      numOrden,
      clienteNombre: `${direccion.nombre ?? ""} ${direccion.apellido ?? ""}`.trim(),
      celular: direccion.celular ?? "",
      distrito: direccion.distrito ?? "",
      direccion: direccion.direccion ?? "",
      items: items.map((it) => ({
        descripcion: it.producto.descripcion,
        qty: it.cantidad,
        precio: it.producto.precio_oferta ?? it.producto.precio_publico,
      })),
      total: Number(orden.total),
      boletaLink,
    })
  } catch (err) {
    console.error("fulfillPaidOrder: correo coordinadores error (non-fatal):", err)
  }
}
```

> **Verificar contra `lib/sunat`** el valor de retorno real de `registrarYEmitirBoleta` (¿devuelve un objeto con `link`?). Si la firma difiere, ajustar la extracción de `boletaLink` (Task 1/lectura de `lib/sunat/lifecycle.ts`). Si no devuelve link, dejar `boletaLink = null` y leerlo de `ordenes_tienda.boleta_link` tras emitir.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run __tests__/lib/store-fulfillment.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/store-fulfillment.ts __tests__/lib/store-fulfillment.test.ts
git commit -m "feat(checkout): fulfillPaidOrder orquesta boleta+venta+correo con claim atómico"
```

---

## Task 7: Cablear `fulfillPaidOrder` en el camino vivo `mp/*`

**Files:**
- Modify: `app/api/mp/webhook/route.ts:119-136`
- Modify: `app/api/mp/process-payment/route.ts:83-102`

- [ ] **Step 1: Reemplazar el bloque en `app/api/mp/webhook/route.ts`**

Quitar el import `createVentaAndDespacho` y el bloque try/catch que lo usa (líneas ~119-136), dejando:

```typescript
import { fulfillPaidOrder } from "@/lib/store-fulfillment"
// ... (quitar: import { createVentaAndDespacho } from "@/lib/ruby-integration")

// ... dentro del handler, donde antes estaba el try/catch de createVentaAndDespacho:
    try {
      await fulfillPaidOrder(ordenId)
    } catch (err) {
      console.error("webhook: fulfillPaidOrder error (non-fatal):", err)
    }

    return NextResponse.json({ ok: true })
```

- [ ] **Step 2: Reemplazar el bloque en `app/api/mp/process-payment/route.ts`**

Igual: quitar import y bloque de `createVentaAndDespacho` (líneas ~83-102), reemplazar por:

```typescript
import { fulfillPaidOrder } from "@/lib/store-fulfillment"
// ... (quitar import createVentaAndDespacho)

      if (updated) {
        try {
          await fulfillPaidOrder(ordenId)
        } catch (err) {
          console.error("process-payment: fulfillPaidOrder error (non-fatal):", err)
        }
      }
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: EXIT 0 (no quedan referencias a `createVentaAndDespacho`).

- [ ] **Step 4: Commit**

```bash
git add app/api/mp/webhook/route.ts app/api/mp/process-payment/route.ts
git commit -m "feat(checkout): mp/webhook y process-payment llaman fulfillPaidOrder"
```

---

## Task 8: Neutralizar la rama de producto del árbol legacy `mercadopago/*`

Evita doble-disparo si quedó un webhook fantasma en el panel de MP apuntando a `/api/mercadopago/webhook`. NO tocar las rutas de citas (`process-appointment`/`process-express`/`confirm-express`).

**Files:**
- Modify: `app/api/mercadopago/webhook/route.ts:155-161` (bloque de `sendAdminSaleNotification` saleType product)
- Modify: `app/api/mercadopago/process-payment/route.ts:122-130` (idem)

- [ ] **Step 1: Neutralizar en `app/api/mercadopago/webhook/route.ts`**

Reemplazar el bloque que llama `getAdminEmails()` + `sendAdminSaleNotification({ saleType: "product" })` por:

```typescript
    // DEPRECADO: el fulfillment de producto vive ahora en el árbol mp/* vía
    // fulfillPaidOrder. Esta rama legacy se neutraliza para evitar doble-disparo
    // (correos duplicados a la lista vieja) si MP tiene un webhook fantasma aquí.
    console.warn("mercadopago/webhook: rama de producto legacy deshabilitada (ver mp/* + fulfillPaidOrder)")
    return NextResponse.json({ ok: true })
```

- [ ] **Step 2: Neutralizar en `app/api/mercadopago/process-payment/route.ts`**

Reemplazar el bloque equivalente (`getAdminEmails` + `sendAdminSaleNotification` product) por:

```typescript
      // DEPRECADO: fulfillment de producto en mp/* vía fulfillPaidOrder.
      console.warn("mercadopago/process-payment: rama de producto legacy deshabilitada")
```

(Quitar el llamado a `sendAdminSaleNotification`/`getAdminEmails` de esa ruta; dejar el resto del flujo intacto.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: EXIT 0. Quitar imports que queden sin uso (`getAdminEmails`, `sendAdminSaleNotification`) si esas rutas ya no los usan.

- [ ] **Step 4: Commit**

```bash
git add app/api/mercadopago/webhook/route.ts app/api/mercadopago/process-payment/route.ts
git commit -m "fix(checkout): neutralizar rama de producto legacy en mercadopago/* (anti doble-disparo)"
```

---

## Task 9: Smoke test e2e local + verificación manual

**Files:**
- Create: `scripts/smoke-test-fulfillment.ts`

- [ ] **Step 1: Escribir el script**

```typescript
// scripts/smoke-test-fulfillment.ts
// Uso: npx tsx scripts/smoke-test-fulfillment.ts <ordenId>
// Requiere una orden de prueba ya marcada `pagado` en ordenes_tienda.
import { config } from "dotenv"
config({ path: ".env.local" })
import { fulfillPaidOrder } from "@/lib/store-fulfillment"

const ordenId = process.argv[2]
if (!ordenId) { console.error("Falta <ordenId>"); process.exit(1) }

fulfillPaidOrder(ordenId)
  .then(() => console.log("✅ fulfillPaidOrder OK — revisar: fila(s) en ventas, id_venta_ruby seteado, correo a los 3, boleta (si tokens prod)"))
  .catch((e) => { console.error("❌", e); process.exit(1) })
```

- [ ] **Step 2: Crear una orden de prueba `pagado` y correr**

Crear (vía Supabase) una fila en `ordenes_tienda` con `estado='pagado'`, `fulfillment_claimed_at=NULL`, `items` con 1 producto real visible, `cliente_snapshot` con nombre/celular/distrito/direccion, `total`/`delivery`.

Run: `npx tsx scripts/smoke-test-fulfillment.ts <ordenId>`

- [ ] **Step 3: Verificar manualmente (evidencia, no asunción)**
- `ventas`: ¿se creó 1 fila por item con el mismo `num_orden`, vendedor "Tienda Web"?
- `ordenes_tienda.id_venta_ruby`: ¿quedó poblado con el uuid de la venta?
- Correo: ¿llegó a jose, raul **y michel** con dirección/distrito/celular/num_orden?
- Re-correr el script con la misma orden → **NO** debe crear venta nueva ni reenviar correo (claim ya tomado).
- Boleta SUNAT: solo si los tokens de producción de NubeFact ya están configurados (dependencia externa).

- [ ] **Step 4: Commit**

```bash
git add scripts/smoke-test-fulfillment.ts
git commit -m "test(checkout): smoke test e2e de fulfillPaidOrder"
```

---

## Self-Review (cobertura del spec)

- ✅ Boleta fuera del claim, idempotencia propia → Task 6 step 3.
- ✅ Claim atómico solo venta+correo (`fulfillment_claimed_at`) → Task 2 + Task 6.
- ✅ Insert directo en `ventas` (sin RPC), patrón kommo → Task 5.
- ✅ Lista explícita de avisos (no `getAdminEmails`) → Task 3.
- ✅ Correo con dirección/distrito/celular + num_orden como requisito → Task 4.
- ✅ Wire en camino vivo `mp/*` → Task 7.
- ✅ Neutralizar rama de producto legacy → Task 8.
- ✅ Supersesión del parche `throw`→`warn` → Task 5 (reescribe el archivo).
- ✅ Estado queda en `pagado` (no se toca) → Task 6 no modifica `estado`.
- ✅ Paso 0 introspección → Task 1.
- ✅ Testing sin PAYMENT_BYPASS (script directo) → Task 9.

## Pendientes que dependen de verificación en ejecución
- Firma real de `registrarYEmitirBoleta` (¿devuelve `link`?) → confirmar en Task 6 contra `lib/sunat/lifecycle.ts`; ajustar extracción de `boletaLink`.
- PK de `ventas` y semántica de `total` por fila → Task 1.
- Aplicación de la migración a la DB compartida (práctica del equipo) → Task 2.
- Dependencia externa: tokens prod NubeFact para boleta real → Task 9.
