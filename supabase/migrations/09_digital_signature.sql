-- Sprint G: Digital signature provider columns
-- Adds FEA (Firma Electrónica Avanzada) support for INDECOPI-accredited PSC (DigiSign)

ALTER TABLE medical.clinical_encounters
  ADD COLUMN IF NOT EXISTS signature_provider            text    DEFAULT 'sha256',
  ADD COLUMN IF NOT EXISTS signature_certificate_serial  text,
  ADD COLUMN IF NOT EXISTS signature_timestamp_rfc3161   text;

ALTER TABLE medical.prescriptions
  ADD COLUMN IF NOT EXISTS signature_provider            text    DEFAULT 'sha256',
  ADD COLUMN IF NOT EXISTS signature_certificate_serial  text;

COMMENT ON COLUMN medical.clinical_encounters.signature_provider IS 'PSC utilizado: sha256 (FES) o digisign (FEA INDECOPI)';
COMMENT ON COLUMN medical.clinical_encounters.signature_certificate_serial IS 'Número de serie del certificado DigiSign (cuando provider=digisign)';
COMMENT ON COLUMN medical.clinical_encounters.signature_timestamp_rfc3161 IS 'Token RFC 3161 de sellado de tiempo (cuando provider=digisign)';
