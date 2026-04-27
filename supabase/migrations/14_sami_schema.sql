-- Schema sami: app de bienestar Sami by Organnical
CREATE SCHEMA IF NOT EXISTS sami;

-- Biblioteca de contenido de audio
CREATE TABLE sami.content (
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
  created_at       timestamptz DEFAULT now()
);

-- Historial de escucha por usuario
CREATE TABLE sami.listening_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id       uuid NOT NULL REFERENCES sami.content(id) ON DELETE CASCADE,
  started_at       timestamptz DEFAULT now(),
  completed        boolean DEFAULT false,
  seconds_listened int DEFAULT 0
);

-- Índices
CREATE INDEX ON sami.listening_sessions(user_id);
CREATE INDEX ON sami.listening_sessions(content_id);
CREATE INDEX ON sami.content(category);
CREATE INDEX ON sami.content(is_published);

-- RLS
ALTER TABLE sami.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE sami.listening_sessions ENABLE ROW LEVEL SECURITY;

-- sami.content: cualquier usuario autenticado puede leer contenido publicado
CREATE POLICY "auth_users_read_published_content"
  ON sami.content FOR SELECT
  TO authenticated
  USING (is_published = true);

-- sami.listening_sessions: usuarios ven y gestionan solo sus propias sesiones
CREATE POLICY "users_manage_own_sessions"
  ON sami.listening_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
