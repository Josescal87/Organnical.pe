# Boleta refleja el descuento del cupón — Design

**Fecha:** 2026-06-02
**Estado:** Diseño aprobado (pendiente review del spec escrito)
**Autor:** Claude + Jose

## Contexto

El checkout de producto (web) emite boleta electrónica vía NubeFact dentro de
`fulfillPaidOrder` → `registrarYEmitirBoleta`. En la primera compra de prueba real
(orden `DAF569C1`, total pagado **S/ 5.00** con cupón `PRUEBA45` de −S/ 45 sobre un
ítem de S/ 50) la boleta salió por **S/ 50.00**, no por S/ 5.00.

### Causa raíz

`itemsFromCart()` en [lib/sunat/lifecycle.ts:118-128](../../../lib/sunat/lifecycle.ts#L118-L128)
arma los ítems de la boleta usando **solo el precio de lista** de cada producto
(`precio_oferta ?? precio_publico`). Los totales del comprobante
(`total_gravada / total_igv / total`, [lifecycle.ts:197-199](../../../lib/sunat/lifecycle.ts#L197-L199))
se derivan por `reduce` sobre esos ítems. En ningún punto se lee `ordenes_tienda.descuento`,
así que el descuento del cupón nunca llega a la boleta.

Es una boleta DEMO hoy (serie `BBB1`, watermark "SIN VALOR LEGAL") porque los tokens
productivos de NubeFact aún no están activos (handoff NubeFact / Nathaly). Sin valor
legal todavía, pero produciría documentos fiscales incorrectos apenas se active producción.

## Alcance

**Dentro:** que la boleta refleje el descuento del cupón, de modo que
`total_boleta == subtotal − descuento`.

**Fuera (deuda explícita, documentada abajo):**
- El **delivery** no se incluye en la boleta.
- El **piso de MercadoPago** (`MP_MIN_AMOUNT = 5`) no se reconcilia con la boleta.

## Decisión de representación

**Prorrateo de precio neto** (elegido sobre "línea de descuento global"):

- Cada ítem muestra su **precio efectivo** (lista × (1 − ratio)). No se muestra una
  línea "Descuento" separada ni el precio de lista original.
- Legalmente válido en SUNAT: el `valor_unitario` puede ser el precio efectivo cobrado;
  no hay obligación de exhibir el precio original.
- **Menor riesgo con NubeFact:** reutiliza el mismo `calcularItem` que NubeFact ya acepta
  hoy. No introduce campos nuevos (`descuento_global`) cuya semántica de recálculo de IGV
  no está verificada contra el sandbox. El bug es de montos; no queremos abrir un bug de
  rechazo SUNAT.

Alternativa descartada: **descuento global** (ítems a precio de lista + línea de descuento
a nivel documento). Más transparente para el cliente pero requiere cablear los campos
`descuento_global` de NubeFact y validar el recálculo de IGV contra el sandbox → más riesgo.

## Diseño técnico

### 1. Wiring de datos

`registrarYEmitirBoleta` ([lib/sunat/lifecycle.ts:155-159](../../../lib/sunat/lifecycle.ts#L155-L159))
agrega `descuento` a su `select` de `ordenes_tienda` (hoy: `id, items, cliente_snapshot, estado, total`).

### 2. Función pura `aplicarDescuentoProrrateado`

Nueva función en `lib/sunat/` (junto a `calcularItem` en `types.ts`, o en un módulo
hermano):

```ts
function aplicarDescuentoProrrateado(
  items: BoletaItem[],
  descuento: number
): BoletaItem[]
```

Comportamiento:

- **`descuento <= 0` → no-op:** devuelve `items` sin tocar. Garantiza que las ventas
  **sin cupón** se comporten exactamente igual que hoy.
- `listTotal = Σ(item.total)`.
- `descuentoEfectivo = min(descuento, listTotal)` (clamp; neto nunca negativo).
- `netTarget = round2(listTotal − descuentoEfectivo)`.
- **Edge degenerado `netTarget == 0`** (solo posible con un cupón 100%, que no existe en
  el catálogo actual): se loguea y se devuelve `items` **sin tocar** únicamente como
  válvula de escape para no emitir una boleta de total 0 (inválida en SUNAT). NUNCA se
  cae a precio de lista como comportamiento normal.
- `ratio = descuentoEfectivo / listTotal`.
- Para cada ítem **excepto el último**: `netLineTotal = round2(item.total × (1 − ratio))`,
  y se recalcula el ítem vía `calcularItem` con `precio_con_igv = round2(netLineTotal / cantidad)`.
- **Último ítem (reconciliación):** `netLineTotal_last = round2(netTarget − Σ(netLineTotals previos))`,
  recalculado igual. Esto garantiza `Σ(line totals) == netTarget` exacto, absorbiendo el
  residual de redondeo en la última línea.
- **Nota sobre `cantidad > 1`:** `calcularItem` fija `total = round2(precio_con_igv × cantidad)`,
  por lo que el `total` resultante de la última línea puede diferir del `netLineTotal_last`
  pre-redondeo en hasta 1 céntimo. La reconciliación debe operar sobre el `total` que
  devuelve `calcularItem` (no sobre el neto pre-redondeo): ajustar el `precio_con_igv` de la
  última línea hasta que `Σ(item.total) == netTarget`. NubeFact tolera diferencias de
  redondeo de ~1 céntimo, pero apuntamos a cuadre exacto. El plan detalla el algoritmo.

### 3. Integración

En `registrarYEmitirBoleta`, reemplazar:

```ts
const sunatItems = itemsFromCart(items)
```

por:

```ts
const sunatItems = aplicarDescuentoProrrateado(itemsFromCart(items), Number(orden.descuento ?? 0))
```

Los totales (`total_gravada / total_igv / total`) ya se derivan por `reduce` sobre
`sunatItems`, así que se corrigen automáticamente. El payload a NubeFact y la fila
persistida en `boletas` heredan los montos correctos sin más cambios.

## Objetivo del total

Boleta = `subtotal − descuento`. Coincide con lo efectivamente pagado cuando:
- no hay delivery, **y**
- el piso de MP no aplica (el caso común).

Se usa `subtotal − descuento` y **no** `orden.total` a propósito: `orden.total` incluye
delivery, y targetearlo infiltraría el costo de envío inflando el precio de los productos.

## Limitaciones conocidas (deuda explícita)

1. **Delivery fuera de la boleta.** En ventas con envío (`delivery > 0`), la boleta queda
   corta por el monto del envío. Fix gemelo (misma función / mismo módulo): incluir el
   delivery como línea gravada adicional. Diferido por decisión de alcance.
2. **Piso MercadoPago.** Si `descuento ≈ subtotal`, lo cobrado se pisa en `MP_MIN_AMOUNT`
   (S/ 5) pero la boleta reflejaría `subtotal − descuento`. Caso extremo y raro
   (requiere descuento casi total). No se reconcilia.

## Testing (TDD)

Tests unitarios de `aplicarDescuentoProrrateado` (función pura, fácil de testear):

- 1 ítem, descuento parcial → línea y total = neto exacto.
- Multi-ítem con redondeo → `Σ(line totals) == round2(subtotal − descuento)` exacto;
  el residual cae en la última línea.
- `descuento = 0` → no-op (ítems idénticos).
- `descuento >= subtotal` → clamp, neto ≥ 0.
- Coherencia `total == base_imponible + igv` por ítem (invariante de `calcularItem`).

Más un test de integración de `registrarYEmitirBoleta` (siguiendo el patrón de
`__tests__/lib/store-fulfillment.test.ts`) que verifique que una orden con `descuento`
produce un payload/fila con total prorrateado.

## Sin backfill

La boleta `BBB1-8` actual es DEMO (sin valor legal) → no se re-emite. Validación opcional
post-merge: disparar una emisión demo de prueba para confirmar visualmente el total
prorrateado antes de que entren los tokens productivos.

## Archivos afectados

- `lib/sunat/lifecycle.ts` — select `descuento` + llamada a la nueva función.
- `lib/sunat/types.ts` (o módulo hermano en `lib/sunat/`) — `aplicarDescuentoProrrateado`.
- `__tests__/lib/sunat/*` — tests de la función pura + integración.
