# Sistema de Automatización de Ventas — Organnical

**Fecha:** 2026-04-29
**Autor:** Ruben (aprobado en sesión de brainstorming)
**Alcance:** WhatsApp Business API + agentes IA + dashboard de supervisión

---

## Objetivo

Reemplazar el trabajo manual de calificación, negociación y cierre de ventas que hoy realiza la vendedora, para que ella pueda dedicarse a marketing de campo y activaciones. Los agentes IA manejan el canal WhatsApp 24/7; la vendedora supervisa y aprueba campañas.

**Volumen actual:** ~20 conversaciones diarias por WhatsApp Business (app del celular). Canal principal de ventas de productos recurrentes y agendamiento de teleconsultas.

---

## Arquitectura general

```
📱 Mensaje entra por WhatsApp (Meta Cloud API webhook)
           │
           ▼
    🎯 Orquestador
    ├── Carga estado de la conversación (wa_conversations)
    ├── Carga contexto del paciente (patient_background, prescriptions, appointments)
    ├── Decide modo: ai | human
    └── Rutea a:
        ├── 💬 Agente Ventas   (inbound, 24/7)
        ├── 📣 Agente Campañas (outbound, proactivo)
        └── 👩‍💼 Vendedora       (supervisión, control manual, alertas)

    Base de datos compartida: Supabase
```

**Stack técnico:**

| Componente | Tecnología |
|---|---|
| Webhook & API routes | Next.js API Routes (ya en Organnical.pe) |
| Agente cerebro | Claude API (claude-sonnet-4-6 o superior) |
| WhatsApp | Meta Cloud API (Business API oficial) |
| Base de datos | Supabase (PostgreSQL + RLS + Realtime) |
| Dashboard supervisor | Next.js (integrado en Organnical.pe) |

---

## Agentes

### Orquestador

**Rol:** Punto de entrada único. No genera respuestas al usuario — solo decide quién responde.

**Lógica en cada mensaje entrante:**

1. Busca o crea registro en `wa_conversations` por `phone_number`
2. Lee `mode` → si `human`, no hace nada (vendedora tiene control)
3. Lee `state` y carga contexto del paciente desde Supabase
4. Evalúa si debe escalar (triggers de alerta)
5. Llama al Agente Ventas con contexto completo

**Máquina de estado — `wa_conversations.state`:**

```
new → qualifying → nurturing → closing → post_sale
                                    ↓
                               escalated ← (cualquier estado)
                                    ↓
                                 human
```

---

### Agente Ventas

**Rol:** Manejar toda conversación inbound — leads nuevos y pacientes recurrentes.

**Tono:** Estilo `whatsapp_crm.md` — tuteo, máx. 4–5 líneas, 2–3 emojis, nunca mencionar precio primero, español peruano.

**Flujo nuevo paciente:**
1. Calificación (condición, historia, dudas)
2. Explicar proceso + médicos + resolver objeciones
3. Agendar teleconsulta (S/60) → `book_appointment()`
4. Post-consulta: venta de productos recetados

**Flujo paciente recurrente:**
1. Identificar si necesita reformulación o mismo producto
2. Si mismo producto + receta vigente → venta directa
3. Si necesita reformulación → derivar a Asesoría Express (formulario rápido)
4. Venta de productos

**Herramientas disponibles:**

```typescript
get_patient(phone_number)         // perfil + condición médica
get_prescription(patient_id)      // receta vigente + fecha vencimiento
get_purchase_history(patient_id)  // últimas compras
book_appointment(patient_id, slot) // agenda teleconsulta
get_catalog()                     // productos disponibles + precios
escalate_to_human(reason)         // escala con alerta a vendedora
```

**Triggers de escalación automática:**
- Queja o insatisfacción detectada
- Pregunta médica compleja (dosificación, interacciones)
- Negociación de precio agresiva
- Mención de THC o sustancias controladas
- Solicitud explícita de hablar con humano

---

### Agente Campañas

**Rol:** Análisis proactivo de Supabase + propuesta de campañas outbound. No envía nada sin doble aprobación humana.

**Triggers de análisis (diario o manual):**
- Pacientes con receta por vencer en ≤15 días
- Pacientes sin compra en ≥90 días
- Solicitudes manuales de la vendedora o dueño

**Output del agente:**
```json
{
  "segment": "Pacientes con receta de CBD 20% venciendo en 15 días",
  "count": 12,
  "message_template": "Hola {nombre}, tu receta de {producto} vence el {fecha}...",
  "estimated_revenue": "S/2,400"
}
```

**Flujo de aprobación:**
```
Draft (agente) → pending_salesperson → pending_owner → approved → sent
                      ↓ rechaza              ↓ rechaza
                   cancelled             cancelled
```

Ambas aprobaciones son independientes. Si cualquiera rechaza, la campaña se cancela y el agente recibe el motivo para mejorar.

**Nota sobre Meta:** Los mensajes outbound de campaña deben usar WhatsApp Template Messages aprobados por Meta. El agente propone el texto; la aprobación de Meta se gestiona antes del primer envío.

---

## Base de datos — Tablas nuevas

Todas en schema `public`. RLS habilitado.

### `wa_conversations`

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
phone_number    TEXT NOT NULL UNIQUE
patient_id      UUID REFERENCES medical.profiles(id) -- nullable para leads
state           TEXT NOT NULL DEFAULT 'new'
                -- new | qualifying | nurturing | closing | post_sale | escalated | human
mode            TEXT NOT NULL DEFAULT 'ai'
                -- ai | human
assigned_to     TEXT DEFAULT 'ventas'
                -- ventas | campaigns
escalation_reason TEXT
last_message_at TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT now()
```

### `wa_messages`

```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
conversation_id   UUID REFERENCES wa_conversations(id) NOT NULL
direction         TEXT NOT NULL  -- inbound | outbound
content           TEXT NOT NULL
agent_type        TEXT           -- ventas | campaigns | human | system
meta_message_id   TEXT           -- ID de Meta para tracking de delivery
sent_at           TIMESTAMPTZ DEFAULT now()
```

### `wa_campaigns`

```sql
id                        UUID PRIMARY KEY DEFAULT gen_random_uuid()
name                      TEXT NOT NULL
segment_description       TEXT
segment_query             JSONB  -- filtros aplicados a patient_background
message_template          TEXT NOT NULL
meta_template_id          TEXT   -- template aprobado por Meta
status                    TEXT NOT NULL DEFAULT 'draft'
                          -- draft | pending_salesperson | pending_owner | approved | sent | cancelled
proposed_at               TIMESTAMPTZ DEFAULT now()
approved_by_salesperson_at TIMESTAMPTZ
approved_by_owner_at      TIMESTAMPTZ
cancelled_reason          TEXT
sent_at                   TIMESTAMPTZ
recipient_count           INT
```

### `wa_campaign_recipients`

```sql
id                    UUID PRIMARY KEY DEFAULT gen_random_uuid()
campaign_id           UUID REFERENCES wa_campaigns(id) NOT NULL
phone_number          TEXT NOT NULL
patient_id            UUID REFERENCES medical.profiles(id)
status                TEXT DEFAULT 'pending'
                      -- pending | sent | delivered | read | replied
sent_at               TIMESTAMPTZ
response_conversation_id UUID REFERENCES wa_conversations(id)
```

---

## Dashboard de supervisión

Ruta: `/dashboard/admin/whatsapp/` (acceso rol `admin` únicamente)

### Vista principal — Conversaciones

- Lista en tiempo real (Supabase Realtime) ordenada por `last_message_at`
- Badges de estado: 🟦 IA activa · 🟥 Control humano · 🟡 Escalada
- Click abre hilo de mensajes

### Vista de conversación

- Hilo de chat completo (inbound/outbound diferenciados)
- Botón **"Tomar control"** → `mode = 'human'`, IA para de responder
- Botón **"Devolver a IA"** → `mode = 'ai'`, IA retoma con contexto completo
- Input para escribir directamente desde el dashboard (envío por Meta API)
- Panel lateral: perfil del paciente, receta activa, historial de compras

### Centro de alertas

- Toast en tiempo real cuando el orquestador detecta un trigger de escalación
- Badge contador en navegación
- Historial de alertas del día

### Gestión de campañas

- Pendientes de aprobación de vendedora (filtradas por rol)
- Pendientes de aprobación de dueño (filtradas por rol)
- Card por campaña: segmento, texto, alcance estimado
- Botones Aprobar / Rechazar con campo de comentario
- Historial de campañas enviadas con métricas de respuesta

---

## Fases de desarrollo

### Fase 0 — Núcleo offline (semanas 1–5)

**Objetivo:** Sistema completo y validado, sin conectar el WhatsApp real.

Entregables:
- Schema DB: 4 tablas nuevas en Supabase
- API route: `POST /api/wa/webhook` (orquestador)
- API route: `POST /api/wa/simulate` (acepta mensajes del simulador)
- Orquestador: máquina de estado + router + carga de contexto
- Agente Ventas: prompt + 6 herramientas (stubs en Fase 0)
- Simulador web: interfaz simple para enviar/recibir mensajes como si fuera WhatsApp
- Dashboard supervisor: lista de conversaciones + vista de hilo + tomar/devolver control

**Criterio de salida:** Conversación end-to-end con paciente nuevo y recurrente validada en simulador. Escalación a humano funciona. Dashboard muestra estado en tiempo real.

---

### Fase 1 — WhatsApp live (semana 6)

**Objetivo:** Conectar el número real a Meta Cloud API.

Entregables:
- Cuenta Business en Meta Business Suite verificada
- Número migrado (o número nuevo) conectado a Meta Cloud API
- Webhook `POST /api/wa/webhook` recibe mensajes reales de Meta
- Envío de mensajes salientes por `POST https://graph.facebook.com/v18.0/{phone_id}/messages`
- Al menos 1 template aprobado por Meta para mensajes outbound

**Criterio de salida:** Primer mensaje real recibido, procesado por el agente, y respuesta enviada por WhatsApp.

---

### Fase 2 — Campañas (semanas 7–9)

**Objetivo:** Agente Campañas proactivo con flujo de doble aprobación.

Entregables:
- Agente Campañas: análisis de Supabase + propuesta de segmento + generación de mensaje
- Cron job diario (Supabase Edge Function o Vercel Cron) que activa el análisis
- UI de aprobación en dashboard (vendedora y dueño)
- Envío masivo via Meta Template Messages
- Agente Ventas maneja respuestas inbound de la campaña

**Criterio de salida:** Primera campaña propuesta por IA, aprobada por ambos, enviada y con respuestas manejadas automáticamente.

---

### Fase 3 — Analytics (semana 10)

**Objetivo:** Métricas de operación para tomar decisiones.

Entregables:
- Conversiones por agente (lead → cita → venta)
- Tasa de respuesta a campañas
- Revenue atribuido al agente vs. humano
- Tiempo promedio de resolución

---

## Restricciones y decisiones de diseño

| Decisión | Razonamiento |
|---|---|
| Meta Cloud API sobre Baileys | Oficial, sin riesgo de ban, requisito para negocio médico |
| Simulador primero | No conectar el número live hasta validar el sistema completo |
| Orquestador sin LLM | El ruteo es lógica determinista — usar LLM aquí sería más lento y más caro |
| Agente Ventas con Claude API | Calidad de respuesta > costo en inbound; ~$0.02-0.05 por conversación |
| Doble aprobación de campañas | Control de riesgo de reputación + compliance Ley 30681 |
| RLS en todas las tablas WA | Coherencia con el resto del sistema; acceso admin-only vía cliente Supabase admin |
| Supabase Realtime para dashboard | Ya en el stack; cero infraestructura adicional para tiempo real |

---

## Archivos a crear

| Ruta | Descripción |
|---|---|
| `app/api/wa/webhook/route.ts` | Webhook de Meta Cloud API + verificación HMAC |
| `app/api/wa/simulate/route.ts` | Endpoint del simulador (Fase 0) |
| `app/api/wa/send/route.ts` | Envío de mensajes salientes (Meta API) |
| `lib/wa/orchestrator.ts` | Máquina de estado + router |
| `lib/wa/agent-ventas.ts` | Agente Ventas + tools |
| `lib/wa/agent-campaigns.ts` | Agente Campañas + análisis |
| `lib/wa/meta-client.ts` | Cliente Meta Cloud API |
| `lib/wa/tools.ts` | Implementaciones de herramientas (get_patient, etc.) |
| `app/dashboard/admin/whatsapp/page.tsx` | Vista principal del supervisor |
| `app/dashboard/admin/whatsapp/[id]/page.tsx` | Vista de conversación individual |
| `app/dashboard/admin/whatsapp/campanas/page.tsx` | Gestión de campañas |
| `supabase/migrations/XX_wa_tables.sql` | Migración con las 4 tablas nuevas |

---

## Sin cambios de DB existente

El sistema de agentes se construye sobre las tablas existentes de `medical` (solo lectura desde los agentes). No se modifican `appointments`, `prescriptions`, `patient_background`, ni `profiles`.
