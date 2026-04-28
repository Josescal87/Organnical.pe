-- Migration 15: Agregar columna region a sami.content
-- Las tres regiones del cielo peruano: costa, sierra, selva
ALTER TABLE sami.content
  ADD COLUMN IF NOT EXISTS region text NOT NULL DEFAULT 'universal'
  CONSTRAINT content_region_check CHECK (region IN ('costa', 'sierra', 'selva', 'universal'));

CREATE INDEX IF NOT EXISTS idx_sami_content_region ON sami.content(region);
