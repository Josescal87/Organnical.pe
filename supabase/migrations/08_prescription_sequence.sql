-- Sprint C: Prescription number sequence (DIGEMID compliance)
-- Formato: {IPRESS_CODE}-{YYYY}-{000001}

CREATE SEQUENCE IF NOT EXISTS medical.prescription_seq START 1;

CREATE OR REPLACE FUNCTION medical.generate_prescription_number()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_ipress text;
BEGIN
  SELECT value INTO v_ipress FROM medical.system_config WHERE key = 'ipress_code';
  RETURN COALESCE(v_ipress, 'ORG')
    || '-' || to_char(now(), 'YYYY')
    || '-' || lpad(nextval('medical.prescription_seq')::text, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION medical.set_prescription_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.prescription_number IS NULL THEN
    NEW.prescription_number := medical.generate_prescription_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_prescription_number ON medical.prescriptions;
CREATE TRIGGER trg_set_prescription_number
  BEFORE INSERT ON medical.prescriptions
  FOR EACH ROW EXECUTE FUNCTION medical.set_prescription_number();
