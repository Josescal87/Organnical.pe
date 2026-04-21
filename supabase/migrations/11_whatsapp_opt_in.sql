-- Sprint H5: WhatsApp opt-in consent field for patients

ALTER TABLE medical.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean DEFAULT false;

COMMENT ON COLUMN medical.profiles.whatsapp_opt_in IS 'Consentimiento explícito para recibir recordatorios por WhatsApp Business (opcional, no bloquea acceso)';
