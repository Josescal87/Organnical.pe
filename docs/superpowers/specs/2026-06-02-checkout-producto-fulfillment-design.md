# Fulfillment de venta de producto (checkout web) — Diseño

**Fecha:** 2026-06-02
**Autor:** Claude + José (Organnical)
**Estado:** Diseño aprobado — pendiente escribir plan de implementación

---

## Problema

El checkout de producto de la tienda web (`organnical.pe`) **nunca ha funcionado end-to-end**. No es una regresión: la migración `20260508_p0_4_ordenes_tienda_id_venta_ruby_uuid.sql` documenta que al 2026-05-08 `id_venta_ruby` estaba 100% NULL en producción — ningún pago vía tienda web se completó jamás.

El checkout vivo usa el árbol `app/api/mp/*` (confirmado en `app/checkout/page.tsx:268` → `POST /api/mp/create-preference`). En ese camino vivo, las tres acciones post-pago están rotas o ausentes:

| Pieza | Estado actual en `mp/*` |
|---|---|
| Emitir boleta SUNAT | Roto: `createVentaAndDespacho` hacía `throw` cuando la RPC inexistente `crear_venta_y_despacho` fallaba, cortando antes de `registrarYEmitirBoleta`. |
| Registrar la venta en Ruby | Roto: la RPC `crear_venta_y_despacho` no existe en ningún repo ni en la DB. |
| Avisar a admins para despachar | Ausente: el correo (`sendAdminSaleNotification`) solo se llama en el árbol legacy `app/api/mercadopago/*`, que **no** está conectado al checkout de producto. |

Consecuencia si se encienden los ads de producto + NubeFact producción tal cual: la primera venta real no emite boleta, no llega a Ruby y no avisa a nadie.

## Contexto arquitectónico

- **Ruby y el store comparten la misma base de datos Supabase.** Ruby (`ruby.organnical.pe`) es el sistema operativo interno; el store escribe en `ordenes_tienda`, Ruby opera sobre la tabla `ventas`.
- **Diseño previsto original:** orden pagada → crear fila(s) en `ventas` → guardar la referencia en `ordenes_tienda.id_venta_ruby`.
- **`ventas` es una fila por producto**, agrupadas por `num_orden`. Forma inferida de `supabase/functions/kommo-parser-ruby/index.ts` (insert real en producción): `num_orden, nombre, apellido, dni, celular, farmacia, item, unidades, fecha_compra, fecha_entrega, distrito, direccion, precio_item, precio_delivery, total, metodo_pago, comentarios, tipo_cliente, campana, vendedor, link_comprobante, hash_comprobante`.
- **Dos árboles de pago paralelos:** `mp/*` (store de producto, vivo) y `mercadopago/*` (citas: `process-appointment`/`process-express`/`confirm-express`, **vivo** — por eso los admins reciben el 🗓). El árbol `mercadopago/*` también tiene ramas "product" duplicadas que NO están conectadas al checkout.

## Objetivo (v1)

Que una venta de producto pagada por MercadoPago:
1. **Emita su boleta SUNAT** (obligación fiscal).
2. **Se registre en Ruby** (`ventas`) para que aparezca en la lista operativa.
3. **Notifique a los 3 coordinadores** (jose, raul, michel @futura-farms.com) para coordinar el despacho **manual**.

Decisión de scope (confirmada con el usuario): **solo registrar la venta**. El correo es la señal de despacho. Sin descuento de inventario ni registro de despacho/tracking en v1.

## No-objetivos (YAGNI)

- Descuento automático de inventario.
- Registro de despacho/entrega con tracking.
- Fusionar o borrar el árbol legacy `app/api/mercadopago/*` completo (las **citas** viven ahí: `process-appointment`/`process-express`/`confirm-express`; borrarlo las rompe). Es un proyecto aparte; aquí solo se marca como deuda técnica y no se agrega lógica nueva de producto ahí. **PERO sí entra en v1** neutralizar la rama de **producto** del legacy (`mercadopago/webhook` + `mercadopago/process-payment`, parte `saleType:"product"`): si en el panel de MP quedó un webhook global → `/api/mercadopago/webhook`, esa rama llamaría `sendAdminSaleNotification` con `getAdminEmails()` (lista vieja) → correos duplicados y a destinatarios distintos. v1 hace que esa rama de producto sea no-op (early return) para evitar doble-disparo, independientemente de que el usuario borre o no el webhook fantasma.
- Recrear la RPC `crear_venta_y_despacho` en Postgres.

## Enfoque elegido

**Insertar la venta desde el código del store (TypeScript), no vía RPC.** Reescribir `createVentaAndDespacho` para insertar filas en `ventas` directamente con el cliente admin (service role), replicando el patrón ya probado de `kommo-parser-ruby`.

Razón: precedente idéntico funcionando, todo en un repo (testeable con el setup de `__tests__/`), sin migración SQL cruzada entre repos. El scope "solo registrar" no necesita la atomicidad de una RPC.

Alternativa descartada: RPC plpgsql en la DB de Ruby (más "puro" y `num_orden` atómico vía secuencia, pero SQL cross-repo, más difícil de testear, overkill para el scope).

## Arquitectura

### Corazón: `fulfillPaidOrder(ordenId)` — idempotente

Una sola función que ejecuta las 3 acciones post-pago, en orden, cada una **no-fatal** respecto a las otras:

```
fulfillPaidOrder(ordenId):
  1. Emitir boleta SUNAT (registrarYEmitirBoleta). Idempotencia propia del
     lifecycle SUNAT (boleta_id en la orden + cron de reintento). Falla → log, sigue.
  2. Claim atómico SOLO de venta+correo (ver Idempotencia). Si no se gana → return.
  3. Insertar venta(s) en `ventas`; guardar referencia en id_venta_ruby.
  4. Enviar correo a coordinadores (con dirección/distrito/celular + num_orden). Falla → log.
```

**Por qué la boleta queda FUERA del claim:** la emisión SUNAT ya es idempotente por su propio lifecycle (no re-emite si ya hay `boleta_id`; el cron reintenta las fallidas). Si la metiéramos bajo el mismo candado que venta+correo, un fallo al insertar la venta dejaría el candado tomado y el reintento del webhook de MP **no volvería a intentar la boleta**. Por eso se dispara aparte; el claim gobierna únicamente venta + correo.

Ambos puntos de entrada del camino vivo — `app/api/mp/webhook/route.ts` y `app/api/mp/process-payment/route.ts` — solo llaman `fulfillPaidOrder(ordenId)`. No duplican lógica.

**Desacople deliberado:** boleta (fiscal) y venta (operativa) son independientes. Un fallo operativo nunca debe impedir la emisión del comprobante legal, ni viceversa.

### Idempotencia (atómica) — solo venta + correo

La boleta NO entra aquí (tiene su propia idempotencia; ver arriba). Este claim protege **venta + correo**.

Webhook y process-payment pueden dispararse casi simultáneamente para la misma orden. Un chequeo `if id_venta_ruby == null` NO es atómico (ambos leen null, ambos insertan → venta duplicada + correo doble).

Mecanismo: **claim por UPDATE condicional** sobre una columna candado dedicada (p.ej. `fulfillment_claimed_at`):

```sql
UPDATE ordenes_tienda
SET fulfillment_claimed_at = NOW()
WHERE id = :ordenId AND fulfillment_claimed_at IS NULL
```

Solo si ese UPDATE afectó 1 fila, se procede a insertar venta + enviar correo. (Columna exacta y su tipo se confirman en paso 0; preferencia: columna dedicada, no reusar `estado`/`id_venta_ruby`, porque venta y correo deben quedar bajo el mismo candado y `id_venta_ruby` recién existe tras insertar la venta.)

**Tradeoff conocido (aceptable en v1):** si tras ganar el claim falla la inserción de la venta, el candado queda tomado y el reintento del webhook no reprocesa venta+correo → requiere atención manual. A volumen v1 es aceptable; si más adelante duele, se mueve a idempotencia por-paso. La boleta NO sufre esto (su lifecycle reintenta aparte).

### Notificación a coordinadores (lista explícita)

NO usar `getAdminEmails()` (lee `medical.profiles role='admin'`; mezcla "admin del sistema" con "coordinador de despacho", y cambia en silencio si alguien cambia de rol).

En su lugar: **lista explícita configurable** de destinatarios de notificación de venta de producto. Default: `jose`, `raul`, `michel` @futura-farms.com (Michel Llontop, socio — persona distinta del paciente "Mitchel Sztrancman" del repo). Fuente a decidir en el plan: env var (`STORE_SALE_NOTIFY_EMAILS`) vs. tabla `app_config` (Ruby la creó el 2026-06-02 en `20260602_app_config.sql`). Preferencia inicial: env var por simplicidad; evaluar `app_config` si se quiere editable sin deploy.

El correo se basa en `sendAdminSaleNotification({ saleType: "product" })` de `lib/emails.ts`, pero la plantilla actual se diseñó para **citas** (muestra paciente, items, total, método de pago) y **no incluye datos de envío**. Para venta de producto es **requisito** (no "ideal") que el correo lleve: **dirección, distrito y celular del cliente**, más `num_orden` de Ruby y link de boleta. Sin esos campos el correo llega pero no sirve para coordinar el despacho. El plan debe extender la plantilla/variante de producto para incluirlos.

### Datos de la venta (mapeo orden → `ventas`)

Por cada item del carrito (`ordenes_tienda.items`), una fila en `ventas`:
- `item` = descripción del producto, `unidades` = cantidad, `precio_item` = precio unitario.
- `precio_delivery` = `ordenes_tienda.delivery` (solo en la primera fila; resto 0, para no duplicar el total).
- Cliente: de `cliente_snapshot` (`nombre`, `apellido`, `dni`, `celular`) + `direccion`/`distrito` de `direccion`.
- `metodo_pago` = `"MercadoPago (web)"`, `vendedor` = `"Tienda Web"`, `tipo_cliente` = default, `fecha_compra` = hoy.
- `num_orden` compartido entre las filas de la orden (mecanismo a confirmar en paso 0).
- `link_comprobante` = link de la boleta si ya se emitió.

Tras insertar, guardar la referencia de Ruby en `ordenes_tienda.id_venta_ruby` (tipo/valor a confirmar en paso 0: UUID del PK de `ventas` vs. `num_orden`).

**Estado de la orden en v1:** tras el fulfillment, `ordenes_tienda.estado` se queda en `pagado`. El equipo lo mueve a `en_despacho`/`entregado` manualmente desde Ruby (el correo es la señal de arranque). El fulfillment no toca `estado`.

## Supersesión del parche previo

El parche aplicado en sesión (`lib/ruby-integration.ts`: `throw` → `console.warn`) queda **reemplazado** por el rewrite de `createVentaAndDespacho` (ya no llama una RPC inexistente). No dejar el parche huérfano.

## Manejo de errores

- Cada paso de `fulfillPaidOrder` es try/catch independiente con log claro; ninguno tumba al pago ni a los otros pasos.
- El pago ya está confirmado y la orden marcada `pagado` antes de `fulfillPaidOrder`; el fulfillment es un efecto posterior.
- El cron existente `app/api/admin/cron/retry-boletas` reintenta boletas pendientes/rechazadas (no cambia).

## Testing

- Unit test de `fulfillPaidOrder` con mocks de Supabase + `lib/emails` + `lib/sunat`: verifica (a) las 3 acciones se invocan, (b) idempotencia — segunda llamada no reinserta ni reenvía, (c) un fallo en una acción no impide las otras.
- Test del mapeo orden → filas `ventas` (N items → N filas, total/delivery correctos).
- Reusar el patrón de mocks de `__tests__/api/appointments.test.ts`.
- Smoke test manual (e2e local): script que llama `fulfillPaidOrder(ordenId)` directo sobre una orden de prueba (estilo `scripts/smoke-test-boleta.ts`), sin necesidad de reactivar `PAYMENT_BYPASS` ni pasar por MercadoPago → verificar fila(s) en `ventas`, correo a los 3, y (con tokens prod de NubeFact) boleta en SUNAT.

## VERIFICAR PRIMERO (paso 0 del plan — introspección de la DB viva)

Estos no cambian el diseño, pero deben confirmarse contra la base de datos real antes de escribir código:

1. **Esquema exacto de `ventas`**: columnas, NOT NULL, y especialmente el **PK** — ¿UUID propio o `num_orden`? Define qué se guarda en `ordenes_tienda.id_venta_ruby` (es UUID por P0-4).
2. **Generación de `num_orden`**: ¿`max+1` (como `kommo-parser`) o secuencia (`20260512_p0_5_ventas_num_orden_sequence.sql`)? Usar el mismo mecanismo vivo para no colisionar con las ventas manuales de Ruby.
3. **Webhook de MP**: ✅ verificado en código (2026-06-02) — `lib/mercadopago.ts` setea `notification_url = ${siteUrl}/api/mp/webhook` en Checkout Pro y Brick; token `APP_USR-` (producción). **Residual (panel MP, lado usuario):** confirmar que no exista un webhook global viejo apuntando a `/api/mercadopago/webhook` (legacy) que cause avisos duplicados.

## Dependencia externa

El smoke test con **boleta real** requiere los tokens de producción de NubeFact (pendientes de Nathaly / pase a producción). Venta + correo se pueden probar independientemente desde ya.
