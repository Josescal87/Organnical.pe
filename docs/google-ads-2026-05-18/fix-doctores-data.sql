-- =============================================================================
-- Fix de datos de médicos · 2026-05-18
-- =============================================================================
-- Contexto: el endpoint /api/public/doctors reveló que en producción hay:
--   1. Dra. Poma con datos incompletos (cmp="PENDIENTE", sin foto, sin specialty)
--   2. Dr. Robert Goodman NO existe en DB (solo aparece como fallback en landing)
--   3. Dr. Escalante - dummy prueba (perfil de testing) contaminando la tabla
--
-- Correr en: Supabase Dashboard → SQL Editor → New query → pegar → Run
-- Verificación: ejecutar el SELECT del final para confirmar el estado post-fix
-- =============================================================================
-- NOTA IMPORTANTE: medical.profiles.id tiene FK a auth.users.id.
-- El bloque PARTE B (Goodman) requiere crear primero su usuario en
-- Authentication → Users del dashboard. Ver instrucciones al final.
-- =============================================================================

-- =============================================================================
-- PARTE A — SEGURO (correr ahora, sin requisitos previos)
-- =============================================================================
-- Nota: NO se borra a Dr. Escalante porque tiene citas históricas (FK
-- appointments_doctor_id_fkey). Se hace soft-delete cambiando role a 'patient'
-- → desaparece de todas las queries de doctor sin romper datos históricos.
-- =============================================================================
BEGIN;

-- 1. Actualizar Dra. Estefanía Poma con datos reales
UPDATE medical.profiles
SET
  full_name        = 'Dra. Estefanía Poma',
  cmp              = '059636',
  specialty_label  = 'Médico General · Medicina Integrativa',
  photo_url        = 'https://organnical.pe/dra-poma-300x300.png'
WHERE id = '7c91ba46-c037-4178-bf69-420105883ce4';

-- 2. Soft-delete del dummy: cambiar role a 'patient' para que deje de aparecer
--    como doctor en /api/public/doctors y en el wizard. Sus citas históricas
--    quedan intactas (no rompe FK appointments_doctor_id_fkey).
UPDATE medical.profiles
SET
  role = 'patient',
  verticals = ARRAY[]::text[]
WHERE id = '018ca083-7161-43b2-b548-cc975ea1b036';

COMMIT;

-- =============================================================================
-- PARTE B — REQUIERE PASO MANUAL PREVIO
-- =============================================================================
-- ANTES de correr este INSERT:
--   1. Supabase Dashboard → Authentication → Users → botón "+ Add user"
--   2. Email: dr.goodman@organnical.com (o el real del médico)
--   3. Password: (uno fuerte, anótalo o usa "Send invitation")
--   4. Marca "Auto Confirm User" para evitar verificación de email
--   5. Crear usuario → copiar el UUID que aparece en la tabla de usuarios
--   6. Reemplazar 'PEGA_AQUI_EL_UUID_DEL_USER_NUEVO' abajo
--   7. Correr este INSERT
-- =============================================================================

INSERT INTO medical.profiles (
  id,
  full_name,
  cmp,
  specialty_label,
  photo_url,
  role,
  verticals,
  weekly_schedule,
  rating,
  reviews_count
)
VALUES (
  'PEGA_AQUI_EL_UUID_DEL_USER_NUEVO'::uuid,
  'Dr. Robert Goodman',
  '095719',
  'Médico General · Medicina Integrativa',
  'https://organnical.pe/drgodman-300x300.png',
  'doctor',
  ARRAY['pain', 'anxiety'],
  '{"1":[10,10.5,11,11.5,14,14.5,15,15.5,16,16.5],"2":[10,10.5,11,11.5,14,14.5,15,15.5,16,16.5],"3":[10,10.5,11,11.5,14,14.5,15,15.5,16,16.5],"4":[10,10.5,11,11.5,14,14.5,15,15.5,16,16.5],"5":[10,10.5,11,11.5,14,14.5,15,15.5,16,16.5]}'::jsonb,
  5,
  0
);

-- =============================================================================
-- VERIFICACIÓN — correr esta query después para confirmar el estado
-- =============================================================================
SELECT
  id,
  full_name,
  cmp,
  specialty_label,
  verticals,
  photo_url IS NOT NULL AS tiene_foto,
  jsonb_object_keys(weekly_schedule) IS NOT NULL AS tiene_horario
FROM medical.profiles
WHERE role = 'doctor'
ORDER BY full_name;
-- Esperado: 2 filas
--   Dr. Robert Goodman   | 095719 | ... | {pain,anxiety}                | true | true
--   Dra. Estefanía Poma  | 059636 | ... | {sleep,pain,anxiety,...}      | true | true
