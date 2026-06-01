# Boleta refleja el descuento del cupón — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la boleta electrónica refleje el descuento del cupón (`total_boleta == subtotal − descuento`) en vez de salir a precio de lista.

**Architecture:** Una función pura `aplicarDescuentoProrrateado(items, descuento)` prorratea el descuento global del cupón sobre las líneas de la boleta (precio neto por ítem), reusando el motor `calcularItem` existente. `registrarYEmitirBoleta` lee `ordenes_tienda.descuento` y aplica la función antes de calcular los totales. Los totales del comprobante ya se derivan por `reduce` sobre los ítems → se corrigen solos.

**Tech Stack:** TypeScript estricto, vitest. Spec: `docs/superpowers/specs/2026-06-02-boleta-descuento-cupon-design.md`.

---

## File Structure

- **Modify** `lib/sunat/types.ts` — agregar la función pura `aplicarDescuentoProrrateado` (junto a `calcularItem`; comparte el `round2` privado del módulo).
- **Modify** `lib/sunat/lifecycle.ts` — `registrarYEmitirBoleta`: agregar `descuento` al `select` y envolver `itemsFromCart(items)` con la nueva función.
- **Create** `__tests__/lib/sunat-descuento.test.ts` — tests de la función pura + un test de integración de `registrarYEmitirBoleta`.

---

## Task 1: Función pura `aplicarDescuentoProrrateado`

**Files:**
- Modify: `lib/sunat/types.ts` (agregar export al final, antes del `round2` o después — `round2` ya existe en el módulo)
- Test: `__tests__/lib/sunat-descuento.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `__tests__/lib/sunat-descuento.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { calcularItem, aplicarDescuentoProrrateado } from "@/lib/sunat/types"
import type { BoletaItem } from "@/lib/sunat/types"

// Helper: arma un ítem a precio de lista vía el mismo motor de producción.
function item(codigo: string, precio: number, cantidad = 1): BoletaItem {
  return calcularItem({ codigo, descripcion: codigo, cantidad, precio_con_igv: precio })
}

const sum2 = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 100) / 100

describe("aplicarDescuentoProrrateado", () => {
  it("descuento=0 es no-op (mismas líneas)", () => {
    const items = [item("A", 50)]
    const out = aplicarDescuentoProrrateado(items, 0)
    expect(out).toEqual(items)
  })

  it("descuento negativo es no-op", () => {
    const items = [item("A", 50)]
    expect(aplicarDescuentoProrrateado(items, -5)).toEqual(items)
  })

  it("1 ítem: S/50 con descuento S/45 → total 5.00 (gravada 4.24, igv 0.76)", () => {
    const out = aplicarDescuentoProrrateado([item("SPIRCRU0001", 50)], 45)
    expect(out).toHaveLength(1)
    expect(out[0].total).toBe(5)
    expect(out[0].base_imponible).toBe(4.24)
    expect(out[0].igv).toBe(0.76)
    // invariante de calcularItem
    expect(out[0].total).toBe(Math.round((out[0].base_imponible + out[0].igv) * 100) / 100)
  })

  it("multi-ítem proporcional: 50 + 30 (=80) con descuento 8 (10%) → 45 + 27 = 72", () => {
    const out = aplicarDescuentoProrrateado([item("A", 50), item("B", 30)], 8)
    expect(out[0].total).toBe(45)
    expect(out[1].total).toBe(27)
    expect(sum2(out.map((x) => x.total))).toBe(72)
  })

  it("reconcilia el residual de redondeo en la última línea (3×10, desc 10 → suma 20 exacta)", () => {
    const out = aplicarDescuentoProrrateado([item("A", 10), item("B", 10), item("C", 10)], 10)
    // netTarget = 30 - 10 = 20. ratio = 1/3. Líneas no-últimas: round2(10*2/3)=6.67.
    expect(out[0].total).toBe(6.67)
    expect(out[1].total).toBe(6.67)
    expect(out[2].total).toBe(6.66) // última absorbe el residual
    expect(sum2(out.map((x) => x.total))).toBe(20)
  })

  it("descuento >= subtotal: válvula de escape, devuelve ítems sin tocar (no boleta de 0)", () => {
    const items = [item("A", 50)]
    expect(aplicarDescuentoProrrateado(items, 50)).toEqual(items)
    expect(aplicarDescuentoProrrateado(items, 99)).toEqual(items)
  })

  it("ítems vacíos → devuelve igual", () => {
    expect(aplicarDescuentoProrrateado([], 10)).toEqual([])
  })
})
```

- [ ] **Step 2: Correr los tests para ver que fallan**

Run: `npm test -- sunat-descuento`
Expected: FAIL — `aplicarDescuentoProrrateado is not a function` / no export.

- [ ] **Step 3: Implementar la función**

En `lib/sunat/types.ts`, agregar (el `round2` privado y `calcularItem` ya existen en el archivo):

```ts
/**
 * Prorratea un descuento global (cupón) sobre las líneas de una boleta,
 * devolviendo cada ítem a su precio NETO efectivo. El total resultante es
 * `Σ(item.total) == round2(listTotal − descuento)`.
 *
 * - `descuento <= 0` → no-op (ventas sin cupón = comportamiento de hoy).
 * - `descuento >= listTotal` → válvula de escape: devuelve los ítems sin tocar
 *   (un cupón ~100% daría una boleta de total 0, inválida en SUNAT; no existe
 *   en el catálogo actual). NUNCA cae a precio de lista como caso normal.
 * - El residual de redondeo se absorbe en la última línea para cuadre exacto
 *   (exacto en líneas de cantidad=1; dentro de ~1 céntimo en multi-unidad).
 */
export function aplicarDescuentoProrrateado(
  items: BoletaItem[],
  descuento: number
): BoletaItem[] {
  if (!Array.isArray(items) || items.length === 0) return items
  if (descuento <= 0) return items

  const listTotal = round2(items.reduce((a, x) => a + x.total, 0))
  if (descuento >= listTotal) return items // válvula de escape (neto <= 0)

  const netTarget = round2(listTotal - descuento)
  const ratio = descuento / listTotal

  const result: BoletaItem[] = []
  let acumulado = 0
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    const esUltimo = i === items.length - 1
    const netLineTotal = esUltimo
      ? round2(netTarget - acumulado)
      : round2(it.total * (1 - ratio))
    if (!esUltimo) acumulado = round2(acumulado + netLineTotal)

    result.push(
      calcularItem({
        codigo: it.codigo,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        precio_con_igv: round2(netLineTotal / it.cantidad),
      })
    )
  }
  return result
}
```

- [ ] **Step 4: Correr los tests para ver que pasan**

Run: `npm test -- sunat-descuento`
Expected: PASS (7 tests verdes).

- [ ] **Step 5: Commit**

```bash
git add lib/sunat/types.ts __tests__/lib/sunat-descuento.test.ts
git commit -m "feat(boleta): aplicarDescuentoProrrateado — prorratea descuento de cupón a precio neto"
```

---

## Task 2: Cablear el descuento en `registrarYEmitirBoleta`

**Files:**
- Modify: `lib/sunat/lifecycle.ts:155-159` (select) y `lib/sunat/lifecycle.ts:195` (uso)
- Test: `__tests__/lib/sunat-descuento.test.ts` (agregar bloque de integración)

- [ ] **Step 1: Escribir el test de integración que falla**

Primero, **consolidar el import de vitest en la primera línea** del archivo (merge con el existente para no violar la regla `import/first`):

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"
```

Luego, **inmediatamente después de los imports del top** (antes del primer `describe`), agregar el mock de NubeFact (vitest hoista `vi.mock`, pero lo dejamos arriba por claridad y lint):

```ts
const emitirMock = vi.fn()
vi.mock("@/lib/sunat/nubefact", () => ({
  emitirBoletaNubefact: (...a: unknown[]) => emitirMock(...a),
  emitirNotaCreditoNubefact: vi.fn(),
}))
```

Finalmente, agregar al **final** del archivo el stub de Supabase y el bloque de integración:

```ts
// Stub mínimo y encadenable de Supabase para el camino feliz de emisión.
function makeSupabase(orden: Record<string, unknown>) {
  const captured: { boletaInsert?: Record<string, unknown> } = {}
  return {
    captured,
    from(table: string) {
      if (table === "ordenes_tienda") {
        return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: orden, error: null }) }) }),
          update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        }
      }
      if (table === "boletas") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) }) }) }),
          insert: (vals: Record<string, unknown>) => {
            captured.boletaInsert = vals
            return { select: () => ({ single: () => Promise.resolve({ data: { id: "bol-1", intentos: 0, serie: vals.serie, numero: null, ...vals }, error: null }) }) }
          },
          update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "bol-1", estado: "emitida" }, error: null }) }) }) }),
        }
      }
      if (table === "ventas") {
        return { update: () => ({ eq: () => ({ then: (res: (v: unknown) => unknown) => Promise.resolve().then(res) }) }) }
      }
      throw new Error("tabla inesperada: " + table)
    },
  }
}

describe("registrarYEmitirBoleta — descuento integrado", () => {
  beforeEach(() => {
    emitirMock.mockReset()
    emitirMock.mockResolvedValue({
      ok: true, id: "BBB1-9", serie: "BBB1", numero: 9,
      link: "http://x/pdf", hash: "h", aceptada_por_sunat: false, proveedor: "nubefact",
    })
  })

  it("orden con descuento → boleta prorrateada (total 5, no 50)", async () => {
    const { registrarYEmitirBoleta } = await import("@/lib/sunat/lifecycle")
    const orden = {
      id: "ord-1",
      estado: "pagado",
      total: 5,
      descuento: 45,
      items: [{ producto: { sku: "SPIRCRU0001", descripcion: "Spirusol crunchie", precio_publico: 55, precio_oferta: 50 }, cantidad: 1 }],
      cliente_snapshot: { nombre: "Jose", apellido: "Escalante", dni: "", email: "j@x.com", distrito: "Recojo en tienda", direccion: "Av. La Mar 750" },
    }
    const sb = makeSupabase(orden)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await registrarYEmitirBoleta("ord-1", sb as any)

    expect(res.ok).toBe(true)
    expect(emitirMock).toHaveBeenCalledTimes(1)
    const payload = emitirMock.mock.calls[0][0]
    expect(payload.total).toBe(5)
    expect(payload.total_gravada).toBe(4.24)
    expect(payload.total_igv).toBe(0.76)
    expect(payload.items[0].total).toBe(5)
    // la fila persistida también lleva el total prorrateado
    expect(sb.captured.boletaInsert?.total).toBe(5)
  })
})
```

- [ ] **Step 2: Correr el test para ver que falla**

Run: `npm test -- sunat-descuento`
Expected: FAIL — `payload.total` es `50`, no `5` (el descuento aún no se aplica).

- [ ] **Step 3: Agregar `descuento` al select de la orden**

En `lib/sunat/lifecycle.ts`, en `registrarYEmitirBoleta` (~línea 156), cambiar:

```ts
  const { data: orden, error: ordenErr } = await supabase
    .from("ordenes_tienda")
    .select("id, items, cliente_snapshot, estado, total")
    .eq("id", ordenId)
    .single()
```

por:

```ts
  const { data: orden, error: ordenErr } = await supabase
    .from("ordenes_tienda")
    .select("id, items, cliente_snapshot, estado, total, descuento")
    .eq("id", ordenId)
    .single()
```

- [ ] **Step 4: Aplicar el prorrateo al construir los ítems**

En `lib/sunat/lifecycle.ts` (~línea 195), cambiar:

```ts
  const sunatItems = itemsFromCart(items)
```

por:

```ts
  const sunatItems = aplicarDescuentoProrrateado(
    itemsFromCart(items),
    Number(orden.descuento ?? 0)
  )
```

Y agregar `aplicarDescuentoProrrateado` al import existente de `./types` (línea 30):

```ts
import { calcularItem, aplicarDescuentoProrrateado } from "./types"
```

- [ ] **Step 5: Correr el test para ver que pasa**

Run: `npm test -- sunat-descuento`
Expected: PASS (todos los tests, incluido el de integración).

- [ ] **Step 6: Commit**

```bash
git add lib/sunat/lifecycle.ts __tests__/lib/sunat-descuento.test.ts
git commit -m "fix(boleta): registrarYEmitirBoleta aplica descuento del cupón (prorrateo neto)"
```

---

## Task 3: Verificación final

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Typecheck completo**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 2: Suite de tests completa**

Run: `npm test`
Expected: toda la suite verde (sin regresiones en store-fulfillment, ruby-integration, etc.).

- [ ] **Step 3: Build de Next**

Run: `npm run build`
Expected: build exitoso.

- [ ] **Step 4: Commit de cierre (si hubo ajustes) o nada**

Si los pasos anteriores no requirieron cambios, no hay commit. Si hubo fixes, commitearlos con un mensaje descriptivo.

---

## Validación post-merge (opcional, manual)

La boleta `BBB1-8` actual es DEMO. Tras mergear, se puede disparar una emisión demo de prueba (o re-correr el smoke test de boleta) para confirmar visualmente que el PDF sale con el total prorrateado antes de que entren los tokens productivos de NubeFact.

## Fuera de alcance (deuda documentada en el spec)

- Delivery en la boleta (ventas con envío quedan cortas por el flete).
- Reconciliación del piso `MP_MIN_AMOUNT` cuando el descuento ≈ subtotal.
