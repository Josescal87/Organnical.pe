-- Libro de Reclamaciones (Ley 29571 INDECOPI)
CREATE TABLE IF NOT EXISTS medical.reclamaciones (
  id            bigserial PRIMARY KEY,
  numero_reclamo text,
  tipo          text NOT NULL CHECK (tipo IN ('reclamo', 'queja')),
  nombre        text NOT NULL,
  dni           text NOT NULL,
  email         text NOT NULL,
  telefono      text,
  descripcion   text NOT NULL,
  pedido        text NOT NULL,
  estado        text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'resuelto', 'cerrado')),
  respuesta     text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Only admins can read/update reclamaciones; inserts come from API with admin client
ALTER TABLE medical.reclamaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_reclamaciones" ON medical.reclamaciones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medical.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
