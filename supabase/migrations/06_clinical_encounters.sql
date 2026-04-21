-- =============================================================================
-- Organnical HealthTech — Migración 06: Historia Clínica Estructurada (SOAP)
-- =============================================================================
-- PROPÓSITO:
--   - medical.clinical_encounters: HC estructurada por cita (SOAP + FHIR R4 compatible)
--   - Campos de firma electrónica simple (SHA-256)
--   - Trigger para bloquear edición de HCs firmadas
--   - Columnas EHR adicionales en medical.prescriptions
-- PREREQUISITOS:
--   Haber ejecutado 05_cie10_consent.sql
-- =============================================================================


-- =============================================================================
-- SECCIÓN 1: medical.clinical_encounters
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical.clinical_encounters (
  id                     uuid        NOT NULL DEFAULT gen_random_uuid(),
  appointment_id         uuid        NOT NULL REFERENCES medical.appointments(id) ON DELETE RESTRICT,
  patient_id             uuid        NOT NULL REFERENCES medical.profiles(id),
  doctor_id              uuid        NOT NULL REFERENCES medical.profiles(id),

  -- S — Subjetivo (Anamnesis NTS 139-MINSA/2018)
  chief_complaint        text        NOT NULL DEFAULT '',
  illness_history        text        NOT NULL DEFAULT '',
  relevant_history       text,

  -- O — Objetivo (Signos vitales + Examen físico)
  vital_weight_kg        numeric(5,2),
  vital_height_cm        numeric(5,2),
  vital_bmi              numeric(4,2),
  vital_bp_systolic      integer,
  vital_bp_diastolic     integer,
  vital_heart_rate       integer,
  vital_respiratory_rate integer,
  vital_temperature_c    numeric(4,2),
  vital_spo2_pct         integer,
  physical_exam_notes    text,

  -- A — Análisis (Diagnósticos CIE-10)
  -- Estructura FHIR R4 Condition compatible:
  -- [{cie10_code, cie10_description, type: "principal"|"secondary", certainty: "definitivo"|"presuntivo"}]
  diagnoses              jsonb       NOT NULL DEFAULT '[]'::jsonb,

  -- P — Plan
  treatment_plan         text        NOT NULL DEFAULT '',
  indications            text,
  follow_up_days         integer,
  lab_orders             text,

  -- Específico Ley 30681 (cannabis medicinal)
  cannabis_indication    text,
  expected_outcomes      text,

  -- Firma electrónica simple
  status                 text        NOT NULL DEFAULT 'draft',  -- draft | signed | amended
  signed_at              timestamptz,
  signed_by              uuid        REFERENCES medical.profiles(id),
  doctor_signature_hash  text,   -- SHA-256(content_json + doctor_id + timestamp)
  doctor_ip              text,

  -- Versionado para enmiendas
  version                integer     NOT NULL DEFAULT 1,
  parent_encounter_id    uuid        REFERENCES medical.clinical_encounters(id),

  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT medical_clinical_encounters_pkey PRIMARY KEY (id),
  CONSTRAINT medical_clinical_encounters_apt_unique UNIQUE (appointment_id)
);

COMMENT ON TABLE medical.clinical_encounters IS
  'Historia clínica estructurada (SOAP) por cita. NTS 139-MINSA/2018. FHIR R4 compatible.';
COMMENT ON COLUMN medical.clinical_encounters.diagnoses IS
  'Array JSONB: [{cie10_code, cie10_description, type: principal|secondary, certainty: definitivo|presuntivo}]';
COMMENT ON COLUMN medical.clinical_encounters.doctor_signature_hash IS
  'SHA-256 del JSON del encuentro + doctor_id + signed_at. Equivalente a firma electrónica simple.';

CREATE INDEX IF NOT EXISTS idx_clinical_encounters_appointment ON medical.clinical_encounters (appointment_id);
CREATE INDEX IF NOT EXISTS idx_clinical_encounters_patient     ON medical.clinical_encounters (patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_encounters_doctor      ON medical.clinical_encounters (doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinical_encounters_status      ON medical.clinical_encounters (status);


-- =============================================================================
-- SECCIÓN 2: Trigger — bloquear edición de HC firmada
-- =============================================================================

CREATE OR REPLACE FUNCTION medical.prevent_signed_encounter_edit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = medical, public
AS $$
BEGIN
  IF OLD.status = 'signed' AND NEW.status <> 'amended' THEN
    RAISE EXCEPTION 'No se puede modificar una historia clínica ya firmada. Use enmienda.';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_signed_encounter_edit ON medical.clinical_encounters;

CREATE TRIGGER trg_prevent_signed_encounter_edit
  BEFORE UPDATE ON medical.clinical_encounters
  FOR EACH ROW EXECUTE FUNCTION medical.prevent_signed_encounter_edit();


-- =============================================================================
-- SECCIÓN 3: RLS — medical.clinical_encounters
-- =============================================================================

ALTER TABLE medical.clinical_encounters ENABLE ROW LEVEL SECURITY;

-- Paciente: solo ve HCs firmadas propias
CREATE POLICY "clinical_encounters: paciente ve las suyas firmadas"
  ON medical.clinical_encounters FOR SELECT
  USING (
    patient_id = auth.uid()
    AND status = 'signed'
  );

-- Doctor: ve las de sus propias citas
CREATE POLICY "clinical_encounters: doctor ve las de sus citas"
  ON medical.clinical_encounters FOR SELECT
  USING (doctor_id = auth.uid());

-- Doctor: puede insertar en sus citas
CREATE POLICY "clinical_encounters: doctor puede insertar"
  ON medical.clinical_encounters FOR INSERT
  WITH CHECK (
    doctor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM medical.appointments a
      WHERE a.id = appointment_id
        AND a.doctor_id = auth.uid()
    )
  );

-- Doctor: puede actualizar solo borradores propios
CREATE POLICY "clinical_encounters: doctor actualiza borrador"
  ON medical.clinical_encounters FOR UPDATE
  USING (
    doctor_id = auth.uid()
    AND status = 'draft'
  )
  WITH CHECK (doctor_id = auth.uid());

-- Admin: acceso completo
CREATE POLICY "clinical_encounters: admin acceso completo"
  ON medical.clinical_encounters FOR ALL
  USING (medical.get_my_role() = 'admin');

-- Nadie puede DELETE
GRANT SELECT, INSERT, UPDATE ON medical.clinical_encounters TO authenticated;
GRANT ALL                     ON medical.clinical_encounters TO service_role;


-- =============================================================================
-- SECCIÓN 4: Columnas EHR adicionales en medical.prescriptions
-- =============================================================================

ALTER TABLE medical.prescriptions
  ADD COLUMN IF NOT EXISTS prescription_number text,
  ADD COLUMN IF NOT EXISTS hc_number           text,
  ADD COLUMN IF NOT EXISTS diagnosis_cie10      text,
  ADD COLUMN IF NOT EXISTS diagnosis_label      text,
  ADD COLUMN IF NOT EXISTS signed_at            timestamptz,
  ADD COLUMN IF NOT EXISTS signed_hash          text;

COMMENT ON COLUMN medical.prescriptions.prescription_number IS 'Número correlativo de receta: RX-{AÑO}-{seq}';
COMMENT ON COLUMN medical.prescriptions.diagnosis_cie10     IS 'Código CIE-10 del diagnóstico principal, copiado desde la HC';
COMMENT ON COLUMN medical.prescriptions.signed_hash         IS 'SHA-256 de la receta firmada';
