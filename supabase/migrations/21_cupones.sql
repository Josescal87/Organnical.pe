-- 21_cupones.sql
-- Tabla de cupones/códigos de descuento para la tienda

CREATE TABLE IF NOT EXISTS public.cupones (
  id              uuid            DEFAULT gen_random_uuid() PRIMARY KEY,
  code            text            NOT NULL,
  descripcion     text,
  tipo            text            NOT NULL CHECK (tipo IN ('porcentaje', 'monto_fijo')),
  valor           numeric(10,2)   NOT NULL CHECK (valor > 0),
  monto_minimo    numeric(10,2)   NOT NULL DEFAULT 0,
  activo          boolean         NOT NULL DEFAULT true,
  fecha_inicio    timestamptz,
  fecha_fin       timestamptz,
  uso_maximo      integer         CHECK (uso_maximo > 0),
  usos_actuales   integer         NOT NULL DEFAULT 0 CHECK (usos_actuales >= 0),
  created_at      timestamptz     NOT NULL DEFAULT now()
);

-- Índice único case-insensitive (los códigos se guardan tal como se insertan
-- pero se buscan siempre en mayúsculas desde el código)
CREATE UNIQUE INDEX IF NOT EXISTS cupones_code_upper_idx ON public.cupones (UPPER(code));

-- Habilitar RLS (el backend usa service role que lo bypass)
ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;

-- Agregar columnas de cupón a ordenes_tienda
ALTER TABLE public.ordenes_tienda
  ADD COLUMN IF NOT EXISTS cupon_codigo text,
  ADD COLUMN IF NOT EXISTS descuento    numeric(10,2) NOT NULL DEFAULT 0;

-- Función atómica para incrementar uso al confirmar pago
CREATE OR REPLACE FUNCTION public.increment_cupon_uso(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.cupones
  SET usos_actuales = usos_actuales + 1
  WHERE UPPER(code) = UPPER(p_code);
END;
$$;

-- Ejemplo: INSERT INTO public.cupones (code, descripcion, tipo, valor, monto_minimo)
-- VALUES ('BIENVENIDO10', '10% de descuento en tu primera compra', 'porcentaje', 10, 50);
