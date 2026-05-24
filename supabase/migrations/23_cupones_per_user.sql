-- 23_cupones_per_user.sql
-- Enforce "una vez por email" en cupones tipo BIENVENIDO.
--
-- Agrega `uso_maximo_por_usuario` (NULL = ilimitado, 1 = una sola vez por email).
-- La validación cuenta órdenes pagadas en `ordenes_tienda` con el mismo
-- `cupon_codigo` y mismo `cliente_snapshot->>'email'` (case-insensitive).

ALTER TABLE public.cupones
  ADD COLUMN IF NOT EXISTS uso_maximo_por_usuario integer
  CHECK (uso_maximo_por_usuario IS NULL OR uso_maximo_por_usuario > 0);

COMMENT ON COLUMN public.cupones.uso_maximo_por_usuario IS
  'Veces que el mismo email (en cliente_snapshot) puede usar este cupón. NULL = ilimitado.';

-- Marcar BIENVENIDO10 como one-time-per-email
UPDATE public.cupones
SET uso_maximo_por_usuario = 1
WHERE UPPER(code) = 'BIENVENIDO10';

-- Índice para hacer el lookup de uso por email rápido.
-- Hace falta cuando la tabla crezca; cliente_snapshot es jsonb.
CREATE INDEX IF NOT EXISTS ordenes_tienda_cupon_email_idx
  ON public.ordenes_tienda (cupon_codigo, ((cliente_snapshot->>'email')))
  WHERE cupon_codigo IS NOT NULL;
