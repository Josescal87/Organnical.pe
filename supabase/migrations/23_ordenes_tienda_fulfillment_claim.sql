-- 23: claim atómico de fulfillment para ordenes_tienda.
-- Webhook y process-payment de MP pueden dispararse a la vez para la misma
-- orden. Esta columna actúa de candado: solo el runner que la setea de NULL
-- a NOW() procede a crear la venta en Ruby + enviar el correo a coordinadores.
-- La boleta SUNAT NO usa este candado (tiene su propia idempotencia).
-- Idempotente y no-destructivo (columna nullable, sin backfill).

ALTER TABLE public.ordenes_tienda
  ADD COLUMN IF NOT EXISTS fulfillment_claimed_at TIMESTAMPTZ;
