-- =============================================================================
-- Organnical HealthTech — Migración 02c: Backfill de roles en JWT metadata
-- =============================================================================
-- PROPÓSITO:
--   Escribe el campo `role` en auth.users.raw_user_meta_data para todos los
--   usuarios existentes. Esto permite que el middleware de Next.js lea el rol
--   desde el JWT sin hacer queries adicionales a la base de datos.
--
-- Ejecutar DESPUÉS de 02_medical_schema.sql
-- Proyecto Supabase: jeomfjulczuimrmonmom (OrgannicalRuby compartido)
-- =============================================================================


-- =============================================================================
-- PASO 1: Admins
-- Confirmar UUIDs en: Auth > Users del dashboard de Supabase
-- =============================================================================

-- ⚠️  michel@futura-farms.com: INVITAR PRIMERO desde Auth > Users > Invite
--     Luego reemplazar <michel_uuid> con el UUID real.

INSERT INTO medical.profiles (id, role, full_name) VALUES
  ('00fa10de-4045-4310-beb5-ecd2f265ec30', 'admin', 'Jose'),
  ('b47c37f5-4312-445f-8483-cbe873b26a54', 'admin', 'Raul')
  -- ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'admin', 'Michel')  ← descomentar tras invitar
ON CONFLICT (id) DO UPDATE SET
  role      = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE id IN (
  '00fa10de-4045-4310-beb5-ecd2f265ec30',  -- jose@futura-farms.com
  'b47c37f5-4312-445f-8483-cbe873b26a54'   -- raul@futura-farms.com
  -- 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  -- michel@futura-farms.com ← descomentar tras invitar
);


-- =============================================================================
-- PASO 2: Doctores
-- ⚠️  Invitar primero desde Auth > Users > Invite:
--       - dra.poma@organnical.com  (o el email que use)
--       - dr.goodman@organnical.com
--     Luego reemplazar los UUIDs y descomentar.
-- =============================================================================

-- INSERT INTO medical.profiles (id, role, full_name, cmp) VALUES
--   ('<poma_uuid>',    'doctor', 'Dra. Estefanía Poma', '059636'),
--   ('<goodman_uuid>', 'doctor', 'Dr. Robert Goodman',  '095719')
-- ON CONFLICT (id) DO UPDATE SET
--   role      = EXCLUDED.role,
--   full_name = EXCLUDED.full_name,
--   cmp       = EXCLUDED.cmp;

-- UPDATE auth.users
--   SET raw_user_meta_data = raw_user_meta_data || '{"role": "doctor"}'::jsonb
-- WHERE id IN ('<poma_uuid>', '<goodman_uuid>');


-- =============================================================================
-- VERIFICACIÓN FINAL
-- =============================================================================

SELECT
  u.email,
  u.raw_user_meta_data->>'role' AS role_en_jwt,
  mp.role                        AS role_en_db,
  mp.full_name,
  mp.cmp
FROM auth.users u
LEFT JOIN medical.profiles mp ON mp.id = u.id
ORDER BY u.created_at DESC;
