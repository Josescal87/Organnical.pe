-- =============================================================================
-- Organnical HealthTech — Migración 02b: Migración de datos
-- =============================================================================
-- PROPÓSITO:
--   Migra datos existentes de las tablas public.* → medical.*
--   Ejecutar DESPUÉS de 02_medical_schema.sql y ANTES de 02c_backfill_roles.sql
--
-- IMPORTANTE: Ejecutar en Supabase SQL Editor con permisos de service_role.
--   Esta migración es idempotente (ON CONFLICT DO NOTHING).
-- =============================================================================


-- =============================================================================
-- 3A: public.profiles → medical.profiles
-- =============================================================================

INSERT INTO medical.profiles (id, role, full_name, document_id, phone, cmp, created_at, updated_at)
SELECT
  id,
  role::text::medical.user_role,
  full_name,
  document_id,
  phone,
  cmp,
  created_at,
  updated_at
FROM public.profiles
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 3B: public.appointments → medical.appointments
-- TRANSFORMACIONES:
--   - vertical       → specialty   (cast de enum)
--   - scheduled_at   → slot_start  (renombre)
--   - slot_end       = slot_start + 1 hora (duración estándar de consulta)
-- =============================================================================

INSERT INTO medical.appointments (
  id, patient_id, doctor_id,
  slot_start, slot_end,
  status, specialty,
  meeting_link, clinical_notes,
  created_at, updated_at
)
SELECT
  id,
  patient_id,
  doctor_id,
  scheduled_at                       AS slot_start,
  scheduled_at + INTERVAL '1 hour'   AS slot_end,
  status::text::medical.appointment_status,
  vertical::text::medical.appointment_specialty,
  meeting_link,
  clinical_notes,
  created_at,
  updated_at
FROM public.appointments
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 3C: public.prescriptions → medical.prescriptions
-- =============================================================================

INSERT INTO medical.prescriptions (
  id, appointment_id, doctor_id, patient_id,
  issued_at, valid_until, pdf_url,
  created_at, updated_at
)
SELECT
  id, appointment_id, doctor_id, patient_id,
  issued_at, valid_until, pdf_url,
  created_at, updated_at
FROM public.prescriptions
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 3D: public.prescription_items → medical.prescription_items
-- TRANSFORMACIÓN CRÍTICA:
--   - product_id (UUID → public.products)  →  producto_sku (TEXT → public.productos.sku)
--   - Requiere join por nombre normalizado entre public.products y public.productos
-- =============================================================================

-- PASO PREVIO: Verificar qué items NO tienen match por nombre en public.productos.
-- Revisar estos registros manualmente antes de la inserción:
DO $$
DECLARE
  unmatched_count INT;
BEGIN
  SELECT COUNT(*) INTO unmatched_count
  FROM public.prescription_items pi
  JOIN public.products p ON p.id = pi.product_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.productos pr
    WHERE LOWER(TRIM(pr.descripcion)) = LOWER(TRIM(p.name))
  );

  IF unmatched_count > 0 THEN
    RAISE NOTICE '⚠️  % items de receta sin match en public.productos. Revisar manualmente.', unmatched_count;
  ELSE
    RAISE NOTICE '✅ Todos los items tienen match en public.productos.';
  END IF;
END $$;

-- Ver detalle de items sin match (ejecutar manualmente para revisión):
-- SELECT pi.id, p.name AS nombre_en_products, p.id AS product_uuid
-- FROM public.prescription_items pi
-- JOIN public.products p ON p.id = pi.product_id
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.productos pr
--   WHERE LOWER(TRIM(pr.descripcion)) = LOWER(TRIM(p.name))
-- );

-- Insertar los items con match por nombre normalizado:
INSERT INTO medical.prescription_items (
  id, prescription_id, producto_sku,
  dosage_instructions, quantity, created_at
)
SELECT
  pi.id,
  pi.prescription_id,
  pr.sku                AS producto_sku,
  pi.dosage_instructions,
  pi.quantity,
  pi.created_at
FROM public.prescription_items pi
JOIN public.products    p  ON p.id = pi.product_id
JOIN public.productos   pr ON LOWER(TRIM(pr.descripcion)) = LOWER(TRIM(p.name))
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- Verificación de resultados
-- =============================================================================

SELECT
  (SELECT COUNT(*) FROM public.profiles)           AS public_profiles,
  (SELECT COUNT(*) FROM medical.profiles)           AS medical_profiles,
  (SELECT COUNT(*) FROM public.appointments)        AS public_appointments,
  (SELECT COUNT(*) FROM medical.appointments)       AS medical_appointments,
  (SELECT COUNT(*) FROM public.prescriptions)       AS public_prescriptions,
  (SELECT COUNT(*) FROM medical.prescriptions)      AS medical_prescriptions,
  (SELECT COUNT(*) FROM public.prescription_items)  AS public_prescription_items,
  (SELECT COUNT(*) FROM medical.prescription_items) AS medical_prescription_items;
