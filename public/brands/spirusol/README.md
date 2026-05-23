# Spirusol — assets físicos

Archivos que la landing y el PDP esperan en `/public/brands/spirusol/` y en el bucket
Supabase Storage `brands/spirusol/`. Si falta alguno, la página renderiza un placeholder
con fallback (gradiente o icono) pero el resultado se ve incompleto.

## En `/public/brands/spirusol/` (servidos por Vercel, no por Supabase)

| Archivo | Uso | Estado |
|---|---|---|
| `og-image.jpg` | Open Graph cuando se comparte spirusol.organnical.pe (1200×630, JPG/PNG) | **Falta — placeholder en metadata** |
| `cert-vegan-verified.pdf` | Modal de certificados §5.7 | **Falta** |
| `registro-sanitario.pdf` | Modal de certificados §5.7 | **Falta** |
| `informe-iin-2025.pdf` | Modal de certificados §5.7 | **Falta** |

## En bucket Supabase `brands/spirusol/` (público)

| Archivo | URL | Uso |
|---|---|---|
| `logo.png` | `https://jeomfjulczuimrmonmom.supabase.co/storage/v1/object/public/brands/spirusol/logo.png` | Chip de marca en PDP + hero subdominio |
| `hero-arequipa.jpg` | `https://jeomfjulczuimrmonmom.supabase.co/storage/v1/object/public/brands/spirusol/hero-arequipa.jpg` | Background hero §5.1 |

La URL ya está apuntada en `public.marcas.logo_url` y `public.marcas.hero_image`. Cuando
subas los archivos físicos a Supabase Storage con esos nombres exactos, automáticamente
aparecerán sin tocar código.

## En bucket Supabase `product-images/` (público) — opcional para galería completa

Spec §3.3 lista una galería de 3-4 imágenes por SKU. Solo `main.jpg` está subida hoy.

| SKU | Archivos sugeridos | Estado |
|---|---|---|
| SPIRPOL0001 | `main.jpg` ✓, `2-back.jpg`, `3-lifestyle-smoothie.jpg`, `4-nutrition-table.jpg` | 1/4 |
| SPIRCRU0001 | `main.jpg` ✓, `2-texture-macro.jpg`, `3-lifestyle-bowl.jpg` | 1/3 |

Si subís más imágenes a esas rutas, actualizá `productos.imagenes_galeria` con un array
de URLs (separadas por `,` en Ruby si lo hacés desde la UI admin):

```sql
UPDATE productos SET imagenes_galeria = ARRAY[
  'https://jeomfjulczuimrmonmom.supabase.co/storage/v1/object/public/product-images/SPIRPOL0001/2-back.jpg',
  'https://jeomfjulczuimrmonmom.supabase.co/storage/v1/object/public/product-images/SPIRPOL0001/3-lifestyle-smoothie.jpg'
] WHERE sku = 'SPIRPOL0001';
```
