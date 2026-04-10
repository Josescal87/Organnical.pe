-- =============================================================================
-- Organnical HealthTech v2.0 — Migración Inicial
-- Clínica Virtual de Cannabis Medicinal
--
-- NOTA DE CUMPLIMIENTO LEGAL:
-- El catálogo de productos (tabla `products`) está protegido por RLS.
-- Un paciente SOLO puede ver productos recetados en una prescripción
-- médica vigente. Ningún usuario anónimo puede acceder a esta tabla.
-- =============================================================================


-- =============================================================================
-- SECCIÓN 1: TIPOS ENUM
-- =============================================================================

CREATE TYPE public.user_role AS ENUM (
  'patient',
  'doctor',
  'admin'
);

CREATE TYPE public.product_category AS ENUM (
  'CBD',
  'THC',
  'Balanced',
  'Accessory'
);

CREATE TYPE public.appointment_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

CREATE TYPE public.appointment_vertical AS ENUM (
  'sleep',
  'pain',
  'anxiety',
  'womens_health'
);


-- =============================================================================
-- SECCIÓN 2: TABLAS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2.1 profiles
-- Extiende auth.users de Supabase. Un trigger (Sección 3) inserta
-- automáticamente una fila aquí con role='patient' al momento del registro.
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id            uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          public.user_role NOT NULL DEFAULT 'patient',
  full_name     text,
  document_id   text,                       -- DNI, requerido para emitir recetas
  phone         text,
  cmp           text,                       -- Código CMP (solo médicos)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  -- Un médico DEBE tener CMP; un paciente/admin no debe tenerlo
  CONSTRAINT cmp_required_for_doctors
    CHECK (
      (role = 'doctor' AND cmp IS NOT NULL)
      OR role <> 'doctor'
    )
);

COMMENT ON TABLE  public.profiles IS 'Perfiles de usuario extendidos desde auth.users.';
COMMENT ON COLUMN public.profiles.cmp IS 'Código de colegiatura médica (CMP). Obligatorio para role=doctor.';
COMMENT ON COLUMN public.profiles.document_id IS 'Número de DNI u otro documento de identidad. Necesario para recetas.';


-- -----------------------------------------------------------------------------
-- 2.2 products
-- Catálogo privado. NUNCA expuesto públicamente.
-- Acceso condicionado a login + receta médica vigente (ver RLS, Sección 4).
-- -----------------------------------------------------------------------------
CREATE TABLE public.products (
  id          uuid              NOT NULL DEFAULT gen_random_uuid(),
  name        text              NOT NULL,
  description text,
  category    public.product_category NOT NULL,
  price       numeric(10, 2)    NOT NULL CHECK (price >= 0),
  is_active   boolean           NOT NULL DEFAULT true,
  created_at  timestamptz       NOT NULL DEFAULT now(),
  updated_at  timestamptz       NOT NULL DEFAULT now(),

  CONSTRAINT products_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.products IS 'Catálogo privado de productos. Acceso restringido por RLS a usuarios con receta médica vigente.';


-- -----------------------------------------------------------------------------
-- 2.3 appointments
-- Reservas de teleconsulta médica.
-- clinical_notes es de uso exclusivo del médico y el AI-Copilot.
-- -----------------------------------------------------------------------------
CREATE TABLE public.appointments (
  id              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  patient_id      uuid                     NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  doctor_id       uuid                     NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  scheduled_at    timestamptz              NOT NULL,
  status          public.appointment_status NOT NULL DEFAULT 'pending',
  vertical        public.appointment_vertical NOT NULL,
  meeting_link    text,
  clinical_notes  text,                    -- Acceso exclusivo: médico y AI-Copilot
  created_at      timestamptz              NOT NULL DEFAULT now(),
  updated_at      timestamptz              NOT NULL DEFAULT now(),

  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_not_doctor
    CHECK (patient_id <> doctor_id)
);

COMMENT ON TABLE  public.appointments IS 'Reservas de teleconsulta. Los pacientes y doctores solo ven sus propias citas.';
COMMENT ON COLUMN public.appointments.clinical_notes IS 'Uso exclusivo del médico tratante y el AI-Copilot. Pacientes no tienen acceso.';
COMMENT ON COLUMN public.appointments.vertical IS 'Área de especialización de la consulta (sueño, dolor, ansiedad, salud femenina).';


-- -----------------------------------------------------------------------------
-- 2.4 prescriptions
-- Receta médica legal generada tras completar una cita.
-- valid_until es la fecha de vencimiento que controla el acceso al catálogo.
-- -----------------------------------------------------------------------------
CREATE TABLE public.prescriptions (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  appointment_id  uuid        NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
  doctor_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  patient_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  issued_at       timestamptz NOT NULL DEFAULT now(),
  valid_until     timestamptz NOT NULL,
  pdf_url         text,                    -- URL al PDF firmado de la receta
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT prescriptions_pkey       PRIMARY KEY (id),
  CONSTRAINT prescriptions_valid_range CHECK (valid_until > issued_at)
);

COMMENT ON TABLE  public.prescriptions IS 'Receta médica legal. Su vigencia (valid_until) habilita el acceso del paciente al catálogo de productos.';
COMMENT ON COLUMN public.prescriptions.valid_until IS 'Fecha de vencimiento. Pasada esta fecha, el paciente pierde acceso a los productos recetados.';


-- -----------------------------------------------------------------------------
-- 2.5 prescription_items
-- Detalle de productos dentro de una receta — el "Carrito Oculto".
-- Cada fila habilita a un paciente a ver exactamente un producto.
-- -----------------------------------------------------------------------------
CREATE TABLE public.prescription_items (
  id                    uuid    NOT NULL DEFAULT gen_random_uuid(),
  prescription_id       uuid    NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  product_id            uuid    NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  dosage_instructions   text,
  quantity              integer NOT NULL CHECK (quantity > 0),
  created_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT prescription_items_pkey PRIMARY KEY (id),
  CONSTRAINT prescription_items_unique UNIQUE (prescription_id, product_id)
);

COMMENT ON TABLE public.prescription_items IS 'Productos recetados por cita. Cada fila habilita a un paciente a ver ese producto en el catálogo.';


-- =============================================================================
-- SECCIÓN 3: TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 updated_at automático (helper genérico)
-- Actualiza la columna updated_at en cualquier tabla que lo use.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 3.2 Auto-creación de perfil al registrarse
-- Cada vez que un usuario se registra en auth.users, se crea automáticamente
-- una fila en profiles con role='patient'.
-- El full_name se toma de los metadatos del registro si está disponible.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER                            -- Necesario para escribir en public.profiles
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'patient',
    NEW.raw_user_meta_data ->> 'full_name'  -- Provisto opcionalmente al hacer signUp
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS
  'Crea automáticamente un perfil de paciente cuando se registra un nuevo usuario.';


-- =============================================================================
-- SECCIÓN 4: ROW-LEVEL SECURITY (RLS)
-- Núcleo del cumplimiento legal del sistema.
-- =============================================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- FUNCIÓN AUXILIAR: obtener el role del usuario autenticado
-- Evita subconsultas repetidas en cada política.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_my_role() IS
  'Retorna el role (patient/doctor/admin) del usuario autenticado actualmente.';


-- -----------------------------------------------------------------------------
-- 4.1 RLS: profiles
-- -----------------------------------------------------------------------------

-- Un usuario puede ver su propio perfil
CREATE POLICY "profiles: ver propio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Un doctor puede ver los perfiles de pacientes con quienes tiene citas
CREATE POLICY "profiles: doctor ve pacientes de sus citas"
  ON public.profiles
  FOR SELECT
  USING (
    public.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.doctor_id = auth.uid()
        AND a.patient_id = profiles.id
    )
  );

-- Un admin puede ver todos los perfiles
CREATE POLICY "profiles: admin ve todos"
  ON public.profiles
  FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Cada usuario solo puede actualizar su propio perfil
CREATE POLICY "profiles: actualizar propio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- El trigger del sistema debe poder insertar el perfil inicial
CREATE POLICY "profiles: inserción por trigger del sistema"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);


-- -----------------------------------------------------------------------------
-- 4.2 RLS: products
-- CRÍTICO: Control de acceso al catálogo privado.
-- -----------------------------------------------------------------------------

-- Admins y Doctores ven todo el catálogo
CREATE POLICY "products: acceso total para admin y doctor"
  ON public.products
  FOR SELECT
  USING (public.get_my_role() IN ('admin', 'doctor'));

-- Pacientes SOLO ven productos en sus prescripciones vigentes
CREATE POLICY "products: paciente ve solo productos recetados y vigentes"
  ON public.products
  FOR SELECT
  USING (
    public.get_my_role() = 'patient'
    AND EXISTS (
      SELECT 1
      FROM public.prescription_items pi
      JOIN public.prescriptions pr ON pr.id = pi.prescription_id
      WHERE pi.product_id = products.id
        AND pr.patient_id = auth.uid()
        AND pr.valid_until > now()           -- Receta aún vigente
    )
  );

-- Solo admins pueden insertar/actualizar/eliminar productos
CREATE POLICY "products: solo admin puede escribir"
  ON public.products
  FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- -----------------------------------------------------------------------------
-- 4.3 RLS: appointments
-- -----------------------------------------------------------------------------

-- Paciente ve sus propias citas
CREATE POLICY "appointments: paciente ve sus citas"
  ON public.appointments
  FOR SELECT
  USING (patient_id = auth.uid());

-- Doctor ve sus propias citas
CREATE POLICY "appointments: doctor ve sus citas"
  ON public.appointments
  FOR SELECT
  USING (doctor_id = auth.uid());

-- Admin ve todas las citas
CREATE POLICY "appointments: admin ve todas"
  ON public.appointments
  FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Paciente puede actualizar sus propias citas (ej: cancelar)
CREATE POLICY "appointments: paciente actualiza sus citas"
  ON public.appointments
  FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Doctor puede actualizar sus propias citas (ej: agregar notas clínicas)
CREATE POLICY "appointments: doctor actualiza sus citas"
  ON public.appointments
  FOR UPDATE
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- Pacientes pueden crear citas (se asigna doctor al momento de agendar)
CREATE POLICY "appointments: paciente puede crear cita"
  ON public.appointments
  FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Admin puede escribir sin restricciones
CREATE POLICY "appointments: admin puede todo"
  ON public.appointments
  FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- -----------------------------------------------------------------------------
-- 4.4 RLS: prescriptions
-- -----------------------------------------------------------------------------

-- Paciente ve sus propias recetas
CREATE POLICY "prescriptions: paciente ve las suyas"
  ON public.prescriptions
  FOR SELECT
  USING (patient_id = auth.uid());

-- Doctor ve las recetas que él emitió
CREATE POLICY "prescriptions: doctor ve las suyas"
  ON public.prescriptions
  FOR SELECT
  USING (doctor_id = auth.uid());

-- Admin ve todas las recetas
CREATE POLICY "prescriptions: admin ve todas"
  ON public.prescriptions
  FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Solo doctores pueden emitir recetas
CREATE POLICY "prescriptions: solo doctor puede crear"
  ON public.prescriptions
  FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'doctor'
    AND doctor_id = auth.uid()
  );

-- Doctor puede actualizar las recetas que emitió (ej: subir PDF)
CREATE POLICY "prescriptions: doctor actualiza las suyas"
  ON public.prescriptions
  FOR UPDATE
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());


-- -----------------------------------------------------------------------------
-- 4.5 RLS: prescription_items
-- -----------------------------------------------------------------------------

-- Paciente ve los items de sus recetas
CREATE POLICY "prescription_items: paciente ve los suyos"
  ON public.prescription_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions pr
      WHERE pr.id = prescription_items.prescription_id
        AND pr.patient_id = auth.uid()
    )
  );

-- Doctor ve los items de las recetas que emitió
CREATE POLICY "prescription_items: doctor ve los suyos"
  ON public.prescription_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions pr
      WHERE pr.id = prescription_items.prescription_id
        AND pr.doctor_id = auth.uid()
    )
  );

-- Admin ve todos los items
CREATE POLICY "prescription_items: admin ve todos"
  ON public.prescription_items
  FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Solo doctores pueden agregar items a una receta propia
CREATE POLICY "prescription_items: solo doctor puede crear"
  ON public.prescription_items
  FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM public.prescriptions pr
      WHERE pr.id = prescription_items.prescription_id
        AND pr.doctor_id = auth.uid()
    )
  );

-- Doctor puede actualizar items de sus propias recetas
CREATE POLICY "prescription_items: doctor actualiza los suyos"
  ON public.prescription_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions pr
      WHERE pr.id = prescription_items.prescription_id
        AND pr.doctor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prescriptions pr
      WHERE pr.id = prescription_items.prescription_id
        AND pr.doctor_id = auth.uid()
    )
  );


-- =============================================================================
-- FIN DE MIGRACIÓN
-- =============================================================================
