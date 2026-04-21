-- =============================================================================
-- Organnical HealthTech — Migración 04: Antecedentes del Paciente
-- =============================================================================
-- PROPÓSITO:
--   Agrega tabla de antecedentes médicos del paciente requerida por
--   NTS 139-MINSA/2018 (sección Anamnesis).
--
-- PREREQUISITOS:
--   Haber ejecutado 03_ehr_foundations.sql
-- =============================================================================


-- =============================================================================
-- SECCIÓN 1: medical.patient_background
-- Antecedentes personales, farmacológicos, familiares y hábitos del paciente.
-- Un registro por paciente (upsert). Actualizable por el médico o el paciente.
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical.patient_background (
  id                   uuid        NOT NULL DEFAULT gen_random_uuid(),
  patient_id           uuid        NOT NULL REFERENCES medical.profiles(id) ON DELETE CASCADE,

  -- Antecedentes personales patológicos
  chronic_conditions   text[],           -- ["hipertensión", "diabetes tipo 2"]
  previous_surgeries   text[],
  previous_hospitalizations text[],

  -- Antecedentes farmacológicos
  -- [{name: string, dose: string, frequency: string}]
  current_medications  jsonb,

  -- Alergias (crítico para cannabis medicinal)
  -- [{substance: string, reaction: string, severity: "leve"|"moderada"|"grave"}]
  allergies            jsonb,

  -- Antecedentes familiares
  family_history       text[],

  -- Hábitos
  smoking_status       text,             -- never | former | current
  alcohol_use          text,             -- none | occasional | regular

  -- Antecedentes gineco-obstétricos (womens_health)
  -- {menarche_age, pregnancies, deliveries, abortions, last_menstrual_period, contraception}
  obstetric_history    jsonb,

  last_updated_by      uuid        REFERENCES medical.profiles(id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT medical_patient_background_pkey       PRIMARY KEY (id),
  CONSTRAINT medical_patient_background_patient_uq UNIQUE (patient_id)
);

COMMENT ON TABLE medical.patient_background IS
  'Antecedentes médicos del paciente. NTS 139-MINSA/2018 sección Anamnesis.';

CREATE TRIGGER trg_medical_patient_background_updated_at
  BEFORE UPDATE ON medical.patient_background
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- SECCIÓN 2: RLS — medical.patient_background
-- =============================================================================

ALTER TABLE medical.patient_background ENABLE ROW LEVEL SECURITY;

-- Paciente ve y edita los suyos
CREATE POLICY "medical.patient_background: paciente ve el suyo"
  ON medical.patient_background FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "medical.patient_background: paciente actualiza el suyo"
  ON medical.patient_background FOR ALL
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Doctor ve y edita de sus pacientes asignados
CREATE POLICY "medical.patient_background: doctor ve los de sus pacientes"
  ON medical.patient_background FOR SELECT
  USING (
    medical.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM medical.appointments a
      WHERE a.doctor_id = auth.uid()
        AND a.patient_id = medical.patient_background.patient_id
    )
  );

CREATE POLICY "medical.patient_background: doctor actualiza los de sus pacientes"
  ON medical.patient_background FOR ALL
  USING (
    medical.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM medical.appointments a
      WHERE a.doctor_id = auth.uid()
        AND a.patient_id = medical.patient_background.patient_id
    )
  )
  WITH CHECK (
    medical.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM medical.appointments a
      WHERE a.doctor_id = auth.uid()
        AND a.patient_id = medical.patient_background.patient_id
    )
  );

-- Admin ve y edita todo
CREATE POLICY "medical.patient_background: admin puede todo"
  ON medical.patient_background FOR ALL
  USING (medical.get_my_role() = 'admin')
  WITH CHECK (medical.get_my_role() = 'admin');


-- =============================================================================
-- SECCIÓN 3: Permisos
-- =============================================================================

GRANT SELECT, INSERT, UPDATE ON medical.patient_background TO authenticated;
GRANT ALL                    ON medical.patient_background TO service_role;
