-- =============================================================================
-- Organnical HealthTech — Migración 03: EHR Foundations
-- =============================================================================
-- PROPÓSITO:
--   Agrega la infraestructura base del EHR certificable (SUSALUD IPRESS I-1/I-2):
--     - medical.patient_records   → Número de historia clínica único por paciente
--     - medical.audit_log         → Trail de auditoría inmutable (RM 164-2025/MINSA)
--     - medical.system_config     → Configuración IPRESS (código, nombre, RUC, etc.)
--     - Campos demográficos en medical.profiles (birth_date, gender, blood_type, rne)
--
-- PREREQUISITOS:
--   Haber ejecutado 01_init_schema.sql y 02_medical_schema.sql
--
-- DESPUÉS DE ESTE SCRIPT:
--   1. En Supabase Dashboard → Table Editor → Ejecutar seed de system_config con datos IPRESS
--   2. Ejecutar el backfill (sección final) para asignar HC a pacientes existentes
-- =============================================================================


-- =============================================================================
-- SECCIÓN 1: Secuencia para números de historia clínica
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS medical.hc_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

GRANT USAGE ON SEQUENCE medical.hc_seq TO service_role;


-- =============================================================================
-- SECCIÓN 2: medical.system_config
-- Configuración global de la IPRESS. Clave-valor.
-- Registros esperados: ipress_code, ipress_name, ipress_ruc, ipress_address,
--                      ipress_category (I-1 | I-2), pdf_header_logo_url
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical.system_config (
  key        text        NOT NULL,
  value      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT medical_system_config_pkey PRIMARY KEY (key)
);

COMMENT ON TABLE medical.system_config IS
  'Configuración global de la IPRESS. Cargada por el administrador del sistema.';

-- Datos iniciales — reemplazar con valores reales antes de producción
INSERT INTO medical.system_config (key, value) VALUES
  ('ipress_code',         'PENDIENTE'),
  ('ipress_name',         'Organnical Salud S.A.C.'),
  ('ipress_ruc',          'PENDIENTE'),
  ('ipress_address',      'PENDIENTE'),
  ('ipress_category',     'I-2'),
  ('pdf_header_logo_url', '/logo-organnical.png')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- SECCIÓN 3: medical.patient_records
-- Número de historia clínica único por paciente.
-- Se asigna automáticamente al crear el perfil de paciente.
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical.patient_records (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  patient_id   uuid        NOT NULL REFERENCES medical.profiles(id) ON DELETE CASCADE,
  hc_number    text        NOT NULL,
  ipress_code  text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT medical_patient_records_pkey       PRIMARY KEY (id),
  CONSTRAINT medical_patient_records_patient_uq UNIQUE (patient_id),
  CONSTRAINT medical_patient_records_hc_uq      UNIQUE (hc_number)
);

COMMENT ON TABLE medical.patient_records IS
  'Número de historia clínica único por paciente. Asignado automáticamente al crear perfil.';
COMMENT ON COLUMN medical.patient_records.hc_number IS
  'Formato: HC-{AÑO}-{secuencia_6_dígitos}. Ejemplo: HC-2025-000042';


-- =============================================================================
-- SECCIÓN 4: medical.audit_log
-- Trail de auditoría inmutable. Solo INSERT está permitido.
-- Cumplimiento: RM 164-2025/MINSA (requisito de seguridad y trazabilidad).
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical.audit_log (
  id            bigserial   NOT NULL,
  event_time    timestamptz NOT NULL DEFAULT now(),
  actor_id      uuid,
  actor_role    text,
  actor_ip      inet,
  action        text        NOT NULL,  -- view|create|update|sign|download|delete
  resource_type text        NOT NULL,  -- encounter|prescription|patient_record|background|consent
  resource_id   text        NOT NULL,
  patient_id    uuid,
  metadata      jsonb,
  session_id    text,

  CONSTRAINT medical_audit_log_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE medical.audit_log IS
  'Trail de auditoría inmutable. Solo INSERT permitido. RM 164-2025/MINSA.';
COMMENT ON COLUMN medical.audit_log.action IS
  'Acción realizada: view|create|update|sign|download|delete';
COMMENT ON COLUMN medical.audit_log.resource_type IS
  'Tipo de recurso afectado: encounter|prescription|patient_record|background|consent';


-- =============================================================================
-- SECCIÓN 5: Función helper medical.log_event()
-- Inserción segura en audit_log. SECURITY DEFINER para capturar datos del
-- contexto de autenticación sin que el caller pueda manipularlos.
-- =============================================================================

CREATE OR REPLACE FUNCTION medical.log_event(
  p_action        text,
  p_resource_type text,
  p_resource_id   text,
  p_patient_id    uuid    DEFAULT NULL,
  p_metadata      jsonb   DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = medical, public
AS $$
BEGIN
  INSERT INTO medical.audit_log (
    actor_id, actor_role, actor_ip,
    action, resource_type, resource_id, patient_id, metadata
  ) VALUES (
    auth.uid(),
    (SELECT "role"::text FROM medical.profiles WHERE id = auth.uid()),
    inet_client_addr(),
    p_action, p_resource_type, p_resource_id, p_patient_id, p_metadata
  );
END;
$$;

COMMENT ON FUNCTION medical.log_event IS
  'Inserta un evento en audit_log capturando automáticamente actor, rol e IP del contexto de auth.';

GRANT EXECUTE ON FUNCTION medical.log_event(text, text, text, uuid, jsonb) TO authenticated, service_role;


-- =============================================================================
-- SECCIÓN 6: Función medical.assign_hc_number()
-- Trigger que asigna número de HC al crear un perfil de paciente.
-- Se encadena con handle_new_user() que ya crea el perfil.
-- =============================================================================

CREATE OR REPLACE FUNCTION medical.assign_hc_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = medical, public
AS $$
BEGIN
  IF NEW."role"::text = 'patient' THEN
    INSERT INTO medical.patient_records (patient_id, hc_number, ipress_code)
    VALUES (
      NEW.id,
      'HC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('medical.hc_seq')::text, 6, '0'),
      COALESCE(
        (SELECT value FROM medical.system_config WHERE key = 'ipress_code'),
        'PENDIENTE'
      )
    )
    ON CONFLICT (patient_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION medical.assign_hc_number() IS
  'Asigna automáticamente un número de HC al crear un perfil de paciente.';

-- Trigger en medical.profiles (AFTER INSERT, para tener el id disponible)
DROP TRIGGER IF EXISTS trg_medical_assign_hc ON medical.profiles;
CREATE TRIGGER trg_medical_assign_hc
  AFTER INSERT ON medical.profiles
  FOR EACH ROW EXECUTE FUNCTION medical.assign_hc_number();

GRANT EXECUTE ON FUNCTION medical.assign_hc_number() TO service_role;


-- =============================================================================
-- SECCIÓN 7: Campos demográficos adicionales en medical.profiles
-- Requeridos por NTS 139-MINSA/2018 para la historia clínica.
-- =============================================================================

ALTER TABLE medical.profiles
  ADD COLUMN IF NOT EXISTS birth_date     date,
  ADD COLUMN IF NOT EXISTS gender         text,
  ADD COLUMN IF NOT EXISTS document_type  text DEFAULT 'DNI',
  ADD COLUMN IF NOT EXISTS blood_type     text,
  ADD COLUMN IF NOT EXISTS rne            text,    -- Registro Nacional de Especialistas (solo doctores)
  ADD COLUMN IF NOT EXISTS photo_url      text,    -- Foto de perfil
  ADD COLUMN IF NOT EXISTS specialty_label text,   -- Label visible en UI (ej: "Especialista en Sueño")
  ADD COLUMN IF NOT EXISTS verticals      text[]   -- Especialidades que atiende el doctor
;

COMMENT ON COLUMN medical.profiles.birth_date    IS 'Fecha de nacimiento. Requerido por NTS 139-MINSA/2018.';
COMMENT ON COLUMN medical.profiles.gender        IS 'Género: M | F | otro';
COMMENT ON COLUMN medical.profiles.document_type IS 'Tipo de documento: DNI | CE | pasaporte';
COMMENT ON COLUMN medical.profiles.blood_type    IS 'Grupo sanguíneo: A+ A- B+ B- AB+ AB- O+ O-';
COMMENT ON COLUMN medical.profiles.rne           IS 'Registro Nacional de Especialistas. Solo para doctores.';


-- =============================================================================
-- SECCIÓN 8: RLS — medical.patient_records
-- =============================================================================

ALTER TABLE medical.patient_records ENABLE ROW LEVEL SECURITY;

-- Paciente ve su propio registro
CREATE POLICY "medical.patient_records: paciente ve el suyo"
  ON medical.patient_records FOR SELECT
  USING (patient_id = auth.uid());

-- Doctor ve registros de sus pacientes asignados
CREATE POLICY "medical.patient_records: doctor ve los de sus pacientes"
  ON medical.patient_records FOR SELECT
  USING (
    medical.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM medical.appointments a
      WHERE a.doctor_id = auth.uid()
        AND a.patient_id = medical.patient_records.patient_id
    )
  );

-- Admin ve todos
CREATE POLICY "medical.patient_records: admin ve todos"
  ON medical.patient_records FOR SELECT
  USING (medical.get_my_role() = 'admin');

-- Solo service_role puede insertar (vía trigger assign_hc_number)
-- No se necesita política INSERT para authenticated porque el trigger es SECURITY DEFINER

-- Nadie puede UPDATE ni DELETE (inmutable)


-- =============================================================================
-- SECCIÓN 9: RLS — medical.audit_log
-- INSERT-only para authenticated (vía log_event SECURITY DEFINER).
-- SELECT restringido por rol.
-- UPDATE y DELETE: nadie.
-- =============================================================================

ALTER TABLE medical.audit_log ENABLE ROW LEVEL SECURITY;

-- Admin ve todo el log
CREATE POLICY "medical.audit_log: admin ve todo"
  ON medical.audit_log FOR SELECT
  USING (medical.get_my_role() = 'admin');

-- Doctor ve eventos de sus pacientes
CREATE POLICY "medical.audit_log: doctor ve eventos de sus pacientes"
  ON medical.audit_log FOR SELECT
  USING (
    medical.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM medical.appointments a
      WHERE a.doctor_id = auth.uid()
        AND a.patient_id = medical.audit_log.patient_id
    )
  );

-- Paciente ve eventos sobre sus propios datos
CREATE POLICY "medical.audit_log: paciente ve eventos propios"
  ON medical.audit_log FOR SELECT
  USING (
    medical.get_my_role() = 'patient'
    AND patient_id = auth.uid()
  );

-- INSERT: solo vía la función log_event (SECURITY DEFINER) que usa service_role internamente
-- No se declara política INSERT para authenticated — se hace a través de la función


-- =============================================================================
-- SECCIÓN 10: RLS — medical.system_config
-- =============================================================================

ALTER TABLE medical.system_config ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer (necesario para generar PDFs y mostrar nombre IPRESS)
CREATE POLICY "medical.system_config: authenticated puede leer"
  ON medical.system_config FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin puede modificar
CREATE POLICY "medical.system_config: solo admin puede escribir"
  ON medical.system_config FOR ALL
  USING (medical.get_my_role() = 'admin')
  WITH CHECK (medical.get_my_role() = 'admin');


-- =============================================================================
-- SECCIÓN 11: Permisos de tabla
-- =============================================================================

GRANT SELECT, INSERT ON medical.patient_records TO service_role;
GRANT SELECT         ON medical.patient_records TO authenticated;

GRANT INSERT         ON medical.audit_log       TO authenticated, service_role;
GRANT SELECT         ON medical.audit_log       TO authenticated;
GRANT USAGE, SELECT  ON SEQUENCE medical.audit_log_id_seq TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON medical.system_config TO service_role;
GRANT SELECT                 ON medical.system_config TO authenticated;


-- =============================================================================
-- SECCIÓN 12: Backfill — Asignar HC a pacientes existentes
-- Ejecutar solo una vez. Seguro re-ejecutar (ON CONFLICT DO NOTHING).
-- =============================================================================

INSERT INTO medical.patient_records (patient_id, hc_number, ipress_code)
SELECT
  p.id,
  'HC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('medical.hc_seq')::text, 6, '0'),
  COALESCE(
    (SELECT value FROM medical.system_config WHERE key = 'ipress_code'),
    'PENDIENTE'
  )
FROM medical.profiles p
WHERE p."role"::text = 'patient'
ON CONFLICT (patient_id) DO NOTHING;
