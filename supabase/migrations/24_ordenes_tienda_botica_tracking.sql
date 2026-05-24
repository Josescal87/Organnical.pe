-- 24_ordenes_tienda_botica_tracking.sql
-- Agrega tracking de tipo de orden + receta asociada (cuando aplica).
--
-- Hoy todas las órdenes son "tienda" — el flujo de botica usa WhatsApp y no
-- crea filas. Estas columnas dejan el schema listo para cuando se implemente
-- checkout de botica vía MercadoPago, o para que el admin/Ruby marque
-- manualmente las órdenes que llegaron por botica.

ALTER TABLE public.ordenes_tienda
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'tienda'
    CHECK (tipo IN ('tienda', 'botica'));

ALTER TABLE public.ordenes_tienda
  ADD COLUMN IF NOT EXISTS receta_id uuid REFERENCES medical.prescriptions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.ordenes_tienda.tipo IS
  'Origen de la orden: tienda (catálogo público) | botica (despachada con receta médica)';

COMMENT ON COLUMN public.ordenes_tienda.receta_id IS
  'Receta médica asociada cuando tipo=botica. NULL para órdenes de tienda regular.';

-- Constraint: receta_id debe estar presente sii tipo=botica
-- (Postgres no soporta ADD CONSTRAINT IF NOT EXISTS — usar DO block.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ordenes_tienda_botica_requires_receta'
  ) THEN
    ALTER TABLE public.ordenes_tienda
      ADD CONSTRAINT ordenes_tienda_botica_requires_receta
      CHECK (
        (tipo = 'botica' AND receta_id IS NOT NULL) OR
        (tipo = 'tienda' AND receta_id IS NULL)
      );
  END IF;
END $$;

-- Índice para filtrar órdenes por receta (útil para auditoría: "qué órdenes
-- consumieron esta receta")
CREATE INDEX IF NOT EXISTS ordenes_tienda_receta_idx
  ON public.ordenes_tienda (receta_id)
  WHERE receta_id IS NOT NULL;
