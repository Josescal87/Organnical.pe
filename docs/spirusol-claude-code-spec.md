# Spirusol × Organnical — Spec de implementación para Claude Code

> **Cómo usar este documento.** Está escrito para ser leído por Claude Code dentro del repo de organnical.pe. Cada fase referencia las **skills exactas** a invocar antes de tocar archivos. El orden importa: invoca la skill, leé su SKILL.md, luego ejecutá la fase. No inventes patrones que la skill ya resuelve.
>
> Sigue la regla operativa de skills: **research/contexto primero, output-format skills después**. Aquí ya hicimos el research (este archivo es el resultado), así que cuando llegues a fases de output (docx/pdf de fichas técnicas, xlsx de inventario, etc.) lee la SKILL.md de output recién en esa fase.

---

## 0. TL;DR de la decisión

| Decisión | Valor | Razón |
|---|---|---|
| Arquitectura subdominio | **Landing estática + link a tienda** | `spirusol.organnical.pe` es marketing/storytelling. Catálogo y checkout viven en `organnical.pe/tienda`. Un único schema, un único checkout, un único Pixel base. |
| Alcance fase 1 | **End-to-end** | Landing + 2 SKUs en catálogo + 3 posts blog seed + email Spirusol + brief Higgsfield (10 videos) + Meta Pixel/CAPI con `content_brand=spirusol` + A/B testing mes 1. |
| Tipo de tenant | **Marca dentro de Organnical** | Spirusol NO es un tenant separado. Es la **marca #2** del catálogo (la #1 es Yumi Gumi). La página de marca es un `app/(marketing)/[brand]/page.tsx` servido también vía rewrite desde el subdominio. |
| Categoría de tienda | **Superalimentos** | Nueva categoría hermana de "Gomitas" y "Bebidas". |

---

## 1. Contexto

**Organnical.pe** — Clínica virtual de medicina integrativa en Perú. Stack Next.js App Router + Supabase (Postgres + Storage). Ya vende la marca propia **Yumi Gumi** (gummies, S/79–104) y agenda teleconsultas. Categorías actuales en tienda: Gomitas, Bebidas. URL de productos: `/productos/[slug]`. Almacenamiento de imágenes: `https://jeomfjulczuimrmonmom.supabase.co/storage/v1/object/public/product-images/<SKU>/main.jpg`.

**Spirusol** — Espirulina premium 100% peruana, producida por **Greenner SAC** (planta en Moquegua, cultivo en Arequipa). 2 SKUs: polvo y crunchie, ambos en doypack de 100g. Vegan Verified, registro sanitario MINSA vigente, informe IIN con 67.33% proteína, 13,648 µmol Trolox/100g antioxidantes, 9.69 mg/g hierro.

**Encaje estratégico.** Organnical posiciona "productos que sí funcionan, respaldados por médicos". Spirusol llega con evidencia de laboratorio (IIN), certificación vegana internacional y registro sanitario — encaja sin fricción narrativa. Audiencia: mujeres 30–55 con interés en bienestar integrativo (audiencia que ya consume Yumi Gumi), más un segmento nuevo de **deportistas / veganos / personas con anemia** que Yumi Gumi no captura.

---

## 2. Marca: identidad visual y verbal

### 2.1 Paleta (Spirusol)

```css
/* tokens/spirusol.css — derivados del logo y doypack */
:root {
  /* Verde Spirusol — usar como brand primary de la landing */
  --spirusol-green-900: oklch(0.32 0.10 145);   /* #1E5E3D  borde logo, texto SPIRUSOL */
  --spirusol-green-700: oklch(0.45 0.13 145);   /* #2E7A4D  CTAs, headings */
  --spirusol-green-500: oklch(0.62 0.15 140);   /* #6DA94C  esferas espirulina */
  --spirusol-green-100: oklch(0.94 0.04 140);   /* fondo soft */

  /* Sol andino — acento cálido para badges y micro-detalles */
  --spirusol-sun-500:   oklch(0.78 0.16 75);    /* #F2A93B */
  --spirusol-sun-100:   oklch(0.96 0.06 80);    /* fondo soft */

  /* Agua / lago — secundario para callouts antioxidante */
  --spirusol-water-600: oklch(0.55 0.08 215);   /* #2E8696 */

  /* Misti / arena — neutro cálido para storytelling Arequipa */
  --spirusol-sand-500:  oklch(0.74 0.06 75);    /* #C9A47A */

  /* Off-white de fondo de packaging */
  --spirusol-cream:     oklch(0.97 0.02 90);    /* #FAF8F2 */
}
```

Mantén los tokens semánticos de Organnical (`--bg-surface`, `--text-default`, etc.). La paleta Spirusol entra como **brand override** solo dentro de `spirusol.organnical.pe/*` y de la categoría Superalimentos en la tienda.

### 2.2 Tipografía

- **Display:** la fuente display de Organnical (la misma del hero "Productos que sí funcionan"). No introducir otra.
- **Cuerpo:** Inter / Geist sans (la que ya use Organnical).
- **Acento numérico:** `font-variant-numeric: tabular-nums` para las tablas de comparación nutricional.

### 2.3 Voz de marca Spirusol

- **Tono:** raíz peruana + ciencia. Habla de Arequipa, del sol, del lago, del cultivo. Cita datos del IIN como ancla de credibilidad.
- **No usar:** "milagroso", "cura", "previene enfermedades" (prohibido por art. 117° DS 007-98-SA y por punto j del Registro Sanitario MINSA).
- **Sí usar:** "aporta", "contribuye a", "contiene", "es fuente de", "ayuda en el contexto de una dieta balanceada".

### 2.4 Iconos de beneficios (los mismos del doypack)

| Icono | Beneficio | Uso |
|---|---|---|
| 💪 / silueta brazo | Masa Muscular | 67% proteína vegetal completa |
| ⚡ / rayo | Energía Natural | hierro 969 mg/kg |
| 🛡️ + flor | Antioxidante | 13,648 µmol Trolox/100g |
| 🩺 / corazón | Fortalece Sistema Inmune | B-complex + clorofila |

---

## 3. Modelo de datos — deltas sobre el schema actual

> **Skill obligatoria antes de tocar esto:** `database-schema-ecommerce`. Lee su SKILL.md para confirmar convenciones (snapshots en orden, variant vs product, indexes).
>
> **Skill complementaria:** `multi-tenancy` — aunque Spirusol no sea un tenant, la propiedad `brandId` en Product se modela como `tenantId` lite: filtro por marca, no aislamiento.

### 3.1 Tabla `Brand`

```prisma
// prisma/schema.prisma — append
model Brand {
  id          String   @id @default(cuid())
  slug        String   @unique             // "spirusol", "yumi-gumi"
  name        String                       // "Spirusol"
  tagline     String?                      // "Espirulina del sol del sur"
  logoUrl     String                       // Supabase public URL
  heroImage   String?                      // imagen full-bleed para la landing de marca
  description String   @db.Text            // bio breve, 2–3 párrafos
  origin      String?                      // "Arequipa, Perú"
  producer    String?                      // "Greenner SAC"
  certificates Json?                       // [{type:"vegan", id:"05-260281-1", validUntil:"2027-02-28"}, ...]
  socialLinks Json?
  themeTokens Json?                        // override de CSS variables para la página de marca
  createdAt   DateTime @default(now())
  products    Product[]
  posts       Post[]                       // blog posts asociados a la marca

  @@index([slug])
}
```

### 3.2 `Product` — campos nuevos

```prisma
model Product {
  // ...campos existentes
  brandId        String?
  brand          Brand?   @relation(fields:[brandId], references:[id])

  // ya existe `category` (Gomitas, Bebidas). Sumar "Superalimentos".
  category       String

  // Datos regulatorios — críticos para alimentos en Perú
  registroSanitario String?            // "M5828924N"
  vidaUtilMeses     Int?               // 12
  laboratorio       String?            // "IIN — Informe N° 000114-2025"

  // Nutrición — para la tabla comparativa
  nutritionFacts Json?
  // { servingSize: "5 g", servingsPerContainer: 20,
  //   per100g: { protein: 67.33, fat: 5.75, carbs: 11.73, energy: 368,
  //              fiber: null, sodium: 612.6, iron: 9.69, calcium: 591.4,
  //              antioxidantCapacity: 13648.4, vitB2: 5.5, vitB6: 0.37 } }

  // Origen
  origin         String?              // "Arequipa, Perú"

  @@index([brandId])
}
```

### 3.3 Datos seed — los 2 SKUs de Spirusol

```ts
// prisma/seed-spirusol.ts
await prisma.brand.upsert({
  where: { slug: "spirusol" },
  update: {},
  create: {
    slug: "spirusol",
    name: "Spirusol",
    tagline: "Espirulina del sol del sur",
    logoUrl: "https://...supabase.../brands/spirusol/logo.png",
    heroImage: "https://...supabase.../brands/spirusol/hero-arequipa.jpg",
    description: "Espirulina 100% peruana cultivada bajo el sol privilegiado del sur del Perú. Producida en Moquegua por Greenner SAC con cultivos de Arequipa, una región cuya radiación solar excepcional favorece una densidad nutricional poco común en microalgas.",
    origin: "Arequipa, Perú",
    producer: "Greenner SAC",
    certificates: [
      { type: "vegan-verified", id: "05-260281-1", issuer: "VeganVerified.org", validUntil: "2027-02-28" },
      { type: "registro-sanitario", id: "M5828924N", issuer: "DIGESA — MINSA", validUntil: "2029-09-30" },
      { type: "informe-laboratorio", id: "000114-2025", issuer: "IIN — Instituto de Investigación Nutricional", date: "2025-08-28" }
    ],
    themeTokens: { /* tokens del bloque 2.1 */ }
  }
});

const spirusol = await prisma.brand.findUnique({ where: { slug: "spirusol" }});

await prisma.product.upsert({
  where: { sku: "SPSL-POL-100" },
  update: {},
  create: {
    sku: "SPSL-POL-100",
    slug: "spirusol-espirulina-polvo-100g",
    name: "Spirusol — Espirulina en Polvo 100g",
    brandId: spirusol!.id,
    category: "Superalimentos",
    price: 5900,                              // S/ 59.00 en céntimos (precio retail sugerido)
    compareAtPrice: null,
    shortDescription: "Espirulina pura en polvo, ideal para smoothies, bowls y bebidas funcionales. 67% proteína vegetal.",
    description: "100% espirulina artesanal peruana. Cultivada bajo el sol de Arequipa, secada a baja temperatura para preservar nutrientes. Sin azúcar añadida, sin aditivos. Polvo finamente molido que se disuelve bien en líquidos.",
    origin: "Arequipa, Perú",
    registroSanitario: "M5828924N",
    vidaUtilMeses: 12,
    laboratorio: "IIN — Informe N° 000114-2025",
    nutritionFacts: {
      servingSize: "5 g",
      servingsPerContainer: 20,
      per100g: {
        protein: 67.33, fat: 5.75, carbs: 11.73, energy: 368,
        moisture: 7.90, ash: 7.29,
        sodium: 612.6, iron: 9.69, calcium: 591.4,
        antioxidantCapacity: 13648.4,
        vitB2: 5.5, vitB6: 0.37
      }
    },
    images: [
      "product-images/SPSL-POL-100/main.jpg",
      "product-images/SPSL-POL-100/2-back.jpg",
      "product-images/SPSL-POL-100/3-lifestyle-smoothie.jpg",
      "product-images/SPSL-POL-100/4-nutrition-table.jpg"
    ],
    stock: 0,           // setear al recibir inventario
    status: "ACTIVE",
  }
});

await prisma.product.upsert({
  where: { sku: "SPSL-CRU-100" },
  update: {},
  create: {
    sku: "SPSL-CRU-100",
    slug: "spirusol-espirulina-crunchie-100g",
    name: "Spirusol — Espirulina Crunchie 100g",
    brandId: spirusol!.id,
    category: "Superalimentos",
    price: 5400,                              // S/ 54.00
    shortDescription: "Espirulina en gránulos crocantes para topping de yogurt, bowls y ensaladas. Misma nutrición, formato versátil.",
    description: "Crunchies de espirulina pura. Pequeños gránulos que aportan textura y sabor a recetas dulces y saladas. Misma espirulina premium de Arequipa, mismo perfil nutricional, formato práctico.",
    origin: "Arequipa, Perú",
    registroSanitario: "M5828924N",
    vidaUtilMeses: 12,
    laboratorio: "IIN — Informe N° 000114-2025",
    nutritionFacts: { /* mismo perfil — es la misma materia prima */ },
    images: [
      "product-images/SPSL-CRU-100/main.jpg",
      "product-images/SPSL-CRU-100/2-texture-macro.jpg",
      "product-images/SPSL-CRU-100/3-lifestyle-bowl.jpg"
    ],
    stock: 0,
    status: "ACTIVE",
  }
});
```

> **Decisión de pricing.** Catálogo sugerido S/55–60 (polvo) y S/50–55 (crunchie). Fijamos **S/59 y S/54** para encajar con el ladder mental de Organnical (Yumi Gumi 79 → 104; Spirusol 54 → 59; ticket medio sube). El comparativo wholesale (S/27 / S/25) queda fuera de la tienda directa al consumidor.

### 3.4 Migración

```bash
pnpm prisma migrate dev --name add_brand_and_nutrition
pnpm tsx prisma/seed-spirusol.ts
```

---

## 4. Páginas y rutas

### 4.1 Subdominio → mismo Next.js, vía middleware

> **Skill:** `nextjs-ecommerce` — patrón de route groups y middleware.

```ts
// middleware.ts — sumar reglas
const host = req.headers.get("host") ?? "";
if (host.startsWith("spirusol.")) {
  // rewrite a la ruta de marca, manteniendo URL bonita en el browser
  const url = req.nextUrl.clone();
  if (url.pathname === "/") url.pathname = "/marcas/spirusol";
  else url.pathname = `/marcas/spirusol${url.pathname}`;
  return NextResponse.rewrite(url);
}
```

Configurar el dominio en Vercel:
1. Añadir `spirusol.organnical.pe` como dominio del proyecto.
2. DNS de organnical.pe: `CNAME spirusol → cname.vercel-dns.com`.
3. SSL: automático vía Vercel.

### 4.2 Rutas nuevas

```
app/
  marcas/
    [brand]/
      page.tsx                  → landing de marca (default: Spirusol o futuras)
      productos/
        page.tsx                → grid filtrado por brand
      recetas/
        page.tsx                → recetas de la marca (CMS o MDX)
        [slug]/page.tsx
      sobre/
        page.tsx                → historia de la marca (Greenner, Arequipa)
  productos/[slug]/page.tsx     → ya existe; sumar bloque Brand + nutrition + certificados
  tienda/
    page.tsx                    → ya existe; sumar filtro de categoría "Superalimentos"
```

### 4.3 Sitemap y robots — actualizar

> **Skill:** `ecommerce-seo`.

- `app/sitemap.ts` — agregar dinámicamente todas las rutas `marcas/[slug]/*`.
- `robots.txt` — incluir `spirusol.organnical.pe` en la host directive si Google lo reporta como host duplicado.
- `canonical` — la landing en subdominio canonicaliza a sí misma (`https://spirusol.organnical.pe/`), no a `organnical.pe/marcas/spirusol`. Google maneja ambos si los `<link rel="canonical">` están bien.

---

## 5. Landing spirusol.organnical.pe — wireframe y copy

> **Skills a invocar antes de codear:** `landing-page-design`, `typography-mastery`, `motion-design`, `frontend-design`, `responsive-mobile-first`. Léelas en ese orden, en una sesión, y luego ejecuta.

### Estructura

#### Sección 1 — Hero
**Fondo:** foto panorámica del Misti al amanecer con leve overlay verde/cream.
**Headline (display, 56–72px desktop, balance):**
> Espirulina cultivada bajo el sol del Misti.

**Subhead (20px, max-w 60ch):**
> 67% proteína vegetal completa, hierro biodisponible y antioxidantes verificados por el IIN. Hecha en Arequipa por Greenner.

**CTA primario:** `Comprar en la tienda →` (enlaza `organnical.pe/tienda?marca=spirusol&utm_source=spirusol_subdomain&utm_medium=landing&utm_campaign=launch`)
**CTA secundario:** `Conocer la espirulina ↓` (scroll a sección 2)

**Trust strip bajo el CTA:** logos pequeños de Vegan Verified, MINSA Registro Sanitario, IIN. Texto: *Certificado vegano internacional · Registro Sanitario M5828924N · Análisis IIN 2025.*

#### Sección 2 — Por qué Spirusol (4 stat cards)

Cuatro tarjetas grandes en grid 2×2 (desktop) / 1×4 (mobile), con icono, número grande y micro-explicación.

| Card | Número | Etiqueta | Fuente |
|---|---|---|---|
| Proteína | **67%** | Proteína vegetal completa con todos los aminoácidos esenciales | IIN |
| Antioxidantes | **13,648** | µmol Trolox/100g — 3× más que arándanos | IIN |
| Hierro | **9.7 mg** | por cada 100g — fuente vegetal concentrada | IIN |
| Pureza | **100%** | Sin azúcar añadida, sin aditivos, sin gluten | Vegan Verified |

#### Sección 3 — Storytelling Arequipa (split)

**Izquierda:** foto del estanque de cultivo o del Misti.
**Derecha:**
> ### Donde el sol trabaja para ti
> Arequipa recibe una de las radiaciones solares más altas del Perú. Esa luz no es un detalle estético: es lo que permite que nuestras microalgas sinteticen más clorofila, más proteína y más antioxidantes que las que crecen en otros climas.
>
> Greenner SAC, productora local, cosecha y seca a baja temperatura para preservar lo que el sol construyó. Sin atajos industriales.

#### Sección 4 — Tabla comparativa

Componente cliente (`'use client'`) con tabs entre **Proteína**, **Hierro**, **Antioxidantes**. Cada tab muestra una barra horizontal animada (framer-motion) comparando Spirusol vs alimentos de referencia.

```
Proteína (g/100g)
Spirusol  ████████████████████████████████ 67
Carne     ███████████ 23
Lentejas  ████ 9
Quinua    ██ 4

Hierro (mg/100g)
Spirusol  ██████████████████ 9.7
Lentejas  ████ 3.3
Espinaca  █ 2.7
Quinua    ██ 4.6

Antioxidantes (µmol Trolox/100g)
Spirusol   ██████████████████████████████ 13,648
Cacao      ███████████████ 6,824
Arándanos  █████████ 4,549
```

> **Disclaimer al pie de la tabla, micro (12px gris):**
> Valores referenciales según informe IIN N° 000114-2025 (Spirusol) y bibliografía Collazos 1993. No reemplaza una dieta variada.

#### Sección 5 — Cómo se toma (3 cards)

| Polvo | Crunchie |
|---|---|
| 1 cucharadita (5g) en smoothie verde matinal | Espolvorear sobre yogurt o granola |
| Disolver en jugo de naranja para enmascarar el sabor a alga | Mezclar en ensaladas como topping crocante |
| Mezclar en masa de panqueques | Comer puro como snack |

Tercera card: link a `/marcas/spirusol/recetas`.

#### Sección 6 — Productos (grid de 2)

Dos tarjetas grandes con foto doypack (la que tenés en la carpeta), nombre, precio, CTA "Agregar al carrito" (Server Action al carrito de Organnical) y "Ver ficha" → `organnical.pe/productos/spirusol-espirulina-polvo-100g`.

#### Sección 7 — Certificaciones y trust (galería de credenciales)

Cuatro mini-cards con foto del certificado (mini-thumbnail) y CTA "Ver documento" que abre el PDF en modal o nueva tab. Documentos a subir:
- `/public/brands/spirusol/cert-vegan-verified.pdf`
- `/public/brands/spirusol/registro-sanitario.pdf`
- `/public/brands/spirusol/informe-iin-2025.pdf`
- (Opcional) Análisis de metales pesados — pedirlo a Greenner antes del launch.

#### Sección 8 — Habla con un médico (cross-sell a telemedicina)

Aprovecha la maquinaria existente de Organnical. Reusa el componente del home actual:
> ### ¿No estás seguro si te conviene?
> Conversa con un médico integrativo de Organnical. Te orientamos sobre dosis, contraindicaciones (anticoagulantes, autoinmunes) y cómo encajar Spirusol con tu salud.
>
> `Consulta Express S/30 →` `Agendar consulta →`

#### Sección 9 — FAQ (acordeón)

Mínimo 8 preguntas. Borrador inicial:
1. ¿Qué es la espirulina y por qué se considera un superalimento?
2. ¿Cuál es la diferencia entre Polvo y Crunchie?
3. ¿Cuánto debo tomar al día?
4. ¿Tiene efectos secundarios? ¿Quién no debería tomarla?
5. ¿Por qué Spirusol vs otras espirulinas en el mercado?
6. ¿Cómo guardo el producto y cuánto dura abierto?
7. ¿De dónde viene? ¿Cómo se certifica que es vegana?
8. ¿Hacen envío a todo el Perú?

Cada FAQ con `FAQPage` JSON-LD (skill `ecommerce-seo`).

#### Sección 10 — Footer pre-cierre

Repite los 4 trust badges, link a tienda, link a blog, WhatsApp.

### Componentes a generar

> **Skill obligatoria:** `frontend-design` — para evitar el look "AI-generated" genérico. Pídele al codeo que use tipografía mixed-weight y composiciones asimétricas.

| Componente | Tipo | Skill primaria |
|---|---|---|
| `<BrandHero>` | RSC + 1 Client island para parallax | landing-page-design |
| `<NutrientStatGrid>` | RSC | data-display-patterns |
| `<NutritionComparisonChart>` | Client (framer-motion) | data-display-patterns, motion-design |
| `<UsageCards>` | RSC | landing-page-design |
| `<BrandProductGrid>` | RSC + Server Action add-to-cart | product-catalog-ui |
| `<CertificateGallery>` | RSC + modal client | navigation-patterns |
| `<MedicalConsultCTA>` | RSC — reusa el del home | landing-page-design |
| `<BrandFAQ>` | RSC con JSON-LD | ecommerce-seo |

---

## 6. Ficha de producto (PDP) — extensiones

> **Skill:** `product-detail-page`. Léela completa antes de tocar `app/productos/[slug]/page.tsx`.

Sobre la PDP existente, agregar bloques **solo cuando `product.brand?.slug === "spirusol"`** (o cuando `product.brand` exista, para que futuras marcas hereden):

1. **Header de marca** — chip con logo Spirusol y link a `/marcas/spirusol`.
2. **Tabla nutricional desplegable** — render desde `product.nutritionFacts` con tabular-nums.
3. **Origen + productor** — "Arequipa, Perú · Greenner SAC".
4. **Bloque certificaciones** — los 3 badges con tooltip.
5. **Trust de Organnical** — "Avalado por nuestro equipo médico integrativo" (solo si Sergio confirma que el equipo lo respalda; si no, omitir).
6. **JSON-LD** — agregar `nutrition` ampliado y `brand` con el Brand entity.

```tsx
// schema.org Product JSON-LD — campos a sumar
{
  "@type": "Product",
  "brand": { "@type": "Brand", "name": "Spirusol", "logo": "..." },
  "category": "Superalimentos > Espirulina",
  "nutrition": {
    "@type": "NutritionInformation",
    "servingSize": "5 g",
    "proteinContent": "3.4 g",
    "calories": "18 kcal"
  },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Registro Sanitario MINSA", "value": "M5828924N" },
    { "@type": "PropertyValue", "name": "Certificación", "value": "Vegan Verified" }
  ]
}
```

---

## 7. Catálogo principal — exposición de la nueva categoría

> **Skill:** `product-catalog-ui`.

Cambios en `/tienda`:

1. Sumar "Superalimentos" en el filtro de categorías (sidebar y mobile drawer).
2. Sumar filtro **Marca** (nuevo) — multi-select. Inicialmente con dos opciones: Yumi Gumi, Spirusol.
3. URL state: `/tienda?categoria=superalimentos&marca=spirusol`.
4. Banner pequeño cuando `marca=spirusol`: chip con logo + link a la landing de marca ("Ver mundo Spirusol →").
5. Tarjeta de producto en grid: badge nuevo verde "NUEVO" sobre los 2 SKUs durante los primeros 30 días.

---

## 8. Compliance — esto NO es opcional

Spirusol es un **alimento de consumo humano**, no un suplemento dietético farmacéutico. La regulación clave en Perú es:

| Norma | Restricción | Acción |
|---|---|---|
| DS 007-98-SA art. 117° | No hacer alusión a propiedades **medicinales, preventivas o curativas** | Revisar todo copy del landing y PDP por verbos prohibidos |
| Registro Sanitario punto j | No mencionar dosificación específica como si fuera medicamento | "1 cucharadita en smoothie" es uso culinario y está OK; "tomar 5g diarios para curar anemia" NO está OK |
| Ley 30021 / Manual de Advertencias (octógonos) | Si el producto excede umbrales de sodio/grasa/azúcar | Espirulina pura está OK (no excede); confirmar con DIGESA si los octógonos aplican. La etiqueta del doypack actual no los muestra, lo cual sugiere que no aplican |
| Ley 29571 Código de Defensa del Consumidor | Toda afirmación nutricional debe estar respaldada | Usar siempre los valores del IIN como fuente citada |
| INDECOPI publicidad comparativa | Comparaciones con otros alimentos deben ser verificables y no denigratorias | "3× más antioxidantes que arándanos" es OK con cita IIN/Collazos; no nombrar competidores directos (otras marcas de espirulina) |

### Copy review checklist (correr antes de publicar)

- [ ] Buscar "cura", "previene", "trata", "elimina", "soluciona" → reemplazar por "aporta", "contribuye a", "contiene", "es fuente de".
- [ ] Buscar "milagroso", "garantiza", "100% efectivo" → eliminar.
- [ ] Toda afirmación numérica linkea o cita el Informe IIN 000114-2025.
- [ ] El footer del landing tiene disclaimer: *"Spirusol es un alimento. Los valores nutricionales son referenciales. No reemplaza una dieta balanceada ni la indicación médica. Para asesoría personalizada, consulta con un médico de Organnical."*
- [ ] Sección FAQ menciona contraindicaciones: anticoagulantes (vitamina K), enfermedades autoinmunes, fenilcetonuria. **Esto es obligatorio.**
- [ ] Libro de reclamaciones de Organnical es accesible desde el landing (link en footer).

---

## 9. Pixel / CAPI por marca

> **Skill obligatoria:** `meta-pixel-capi`.

Organnical ya tiene Pixel. Para Spirusol queremos **atribución segmentada** sin crear un Pixel separado.

```ts
// lib/analytics/events.ts — extender
trackEvent("ViewContent", {
  content_ids: [product.sku],
  content_brand: product.brand?.slug,         // ← clave
  content_category: product.category,
  value: product.price / 100,
  currency: "PEN"
});

trackEvent("AddToCart", { /* same shape */ });
trackEvent("Purchase", {
  contents: order.items.map(i => ({
    id: i.sku, quantity: i.quantity, item_price: i.price/100, brand: i.brand?.slug
  })),
  value: order.total/100, currency:"PEN"
});
```

**CAPI server-side**: en el webhook de MercadoPago, agregar `content_brand` derivado del primer item. Esto deduplica por `event_id` con el browser pixel.

**En Ads Manager:** crear un **Custom Conversion** filtrando `content_brand=spirusol` para medir el ROAS de la campaña Spirusol sin contaminar con Yumi Gumi.

---

## 10. Higgsfield — 10 videos UGC fase 1

> **Skill obligatoria:** `higgsfield-content-factory`. Léela y corre Stage 1.
>
> **Skills complementarias para el brief:** `hook-writing-for-ugc`, `prompt-engineering-for-ai-video`, `visual-consistency-across-content`, `ad-copy-frameworks`, `meta-ads-creative-best-practices`, `captions-and-subtitles-strategy`.

### Brief de marca para el factory

```yaml
brand: Spirusol
parent_brand: Organnical
hero_product_image: <Foto doypack polvo.jpg en uploads>
secondary_product: <Foto doypack crunchie.jpg>

audience_segments:
  - mujeres 30–55 wellness Lima (cruce con Yumi Gumi)
  - deportistas / fitness 22–40 (segmento nuevo)
  - veganos / plant-based 25–45 (segmento nuevo)
  - personas con diagnóstico de anemia leve / fatiga (segmento médico)

positioning_angle: "Espirulina que sí tiene la nutrición que promete — con análisis del IIN para probarlo."

unique_mechanism: "Sol andino + secado a baja temperatura preservan 67% proteína y antioxidantes 3× más densos que arándanos."

visual_signature:
  palette: [#1E5E3D, #6DA94C, #F2A93B, #FAF8F2]
  lighting: "luz dorada cálida tipo amanecer andino"
  setting_palette: "cocina blanca minimalista + plano abierto Misti/Arequipa para storytelling"
  film_aesthetic: "documental cálido + UGC nativo (no estudio comercial)"

formats_to_produce: 10 videos = 2 por cada uno de los 5 formatos
  - UGC Entertainment (challenge): "5 días tomando espirulina"
  - Street Interview: "¿Cuánta proteína tiene tu desayuno?" en mercado de Surquillo
  - Unboxing: doypack + scoop + smoothie reveal
  - Product Review: I-was-skeptical-but framework, mujer 35–45
  - ASMR: scoop en agua, gránulos crunchie en yogurt, espuma del smoothie

hook_pool:
  - "Tomé esto 7 días y mi última analítica salió diferente." [resultado]
  - "Si tienes anemia, escucha." [polarizing]
  - "Mi nutricionista no me cree." [contradiction]
  - "Esta espirulina tiene 3× más antioxidantes que tus arándanos." [number]
  - "POV: descubres que la mejor espirulina del mundo es peruana." [POV]

ctas: "Compralo en organnical.pe → Spirusol"

compliance:
  forbidden_claims: ["cura", "previene", "trata", "garantiza"]
  required_disclaimer_in_description: "No reemplaza indicación médica. Registro Sanitario M5828924N."
```

### Pipeline (5 stages de la skill)

1. Probe Marketing Studio capability, research trends de "espirulina", "anemia", "proteína vegetal" en TikTok/IG/YT Perú/México.
2. Generar HTML content plan con 10 videos.
3. Generar videos batch por formato + image asset pack (4 imágenes por video) vía GPT Image 2.0.
4. Schedule a Meta Ads vía Meta MCP (cuando esté listo el píxel CAPI con `content_brand=spirusol`).
5. Cost comparison Higgsfield USD vs producción tradicional.

---

## 11. Blog seed — 3 posts

> **Skills:** `editorial-design`, `ecommerce-seo`, `rag-retrieval-augmented-generation` (opcional para citar IIN dentro del CMS).

Cada post 1,200–1,800 palabras, MDX en `content/blog/`, con Author del equipo médico de Organnical, no de Spirusol (mantenemos la voz médica como autoridad).

| Slug | Título | Categoría | Keyword principal |
|---|---|---|---|
| `espirulina-proteina-vegetal-evidencia` | Espirulina: la única proteína vegetal con perfil completo de aminoácidos | Nutrición | "espirulina proteína" |
| `anemia-hierro-vegetal-espirulina` | Anemia y hierro vegetal: por qué la espirulina tiene 3× más hierro que las lentejas | Anemia / Salud Femenina | "hierro vegetal anemia" |
| `antioxidantes-espirulina-vs-arandanos` | Antioxidantes: la espirulina cultivada en Arequipa medida en laboratorio | Bienestar | "antioxidantes espirulina" |

Cada post linkea a la ficha de producto Spirusol (no al subdominio — para concentrar autoridad SEO en organnical.pe).

---

## 12. Emails y WhatsApp

> **Skills:** `transactional-emails`, `whatsapp-notifications`.

### Templates nuevos (Resend / React Email)

1. **Bienvenida Spirusol** (trigger: primer Purchase con `content_brand=spirusol`) — recetas + cómo guardarlo + link a recetas en la landing.
2. **Review request Spirusol** (trigger: 14 días post-entrega) — reusa template existente pero con CTA propio.
3. **Reabastecimiento** (trigger: 25 días post-Purchase si no hay recompra) — "Tu Spirusol está por acabarse" + descuento 10%.

### Plantillas de WhatsApp (Meta Cloud API)

Crear y enviar a Meta para aprobación con 48h de anticipación:
- `spirusol_order_confirmation_v1`
- `spirusol_shipped_v1`
- `spirusol_replenish_reminder_v1`

> Mantener disclaimer en la primera plantilla: "Este es un mensaje automático de Organnical. Para consultas médicas escríbenos a +51 952 476 574."

---

## 13. Merchant feed y Google Shopping

> **Skill:** `google-merchant-feed`.

- Sumar los 2 SKUs al feed dinámico `/api/merchant-feed.xml`.
- Categoría Google: `Food, Beverages & Tobacco > Food Items > Dietary Supplements`.
- `brand: Spirusol`, `gtin: <pendiente — pedir a Greenner si lo tienen>`, `mpn: SPSL-POL-100 / SPSL-CRU-100`.

---

## 14. A/B testing — primer mes

> **Skill:** `ab-testing-creatives`. Una sola variable por test.

| Semana | Test | Variantes | Métrica clave | Presupuesto |
|---|---|---|---|---|
| 1 | Hook por formato | 5 hooks × 5 formatos | Hook rate (3s view) | S/ 1,500 |
| 2 | Ganadores semana 1 vs nuevos | Top 3 vs 3 nuevos | Hold rate (15s) | S/ 2,000 |
| 3 | Framework de copy (PAS vs BAB vs Skeptical) | 3 frameworks × top-format | CTR | S/ 2,500 |
| 4 | Scale del ganador | 2× presupuesto del top combo | ROAS | S/ 5,000 |

Confidence threshold: 95%. Minimum impressions: 8,000 por variante. Frankenstein del ganador final (mejor hook + mejor body + mejor CTA) entra como creative permanente.

---

## 15. Dashboard de métricas Spirusol

> **Skill:** `analytics-dashboard`.

Crear un dashboard interno `/admin/marcas/spirusol` (gated por permiso `BRAND_VIEW`) con:

- Revenue Spirusol vs total tienda (sparkline 30 días).
- Top SKU (polvo vs crunchie).
- Funnel: views landing → views PDP → AddToCart → Purchase.
- Repeat rate Spirusol vs Yumi Gumi.
- Stock por SKU + alerta cuando baja de 20 unidades.
- ROAS por campaña Meta filtrada por `content_brand=spirusol`.

---

## 16. Plan de fases — qué ejecuta Claude Code y en qué orden

> Cada fase declara las **skills a invocar antes**. No te saltes esto.

### Fase 0 — Preparación (0.5 día)

- Subir assets al storage de Supabase:
  - `brands/spirusol/logo.png` (del `LOGO SPIRUSOL-02.jpg` recortado a PNG transparente)
  - `brands/spirusol/hero-arequipa.jpg` (foto stock o brief a Greenner)
  - `product-images/SPSL-POL-100/main.jpg` (de `Foto doypack polvo.jpg`)
  - `product-images/SPSL-CRU-100/main.jpg` (de `Foto doypack crunchie.jpg`)
  - 3 PDFs de certificados en `/public/brands/spirusol/`.
- Crear el dominio `spirusol.organnical.pe` en Vercel + DNS.
- **Skills:** `image-optimization`.

### Fase 1 — Schema y datos (1 día)

- Modificar `prisma/schema.prisma` con `Brand` y campos nuevos en `Product`.
- Migrar dev y staging.
- Seed con los 2 SKUs.
- Confirmar que `/productos/spirusol-espirulina-polvo-100g` resuelve 200 con datos correctos.
- **Skills:** `database-schema-ecommerce`, `nextjs-ecommerce`.

### Fase 2 — Catálogo y PDP (1.5 días)

- Sumar categoría "Superalimentos" al filtro de tienda.
- Sumar filtro de marca.
- Extender PDP con bloques: header de marca, tabla nutricional, certificaciones, origen.
- JSON-LD ampliado.
- **Skills:** `product-catalog-ui`, `product-detail-page`, `data-display-patterns`, `ecommerce-seo`.

### Fase 3 — Landing de marca (2.5 días)

- Middleware de subdominio.
- 10 secciones del landing.
- Tokens visuales Spirusol.
- Componentes listados en §5.
- Pruebas mobile (la mitad del tráfico viene de IG).
- **Skills:** `landing-page-design`, `frontend-design`, `typography-mastery`, `motion-design`, `responsive-mobile-first`, `layout-composition`.

### Fase 4 — Analytics y CAPI (0.5 día)

- Sumar `content_brand` a todos los eventos.
- Custom Conversion en Meta Ads Manager.
- Validar deduplicación con Meta Test Events.
- **Skills:** `meta-pixel-capi`.

### Fase 5 — Emails y WhatsApp (0.5 día)

- 3 templates Resend.
- 3 plantillas WhatsApp a Meta para aprobación.
- Triggers en webhook de Mercado Pago y cron de reabastecimiento.
- **Skills:** `transactional-emails`, `whatsapp-notifications`.

### Fase 6 — Blog seed (1 día — paralelizable, Sergio escribe contenido)

- 3 posts MDX.
- JSON-LD Article.
- **Skills:** `editorial-design`, `ecommerce-seo`.

### Fase 7 — Merchant feed (0.25 día)

- Sumar 2 SKUs al feed dinámico.
- **Skills:** `google-merchant-feed`.

### Fase 8 — Higgsfield content factory (paralelo desde Fase 0)

- Brief del §10 → Stage 1–3 de la skill → 10 videos + asset pack.
- **Skills:** `higgsfield-content-factory`, `hook-writing-for-ugc`, `prompt-engineering-for-ai-video`, `visual-consistency-across-content`, `meta-ads-creative-best-practices`, `captions-and-subtitles-strategy`.

### Fase 9 — Dashboard interno (0.5 día — post launch)

- `/admin/marcas/spirusol`.
- **Skills:** `analytics-dashboard`, `dashboard-ui-design`.

### Fase 10 — Soft launch + A/B test mes 1

- Activar campaña Meta con 4 ad sets (1 por audiencia + 1 retargeting).
- Plan A/B del §14.
- **Skills:** `ab-testing-creatives`, `creative-performance-analytics`, `creator-economics-and-roas`.

**Tiempo total dev: ~8 días-persona** (no incluye espera de aprobación de templates WhatsApp ni producción de videos Higgsfield).

---

## 17. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Copy infringe DS 007-98-SA y un cliente se queja en INDECOPI | Media | Alto (multa, retirada de copy) | Checklist §8 + Sergio aprueba copy final |
| Inventario de Greenner se agota antes del impulso de marketing | Media | Alto (frenar ads cuesta caro) | Confirmar stock para 60 días antes de Fase 10. Alerta en dashboard |
| Subdominio devuelve canonical hacia organnical.pe y Google indexa duplicado | Baja | Medio (caída SEO) | `<link rel="canonical">` propio + monitor Search Console primeras 4 semanas |
| Pixel no separa Spirusol de Yumi Gumi → ROAS contaminado | Media | Alto (decisiones erradas) | Validar `content_brand` en Test Events antes de gastar real |
| Reseñas negativas tempranas (sabor de la espirulina) hunden conversión | Media | Medio | Pre-poblar 4–6 reseñas reales del equipo Greenner + customers iniciales |
| Anaqueles de doypack con texto en blanco no fotografían bien en mobile feeds | Media | Medio | Re-shootear lifestyle con fondo cremoso, doypack center-frame |
| Vegan Verified expira feb 2027 sin renovación | Baja | Bajo | Recordatorio en calendario nov 2026 |

---

## 18. Checklist de aceptación (gate de launch)

- [ ] `spirusol.organnical.pe` responde 200 con landing completa y SSL OK.
- [ ] Los 2 SKUs son comprables en `organnical.pe/tienda?marca=spirusol`.
- [ ] PDP de ambos productos muestra tabla nutricional, certificaciones y badge Brand.
- [ ] Pixel registra `Purchase` con `content_brand=spirusol` (verificado en Test Events).
- [ ] CAPI deduplica con el browser (mismo `event_id`).
- [ ] Email de confirmación llega con branding Spirusol.
- [ ] Plantilla WhatsApp `spirusol_order_confirmation_v1` aprobada por Meta.
- [ ] 10 videos Higgsfield rendered + asset pack listos.
- [ ] Disclaimer compliance presente en footer landing y en PDP.
- [ ] Libro de reclamaciones accesible desde el footer del subdominio.
- [ ] FAQ menciona contraindicaciones (anticoagulantes, autoinmunes, fenilcetonuria).
- [ ] Sitemap incluye `marcas/spirusol/*`.
- [ ] Dashboard `/admin/marcas/spirusol` muestra al menos un Purchase de prueba.
- [ ] Sergio firma off copy review.

---

## 19. Apéndice A — datos del IIN (referencia, no modificar)

Informe de Ensayo N° 0000114-2025 (IIN, La Molina, 28-08-2025):

| Ensayo | Resultado | Unidad |
|---|---|---|
| Humedad | 7.90 | g/100g |
| Ceniza | 7.29 | g/100g |
| Grasa | 5.75 | g/100g |
| Proteína (N × 6.25) | 67.33 | g/100g |
| Carbohidratos | 11.73 | g/100g |
| Energía total | 368 | kcal/100g |
| Capacidad antioxidante | 13,648.4 | µmol Trolox/100g |
| Vitamina B2 | 5.50 | mg/100g |
| Vitamina B6 | 0.37 | mg/100g |
| Calcio | 5,914.31 | mg/kg |
| Hierro | 969.39 | mg/kg |
| Sodio | 6,126.09 | mg/kg |

## 20. Apéndice B — Registro Sanitario

- Código: **M5828924N**
- Vigencia: 5 años desde 30/09/2024 → expira 30/09/2029.
- Producto declarado: "MEZCLA INSTANTANEA EN POLVO A BASE DE MORINGA Y ESPIRULINA" — denominación comercial SPIRUSOL.
- Marca: GREENNER.
- Presentaciones autorizadas: Sachet 1–10,000g, Doypack 1–5,000g, Lata 1–2,000g, Frasco 100–2,000g.
- Vida útil: 12 meses.

> **Atención:** la denominación oficial menciona "moringa y espirulina". Confirmar con Greenner si el producto actual incluye moringa o si es 100% espirulina como dice el doypack. Si es 100% espirulina, hay que **rectificar la denominación en DIGESA** antes de declarar "100% espirulina" en la web. Si la web declara algo distinto a lo registrado, hay riesgo en una fiscalización.

## 21. Apéndice C — Vegan Verified

- Participant: Greenner SAC · Product: SPIRUSOL · ID: 05-260281-1 · Validez: 01/03/2026 – 28/02/2027 · Issuer: VeganVerified.org.

---

## 22. Cómo arrancar (literal — Sergio, paste esto en Claude Code)

> "Vamos a implementar la propuesta Spirusol descrita en `spirusol-claude-code-spec.md`. Empezamos por Fase 1 (Schema y datos). Antes de tocar archivos, invoca y lee `database-schema-ecommerce` y `nextjs-ecommerce`. Luego modifica `prisma/schema.prisma` siguiendo §3.1 y §3.2, corre la migración y crea `prisma/seed-spirusol.ts` con los datos de §3.3. Al terminar, lista en chat: archivos modificados, comandos corridos, y confirmá que `pnpm prisma migrate dev` corrió limpio."

Al cerrar cada fase, pídele a Claude Code el checklist de §18 marcado parcialmente y la lista de archivos tocados, para que vos puedas reviewer en git.

---

**Fin del spec.** Cualquier ambigüedad encontrada durante la implementación → marcala como TODO en el código y pasa al siguiente bloque, no inventes valores regulatorios.
