-- Sprint H: Whereby meeting host link + provider tracking

ALTER TABLE medical.appointments
  ADD COLUMN IF NOT EXISTS meeting_provider   text DEFAULT 'google_meet',
  ADD COLUMN IF NOT EXISTS meeting_host_link  text;

COMMENT ON COLUMN medical.appointments.meeting_provider IS 'Proveedor de videoconsulta: google_meet o whereby';
COMMENT ON COLUMN medical.appointments.meeting_host_link IS 'URL con controles de host para el médico (Whereby hostRoomUrl)';
