# Spirusol — CAPI server-side (postpuesto)

Estado: **pendiente para próxima semana del 2026-05-22**.
Decisión: postponer todo Paso 4 hasta tener el token de Meta — sin el token no se
puede probar end-to-end y dejar código a medias es peor que no tenerlo.

## Inputs que necesito antes de codear

| Env var | Dónde se obtiene | Notas |
|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Events Manager → Settings → tu Pixel | Hoy NO está configurado en `.env.local`, por lo que ni el browser Pixel está activo. Sin esto, ningún evento se dispara. |
| `META_ACCESS_TOKEN` | Business Settings → System Users → "Generate New Token" → permiso `ads_management` | **System User Token permanente**, no el temporal de 24h del dashboard. |
| `META_TEST_EVENT_CODE` | Events Manager → Test Events → copy del código tipo `TEST12345` | Solo en `.env.local`, nunca en `.env.production`. Para validar deduplicación browser↔CAPI. |

## Decisiones ya tomadas con el usuario (2026-05-22)

- ✅ OK para agregar columna `tracking_data jsonb` nullable a `ordenes_tienda`.
- ✅ OK para tocar `/api/mercadopago/webhook/route.ts` y sumar llamada CAPI al final.
- ✅ Webhook vivo del ecommerce confirmado: `/api/mercadopago/webhook` (no `/api/mp/webhook`).

## Plan de implementación (cuando se reanude)

### 1. Migración SQL `23_capi_tracking.sql`
```sql
ALTER TABLE public.ordenes_tienda
  ADD COLUMN IF NOT EXISTS tracking_data jsonb;
-- Cero default, cero NOT NULL. Backward-compatible con todas las inserts existentes.
```

### 2. `lib/meta/capi.ts` — helper CAPI
- `sendCAPIEvent(event)` — fire-and-forget, nunca throw, log error a Sentry.
- `hashData(value)` — SHA-256 con normalización (lowercase + trim para email; E.164 sin `+` para phone).
- Construir payload con `event_id` idéntico al del browser Pixel.

### 3. `lib/analytics.ts` — ya está listo
- El browser Pixel ya envía `eventID: purchase_${transactionId}` (línea ~155).
- El server CAPI debe usar el mismo string `purchase_${orderId}`.

### 4. Capturar `fbp` + `fbc` + IP + UA al iniciar checkout
- Endpoint candidato: el que crea `ordenes_tienda` (verificar — probablemente `/api/mercadopago/create-preference`).
- Leer cookies `_fbp` y `_fbc` desde el request.
- Guardar junto al insert de `ordenes_tienda.tracking_data`.

### 5. `/api/mercadopago/webhook/route.ts` — sumar CAPI al final
- Después de `sendAdminSaleNotification`, lookup de `ordenes_tienda` por `mp_payment_id`.
- Si encontrada y `estado='pagado'`: `void sendCAPIEvent("Purchase", { ... content_brand: marca_slug ... })`.
- Lookup de `marca_slug` derivada del primer item (o del más representativo). Si la orden tiene productos de varias marcas, omitir `content_brand` a nivel de evento (queda en `contents[].brand`).

### 6. Testing con Meta Test Events
1. Setear `META_TEST_EVENT_CODE=TESTxxxxx` en `.env.local`.
2. Compra de prueba `https://organnical.pe/tienda?marca=spirusol` (o con `?test=1` para usar producto de S/1).
3. Events Manager → Test Events: confirmar que aparece "Purchase (Received and Deduplicated)" con `content_brand=spirusol`.
4. Quitar `META_TEST_EVENT_CODE` antes de hacer push a prod.

### 7. Custom Conversion en Ads Manager
- Crear Custom Conversion filtrando `content_brand=spirusol`.
- Eso permite medir ROAS de campañas Spirusol sin contaminar Yumi Gumi.

## Estimación

~2 h de coding una vez tengamos los 3 env vars + acceso a Meta Test Events para validar.

## Archivos a tocar

- [supabase/migrations/23_capi_tracking.sql](../supabase/migrations/23_capi_tracking.sql) — NUEVO
- [lib/meta/capi.ts](../lib/meta/capi.ts) — NUEVO
- [app/api/mercadopago/create-preference/route.ts](../app/api/mercadopago/create-preference/route.ts) — MODIFY (capturar fbp/fbc)
- [app/api/mercadopago/webhook/route.ts](../app/api/mercadopago/webhook/route.ts) — MODIFY (llamar CAPI al final)
- [.env.local](../.env.local) — agregar 3 vars

## Lo que SÍ ya está listo (sesión 2026-05-22)

- Browser Pixel con `content_brand` en `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase` (todos los handlers de `lib/analytics.ts`).
- `eventID: purchase_${orderId}` en el Pixel browser para que dedupe contra CAPI cuando se sume.
- `/api/ordenes/[id]/route.ts` enriquece items con `marca.slug` desde la BD.
- `lib/analytics.ts` documenta el plan en un comentario TODO.
