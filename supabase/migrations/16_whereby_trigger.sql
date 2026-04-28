-- Migration 16: Trigger automático de Whereby para medical.appointments
-- Usa pg_net para llamar a la Edge Function en cada INSERT sin meeting_link

-- Habilitar extensión pg_net (viene preinstalada en Supabase)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Función que dispara la Edge Function de Whereby
CREATE OR REPLACE FUNCTION medical.trigger_create_whereby()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo actuar si no tiene sala asignada
  IF NEW.meeting_link IS NULL THEN
    PERFORM net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/create-whereby-meeting',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body    := jsonb_build_object(
        'record', jsonb_build_object(
          'id',           NEW.id,
          'slot_start',   NEW.slot_start,
          'slot_end',     NEW.slot_end,
          'meeting_link', NEW.meeting_link
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger en INSERT
DROP TRIGGER IF EXISTS on_appointment_insert_create_whereby ON medical.appointments;
CREATE TRIGGER on_appointment_insert_create_whereby
  AFTER INSERT ON medical.appointments
  FOR EACH ROW
  EXECUTE FUNCTION medical.trigger_create_whereby();
