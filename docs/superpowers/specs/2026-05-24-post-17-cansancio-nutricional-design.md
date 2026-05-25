# Post #17 — Cansancio nutricional vs cansancio de descanso

**Fecha de diseño:** 2026-05-24
**Fecha de publicación objetivo:** 2026-05-25 (lunes — pilar semanal)
**Formato:** Blog v2 (research con fuentes, tono cercano, CTA primario producto)
**Autor del post:** Mary Keting

---

## 1. Propósito

Estrenar el **formato v2** del blog con un post pilar que:

1. Demuestre la línea editorial nueva (fuentes citadas + tono cercano + CTA producto cuando el síntoma es lifestyle).
2. Posicione a Spirusol como respuesta natural al cansancio nutricional **sin caer en post patrocinado**.
3. Construya autoridad siendo honesto sobre lo que la espirulina **no** hace (B12).

Este post abre la cadencia 2 posts/sem (lunes pilar + jueves soporte) y es la primera implementación real de los componentes nuevos: `<RelatedProducts>`, `<Sources>`, `<MedicalDisclaimer>` y `primaryCta` parametrizado.

---

## 2. Metadatos

| Campo | Valor |
|---|---|
| `slug` | `cansancio-nutricional-vs-descanso` |
| `title` | Cansancio nutricional vs cansancio de descanso: cómo saber cuál es el tuyo |
| `excerpt` | Duermes 8 horas y te despiertas cansada. El café ya no aguanta hasta las 11. Lo más probable: tu cansancio no es de descanso — es nutricional. Y es muy distinto. |
| `date` | 2026-05-25 |
| `dateFormatted` | 25 de mayo de 2026 |
| `author` | Mary Keting |
| `authorRole` | Medicina Integrativa |
| `category` | Salud Femenina |
| `tags` | `["cansancio", "fatiga", "hierro", "espirulina", "nutrición"]` |
| `readTime` | 9 |
| `image` | `/images/blog/draft-cansancio-nutricional-vs-descanso.jpg` (placeholder; reemplazar antes de publicar con Higgsfield Nano Banana — prompt: *photorealistic, woman 40s at sunlit kitchen counter in the morning, holding ceramic mug, soft natural light, warm tones, shallow depth of field, 16:9*) |

**Vertical para CTA de teleconsulta secundaria (MedicalDisclaimer):** `womens_health` (mapeo automático desde categoría).

---

## 3. Audiencia

**Primaria:** Mujer 30-50 años, urbana, con cansancio sostenido sin causa médica obvia. Posible perimenopausia. Duerme suficiente, come "sano" en general, no está enferma, pero se despierta sintiendo que no descansó.

**Secundaria (SEO):** búsquedas tipo *"por qué estoy tan cansada todo el tiempo"*, *"cansancio sin razón aparente"*, *"espirulina sirve para la energía"*, *"hierro bajo sin anemia"*.

**Tono:** cercano-analítico (no "amiga, te entiendo" ni "estimado lector"). Mary Keting voz: precisa, frases cortas, evita superlativos, traduce ciencia sin diluirla.

---

## 4. Decisiones de diseño y por qué

### 4.1 Ángulo: "nutricional vs descanso"

Match con el patrón de los 3 posts más recientes del blog (*"Melatonina: cuándo funciona, cuándo no"*, *"Magnesio y ansiedad"*, *"Colágeno a los 35"*). El lector llega esperando análisis honesto, no listicle viral. Reduce riesgo creativo y mantiene continuidad editorial.

### 4.2 Balance educativo 85% / Spirusol 15%

Decisión revisada del balance inicial 80/20. La sección H2 dedicada a Spirusol se **disuelve** dentro de la sección "Por qué los alimentos densos son la primera línea" como callout breve (~60 palabras). El bloque `<RelatedProducts>` al final del artículo (componente ya implementado) hace el trabajo visual de mostrar producto + precio + CTA sin necesidad de H2 con marca.

**Por qué:** un H2 con nombre de marca cruza la línea perceptual de "leyendo artículo" a "leyendo anuncio". 60 palabras integradas + tarjeta visual al final separa lo educativo de lo comercial sin perder conversión.

### 4.3 Honestidad sobre B12

La espirulina contiene **pseudovitamina B12** (análogo inactivo en humanos) — esto está claramente establecido en literatura. Mencionar la B12 sin matizar sería técnicamente engañoso y un lector informado lo detecta.

**Decisión:** decirlo explícitamente en la sección 5 (alimentos densos):

> *"La espirulina aporta hierro biodisponible, proteína completa con todos los aminoácidos esenciales y antioxidantes. No aporta B12 utilizable — lo que figura como B12 en la mayoría de etiquetas es un análogo inactivo en humanos. Para B12 necesitas otra fuente: huevo, lácteo, pescado, o suplemento."*

Este párrafo es un **credibility-builder explícito** y refuerza la regla v2 de no marketing engañoso.

### 4.4 Mini-caso narrativo (viñeta "Marina")

En la sección 3 ("Cómo reconocer cuál es el tuyo") insertar una viñeta breve (~80 palabras):

> *"Marina tiene 42 años, es contadora. Duerme 7 a 8 horas, come razonablemente bien, no fuma, no toma. No está enferma — los análisis básicos salen normales. Y aun así se despierta sintiendo que no descansó. La sensación es como si el cuerpo no se hubiera enchufado. El café aguanta hasta las 11; después, nada. Marina no necesita más sueño. Necesita revisar qué le está faltando."*

Aterriza la audiencia femenina sin nombrarla en título, mejora ranking de pilar, permite tono cercano sin diluir el resto.

### 4.5 `sources[]` solo evidencia independiente

El Informe IIN 000114-2025 se menciona en cuerpo como respaldo del cultivo de Spirusol, pero **no entra en `sources[]`** porque es un reporte encargado por la propia marca (autoreferencial).

`sources[]` reservado para PubMed / NHS / Mayo / Examine / Cochrane.

---

## 5. Estructura del cuerpo (`content[]`)

Word budget total objetivo: **~1.850 palabras**. Pilar dentro del rango 1.500-2.200.

| # | Tipo de bloque | Tema | Palabras |
|---|---|---|---|
| 1 | `p` | **Hook** — Dormiste 7-8h, comes "bien", no estás enferma. Y sigues agotada. Adelanto: hay más de un tipo de cansancio. | ~130 |
| 2 | `h2` | La diferencia que casi nadie hace | — |
| 3 | `p` | Cansancio de descanso responde a sueño. Cansancio nutricional no — duermes y sigues cansada. Pueden coexistir, pero confundir uno con otro es por qué llevas meses sin avanzar. | ~220 |
| 4 | `h2` | Cómo reconocer cuál es el tuyo | — |
| 5 | `p` | Intro a criterios. Mejora momentánea al comer, niebla mental por la tarde, mareo al pararte rápido, uñas frágiles. | ~120 |
| 6 | `ul` | Checklist de 6-7 signos prácticos del cansancio nutricional | ~80 |
| 7 | `p` | **Viñeta Marina** — caso típico, transición a ferritina baja sin anemia. | ~110 |
| 8 | `p` | Ferritina baja sin anemia: subdiagnosticada. Análisis de hemoglobina pueden salir normales con reservas de hierro agotadas. Cita PubMed. | ~70 |
| 9 | `h2` | Lo que el cansancio nutricional necesita | — |
| 10 | `p` | Cinco nutrientes core: hierro biodisponible (hemo vs no-hemo, vitamina C ayuda), B12, proteína completa, antioxidantes, magnesio. | ~140 |
| 11 | `ul` | 5 items: hierro / B12 / proteína completa / antioxidantes / magnesio — qué hace cada uno + fuente alimentaria típica | ~180 |
| 12 | `p` | Por qué la dieta moderna procesada los pierde sistemáticamente (refinado de granos, suelos empobrecidos, ultraprocesados). | ~80 |
| 13 | `h2` | Por qué los alimentos densos son la primera línea | — |
| 14 | `p` | Concepto de densidad nutricional. Más nutrientes por caloría = menos cantidad para cubrir requerimientos. Antes de suplementar sintético, comer denso. | ~120 |
| 15 | `p` | Introducir espirulina (microalga *Arthrospira platensis*) como ejemplo: ~60-70% proteína completa, hierro biodisponible, antioxidantes. Una cucharadita aporta lo equivalente a varias porciones de hojas verdes. | ~140 |
| 16 | `p` | **Honestidad B12** — la espirulina NO aporta B12 utilizable, lo que figura en la etiqueta es pseudovitamina. Para B12: huevo, lácteo, pescado o suplemento. | ~100 |
| 17 | `quote` | "El cansancio nutricional no se cura durmiendo más. Se cura comiendo distinto." | ~15 |
| 18 | `p` | **Callout Spirusol** (integrado, ~60 palabras) — cultivada en Arequipa con radiación solar alta, IIN 000114-2025 verifica 67.33% proteína y 9.69 mg/100g hierro, MINSA registrado, certificación vegan internacional. Una cucharadita al día. | ~60 |
| 19 | `h2` | Cuándo el cansancio no es esto | — |
| 20 | `p` | Señales de descartar antes de asumir nutricional: cansancio >3 meses sin mejora, pérdida de peso involuntaria, fiebre/sudores nocturnos, dolor articular nuevo, cambios menstruales drásticos, ánimo persistentemente bajo. | ~120 |
| 21 | `p` | Posibles causas médicas que no se resuelven con alimentación: anemia severa, hipotiroidismo, depresión, fatiga crónica idiopática, déficits que requieren protocolo médico. CTA implícito a `MedicalDisclaimer`. | ~100 |
| 22 | `p` | **Cierre** — Para el cansancio nutricional, lo primero es densidad alimentaria, no más sueño. Empezar simple: una cucharadita al día e ir observando. Los cambios en niveles de hierro y reservas nutricionales toman semanas, no días — paciencia con el cuerpo. | ~80 |

**Total estimado: ~1.865 palabras** ✓

**Posición del mid-CTA automático:** el componente actual lo inserta en `Math.floor(content.length / 2) - 1`. Con 22 bloques, cae en el bloque 10 (intro a "Lo que el cansancio nutricional necesita"). Caída natural — el lector está enganchado, no entra en el callout Spirusol ni en el médico-disclaimer.

---

## 6. `sources[]`

```ts
sources: [
  {
    label: "Krayenbuehl et al. — Iron deficiency anemia and iron deficiency without anemia. Blood, 2011.",
    url: "<PubMed URL — research time>",
    type: "pubmed",
  },
  {
    label: "Selmi et al. — Spirulina effects on hematological parameters and oxidative stress. Cell Mol Immunol, 2011.",
    url: "<PubMed URL — research time>",
    type: "pubmed",
  },
  {
    label: "Vitamin B12 deficiency — symptoms, causes and treatment.",
    url: "https://www.nhs.uk/conditions/vitamin-b12-or-folate-deficiency-anaemia/",
    type: "nhs",
  },
  {
    label: "Heme and non-heme iron — absorption and bioavailability.",
    url: "https://www.nhs.uk/live-well/eat-well/food-types/iron-in-your-diet/",
    type: "nhs",
  },
  {
    label: "Magnesium — health benefits, evidence and dosage.",
    url: "https://examine.com/supplements/magnesium/",
    type: "examine",
  },
  {
    label: "Perimenopause — symptoms and causes.",
    url: "https://www.mayoclinic.org/diseases-conditions/perimenopause/symptoms-causes/syc-20354666",
    type: "mayo",
  },
]
```

**Research a hacer al momento de escribir** (con WebSearch/WebFetch): verificar URLs reales y resumir lo que realmente dicen los papers — no citar de memoria. Reemplazar los placeholders `<PubMed URL — research time>` con URLs concretas. Si una fuente no se sostiene tras leerla, sustituir por otra del mismo nivel.

---

## 7. `relatedProducts[]`

```ts
relatedProducts: [
  {
    slug: "spirusol-en-polvo",
    reason: "Una cucharadita al día disuelta en agua, jugo o smoothie. El formato más versátil para empezar.",
  },
  {
    slug: "spirusol-crunchie",
    reason: "Misma espirulina, formato crocante. Para topping de yogur, ensaladas o snack puro.",
  },
]
```

El componente `<RelatedProducts>` (server, ya implementado) consulta Supabase por estos slugs y renderiza imagen + precio + razón + CTA "Ver".

**Verificación de slugs:** confirmados en el merchant feed (curl a `/api/merchant-feed.xml`): `spirusol-en-polvo` y `spirusol-crunchie` están live.

---

## 8. `primaryCta`

```ts
primaryCta: {
  kind: "product",
  slug: "spirusol-en-polvo",
  label: "Probar Spirusol",
}
```

**Comportamiento del componente `resolveCta()` ya implementado:**

- Mid-CTA → "¿Te interesa probarlo?" + botón "Probar Spirusol" → `/productos/spirusol-en-polvo`
- Sidebar (gradient navy) → "Lo que recomendamos" + botón "Probar Spirusol" → mismo destino
- Bottom CTA → "Probar Spirusol" → mismo destino

El `<MedicalDisclaimer>` siempre renderiza con su CTA secundario a `/agendar` — recoge los casos del bloque 20-21 ("cuándo no es esto"). Esto cumple la regla v2: lifestyle → producto, severo → teleconsulta.

---

## 9. Compliance check

| Riesgo | Cómo se mitiga |
|---|---|
| Claim médico no respaldado | Cada afirmación clínica tiene fuente independiente en `sources[]` |
| Pseudo-B12 (común en espirulina) | Mencionado explícitamente en bloque 16 |
| Promesa de cura | Lenguaje "primera línea", "el cuerpo nota la diferencia en 4-6 semanas" — sin "cura" ni "elimina la fatiga" |
| Diagnóstico DIY | Sección 19-21 enumera red flags + MedicalDisclaimer + CTA teleconsulta |
| CBD/THC | No aplica — Spirusol es 100% espirulina |
| Posología sin médico | "Una cucharadita al día" es el uso culinario habitual del FAQ Spirusol; no se prescribe dosis terapéutica |

---

## 10. Imagen del post

**Placeholder:** `/images/blog/draft-cansancio-nutricional-vs-descanso.jpg`

**Prompt para Higgsfield Nano Banana antes de publicar:**

> photorealistic, woman in her early 40s standing at a sunlit kitchen counter in the morning, holding a ceramic mug, soft natural window light, warm earthy tones, slight rim light on hair, shallow depth of field, no logos, no text, casual neutral clothing, slightly tired but composed expression, 16:9 aspect ratio

**Dimensión final:** 1200×630 (OG-compatible).

---

## 11. Checklist de implementación

- [ ] Research y verificación de las 6 URLs en `sources[]` (WebSearch/WebFetch)
- [ ] Redactar `content[]` siguiendo la estructura de la sección 5 (22 bloques)
- [ ] Insertar entrada del post en `lib/blog.ts` con los 4 campos nuevos (`sources`, `relatedProducts`, `primaryCta`, `content`)
- [ ] Generar imagen vía Higgsfield Nano Banana (prompt en sección 10)
- [ ] Subir imagen a `/public/images/blog/cansancio-nutricional-vs-descanso.jpg` y actualizar campo `image`
- [ ] `npx next build` → verificar prerender del slug nuevo
- [ ] Smoke visual del post en dev (`/blog/cansancio-nutricional-vs-descanso`) — verificar que `<Sources>`, `<MedicalDisclaimer>` y `<RelatedProducts>` rendericen con datos reales
- [ ] Commit con mensaje: `feat(blog): post #17 — cansancio nutricional vs descanso (estreno formato v2)`

---

## 12. Lo que NO entra en este post

(Para evitar scope creep — guardar para futuros posts si funciona el v2.)

- Recetas con espirulina (post de soporte de jueves, no pilar lunes)
- Comparativa Spirusol vs otras espirulinas (post de marca, no de educación)
- Suplementación de hierro oral / inyectable (post de salud femenina específico)
- Protocolos de detox / "limpieza" (no es el ángulo)
- Bypass del MedicalDisclaimer para casos clínicos — siempre va

---

## 13. Métricas a observar post-lanzamiento

(Para review del primer viernes de junio, según plan v2.)

- GA4: `view_item` event en `/blog/cansancio-nutricional-vs-descanso` — comparar con baseline de posts mayo
- GA4: clicks en `/productos/spirusol-en-polvo` desde fuente blog
- Tiempo en página (proxy de calidad del contenido pilar)
- Scroll depth ≥75%
- (Mes 2) GSC: queries que rankean para este slug — informar qué keywords funcionan para el siguiente pilar
