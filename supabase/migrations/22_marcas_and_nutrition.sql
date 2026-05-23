-- 22_marcas_and_nutrition.sql
-- Soporte multi-marca + datos nutricionales para Spirusol y futuras marcas.
-- Spec de referencia: docs/spirusol-claude-code-spec.md §3.
--
-- Decisiones de arquitectura tomadas con el usuario (2026-05-22):
--   • Tabla `marcas` nueva con FK desde productos.marca_id (no campo plano).
--   • Mantener SKUs y precios actuales (SPIRPOL0001 S/60, SPIRCRU0001 S/55).
--   • Mover Spirusol de categoría "Alimentos" a "Superalimentos".
--   • Avanzar con copy "100% espirulina" del spec (TODO: confirmar con Greenner
--     si el producto real es 100% espirulina vs la denominación DIGESA actual
--     que lista "mezcla con moringa"; spec §20).

-- ─── Tabla marcas ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marcas (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text          NOT NULL UNIQUE,
  nombre        text          NOT NULL,
  tagline       text,
  logo_url      text,
  hero_image    text,
  descripcion   text,
  origen        text,
  productor     text,
  certificados  jsonb         NOT NULL DEFAULT '[]'::jsonb,
  theme_tokens  jsonb         NOT NULL DEFAULT '{}'::jsonb,
  social_links  jsonb         NOT NULL DEFAULT '{}'::jsonb,
  visible       boolean       NOT NULL DEFAULT true,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marcas_slug_idx ON public.marcas (slug);

-- RLS: lectura pública (la landing de marca lee sin auth); writes solo service role.
ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marcas_public_read" ON public.marcas;
CREATE POLICY "marcas_public_read"
  ON public.marcas
  FOR SELECT
  USING (visible = true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_marcas_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marcas_set_updated_at ON public.marcas;
CREATE TRIGGER marcas_set_updated_at
  BEFORE UPDATE ON public.marcas
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_marcas_updated_at();

-- ─── productos: columnas nuevas ─────────────────────────────────────────────
ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS marca_id          uuid REFERENCES public.marcas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nutrition_facts   jsonb,
  ADD COLUMN IF NOT EXISTS registro_sanitario text,
  ADD COLUMN IF NOT EXISTS vida_util_meses    integer CHECK (vida_util_meses IS NULL OR vida_util_meses > 0),
  ADD COLUMN IF NOT EXISTS laboratorio        text,
  ADD COLUMN IF NOT EXISTS origen             text;

CREATE INDEX IF NOT EXISTS productos_marca_id_idx ON public.productos (marca_id);

-- ─── Seed: marca Spirusol ───────────────────────────────────────────────────
-- Estructura derivada del spec §3.3 (campos en español para coincidir con resto del schema).
INSERT INTO public.marcas (
  slug, nombre, tagline, logo_url, hero_image, descripcion, origen, productor,
  certificados, theme_tokens
) VALUES (
  'spirusol',
  'Spirusol',
  'Espirulina del sol del sur',
  'https://jeomfjulczuimrmonmom.supabase.co/storage/v1/object/public/brands/spirusol/logo.png',
  'https://jeomfjulczuimrmonmom.supabase.co/storage/v1/object/public/brands/spirusol/hero-arequipa.jpg',
  'Espirulina 100% peruana cultivada bajo el sol privilegiado del sur del Perú. Producida en Moquegua por Greenner SAC con cultivos de Arequipa, una región cuya radiación solar excepcional favorece una densidad nutricional poco común en microalgas.',
  'Arequipa, Perú',
  'Greenner SAC',
  '[
    {"tipo":"vegan-verified","id":"05-260281-1","emisor":"VeganVerified.org","valido_hasta":"2027-02-28"},
    {"tipo":"registro-sanitario","id":"M5828924N","emisor":"DIGESA — MINSA","valido_hasta":"2029-09-30"},
    {"tipo":"informe-laboratorio","id":"000114-2025","emisor":"IIN — Instituto de Investigación Nutricional","fecha":"2025-08-28"}
  ]'::jsonb,
  '{
    "green_900":"oklch(0.32 0.10 145)",
    "green_700":"oklch(0.45 0.13 145)",
    "green_500":"oklch(0.62 0.15 140)",
    "green_100":"oklch(0.94 0.04 140)",
    "sun_500":"oklch(0.78 0.16 75)",
    "sun_100":"oklch(0.96 0.06 80)",
    "water_600":"oklch(0.55 0.08 215)",
    "sand_500":"oklch(0.74 0.06 75)",
    "cream":"oklch(0.97 0.02 90)"
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nombre        = EXCLUDED.nombre,
  tagline       = EXCLUDED.tagline,
  logo_url      = EXCLUDED.logo_url,
  hero_image    = EXCLUDED.hero_image,
  descripcion   = EXCLUDED.descripcion,
  origen        = EXCLUDED.origen,
  productor     = EXCLUDED.productor,
  certificados  = EXCLUDED.certificados,
  theme_tokens  = EXCLUDED.theme_tokens,
  updated_at    = now();

-- ─── Actualizar SKUs Spirusol existentes ────────────────────────────────────
-- Datos nutricionales del Informe IIN N° 000114-2025 (spec §19, no modificar).
-- Estos valores se citan textualmente en la landing y son la base de todas
-- las afirmaciones nutricionales — están validados por el laboratorio.

WITH marca_spirusol AS (
  SELECT id FROM public.marcas WHERE slug = 'spirusol'
)
UPDATE public.productos p
SET
  marca_id           = ms.id,
  categoria          = 'Superalimentos',
  registro_sanitario = 'M5828924N',
  vida_util_meses    = 12,
  laboratorio        = 'IIN — Informe N° 000114-2025',
  origen             = 'Arequipa, Perú',
  nutrition_facts    = '{
    "porcion": "5 g",
    "porciones_por_envase": 20,
    "por_100g": {
      "proteina_g": 67.33,
      "grasa_g": 5.75,
      "carbohidratos_g": 11.73,
      "energia_kcal": 368,
      "humedad_g": 7.90,
      "ceniza_g": 7.29,
      "sodio_mg": 612.6,
      "hierro_mg": 9.69,
      "calcio_mg": 591.4,
      "capacidad_antioxidante_umol_trolox": 13648.4,
      "vitamina_b2_mg": 5.5,
      "vitamina_b6_mg": 0.37
    },
    "fuente": "Informe IIN N° 000114-2025 (Instituto de Investigación Nutricional, La Molina, 28-08-2025)"
  }'::jsonb
FROM marca_spirusol ms
WHERE p.sku IN ('SPIRPOL0001', 'SPIRCRU0001');

-- ─── Populate copy faltante en productos Spirusol ───────────────────────────
-- Los SKUs ya están vivos pero con descripcion_larga, presentacion, peso_g,
-- ingredientes, modo_uso, advertencias todos NULL. Poblar con copy del spec
-- (§3.3 + §8 compliance) para que el detalle se vea completo.

UPDATE public.productos
SET
  descripcion_corta = 'Espirulina pura en polvo, ideal para smoothies, bowls y bebidas funcionales. 67% proteína vegetal.',
  descripcion_larga = 'Espirulina artesanal peruana cultivada bajo el sol de Arequipa, secada a baja temperatura para preservar nutrientes. Polvo finamente molido que se disuelve bien en líquidos. Sin azúcar añadida, sin aditivos. Contiene 67% de proteína vegetal completa, hierro biodisponible y antioxidantes verificados por el Instituto de Investigación Nutricional (IIN).',
  presentacion = 'Doypack 100 g',
  peso_g = 100,
  ingredientes = 'Espirulina (Arthrospira platensis) deshidratada 100%.',
  modo_uso = '1 cucharadita (5 g) en smoothie verde, jugo de naranja o mezclada en masa de panqueques. Comenzar con media cucharadita y aumentar progresivamente.',
  advertencias = 'Consultar con un médico si toma anticoagulantes (la espirulina aporta vitamina K), tiene una enfermedad autoinmune o fenilcetonuria. No reemplaza una dieta balanceada.'
WHERE sku = 'SPIRPOL0001';

UPDATE public.productos
SET
  descripcion_corta = 'Espirulina en gránulos crocantes para topping de yogurt, bowls y ensaladas. Misma nutrición, formato versátil.',
  descripcion_larga = 'Crunchies de espirulina pura. Pequeños gránulos que aportan textura y sabor a recetas dulces y saladas. Misma espirulina premium de Arequipa con 67% de proteína vegetal completa, hierro biodisponible y antioxidantes verificados por el IIN. Formato práctico para sumar a yogurt, granola, bowls o como snack.',
  presentacion = 'Doypack 100 g',
  peso_g = 100,
  ingredientes = 'Espirulina (Arthrospira platensis) deshidratada 100%.',
  modo_uso = 'Espolvorear sobre yogurt, granola, ensaladas o bowls. También se puede comer puro como snack. Comenzar con 1 cucharadita y aumentar gradualmente.',
  advertencias = 'Consultar con un médico si toma anticoagulantes (la espirulina aporta vitamina K), tiene una enfermedad autoinmune o fenilcetonuria. No reemplaza una dieta balanceada.'
WHERE sku = 'SPIRCRU0001';

-- ─── Verificación ───────────────────────────────────────────────────────────
-- Después de aplicar, correr:
--   SELECT sku, descripcion, categoria, marca_id, nutrition_facts->'por_100g'->>'proteina_g' AS proteina
--   FROM public.productos WHERE sku IN ('SPIRPOL0001','SPIRCRU0001');
-- Debe devolver categoria='Superalimentos', marca_id no nulo, proteina='67.33'.
