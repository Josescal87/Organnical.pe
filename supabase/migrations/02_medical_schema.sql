-- =============================================================================
-- Organnical HealthTech — Migración 02: Medical Schema
-- =============================================================================
-- PROPÓSITO:
--   Reorganiza las tablas de telemedicina de `public` a un schema dedicado
--   `medical`. Unifica identidad con OrgannicalRuby usando public.productos
--   como catálogo maestro para las recetas médicas.
--
-- PREREQUISITOS (ejecutar ANTES de este script):
--   1. Verificar duplicados: SELECT sku, COUNT(*) FROM public.productos GROUP BY sku HAVING COUNT(*) > 1;
--   2. Agregar UNIQUE: ALTER TABLE public.productos ADD CONSTRAINT productos_sku_unique UNIQUE (sku);
--
-- DESPUÉS DE ESTE SCRIPT:
--   3. Ejecutar 02b_data_migration.sql para migrar datos de public.* → medical.*
--   4. Ejecutar 02c_backfill_roles.sql para escribir roles en JWT metadata
--   5. En Supabase Dashboard → Settings → API → Exposed schemas → agregar "medical"
-- =============================================================================


-- =============================================================================
-- SECCIÓN 1: Schema + Permisos
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS medical;

-- Acceso al schema para roles de Supabase
GRANT USAGE ON SCHEMA medical TO authenticated, service_role, anon;


-- =============================================================================
-- SECCIÓN 2: ENUMs (independientes de public schema)
-- =============================================================================

CREATE TYPE medical.user_role AS ENUM (
  'patient',
  'doctor',
  'admin'
);

CREATE TYPE medical.appointment_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

-- NOTA: Renombrado de appointment_vertical → appointment_specialty
CREATE TYPE medical.appointment_specialty AS ENUM (
  'sleep',
  'pain',
  'anxiety',
  'womens_health'
);


-- =============================================================================
-- SECCIÓN 3: Tablas
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3.1  medical.profiles
-- Fuente de verdad para identidad de telemedicina.
-- FK → auth.users (mismo UUID que usa OrgannicalRuby si el usuario existe en auth).
-- ---------------------------------------------------------------------------
CREATE TABLE medical.profiles (
  id           uuid              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         medical.user_role NOT NULL DEFAULT 'patient',
  full_name    text,
  document_id  text,
  phone        text,
  cmp          text,  -- Código Médico Peruano (solo requerido para doctores)
  created_at   timestamptz       NOT NULL DEFAULT now(),
  updated_at   timestamptz       NOT NULL DEFAULT now(),

  CONSTRAINT medical_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT medical_cmp_required_for_doctors
    CHECK (
      (role = 'doctor' AND cmp IS NOT NULL)
      OR role <> 'doctor'
    )
);

COMMENT ON TABLE medical.profiles IS
  'Perfiles de usuarios del sistema de telemedicina. Vinculado a auth.users por UUID.';
COMMENT ON COLUMN medical.profiles.cmp IS
  'Código del Colegio Médico del Perú. Obligatorio para role=doctor.';


-- ---------------------------------------------------------------------------
-- 3.2  medical.appointments
-- CAMBIOS vs public.appointments:
--   - vertical      → specialty  (renombre de campo y tipo)
--   - scheduled_at  → slot_start + slot_end  (más preciso, evita calcular duración)
-- ---------------------------------------------------------------------------
CREATE TABLE medical.appointments (
  id             uuid                          NOT NULL DEFAULT gen_random_uuid(),
  patient_id     uuid                          NOT NULL REFERENCES medical.profiles(id) ON DELETE RESTRICT,
  doctor_id      uuid                          NOT NULL REFERENCES medical.profiles(id) ON DELETE RESTRICT,
  slot_start     timestamptz                   NOT NULL,
  slot_end       timestamptz                   NOT NULL,
  status         medical.appointment_status    NOT NULL DEFAULT 'pending',
  specialty      medical.appointment_specialty NOT NULL,
  meeting_link   text,
  clinical_notes text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT medical_appointments_pkey               PRIMARY KEY (id),
  CONSTRAINT medical_appointments_patient_not_doctor CHECK (patient_id <> doctor_id),
  CONSTRAINT medical_appointments_slot_order         CHECK (slot_end > slot_start)
);

COMMENT ON TABLE medical.appointments IS
  'Citas de teleconsulta. specialty reemplaza vertical. slot_start/slot_end reemplazan scheduled_at.';


-- ---------------------------------------------------------------------------
-- 3.3  medical.prescriptions
-- ---------------------------------------------------------------------------
CREATE TABLE medical.prescriptions (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  appointment_id uuid        NOT NULL REFERENCES medical.appointments(id) ON DELETE RESTRICT,
  doctor_id      uuid        NOT NULL REFERENCES medical.profiles(id) ON DELETE RESTRICT,
  patient_id     uuid        NOT NULL REFERENCES medical.profiles(id) ON DELETE RESTRICT,
  issued_at      timestamptz NOT NULL DEFAULT now(),
  valid_until    timestamptz NOT NULL,
  pdf_url        text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT medical_prescriptions_pkey        PRIMARY KEY (id),
  CONSTRAINT medical_prescriptions_valid_range CHECK (valid_until > issued_at)
);

COMMENT ON TABLE medical.prescriptions IS
  'Recetas médicas emitidas por doctores. valid_until controla acceso al catálogo vía RLS.';


-- ---------------------------------------------------------------------------
-- 3.4  medical.prescription_items
-- CAMBIO CLAVE vs public.prescription_items:
--   - product_id  UUID → public.products   (tabla duplicada, ahora deprecada)
--   - producto_sku TEXT → public.productos.sku  (catálogo maestro de OrgannicalRuby)
-- ---------------------------------------------------------------------------
CREATE TABLE medical.prescription_items (
  id                  uuid    NOT NULL DEFAULT gen_random_uuid(),
  prescription_id     uuid    NOT NULL REFERENCES medical.prescriptions(id) ON DELETE CASCADE,
  producto_sku        text    NOT NULL REFERENCES public.productos(sku) ON DELETE RESTRICT,
  dosage_instructions text,
  quantity            integer NOT NULL CHECK (quantity > 0),
  created_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT medical_prescription_items_pkey   PRIMARY KEY (id),
  CONSTRAINT medical_prescription_items_unique UNIQUE (prescription_id, producto_sku)
);

COMMENT ON TABLE medical.prescription_items IS
  'Items de receta médica. producto_sku apunta al catálogo real de OrgannicalRuby (public.productos).';


-- =============================================================================
-- SECCIÓN 4: Triggers de updated_at
-- Define public.set_updated_at() si no existe (en caso de no haber corrido 01_init_schema.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_medical_profiles_updated_at
  BEFORE UPDATE ON medical.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_medical_appointments_updated_at
  BEFORE UPDATE ON medical.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_medical_prescriptions_updated_at
  BEFORE UPDATE ON medical.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- SECCIÓN 5: Trigger de auto-creación de perfil al registrarse
-- Reemplaza al trigger del schema public.
-- También escribe role="patient" en user_metadata para que el middleware
-- pueda leer el rol desde el JWT sin hacer queries a la DB.
-- =============================================================================

CREATE OR REPLACE FUNCTION medical.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = medical, public
AS $$
BEGIN
  INSERT INTO medical.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'patient',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Escribir role en user_metadata → queda embebido en el JWT
  -- El middleware lee user.user_metadata.role sin DB call
  UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"role": "patient"}'::jsonb
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION medical.handle_new_user() IS
  'Crea perfil en medical.profiles y escribe role=patient en JWT metadata al registrarse.';

-- Reemplaza el trigger anterior de public schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION medical.handle_new_user();


-- =============================================================================
-- SECCIÓN 6: Función helper get_my_role()
-- =============================================================================

CREATE OR REPLACE FUNCTION medical.get_my_role()
RETURNS medical.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = medical
AS $$
  SELECT role FROM medical.profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION medical.get_my_role() IS
  'Retorna el role del usuario autenticado. Usado en políticas RLS.';

GRANT EXECUTE ON FUNCTION medical.get_my_role()     TO authenticated;
GRANT EXECUTE ON FUNCTION medical.handle_new_user() TO service_role;


-- =============================================================================
-- SECCIÓN 7: Activar RLS en todas las tablas
-- =============================================================================

ALTER TABLE medical.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.prescriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.prescription_items ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- SECCIÓN 8: Políticas RLS — medical.profiles
-- =============================================================================

-- Cada usuario ve su propio perfil
CREATE POLICY "medical.profiles: ver propio"
  ON medical.profiles FOR SELECT
  USING (auth.uid() = id);

-- Doctor ve perfiles de pacientes asignados a él
CREATE POLICY "medical.profiles: doctor ve pacientes suyos"
  ON medical.profiles FOR SELECT
  USING (
    medical.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM medical.appointments a
      WHERE a.doctor_id = auth.uid()
        AND a.patient_id = medical.profiles.id
    )
  );

-- Admin ve todos
CREATE POLICY "medical.profiles: admin ve todos"
  ON medical.profiles FOR SELECT
  USING (medical.get_my_role() = 'admin');

-- Cada usuario actualiza solo su perfil
CREATE POLICY "medical.profiles: actualizar propio"
  ON medical.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- El trigger del signup inserta el perfil
CREATE POLICY "medical.profiles: insercion propia"
  ON medical.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- =============================================================================
-- SECCIÓN 9: Políticas RLS — medical.appointments
-- =============================================================================

CREATE POLICY "medical.appointments: paciente ve los suyos"
  ON medical.appointments FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "medical.appointments: doctor ve los suyos"
  ON medical.appointments FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "medical.appointments: admin ve todos"
  ON medical.appointments FOR SELECT
  USING (medical.get_my_role() = 'admin');

CREATE POLICY "medical.appointments: paciente puede crear"
  ON medical.appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Paciente puede cancelar (cambiar status)
CREATE POLICY "medical.appointments: paciente actualiza los suyos"
  ON medical.appointments FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Doctor puede agregar notas clínicas y cambiar status
CREATE POLICY "medical.appointments: doctor actualiza los suyos"
  ON medical.appointments FOR UPDATE
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "medical.appointments: admin puede todo"
  ON medical.appointments FOR ALL
  USING (medical.get_my_role() = 'admin')
  WITH CHECK (medical.get_my_role() = 'admin');


-- =============================================================================
-- SECCIÓN 10: Políticas RLS — medical.prescriptions
-- =============================================================================

CREATE POLICY "medical.prescriptions: paciente ve las suyas"
  ON medical.prescriptions FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "medical.prescriptions: doctor ve las suyas"
  ON medical.prescriptions FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "medical.prescriptions: admin ve todas"
  ON medical.prescriptions FOR SELECT
  USING (medical.get_my_role() = 'admin');

-- Solo doctores pueden emitir recetas, y solo las suyas
CREATE POLICY "medical.prescriptions: solo doctor puede crear"
  ON medical.prescriptions FOR INSERT
  WITH CHECK (
    medical.get_my_role() = 'doctor'
    AND doctor_id = auth.uid()
  );

-- Doctor puede editar recetas que emitió (subir PDF, ajustar valid_until)
CREATE POLICY "medical.prescriptions: doctor actualiza las suyas"
  ON medical.prescriptions FOR UPDATE
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "medical.prescriptions: admin puede todo"
  ON medical.prescriptions FOR ALL
  USING (medical.get_my_role() = 'admin')
  WITH CHECK (medical.get_my_role() = 'admin');


-- =============================================================================
-- SECCIÓN 11: Políticas RLS — medical.prescription_items
-- =============================================================================

-- Paciente ve items de sus recetas (join implícito con prescriptions)
CREATE POLICY "medical.prescription_items: paciente ve los suyos"
  ON medical.prescription_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM medical.prescriptions pr
      WHERE pr.id = medical.prescription_items.prescription_id
        AND pr.patient_id = auth.uid()
    )
  );

-- Doctor ve items de recetas que emitió
CREATE POLICY "medical.prescription_items: doctor ve los suyos"
  ON medical.prescription_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM medical.prescriptions pr
      WHERE pr.id = medical.prescription_items.prescription_id
        AND pr.doctor_id = auth.uid()
    )
  );

CREATE POLICY "medical.prescription_items: admin ve todos"
  ON medical.prescription_items FOR SELECT
  USING (medical.get_my_role() = 'admin');

-- Solo doctor inserta items en sus propias recetas
CREATE POLICY "medical.prescription_items: doctor puede crear"
  ON medical.prescription_items FOR INSERT
  WITH CHECK (
    medical.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM medical.prescriptions pr
      WHERE pr.id = medical.prescription_items.prescription_id
        AND pr.doctor_id = auth.uid()
    )
  );

-- Doctor actualiza items de sus recetas
CREATE POLICY "medical.prescription_items: doctor actualiza los suyos"
  ON medical.prescription_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM medical.prescriptions pr
      WHERE pr.id = medical.prescription_items.prescription_id
        AND pr.doctor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medical.prescriptions pr
      WHERE pr.id = medical.prescription_items.prescription_id
        AND pr.doctor_id = auth.uid()
    )
  );

CREATE POLICY "medical.prescription_items: admin puede todo"
  ON medical.prescription_items FOR ALL
  USING (medical.get_my_role() = 'admin')
  WITH CHECK (medical.get_my_role() = 'admin');


-- =============================================================================
-- SECCIÓN 12: Permisos de tabla para roles de Supabase
-- =============================================================================

GRANT ALL ON ALL TABLES    IN SCHEMA medical TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA medical TO authenticated;
GRANT USAGE, SELECT        ON ALL SEQUENCES IN SCHEMA medical TO authenticated;


-- =============================================================================
-- SECCIÓN 13: RLS en public.productos (si está habilitado en OrgannicalRuby)
-- Ejecutar solo si: SELECT relrowsecurity FROM pg_class WHERE relname = 'productos';
-- retorna TRUE.
-- =============================================================================

-- Si RLS está activo en public.productos, agregar política de lectura:
-- CREATE POLICY "public.productos: authenticated puede leer"
--   ON public.productos FOR SELECT TO authenticated USING (true);
