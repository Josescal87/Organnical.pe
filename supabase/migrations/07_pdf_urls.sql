-- =============================================================================
-- Organnical HealthTech — Migración 07: Columnas PDF en clinical_encounters
-- =============================================================================

ALTER TABLE medical.clinical_encounters
  ADD COLUMN IF NOT EXISTS pdf_url text;

COMMENT ON COLUMN medical.clinical_encounters.pdf_url IS
  'URL del PDF de la HC en Supabase Storage (bucket medical-documents)';
