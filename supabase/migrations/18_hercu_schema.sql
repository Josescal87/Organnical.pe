-- 18_hercu_schema.sql

CREATE SCHEMA IF NOT EXISTS hercu;

CREATE TYPE hercu.fitness_level_enum AS ENUM ('principiante', 'intermedio', 'avanzado');
CREATE TYPE hercu.message_role_enum  AS ENUM ('user', 'assistant');

CREATE TABLE hercu.hercu_profiles (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fitness_level   hercu.fitness_level_enum NOT NULL DEFAULT 'principiante',
  goals           TEXT[] NOT NULL DEFAULT '{}',
  equipment       TEXT[] NOT NULL DEFAULT '{peso_corporal}',
  days_per_week   INT NOT NULL DEFAULT 3,
  available_days  TEXT[] NOT NULL DEFAULT '{}',
  session_minutes INT NOT NULL DEFAULT 30,
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hercu.hercu_plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  plan_data  JSONB NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hercu.hercu_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    UUID NOT NULL REFERENCES hercu.hercu_plans(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       hercu.message_role_enum NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION hercu.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hercu_plans_updated_at
  BEFORE UPDATE ON hercu.hercu_plans
  FOR EACH ROW EXECUTE FUNCTION hercu.set_updated_at();

-- Indexes
CREATE INDEX idx_hercu_plans_user_id    ON hercu.hercu_plans(user_id);
CREATE INDEX idx_hercu_messages_user_id ON hercu.hercu_messages(user_id);
CREATE INDEX idx_hercu_messages_plan_id ON hercu.hercu_messages(plan_id);

-- RLS
ALTER TABLE hercu.hercu_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hercu.hercu_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hercu.hercu_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile"   ON hercu.hercu_profiles
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own plans"     ON hercu.hercu_plans
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own messages"  ON hercu.hercu_messages
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
