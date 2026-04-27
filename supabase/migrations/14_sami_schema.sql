-- Schema sami: app de bienestar Sami by Organnical
CREATE SCHEMA IF NOT EXISTS sami;

-- Permisos de schema
GRANT USAGE ON SCHEMA sami TO authenticated, service_role, anon;

-- Biblioteca de contenido de audio
CREATE TABLE IF NOT EXISTS sami.content (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  title            text NOT NULL,
  description      text,
  category         text NOT NULL CHECK (category IN ('meditacion','cuento','ruido','respiracion')),
  duration_seconds int NOT NULL,
  audio_url        text,
  thumbnail_url    text,
  tags             text[],
  script_text      text,
  tts_voice        text,
  is_published     boolean DEFAULT false,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  CONSTRAINT content_published_requires_audio CHECK (NOT is_published OR audio_url IS NOT NULL)
);

-- Historial de escucha por usuario
CREATE TABLE IF NOT EXISTS sami.listening_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id       uuid NOT NULL REFERENCES sami.content(id) ON DELETE CASCADE,
  started_at       timestamptz DEFAULT now(),
  completed        boolean DEFAULT false,
  seconds_listened int DEFAULT 0 CHECK (seconds_listened >= 0)
);

-- Permisos de tablas
GRANT SELECT ON sami.content TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON sami.listening_sessions TO authenticated;
GRANT ALL ON sami.content, sami.listening_sessions TO service_role;

-- Índices
CREATE INDEX IF NOT EXISTS idx_sami_sessions_user_id ON sami.listening_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sami_sessions_content_id ON sami.listening_sessions(content_id);
CREATE INDEX IF NOT EXISTS idx_sami_sessions_user_content ON sami.listening_sessions(user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_sami_content_category ON sami.content(category);
CREATE INDEX IF NOT EXISTS idx_sami_content_published ON sami.content(is_published);

-- RLS
ALTER TABLE sami.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE sami.listening_sessions ENABLE ROW LEVEL SECURITY;

-- sami.content: cualquier usuario autenticado puede leer contenido publicado
DO $$ BEGIN
  CREATE POLICY "auth_users_read_published_content"
    ON sami.content FOR SELECT
    TO authenticated
    USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- sami.listening_sessions: usuarios ven y gestionan solo sus propias sesiones
DO $$ BEGIN
  CREATE POLICY "users_manage_own_sessions"
    ON sami.listening_sessions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
