-- Fix: grants + check constraint + columnas faltantes para express_consultations
-- El GRANT ALL ON ALL TABLES de 02_medical_schema.sql no aplica a tablas creadas después.

-- 1. Permisos
GRANT ALL ON medical.express_consultations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON medical.express_consultations TO authenticated;

-- 2. Check constraint: agregar 'pending' (el flujo Checkout Pro crea en pending, luego pasa a paid)
ALTER TABLE medical.express_consultations
  DROP CONSTRAINT IF EXISTS express_consultations_status_check;

ALTER TABLE medical.express_consultations
  ADD CONSTRAINT express_consultations_status_check
  CHECK (status IN ('pending', 'paid', 'contacted', 'completed', 'refunded', 'cancelled'));

-- Cambiar default a 'pending' (más correcto para el flujo de creación)
ALTER TABLE medical.express_consultations
  ALTER COLUMN status SET DEFAULT 'pending';

-- 3. Columna coupon_code (referenciada en la ruta pero faltaba en el schema)
ALTER TABLE medical.express_consultations
  ADD COLUMN IF NOT EXISTS coupon_code text;
