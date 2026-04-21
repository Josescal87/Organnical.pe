# Organnical.pe — Guía para Claude Code

## Stack
- **Framework:** Next.js 16 + React 19 + TypeScript 5
- **Estilos:** Tailwind CSS 4
- **Base de datos:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Vercel
- **Email:** Resend API
- **Pagos:** MercadoPago SDK
- **Calendario:** Google Calendar API (service account)
- **Idioma:** Español peruano en toda la UI y contenido

## Rutas importantes
- Blog público: `app/(marketing)/blog/`
- Auth: `app/(auth)/`
- Dashboard médico/paciente: `app/dashboard/`
- API endpoints: `app/api/`
- Emails: `lib/emails.ts`
- Google Calendar client: `lib/google-calendar.ts`
- Blog data (estático): `lib/blog.ts`
- Tipos Supabase: `lib/supabase/`

## Base de datos — Dos schemas
- `public`: productos, ventas, tablas legacy
- `medical`: appointments, prescriptions, prescription_items, profiles
- Siempre usar `.schema("medical")` para queries de telemedicina
- RLS habilitado en todas las tablas — usar el cliente admin para operaciones de backend

## Roles de usuario
- `patient` — paciente con acceso a su dashboard y citas
- `doctor` — médico con acceso a agenda y recetas
- `admin` — acceso completo

---

## Marketing Operating System

Sistema multi-agente en `marketing-os/`. Permite generar campañas de marketing completas desde la CLI.

### Pipeline de agentes
```
Director (planifica) → SEO → Contenido → Social → WhatsApp → Compliance Checker
```

### Slash commands disponibles
| Comando | Descripción |
|---------|-------------|
| `/campana {tema}` | Campaña completa (todos los agentes) |
| `/contenido {tema}` | Artículo de blog (draft + rama git) |
| `/seo {tema}` | Keywords y meta tags anti-canibalización |
| `/social {tema}` | Posts IG/FB + guión Reel + Media Assets |
| `/whatsapp {tipo}` | Plantillas y secuencias CRM |

### Comandos CLI directos
```bash
# Campaña completa
python marketing-os/marketing_os.py --task "Campaña menopausia y sueño"

# Solo blog (genera draft en outputs/blog/ + crea rama git)
python marketing-os/marketing_os.py --task "CBD para TDAH adultos" --type blog

# Publicar draft aprobado (Paso 2 — acción manual)
python marketing-os/marketing_os.py --publish {slug}

# Solo SEO
python marketing-os/marketing_os.py --task "Keywords artritis Peru" --type seo

# Solo social
python marketing-os/marketing_os.py --task "Posts IG semana del dolor" --type social

# Solo WhatsApp
python marketing-os/marketing_os.py --task "Secuencia nurturing ansiedad" --type whatsapp

# Instalar dependencias Python (primera vez)
pip install -r marketing-os/requirements.txt
```

### Flujo Human-in-the-Loop para blog
1. `--type blog` → genera draft en `marketing-os/outputs/blog/draft_{slug}.json` + rama git `blog/{slug}`
2. Revisar el draft manualmente
3. `--publish {slug}` → inserta en `lib/blog.ts` + valida TypeScript + commit git

### Contexto de marca
`marketing-os/context/brand_knowledge.md` — catálogo completo, precios, médicos, tono, hashtags. Se inyecta automáticamente en todos los agentes.

### Multimedia generada
- **Imágenes:** modelo **Nano Banana** — prompts en inglés, photorealistic, ratios 16:9 / 1:1 / 9:16
- **Video:** modelo **Higgsfield** — prompts con descripción de toma, movimiento de cámara, duración 6s
- Los drafts usan placeholder `/images/blog/draft-[slug].jpg` — reemplazar antes de publicar

### Compliance
- Todos los outputs pasan por `agents/compliance_checker.md` antes de guardarse
- Verifica cumplimiento de Ley 30681 (cannabis medicinal Perú)
- Rechazos y correcciones guardados en `marketing-os/outputs/compliance_log/`

### Estructura de archivos del Marketing OS
```
marketing-os/
├── context/brand_knowledge.md    ← catálogo, médicos, tono
├── agents/
│   ├── director.md               ← orquestador
│   ├── seo_specialist.md
│   ├── content_creator.md        ← genera JSON BlogPost + Media Assets
│   ├── social_media.md           ← captions + prompts multimedia
│   ├── whatsapp_crm.md           ← few-shot tono peruano
│   └── compliance_checker.md     ← filtro Ley 30681
├── tools/
│   ├── blog_reader.py            ← extrae slugs de lib/blog.ts
│   ├── blog_writer.py            ← save_draft() + publish_draft()
│   └── output_formatter.py
├── orchestrator.py               ← OrchestratorAgent + SpecialistAgent
├── marketing_os.py               ← CLI principal
└── outputs/                      ← archivos generados (gitignored)
    ├── blog/                     ← draft_{slug}.json
    ├── social/
    ├── whatsapp/
    └── compliance_log/
```

---

## Variables de entorno requeridas (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_CALENDAR_ID=
ANTHROPIC_API_KEY=          ← requerida para Marketing OS
```

## Convenciones de código
- TypeScript estricto (`strict: true` en tsconfig)
- Server Components por defecto, Client Components solo cuando necesario (`"use client"`)
- Supabase SSR: usar `createClient()` de `lib/supabase/server.ts` en Server Components
- Emails: `lib/emails.ts` con Resend — siempre devuelven HTML estilizado
- No usar `any` en TypeScript
