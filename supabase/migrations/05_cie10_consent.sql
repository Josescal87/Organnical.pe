-- =============================================================================
-- Organnical HealthTech — Migración 05: CIE-10 + Consentimientos
-- =============================================================================
-- PROPÓSITO:
--   - medical.cie10_cache: catálogo de códigos diagnósticos para las 4 especialidades
--   - medical.consent_records: consentimientos informados del paciente (Ley 29733)
--
-- PREREQUISITOS:
--   Haber ejecutado 04_patient_background.sql
-- =============================================================================


-- =============================================================================
-- SECCIÓN 1: medical.cie10_cache
-- Códigos CIE-10 relevantes para sleep, pain, anxiety, womens_health.
-- Fuente: OPS/OMS + RM 447-2024/MINSA
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical.cie10_cache (
  code        text    NOT NULL,
  description text    NOT NULL,
  category    text,
  keywords    text[],
  specialty   text,   -- sleep | pain | anxiety | womens_health | general
  is_active   boolean NOT NULL DEFAULT true,

  CONSTRAINT medical_cie10_cache_pkey PRIMARY KEY (code)
);

COMMENT ON TABLE medical.cie10_cache IS
  'Códigos CIE-10 para diagnósticos médicos. RM 447-2024/MINSA.';

CREATE INDEX IF NOT EXISTS idx_cie10_keywords  ON medical.cie10_cache USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_cie10_specialty ON medical.cie10_cache (specialty);


-- =============================================================================
-- SECCIÓN 2: Seed CIE-10 — Especialidad SLEEP (Sueño)
-- =============================================================================

INSERT INTO medical.cie10_cache (code, description, category, keywords, specialty) VALUES
  ('G47.0',  'Trastornos del inicio y del mantenimiento del sueño [insomnios]',              'Trastornos del sueño', ARRAY['insomnio','dificultad dormir','insomnio crónico','no puedo dormir'], 'sleep'),
  ('G47.1',  'Trastornos de somnolencia excesiva [hipersomnias]',                            'Trastornos del sueño', ARRAY['somnolencia','hipersomnia','sueño excesivo','narcolepsia'], 'sleep'),
  ('G47.2',  'Trastornos del ciclo sueño-vigilia',                                           'Trastornos del sueño', ARRAY['ciclo sueño','ritmo circadiano','jet lag','turno nocturno'], 'sleep'),
  ('G47.3',  'Apnea del sueño',                                                              'Trastornos del sueño', ARRAY['apnea','ronquido','apnea obstructiva','SAOS'], 'sleep'),
  ('G47.4',  'Narcolepsia y cataplejía',                                                     'Trastornos del sueño', ARRAY['narcolepsia','cataplejia','somnolencia extrema'], 'sleep'),
  ('G47.8',  'Otros trastornos del sueño',                                                   'Trastornos del sueño', ARRAY['parasomnia','sonambulismo','terrores nocturnos'], 'sleep'),
  ('G47.9',  'Trastorno del sueño, no especificado',                                         'Trastornos del sueño', ARRAY['trastorno sueño','problema sueño'], 'sleep'),
  ('F51.0',  'Insomnio no orgánico',                                                         'Trastornos del sueño', ARRAY['insomnio','ansiedad sueño','insomnio psicogénico'], 'sleep'),
  ('F51.1',  'Hipersomnia no orgánica',                                                      'Trastornos del sueño', ARRAY['hipersomnia','somnolencia','sueño excesivo'], 'sleep'),
  ('F51.2',  'Trastorno del ciclo sueño-vigilia no orgánico',                                'Trastornos del sueño', ARRAY['ritmo circadiano','ciclo sueño'], 'sleep'),
  ('F51.3',  'Sonambulismo',                                                                  'Trastornos del sueño', ARRAY['sonambulismo','caminar dormido'], 'sleep'),
  ('F51.4',  'Terrores del sueño [terrores nocturnos]',                                      'Trastornos del sueño', ARRAY['terrores nocturnos','pesadillas','pavor nocturno'], 'sleep'),
  ('F51.5',  'Pesadillas',                                                                    'Trastornos del sueño', ARRAY['pesadillas','sueños malos'], 'sleep'),
  ('G25.8',  'Síndrome de piernas inquietas',                                                'Trastornos del movimiento', ARRAY['piernas inquietas','RLS','movimiento piernas dormir'], 'sleep'),
  ('R00.0',  'Taquicardia no especificada (asociada a insomnio)',                            'Síntomas cardiovasculares', ARRAY['taquicardia','palpitaciones','corazón acelerado'], 'sleep')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, keywords = EXCLUDED.keywords;


-- =============================================================================
-- SECCIÓN 3: Seed CIE-10 — Especialidad PAIN (Dolor Crónico)
-- =============================================================================

INSERT INTO medical.cie10_cache (code, description, category, keywords, specialty) VALUES
  ('M54.5',  'Lumbago no especificado',                                                      'Dorsalgia', ARRAY['lumbar','dolor espalda baja','lumbago','dolor lumbar'], 'pain'),
  ('M54.4',  'Lumbago con ciática',                                                          'Dorsalgia', ARRAY['ciática','lumbar','nervio ciático','dolor pierna'], 'pain'),
  ('M54.2',  'Cervicalgia',                                                                   'Dorsalgia', ARRAY['cervical','dolor cuello','cervicalgia'], 'pain'),
  ('M54.3',  'Ciática',                                                                       'Dorsalgia', ARRAY['ciática','nervio ciático','dolor irradiado pierna'], 'pain'),
  ('M79.3',  'Paniculitis',                                                                   'Trastornos de tejidos blandos', ARRAY['dolor difuso','paniculitis'], 'pain'),
  ('M79.7',  'Fibromialgia',                                                                  'Trastornos de tejidos blandos', ARRAY['fibromialgia','dolor generalizado','puntos gatillo'], 'pain'),
  ('M79.2',  'Neuralgia y neuritis, no especificada',                                        'Trastornos de tejidos blandos', ARRAY['neuralgia','neuritis','dolor nervioso'], 'pain'),
  ('G89.0',  'Dolor central no especificado',                                                'Dolor crónico', ARRAY['dolor crónico','dolor central'], 'pain'),
  ('G89.2',  'Dolor crónico, no clasificado en otra parte',                                  'Dolor crónico', ARRAY['dolor crónico','dolor persistente'], 'pain'),
  ('G89.3',  'Síndrome de dolor neoplásico',                                                 'Dolor crónico', ARRAY['dolor oncológico','dolor cáncer'], 'pain'),
  ('G89.4',  'Síndrome de dolor crónico',                                                    'Dolor crónico', ARRAY['síndrome dolor crónico','dolor persistente crónico'], 'pain'),
  ('M05.9',  'Artritis reumatoide seropositiva, no especificada',                            'Artropatías', ARRAY['artritis reumatoide','AR','articulaciones','inflamación'], 'pain'),
  ('M06.9',  'Artritis reumatoide, no especificada',                                         'Artropatías', ARRAY['artritis','dolor articular','articulaciones'], 'pain'),
  ('M15.9',  'Poliartrosis, no especificada',                                                'Artrosis', ARRAY['artrosis','desgaste articular','osteoartritis'], 'pain'),
  ('M16.9',  'Coxartrosis, no especificada',                                                 'Artrosis', ARRAY['artrosis cadera','coxartrosis','dolor cadera'], 'pain'),
  ('M17.9',  'Gonartrosis, no especificada',                                                 'Artrosis', ARRAY['artrosis rodilla','gonartrosis','dolor rodilla'], 'pain'),
  ('M47.9',  'Espondiloartrosis, no especificada',                                           'Espondilopatías', ARRAY['espondilosis','artrosis columna','dolor columna'], 'pain'),
  ('M48.0',  'Estenosis del conducto vertebral',                                             'Espondilopatías', ARRAY['estenosis canal','compresión médula','dolor columna'], 'pain'),
  ('M51.1',  'Trastornos de disco lumbar con radiculopatía',                                 'Trastornos de disco intervertebral', ARRAY['hernia disco','radiculopatía','disco lumbar'], 'pain'),
  ('G43.9',  'Migraña, no especificada',                                                     'Cefaleas', ARRAY['migraña','jaqueca','dolor cabeza crónico'], 'pain'),
  ('G44.2',  'Cefalea tensional',                                                             'Cefaleas', ARRAY['cefalea tensional','dolor cabeza tensión'], 'pain'),
  ('R52',    'Dolor, no clasificado en otra parte',                                           'Síntomas generales', ARRAY['dolor','dolor no especificado'], 'pain'),
  ('M79.1',  'Mialgia',                                                                       'Trastornos de tejidos blandos', ARRAY['mialgia','dolor muscular','contractura'], 'pain'),
  ('M62.4',  'Contractura muscular',                                                          'Trastornos musculares', ARRAY['contractura','espasmo muscular','tensión muscular'], 'pain'),
  ('G54.2',  'Trastornos de la raíz nerviosa cervical',                                      'Trastornos de raíces nerviosas', ARRAY['radiculopatía cervical','dolor brazo','hormigueo'], 'pain'),
  ('G54.4',  'Trastornos de la raíz nerviosa lumbosacra',                                   'Trastornos de raíces nerviosas', ARRAY['radiculopatía lumbar','dolor pierna','ciática'], 'pain'),
  ('M79.0',  'Reumatismo, no especificado',                                                  'Trastornos de tejidos blandos', ARRAY['reumatismo','dolor articular difuso'], 'pain'),
  ('M25.5',  'Dolor articular',                                                               'Artropatías', ARRAY['dolor articular','artralgia'], 'pain')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, keywords = EXCLUDED.keywords;


-- =============================================================================
-- SECCIÓN 4: Seed CIE-10 — Especialidad ANXIETY (Ansiedad)
-- =============================================================================

INSERT INTO medical.cie10_cache (code, description, category, keywords, specialty) VALUES
  ('F41.0',  'Trastorno de pánico [ansiedad paroxística episódica]',                         'Trastornos de ansiedad', ARRAY['pánico','ataque pánico','ansiedad episódica','crisis pánico'], 'anxiety'),
  ('F41.1',  'Trastorno de ansiedad generalizada',                                           'Trastornos de ansiedad', ARRAY['ansiedad generalizada','TAG','preocupación excesiva','ansiedad crónica'], 'anxiety'),
  ('F41.2',  'Trastorno mixto ansioso-depresivo',                                            'Trastornos de ansiedad', ARRAY['ansiedad depresión','mixto','ansioso depresivo'], 'anxiety'),
  ('F41.9',  'Trastorno de ansiedad, no especificado',                                       'Trastornos de ansiedad', ARRAY['ansiedad','nerviosismo','tensión'], 'anxiety'),
  ('F40.0',  'Agorafobia',                                                                    'Trastornos fóbicos', ARRAY['agorafobia','espacios abiertos','miedo multitudes'], 'anxiety'),
  ('F40.1',  'Fobias sociales',                                                               'Trastornos fóbicos', ARRAY['fobia social','ansiedad social','miedo público'], 'anxiety'),
  ('F40.2',  'Fobias específicas (aisladas)',                                                 'Trastornos fóbicos', ARRAY['fobia específica','miedo irracional'], 'anxiety'),
  ('F42',    'Trastorno obsesivo-compulsivo',                                                 'Trastornos obsesivo-compulsivos', ARRAY['TOC','obsesiones','compulsiones','rituales'], 'anxiety'),
  ('F43.0',  'Reacción a estrés agudo',                                                       'Reacciones al estrés', ARRAY['estrés agudo','trauma agudo','shock emocional'], 'anxiety'),
  ('F43.1',  'Trastorno de estrés postraumático',                                            'Reacciones al estrés', ARRAY['TEPT','trauma','estrés postraumático','PTSD'], 'anxiety'),
  ('F43.2',  'Trastornos de adaptación',                                                     'Reacciones al estrés', ARRAY['adaptación','estrés situacional','duelo patológico'], 'anxiety'),
  ('F32.0',  'Episodio depresivo leve',                                                       'Episodios depresivos', ARRAY['depresión leve','tristeza','anhedonia'], 'anxiety'),
  ('F32.1',  'Episodio depresivo moderado',                                                   'Episodios depresivos', ARRAY['depresión moderada','depresión'], 'anxiety'),
  ('F32.2',  'Episodio depresivo grave sin síntomas psicóticos',                             'Episodios depresivos', ARRAY['depresión grave','depresión severa'], 'anxiety'),
  ('F33.0',  'Trastorno depresivo recurrente, episodio actual leve',                         'Trastornos depresivos recurrentes', ARRAY['depresión recurrente','recaída depresión'], 'anxiety'),
  ('F45.0',  'Trastorno de somatización',                                                    'Trastornos somatomorfos', ARRAY['somatización','síntomas físicos sin causa','psicosomático'], 'anxiety'),
  ('F45.1',  'Trastorno somatomorfo indiferenciado',                                         'Trastornos somatomorfos', ARRAY['síntomas inexplicados','psicosomático'], 'anxiety'),
  ('F48.0',  'Neurastenia',                                                                   'Otros trastornos neuróticos', ARRAY['neurastenia','fatiga mental','agotamiento nervioso'], 'anxiety'),
  ('F48.9',  'Trastorno neurótico, no especificado',                                         'Otros trastornos neuróticos', ARRAY['neurosis','trastorno nervioso'], 'anxiety'),
  ('Z73.0',  'Agotamiento vital',                                                             'Problemas relacionados con dificultades de organización del modo de vida', ARRAY['burnout','agotamiento','estrés laboral','síndrome quemado'], 'anxiety'),
  ('F10.1',  'Trastornos mentales y del comportamiento debidos al uso de alcohol, uso nocivo', 'Trastornos por sustancias', ARRAY['alcohol','uso nocivo alcohol','alcoholismo'], 'anxiety'),
  ('F12.1',  'Trastornos mentales debidos al uso de cannabinoides, uso nocivo',              'Trastornos por sustancias', ARRAY['cannabis','cannabinoides','uso nocivo cannabis'], 'anxiety')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, keywords = EXCLUDED.keywords;


-- =============================================================================
-- SECCIÓN 5: Seed CIE-10 — Especialidad WOMENS_HEALTH (Salud Femenina)
-- =============================================================================

INSERT INTO medical.cie10_cache (code, description, category, keywords, specialty) VALUES
  ('N94.3',  'Síndrome de tensión premenstrual',                                             'Otros trastornos de los órganos genitales femeninos', ARRAY['SPM','tensión premenstrual','PMS','síndrome premenstrual'], 'womens_health'),
  ('N94.4',  'Dismenorrea primaria',                                                          'Otros trastornos de los órganos genitales femeninos', ARRAY['dismenorrea','cólicos menstruales','dolor menstrual'], 'womens_health'),
  ('N94.5',  'Dismenorrea secundaria',                                                        'Otros trastornos de los órganos genitales femeninos', ARRAY['dismenorrea secundaria','endometriosis dolor','miomas dolor'], 'womens_health'),
  ('N94.6',  'Dismenorrea, no especificada',                                                  'Otros trastornos de los órganos genitales femeninos', ARRAY['dismenorrea','dolor menstrual'], 'womens_health'),
  ('N80.0',  'Endometriosis del útero',                                                       'Endometriosis', ARRAY['endometriosis uterina','adenomiosis'], 'womens_health'),
  ('N80.1',  'Endometriosis del ovario',                                                      'Endometriosis', ARRAY['endometriosis ovárica','endometrioma'], 'womens_health'),
  ('N80.9',  'Endometriosis, no especificada',                                                'Endometriosis', ARRAY['endometriosis','dolor pélvico crónico endometriosis'], 'womens_health'),
  ('N95.1',  'Estados menopáusicos y climatéricos femeninos',                                'Trastornos menopáusicos y perimenopáusicos', ARRAY['menopausia','climaterio','sofocos','bochornos'], 'womens_health'),
  ('N95.0',  'Hemorragia postmenopáusica',                                                   'Trastornos menopáusicos y perimenopáusicos', ARRAY['sangrado postmenopausia','hemorragia menopausia'], 'womens_health'),
  ('N95.2',  'Vaginitis atrófica postmenopáusica',                                           'Trastornos menopáusicos y perimenopáusicos', ARRAY['vaginitis atrófica','sequedad vaginal','menopausia'], 'womens_health'),
  ('N91.0',  'Amenorrea primaria',                                                            'Menstruación ausente, escasa o rara', ARRAY['amenorrea primaria','ausencia menstruación'], 'womens_health'),
  ('N91.1',  'Amenorrea secundaria',                                                          'Menstruación ausente, escasa o rara', ARRAY['amenorrea secundaria','pérdida menstruación'], 'womens_health'),
  ('N92.0',  'Menstruación excesiva y frecuente con ciclo regular',                          'Menstruación excesiva, frecuente e irregular', ARRAY['menorragia','sangrado abundante','hipermenorrea'], 'womens_health'),
  ('N92.3',  'Hemorragia irregular premenopáusica',                                          'Menstruación excesiva, frecuente e irregular', ARRAY['sangrado irregular','perimenopausia','sangrado premenopausia'], 'womens_health'),
  ('N83.2',  'Otros quistes ováricos y los no especificados',                                'Trastornos no inflamatorios del ovario', ARRAY['quiste ovárico','quiste ovario'], 'womens_health'),
  ('E28.2',  'Síndrome de ovario poliquístico',                                              'Disfunción ovárica', ARRAY['SOP','ovario poliquístico','PCOS'], 'womens_health'),
  ('N73.9',  'Enfermedad inflamatoria pélvica femenina, no especificada',                   'Enfermedades inflamatorias del útero', ARRAY['EIP','enfermedad inflamatoria pélvica','dolor pélvico'], 'womens_health'),
  ('N94.1',  'Dispareunia',                                                                   'Otros trastornos de los órganos genitales femeninos', ARRAY['dispareunia','dolor coito','dolor relaciones sexuales'], 'womens_health'),
  ('N94.2',  'Vaginismo',                                                                     'Otros trastornos de los órganos genitales femeninos', ARRAY['vaginismo','espasmo vaginal'], 'womens_health'),
  ('F52.0',  'Ausencia o pérdida del deseo sexual',                                          'Disfunciones sexuales', ARRAY['falta libido','disminución deseo sexual'], 'womens_health'),
  ('O26.8',  'Otras afecciones especificadas relacionadas con el embarazo',                 'Asistencia materna por otras afecciones', ARRAY['embarazo complicado','náuseas embarazo'], 'womens_health'),
  ('N76.0',  'Vaginitis aguda',                                                               'Inflamación de vagina y vulva', ARRAY['vaginitis','infección vaginal','flujo vaginal'], 'womens_health'),
  ('N89.8',  'Otras enfermedades no inflamatorias especificadas de la vagina',              'Enfermedades no inflamatorias', ARRAY['sequedad vaginal','atrofia vaginal'], 'womens_health')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, keywords = EXCLUDED.keywords;


-- =============================================================================
-- SECCIÓN 6: Seed CIE-10 — General (aplica a todas las especialidades)
-- =============================================================================

INSERT INTO medical.cie10_cache (code, description, category, keywords, specialty) VALUES
  ('Z71.1',  'Persona que consulta para explicación de hallazgos de investigaciones',        'Consulta por motivos generales', ARRAY['consulta','resultado examen','interpretación'], 'general'),
  ('Z00.0',  'Examen médico general',                                                         'Examen y contacto con servicios de salud', ARRAY['chequeo','control','revisión general'], 'general'),
  ('Z76.0',  'Expedición de prescripción repetida',                                          'Personas que entran en contacto con servicios de salud', ARRAY['renovación receta','prescripción repetida'], 'general'),
  ('R53',    'Malestar y fatiga',                                                              'Síntomas generales', ARRAY['fatiga','cansancio','astenia','malestar general'], 'general'),
  ('R50.9',  'Fiebre, no especificada',                                                       'Síntomas generales', ARRAY['fiebre','temperatura'], 'general'),
  ('R51',    'Cefalea',                                                                        'Síntomas generales', ARRAY['dolor cabeza','cefalea','jaqueca'], 'general'),
  ('R55',    'Síncope y colapso',                                                              'Síntomas generales', ARRAY['desmayo','síncope','mareo'], 'general'),
  ('R45.1',  'Agitación e inquietud psicomotora',                                            'Síntomas emocionales', ARRAY['agitación','inquietud','nerviosismo'], 'general'),
  ('R45.7',  'Estado de shock emocional, no especificado',                                   'Síntomas emocionales', ARRAY['shock emocional','crisis emocional'], 'general'),
  ('Z79.8',  'Uso prolongado de otra medicación',                                            'Factores de riesgo', ARRAY['medicación crónica','uso prolongado medicamento'], 'general'),
  ('Z82.4',  'Historia familiar de epilepsia y otras enfermedades del sistema nervioso',    'Historia familiar', ARRAY['antecedente familiar neurológico'], 'general'),
  ('Z87.3',  'Historia personal de enfermedades del sistema musculoesquelético',            'Historia personal', ARRAY['antecedente musculoesquelético'], 'general')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, keywords = EXCLUDED.keywords;


-- =============================================================================
-- SECCIÓN 7: RLS — medical.cie10_cache
-- Lectura pública para usuarios autenticados, escritura solo admin.
-- =============================================================================

ALTER TABLE medical.cie10_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medical.cie10_cache: authenticated puede leer"
  ON medical.cie10_cache FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "medical.cie10_cache: admin puede todo"
  ON medical.cie10_cache FOR ALL
  USING (medical.get_my_role() = 'admin')
  WITH CHECK (medical.get_my_role() = 'admin');

GRANT SELECT ON medical.cie10_cache TO authenticated;
GRANT ALL    ON medical.cie10_cache TO service_role;


-- =============================================================================
-- SECCIÓN 8: medical.consent_records
-- Consentimientos informados del paciente. Ley 29733 (Datos Personales).
-- INSERT-only — no se modifica ni elimina.
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical.consent_records (
  id                uuid        NOT NULL DEFAULT gen_random_uuid(),
  patient_id        uuid        NOT NULL REFERENCES medical.profiles(id) ON DELETE CASCADE,
  appointment_id    uuid        REFERENCES medical.appointments(id),
  consent_type      text        NOT NULL,  -- general_treatment | telemedicine | cannabis_use | data_processing
  consent_text_hash text        NOT NULL,  -- SHA-256 del texto exacto que aceptó el paciente
  consent_version   text        NOT NULL,  -- "v1.0", "v1.1", etc.
  accepted          boolean     NOT NULL,
  accepted_at       timestamptz,
  patient_ip        text,
  patient_device    text,
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT medical_consent_records_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE medical.consent_records IS
  'Consentimientos informados del paciente. Inmutable. Ley 29733 y Ley 30681.';
COMMENT ON COLUMN medical.consent_records.consent_type IS
  'Tipo: general_treatment | telemedicine | cannabis_use | data_processing';
COMMENT ON COLUMN medical.consent_records.consent_text_hash IS
  'SHA-256 del texto exacto aceptado. Permite auditar qué versión del texto fue firmada.';


-- =============================================================================
-- SECCIÓN 9: RLS — medical.consent_records
-- =============================================================================

ALTER TABLE medical.consent_records ENABLE ROW LEVEL SECURITY;

-- Paciente ve los suyos
CREATE POLICY "medical.consent_records: paciente ve los suyos"
  ON medical.consent_records FOR SELECT
  USING (patient_id = auth.uid());

-- Paciente inserta los suyos
CREATE POLICY "medical.consent_records: paciente puede insertar"
  ON medical.consent_records FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Doctor ve los de sus pacientes
CREATE POLICY "medical.consent_records: doctor ve los de sus pacientes"
  ON medical.consent_records FOR SELECT
  USING (
    medical.get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM medical.appointments a
      WHERE a.doctor_id = auth.uid()
        AND a.patient_id = medical.consent_records.patient_id
    )
  );

-- Admin ve todos
CREATE POLICY "medical.consent_records: admin ve todos"
  ON medical.consent_records FOR SELECT
  USING (medical.get_my_role() = 'admin');

-- Nadie puede UPDATE ni DELETE

GRANT SELECT, INSERT ON medical.consent_records TO authenticated;
GRANT ALL            ON medical.consent_records TO service_role;
