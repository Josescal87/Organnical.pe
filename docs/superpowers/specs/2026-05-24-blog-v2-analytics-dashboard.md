# Dashboard de analíticas blog v2 — setup y spec

**Fecha:** 2026-05-24
**Cadencia de revisión:** primer viernes de cada mes (definido en [project_blog_organnical_v2](../../../../) memory)
**Stack:** GA4 + GSC + Vercel Analytics + Looker Studio

---

## 1. Por qué este doc existe

El blog v2 estrenó cadencia 2 posts/sem con tracking custom (eventos GA4 nuevos: `blog_scroll_depth`, `blog_source_click`, `blog_related_product_click`, `blog_cta_click`). Sin un dashboard estable, los datos quedan en las herramientas nativas y la review mensual se diluye.

Este doc define **qué métricas mirar**, **dónde armarlas** y **qué decisión disparan**. Acompaña al setup técnico (que ya está en producción).

---

## 2. Setup técnico — qué quedó cableado

| Fuente | Cómo entran datos | Dónde verlos nativamente |
|---|---|---|
| **GA4** | `lib/analytics.ts` (e-commerce) + `components/blog/BlogPostTracking.tsx` (blog events) | analytics.google.com → tu property |
| **GSC** | `public/googleb3e9a02901c097a2.html` verifica ownership + `app/sitemap.ts` se submite manual | search.google.com/search-console |
| **Vercel Analytics** | `<VercelAnalytics />` + `<SpeedInsights />` en `app/layout.tsx` | vercel.com → tu proyecto → tab "Analytics" / "Speed Insights" |
| **Meta Pixel** | Misma `lib/analytics.ts` (browser). CAPI server-side pendiente (ver `docs/spirusol-capi-pending.md`) | business.facebook.com → Events Manager |
| **Microsoft Clarity** | `components/AnalyticsScripts.tsx` (gated by consent) | clarity.microsoft.com |

---

## 3. Eventos GA4 custom del blog v2 — referencia rápida

Disparan desde `BlogPostTracking.tsx` (client component montado una sola vez por post). Todos llevan `post_slug` y `post_category` como parámetros de contexto.

| Evento | Cuándo dispara | Parámetros adicionales |
|---|---|---|
| `blog_scroll_depth` | Al cruzar 25/50/75/100% del scroll por primera vez en la sesión | `percent` (25, 50, 75, 100) |
| `blog_source_click` | Click en un link del bloque `<Sources>` | `source_type` (`pubmed`/`nhs`/`mayo`/`examine`/`minsa`/`cochrane`/`other`), `source_index` (1-N), `source_url` |
| `blog_related_product_click` | Click en una tarjeta de `<RelatedProducts>` | `product_slug` |
| `blog_cta_click` | Click en cualquiera de los 3 CTAs del post | `cta_position` (`mid`/`sidebar`/`bottom`), `cta_kind` (`product`/`teleconsulta`), `cta_destination` (URL) |

Los eventos llegan a GA4 a tiempo casi real (Realtime report); para que aparezcan en Explore reports y como dimensiones agregables hay que **registrarlos como Custom Definitions** en GA4 Admin (paso 5 del setup, abajo).

---

## 4. Looker Studio — dashboard único combinado

### Por qué Looker Studio (no in-app dashboard)

GA4 y GSC tienen interfaces nativas potentes pero **separadas**. Para responder "¿este post performa?" hay que cruzar:
- **GSC**: ¿con qué queries entra la gente al post? ¿en qué posición de búsqueda?
- **GA4**: ¿qué % llega al final? ¿clickean al producto o se van por las fuentes? ¿cuántos terminan en checkout?

Looker Studio (gratis, Google) blendea ambas fuentes en un solo report. Alternativa (custom dashboard interno en `/admin/analytics`) sería ~3-4h de engineering y un mantenimiento ongoing — no justifica el costo para una review mensual.

### Setup paso a paso (~30 min)

#### 4.1 Conectar las fuentes (5 min)

1. Login a [lookerstudio.google.com](https://lookerstudio.google.com) con la cuenta dueña de GA4 + GSC
2. **Create** → **Data source**
3. Buscar "Google Analytics" → seleccionar la property `Organnical` → **Connect**
4. Repetir: **Create** → **Data source** → "Search Console" → seleccionar el site `https://organnical.pe` → **Connect**
   - Elegir "Site Impression" (no "URL Impression") — agrega por query, más útil para review mensual

#### 4.2 Empezar desde plantilla oficial (5 min)

Para ahorrar tiempo de armado:

- **GA4 template oficial:** [Looker Studio Gallery → "Google Analytics 4 Report Template"](https://lookerstudio.google.com/gallery?category=marketing)
- **GSC template oficial:** [Looker Studio Gallery → "Search Console Report"](https://lookerstudio.google.com/gallery?category=seo)

Botón **"Use template"** → conectar a tus data sources (paso 4.1).

#### 4.3 Crear una página "Blog v2" con los charts custom (15 min)

En el report (ya copiado del template), agregar una nueva página con estos charts:

| Chart | Tipo | Fuente | Métricas | Dimensiones | Filtros |
|---|---|---|---|---|---|
| Posts publicados — visión general | Tabla | GA4 | Page views, Engaged sessions, Avg. engagement time | Page path | Page path **contains** `/blog/` |
| Funnel de scroll por post | Bar chart | GA4 | Event count | Event name `blog_scroll_depth`, dimension `percent` | Page path **contains** `/blog/` |
| CTAs que convierten | Stacked bar | GA4 | Event count | `cta_position`, breakdown por `cta_kind` | Event name = `blog_cta_click` |
| Fuentes más clickeadas | Bar chart | GA4 | Event count | `source_type` | Event name = `blog_source_click` |
| Productos más clickeados desde blog | Bar chart | GA4 | Event count | `product_slug` | Event name = `blog_related_product_click` |
| Queries que rankean por post | Tabla | GSC | Clicks, Impressions, CTR, Avg. position | Query, Landing page | Landing page **contains** `/blog/` |
| Posiciones por post | Tabla | GSC | Avg. position | Landing page | Landing page **contains** `/blog/`, Position < 30 |

#### 4.4 Setup del filtro de fecha (2 min)

- Arrastrar un **Date range control** en el header del dashboard
- Default: **Last 30 days**
- Esto filtra todos los charts a la vez

#### 4.5 Compartir y bookmark (3 min)

- **Share** → permitir editar a jose@futura-farms.com
- Cambiar título: "Organnical Blog v2 — Dashboard mensual"
- Bookmark en navegador

---

## 5. Custom Definitions en GA4 — pasarlas a dimensions agregables

Sin este paso, los parámetros de los eventos (`post_slug`, `cta_position`, `source_type`, etc.) **no aparecen como columnas filtrables en Explore reports**. Hay que registrarlos manualmente.

En GA4 → **Admin** → **Custom definitions** → **Create custom dimensions**:

| Dimension name | Event parameter | Scope |
|---|---|---|
| Post slug | `post_slug` | Event |
| Post category | `post_category` | Event |
| Scroll percent | `percent` | Event |
| Source type | `source_type` | Event |
| Source index | `source_index` | Event |
| Source URL | `source_url` | Event |
| Product slug | `product_slug` | Event |
| CTA position | `cta_position` | Event |
| CTA kind | `cta_kind` | Event |
| CTA destination | `cta_destination` | Event |

Datos retroactivos: GA4 **NO** rellena dimensiones para eventos previos al registro. Por eso vale registrarlas hoy mismo, antes del primer visitante del Post #17 mañana 05:00.

---

## 6. Métricas clave a observar — review mensual

Cada **primer viernes del mes**, abrir el dashboard de Looker Studio y revisar:

### 6.1 Health del contenido pilar (Lunes)

| Métrica | Bench inicial | Acción si baja |
|---|---|---|
| Page views por post (30d) | > 200 | Revisar SEO + share manual en redes |
| Avg. engagement time | > 3:00 min | Posts muy largos o pierde interés → reestructurar |
| `blog_scroll_depth=100` ratio | > 30% del total de page views | Post demasiado largo o lead débil al final |
| Bounce rate | < 70% | Hook débil o expectativa título ≠ contenido |

### 6.2 Conversión

| Métrica | Bench inicial | Acción si baja |
|---|---|---|
| `blog_cta_click` rate (clicks/views) | > 3% | CTA copy débil o muy enterrado |
| `blog_cta_click` por position | Sidebar > Bottom > Mid | Si "mid" performa mejor que sidebar, mover sidebar al medio del artículo |
| Conversiones product→purchase desde blog | tracking en GA4 explorer | Si productos del blog no convierten, problema de mismatch CTA↔producto |

### 6.3 Autoridad / credibility

| Métrica | Bench inicial | Acción si baja |
|---|---|---|
| `blog_source_click` rate | > 0.5% | Las fuentes no se ven o no llaman la atención |
| Top source_types más clickeados | PubMed > NHS expectado | Si "other" lidera, las fuentes principales no son atractivas |

### 6.4 SEO (GSC, datos desde el mes 2)

| Métrica | Bench inicial | Acción si baja |
|---|---|---|
| Avg. position por slug | < 20 | Mejorar internal links, on-page SEO |
| Impressions por slug | > 500/mes | Slug no indexado o muy long-tail |
| CTR (clicks/impressions) | > 2% | Title + meta description débiles para esa query |
| Top queries por slug | mapeo intencional | Si rankea por queries irrelevantes, ajustar contenido o metadatos |

---

## 7. Vercel Analytics + Speed Insights — qué entrega gratis

No requiere config — instalado y mountado ya. Datos visibles en vercel.com → proyecto → tab Analytics / Speed Insights.

| Reporte | Para qué sirve |
|---|---|
| **Visitors** | Sin cookies, da Top pages y referrers. Útil para comparar tráfico blog vs tienda sin sesgo de consent rate |
| **Top pages** | Confirmación cruzada con GA4 — si difieren mucho, hay un bug de tracking |
| **Speed Insights → Real Experience Score (RES)** | Performance percibido por usuarios reales. Score > 85 = OK. Score < 70 = revisar imágenes / JS |
| **Core Web Vitals** (LCP, INP, CLS) | Google los usa como factor de ranking SEO. Mantener todos en "Good" |

---

## 8. Roadmap (no esta noche)

- **Meta CAPI server-side** ([docs/spirusol-capi-pending.md](../../spirusol-capi-pending.md)) — requiere `META_ACCESS_TOKEN`. Importante para ads tracking de Spirusol, no para blog.
- **Internal `/admin/analytics` dashboard** — solo si Looker Studio se queda corto. Probable trigger: si el equipo crece y necesita acceso sin Google account dueña de GA4.
- **Alertas automáticas** — bot en Slack/email cuando una métrica cae del bench. Solo cuando el blog tenga 6+ meses de tráfico estable.

---

## 9. Checklist primer review (primer viernes junio 2026)

- [ ] Abrir Looker Studio dashboard
- [ ] Filtro 30 días
- [ ] ¿Post #17 (cansancio) cruzó 200 page views? Sí → SEO funciona. No → push manual en redes.
- [ ] ¿`scroll_depth=100` > 30%? Si no, el post es muy largo
- [ ] ¿Cuál CTA convirtió más?
- [ ] ¿Qué queries de GSC trajeron tráfico al post? ¿son las esperadas?
- [ ] Anotar 1 aprendizaje accionable que cambie el próximo post pilar
