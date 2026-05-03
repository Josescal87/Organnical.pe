-- Añade la columna narrator a sami.content
-- Ejecutar en Supabase Dashboard → SQL Editor

ALTER TABLE sami.content
  ADD COLUMN IF NOT EXISTS narrator TEXT;

-- Comentario: valores válidos son los IDs en narrators.json
-- (pescador, abuelo, mujer-selva) o NULL para contenido universal/sin narrador asignado.
