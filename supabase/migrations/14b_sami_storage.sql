-- Bucket de Storage para archivos de audio de Sami
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sami-audio',
  'sami-audio',
  true,
  52428800,  -- 50MB por archivo
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquier usuario autenticado puede leer audio
CREATE POLICY "auth_users_read_audio"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'sami-audio');

-- Política: solo service role puede subir/eliminar audio
CREATE POLICY "service_role_manage_audio"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'sami-audio');
