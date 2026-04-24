-- Migration 013: IPRESS Light Mode
-- Adds ipress_mode flag to system_config.
-- When 'disabled': prescriptions use ORG- prefix, PDFs show doctor info only.
-- When 'enabled': prescriptions use IPRESS code prefix, PDFs show full IPRESS block.

-- 1. Insert the flag (default: disabled)
INSERT INTO medical.system_config (key, value, updated_at)
VALUES ('ipress_mode', 'disabled', now())
ON CONFLICT (key) DO NOTHING;

-- 2. Update the prescription number generator to respect the flag
CREATE OR REPLACE FUNCTION medical.generate_prescription_number()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_mode  text;
  v_ipress text;
BEGIN
  SELECT value INTO v_mode  FROM medical.system_config WHERE key = 'ipress_mode';
  SELECT value INTO v_ipress FROM medical.system_config WHERE key = 'ipress_code';

  IF v_mode = 'enabled' AND v_ipress IS NOT NULL AND v_ipress NOT IN ('PENDIENTE', '') THEN
    RETURN v_ipress
      || '-' || to_char(now(), 'YYYY')
      || '-' || lpad(nextval('medical.prescription_seq')::text, 6, '0');
  ELSE
    RETURN 'ORG'
      || '-' || to_char(now(), 'YYYY')
      || '-' || lpad(nextval('medical.prescription_seq')::text, 6, '0');
  END IF;
END;
$$;
