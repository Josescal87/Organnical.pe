# WhatsApp Sales Automation — Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete WhatsApp AI sales system (orchestrator + Agente Ventas + supervisor dashboard + web simulator) in offline/simulate mode — no live WhatsApp connection until the system is fully validated.

**Architecture:** All inbound messages go through `POST /api/wa/simulate`. The orchestrator reads/writes conversation state in Supabase, loads patient context from existing `medical` tables, and routes to the Agente Ventas (Claude API with tool use). The supervisor dashboard shows all conversations in real-time via Supabase Realtime and lets an admin take/return control of any conversation.

**Tech Stack:** Next.js API Routes, `@anthropic-ai/sdk` (Claude API), Supabase (PostgreSQL + Realtime), TypeScript strict, `@supabase/supabase-js` for admin client.

---

## File Map

| File | Responsibility |
|---|---|
| `supabase/migrations/17_wa_tables.sql` | 4 new tables: wa_conversations, wa_messages, wa_campaigns, wa_campaign_recipients |
| `lib/wa/types.ts` | Shared TypeScript types |
| `lib/wa/tools.ts` | Tool implementations (Supabase reads + side effects) |
| `lib/wa/agent-ventas.ts` | Claude API agent with tool use loop |
| `lib/wa/orchestrator.ts` | State machine, context loading, routing |
| `app/api/wa/simulate/route.ts` | POST — receive simulated inbound messages |
| `app/api/wa/control/route.ts` | POST — take/return human control |
| `app/api/wa/human-message/route.ts` | POST — send outbound message as human from dashboard |
| `app/dashboard/admin/whatsapp/page.tsx` | Server Component — conversation list page |
| `app/dashboard/admin/whatsapp/_components/ConversationList.tsx` | Client Component — realtime list |
| `app/dashboard/admin/whatsapp/[id]/page.tsx` | Server Component — conversation thread page |
| `app/dashboard/admin/whatsapp/[id]/_components/ChatThread.tsx` | Client Component — realtime message thread + human input |
| `app/dashboard/admin/whatsapp/[id]/_components/ControlButtons.tsx` | Client Component — take/return control buttons |
| `app/dashboard/admin/whatsapp/simulator/page.tsx` | Client Component — web simulator UI |

---

## Task 1: Install Anthropic SDK

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the SDK**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Verify the package is available**

```bash
node -e "require('@anthropic-ai/sdk'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Verify ANTHROPIC_API_KEY is in .env.local**

```bash
grep ANTHROPIC_API_KEY .env.local
```
Expected: line with `ANTHROPIC_API_KEY=sk-ant-...`

If missing, add it. The key is required for every subsequent task.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @anthropic-ai/sdk"
```

---

## Task 2: Database Migration

**Files:**
- Create: `supabase/migrations/17_wa_tables.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/17_wa_tables.sql

-- Conversations: one row per WhatsApp contact
create table public.wa_conversations (
  id               uuid primary key default gen_random_uuid(),
  phone_number     text not null unique,
  patient_id       uuid references medical.profiles(id),
  state            text not null default 'new',
  mode             text not null default 'ai',
  assigned_to      text not null default 'ventas',
  escalation_reason text,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now(),
  constraint wa_conversations_state_check
    check (state in ('new','qualifying','nurturing','closing','post_sale','escalated','human')),
  constraint wa_conversations_mode_check
    check (mode in ('ai','human'))
);

-- Messages: log of every inbound and outbound message
create table public.wa_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.wa_conversations(id) on delete cascade,
  direction       text not null,
  content         text not null,
  agent_type      text,
  meta_message_id text,
  sent_at         timestamptz not null default now(),
  constraint wa_messages_direction_check
    check (direction in ('inbound','outbound'))
);

-- Campaigns: outbound campaigns proposed by the AI, approved by humans
create table public.wa_campaigns (
  id                          uuid primary key default gen_random_uuid(),
  name                        text not null,
  segment_description         text,
  segment_query               jsonb,
  message_template            text not null,
  meta_template_id            text,
  status                      text not null default 'draft',
  proposed_at                 timestamptz not null default now(),
  approved_by_salesperson_at  timestamptz,
  approved_by_owner_at        timestamptz,
  cancelled_reason            text,
  sent_at                     timestamptz,
  recipient_count             int,
  constraint wa_campaigns_status_check
    check (status in ('draft','pending_salesperson','pending_owner','approved','sent','cancelled'))
);

-- Campaign recipients: one row per phone number per campaign
create table public.wa_campaign_recipients (
  id                       uuid primary key default gen_random_uuid(),
  campaign_id              uuid not null references public.wa_campaigns(id) on delete cascade,
  phone_number             text not null,
  patient_id               uuid references medical.profiles(id),
  status                   text not null default 'pending',
  sent_at                  timestamptz,
  response_conversation_id uuid references public.wa_conversations(id),
  constraint wa_campaign_recipients_status_check
    check (status in ('pending','sent','delivered','read','replied'))
);

-- RLS: all tables are backend-only (service key bypasses RLS)
alter table public.wa_conversations       enable row level security;
alter table public.wa_messages            enable row level security;
alter table public.wa_campaigns           enable row level security;
alter table public.wa_campaign_recipients enable row level security;

create policy "no_direct_access_wa_conversations"       on public.wa_conversations       for all using (false);
create policy "no_direct_access_wa_messages"            on public.wa_messages            for all using (false);
create policy "no_direct_access_wa_campaigns"           on public.wa_campaigns           for all using (false);
create policy "no_direct_access_wa_campaign_recipients" on public.wa_campaign_recipients for all using (false);

-- Performance indexes
create index wa_conversations_phone_idx        on public.wa_conversations(phone_number);
create index wa_conversations_last_msg_idx     on public.wa_conversations(last_message_at desc nulls last);
create index wa_messages_conversation_idx      on public.wa_messages(conversation_id);
create index wa_messages_sent_at_idx           on public.wa_messages(sent_at);

-- Realtime (required for supervisor dashboard live updates)
alter publication supabase_realtime add table public.wa_conversations;
alter publication supabase_realtime add table public.wa_messages;
```

- [ ] **Step 2: Apply the migration via Supabase CLI**

```bash
npx supabase db push
```

If supabase CLI is not installed, run the SQL manually in the Supabase dashboard → SQL editor.

- [ ] **Step 3: Verify tables exist**

In the Supabase dashboard, check that these 4 tables exist in schema `public`:
- `wa_conversations`
- `wa_messages`
- `wa_campaigns`
- `wa_campaign_recipients`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/17_wa_tables.sql
git commit -m "feat(wa): add WhatsApp tables migration"
```

---

## Task 3: Shared Types

**Files:**
- Create: `lib/wa/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// lib/wa/types.ts

export type ConversationState =
  | 'new'
  | 'qualifying'
  | 'nurturing'
  | 'closing'
  | 'post_sale'
  | 'escalated'
  | 'human'

export type ConversationMode = 'ai' | 'human'

export interface WaConversation {
  id: string
  phone_number: string
  patient_id: string | null
  state: ConversationState
  mode: ConversationMode
  assigned_to: string
  escalation_reason: string | null
  last_message_at: string | null
  created_at: string
}

export interface WaMessage {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  content: string
  agent_type: 'ventas' | 'campaigns' | 'human' | 'system' | null
  meta_message_id: string | null
  sent_at: string
}

export interface PatientContext {
  patient_id: string | null
  full_name: string | null
  chronic_conditions: string[]
  current_medications: Array<{ name: string; dose: string; frequency?: string }>
  active_prescription: {
    id: string
    product_name: string
    valid_until: string | null
    is_expired: boolean
  } | null
  upcoming_appointment: {
    slot_start: string
    specialty: string
    doctor_name: string
  } | null
}

export interface SimulateRequest {
  phone_number: string
  content: string
}

export interface SimulateResponse {
  conversation_id: string
  response: string | null
  mode: ConversationMode
  state: ConversationState
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/wa/types.ts
git commit -m "feat(wa): add shared WA types"
```

---

## Task 4: Tool Implementations

**Files:**
- Create: `lib/wa/tools.ts`

Tools are pure functions that read from Supabase (using the admin client with `SUPABASE_SECRET_KEY`) or write side effects like updating conversation state.

- [ ] **Step 1: Create `lib/wa/tools.ts`**

```typescript
// lib/wa/tools.ts
import { createClient } from '@supabase/supabase-js'
import type { PatientContext } from './types'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

export async function getPatientContext(phoneNumber: string): Promise<PatientContext> {
  const supabase = admin()

  const { data: profile } = await supabase
    .schema('medical')
    .from('profiles')
    .select('id, full_name')
    .eq('phone', phoneNumber)
    .maybeSingle()

  if (!profile) {
    return {
      patient_id: null,
      full_name: null,
      chronic_conditions: [],
      current_medications: [],
      active_prescription: null,
      upcoming_appointment: null,
    }
  }

  const [backgroundRes, prescriptionRes, appointmentRes] = await Promise.all([
    supabase
      .schema('medical')
      .from('patient_background')
      .select('chronic_conditions, current_medications')
      .eq('patient_id', profile.id)
      .maybeSingle(),

    supabase
      .schema('medical')
      .from('prescriptions')
      .select('id, valid_until, prescription_items(producto_sku)')
      .eq('patient_id', profile.id)
      .eq('status', 'active')
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .schema('medical')
      .from('appointments')
      .select('slot_start, specialty, doctor:profiles!appointments_doctor_id_fkey(full_name)')
      .eq('patient_id', profile.id)
      .eq('status', 'confirmed')
      .gte('slot_start', new Date().toISOString())
      .order('slot_start', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const prescription = prescriptionRes.data
  const appointment = appointmentRes.data
  const background = backgroundRes.data
  const validUntil = prescription?.valid_until ?? null

  return {
    patient_id: profile.id,
    full_name: profile.full_name,
    chronic_conditions: (background?.chronic_conditions as string[] | null) ?? [],
    current_medications: (background?.current_medications as Array<{ name: string; dose: string }> | null) ?? [],
    active_prescription: prescription
      ? {
          id: prescription.id,
          product_name:
            (prescription.prescription_items as Array<{ producto_sku: string }> | null)?.[0]
              ?.producto_sku ?? 'Producto',
          valid_until: validUntil,
          is_expired: validUntil ? new Date(validUntil) < new Date() : true,
        }
      : null,
    upcoming_appointment: appointment
      ? {
          slot_start: appointment.slot_start,
          specialty: appointment.specialty,
          doctor_name:
            (appointment.doctor as { full_name: string } | null)?.full_name ?? 'Médico',
        }
      : null,
  }
}

export async function toolGetCatalog(): Promise<unknown> {
  return [
    { sku: 'CBD-5',  name: 'CBD 5%',        price_pen: 120, description: 'Aceite CBD espectro completo 5%' },
    { sku: 'CBD-10', name: 'CBD 10%',       price_pen: 180, description: 'Aceite CBD espectro completo 10%' },
    { sku: 'CBD-20', name: 'CBD 20%',       price_pen: 280, description: 'Aceite CBD espectro completo 20%' },
    { sku: 'CBN-SL', name: 'CBN Sleep',     price_pen: 150, description: 'Cápsulas CBN para insomnio' },
    { sku: 'BALM-P', name: 'Bálsamo 250mg', price_pen: 90,  description: 'Bálsamo tópico CBD 250mg' },
  ]
}

export async function toolGetPrescription(patientId: string): Promise<unknown> {
  const { data, error } = await admin()
    .schema('medical')
    .from('prescriptions')
    .select('id, issued_at, valid_until, diagnosis_label, status, prescription_items(producto_sku, quantity, posologia)')
    .eq('patient_id', patientId)
    .order('issued_at', { ascending: false })
    .limit(3)

  if (error) return { error: error.message }
  return data
}

export async function toolBookAppointment(patientId: string): Promise<unknown> {
  // Phase 0 stub — Phase 1 will integrate with the appointments API
  return {
    message: 'Para agendar tu teleconsulta, ingresa a organnical.pe y selecciona un horario disponible.',
    link: 'https://organnical.pe/dashboard/paciente',
    price_pen: 60,
    patient_id: patientId,
  }
}

export async function toolEscalateToHuman(
  conversationId: string,
  reason: string
): Promise<unknown> {
  const { error } = await admin()
    .from('wa_conversations')
    .update({
      mode: 'human',
      state: 'escalated',
      escalation_reason: reason,
    })
    .eq('id', conversationId)

  if (error) return { success: false, error: error.message }
  return { success: true, reason }
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/wa/tools.ts
git commit -m "feat(wa): add tool implementations"
```

---

## Task 5: Agente Ventas

**Files:**
- Create: `lib/wa/agent-ventas.ts`

The agent receives patient context pre-loaded in the system prompt, runs a tool use loop with Claude, and returns the final text response (or `null` if escalated).

- [ ] **Step 1: Create `lib/wa/agent-ventas.ts`**

```typescript
// lib/wa/agent-ventas.ts
import Anthropic from '@anthropic-ai/sdk'
import {
  toolGetCatalog,
  toolGetPrescription,
  toolBookAppointment,
  toolEscalateToHuman,
} from './tools'
import type { PatientContext, WaMessage } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_catalog',
    description: 'Obtiene el catálogo de productos con precios. Úsalo cuando el paciente pregunte qué productos hay o cuánto cuestan.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_prescription',
    description: 'Obtiene el detalle de las recetas del paciente (ingredientes, dosis, vigencia).',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: { type: 'string', description: 'UUID del paciente (disponible en el contexto)' },
      },
      required: ['patient_id'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Genera el link y la información para agendar una teleconsulta médica (S/60). Úsalo cuando el paciente quiera agendar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: { type: 'string', description: 'UUID del paciente, o vacío si es lead nuevo' },
      },
      required: ['patient_id'],
    },
  },
  {
    name: 'escalate_to_human',
    description: 'Escala la conversación a la vendedora. Úsalo cuando: el paciente se queja, hace preguntas médicas complejas (dosis, interacciones), menciona THC, negocia precio de forma agresiva, o pide hablar con una persona.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: { type: 'string', description: 'Razón breve de la escalación' },
      },
      required: ['reason'],
    },
  },
]

function buildSystemPrompt(ctx: PatientContext): string {
  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const patientSection = ctx.patient_id
    ? `## Paciente identificado
- **Nombre:** ${ctx.full_name}
- **Condiciones:** ${ctx.chronic_conditions.join(', ') || 'No registradas'}
- **Receta activa:** ${
        ctx.active_prescription
          ? `${ctx.active_prescription.product_name} · vence ${ctx.active_prescription.valid_until ?? 'N/A'}${ctx.active_prescription.is_expired ? ' ⚠️ VENCIDA' : ''}`
          : 'Sin receta activa'
      }
- **Próxima cita:** ${
        ctx.upcoming_appointment
          ? `${new Date(ctx.upcoming_appointment.slot_start).toLocaleString('es-PE')} — ${ctx.upcoming_appointment.specialty}`
          : 'Sin cita agendada'
      }
- **patient_id:** ${ctx.patient_id}`
    : '## Lead nuevo — no está registrado en el sistema aún'

  return `Eres el agente de ventas de Organnical, una clínica de medicina integrativa en Lima certificada para cannabis medicinal bajo Ley 30681.

## Reglas de comunicación
- Tuteo siempre (tú, no usted)
- Máximo 4–5 líneas por respuesta
- 2–3 emojis por mensaje, nunca más
- Nunca menciones precio primero — entiende la necesidad antes
- Español peruano, tono cálido y cercano
- Nunca hagas promesas médicas específicas ni des dosis exactas
- Para preguntas de dosis o interacciones medicamentosas → escala al equipo médico

## Flujos de venta

**Lead nuevo:**
1. Saluda y pregunta por su condición de salud
2. Explica el proceso: teleconsulta médica (S/60) → el médico emite la receta → compra tus productos
3. Resuelve objeciones con empatía
4. Cierra agendando la teleconsulta con \`book_appointment\`

**Paciente recurrente con receta activa y sin vencer:**
1. Salúdalo por su nombre
2. Propone directamente el reorden de su producto
3. Cierra con precio y link de pago (organnical.pe)

**Paciente recurrente con receta vencida:**
1. Saluda, informa que la receta venció
2. Propone una Asesoría Express (reformulación rápida con el médico)
3. Usa \`book_appointment\` para agendar

## Cuándo escalar (usar escalate_to_human)
- Queja o insatisfacción explícita
- Pregunta sobre dosis exactas o interacciones con otros medicamentos
- Mención de THC o marihuana recreacional
- Negociación de precio agresiva o pedido de descuento no estándar
- "quiero hablar con una persona" o similar

## Fecha actual
${today}

${patientSection}`
}

async function executeToolCall(
  name: string,
  input: Record<string, string>,
  conversationId: string
): Promise<unknown> {
  switch (name) {
    case 'get_catalog':
      return toolGetCatalog()
    case 'get_prescription':
      return toolGetPrescription(input.patient_id)
    case 'book_appointment':
      return toolBookAppointment(input.patient_id ?? '')
    case 'escalate_to_human':
      return toolEscalateToHuman(conversationId, input.reason)
    default:
      return { error: `Tool desconocida: ${name}` }
  }
}

export async function runAgenteVentas({
  conversationId,
  patientContext,
  messageHistory,
  newMessage,
}: {
  conversationId: string
  patientContext: PatientContext
  messageHistory: WaMessage[]
  newMessage: string
}): Promise<string | null> {
  const systemPrompt = buildSystemPrompt(patientContext)

  // Build message history — last 20 messages to keep context manageable
  const historyMessages: Anthropic.MessageParam[] = messageHistory
    .slice(-20)
    .map((m) => ({
      role: m.direction === 'inbound' ? 'user' : 'assistant',
      content: m.content,
    }))

  let messages: Anthropic.MessageParam[] = [
    ...historyMessages,
    { role: 'user', content: newMessage },
  ]

  // Tool use loop — max 5 iterations to prevent runaway loops
  for (let i = 0; i < 5; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text')
      return textBlock?.type === 'text' ? textBlock.text : null
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      )

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: JSON.stringify(
            await executeToolCall(
              block.name,
              block.input as Record<string, string>,
              conversationId
            )
          ),
        }))
      )

      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ]
      continue
    }

    break
  }

  return null
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/wa/agent-ventas.ts
git commit -m "feat(wa): add Agente Ventas with Claude tool use loop"
```

---

## Task 6: Orchestrator

**Files:**
- Create: `lib/wa/orchestrator.ts`

The orchestrator is the entry point for every inbound message. It manages conversation state in Supabase.

- [ ] **Step 1: Create `lib/wa/orchestrator.ts`**

```typescript
// lib/wa/orchestrator.ts
import { createClient } from '@supabase/supabase-js'
import { getPatientContext } from './tools'
import { runAgenteVentas } from './agent-ventas'
import type { WaConversation, WaMessage, SimulateResponse } from './types'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

async function getOrCreateConversation(phoneNumber: string): Promise<WaConversation> {
  const supabase = admin()

  const { data: existing } = await supabase
    .from('wa_conversations')
    .select('*')
    .eq('phone_number', phoneNumber)
    .maybeSingle()

  if (existing) return existing as WaConversation

  const { data: created, error } = await supabase
    .from('wa_conversations')
    .insert({ phone_number: phoneNumber })
    .select('*')
    .single()

  if (error || !created) throw new Error(`Failed to create conversation: ${error?.message}`)
  return created as WaConversation
}

async function getMessageHistory(conversationId: string): Promise<WaMessage[]> {
  const { data } = await admin()
    .from('wa_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })
    .limit(30)

  return (data ?? []) as WaMessage[]
}

async function saveMessage(
  conversationId: string,
  direction: 'inbound' | 'outbound',
  content: string,
  agentType?: string
): Promise<void> {
  await admin().from('wa_messages').insert({
    conversation_id: conversationId,
    direction,
    content,
    agent_type: agentType ?? null,
  })

  await admin()
    .from('wa_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)
}

export async function handleIncomingMessage(
  phoneNumber: string,
  content: string
): Promise<SimulateResponse> {
  const supabase = admin()

  // 1. Get or create conversation
  const conversation = await getOrCreateConversation(phoneNumber)

  // 2. Save inbound message
  await saveMessage(conversation.id, 'inbound', content)

  // 3. If human has control, skip AI — dashboard user will respond manually
  if (conversation.mode === 'human') {
    return {
      conversation_id: conversation.id,
      response: null,
      mode: 'human',
      state: conversation.state,
    }
  }

  // 4. Load patient context and message history
  const [patientContext, history] = await Promise.all([
    getPatientContext(phoneNumber),
    getMessageHistory(conversation.id),
  ])

  // 5. Run agent (history excludes the message we just saved — it's passed as newMessage)
  const agentResponse = await runAgenteVentas({
    conversationId: conversation.id,
    patientContext,
    messageHistory: history.slice(0, -1),
    newMessage: content,
  })

  // 6. Re-read conversation — agent may have updated mode via escalate_to_human
  const { data: updatedConv } = await supabase
    .from('wa_conversations')
    .select('mode, state')
    .eq('id', conversation.id)
    .single()

  const finalMode = (updatedConv?.mode ?? conversation.mode) as WaConversation['mode']
  const finalState = (updatedConv?.state ?? conversation.state) as WaConversation['state']

  // 7. Save agent response only if still in AI mode
  if (agentResponse && finalMode === 'ai') {
    await saveMessage(conversation.id, 'outbound', agentResponse, 'ventas')
  }

  return {
    conversation_id: conversation.id,
    response: agentResponse,
    mode: finalMode,
    state: finalState,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/wa/orchestrator.ts
git commit -m "feat(wa): add orchestrator — state machine and routing"
```

---

## Task 7: API Routes

**Files:**
- Create: `app/api/wa/simulate/route.ts`
- Create: `app/api/wa/control/route.ts`
- Create: `app/api/wa/human-message/route.ts`

- [ ] **Step 1: Create simulate route**

```typescript
// app/api/wa/simulate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/lib/wa/orchestrator'
import type { SimulateRequest } from '@/lib/wa/types'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SimulateRequest
    const { phone_number, content } = body

    if (!phone_number || !content) {
      return NextResponse.json(
        { error: 'phone_number y content son requeridos' },
        { status: 400 }
      )
    }

    const result = await handleIncomingMessage(phone_number, content)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[wa/simulate]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create control route**

```typescript
// app/api/wa/control/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = (await req.json()) as { conversation_id: string; action: 'take' | 'return' }
  const { conversation_id, action } = body

  if (!conversation_id || !['take', 'return'].includes(action)) {
    return NextResponse.json(
      { error: 'conversation_id y action (take|return) son requeridos' },
      { status: 400 }
    )
  }

  const update =
    action === 'take'
      ? { mode: 'human', state: 'escalated' }
      : { mode: 'ai', state: 'nurturing', escalation_reason: null }

  const { error } = await admin()
    .from('wa_conversations')
    .update(update)
    .eq('id', conversation_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, action })
}
```

- [ ] **Step 3: Create human-message route**

```typescript
// app/api/wa/human-message/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = (await req.json()) as { conversation_id: string; content: string }
  const { conversation_id, content } = body

  if (!conversation_id || !content) {
    return NextResponse.json(
      { error: 'conversation_id y content son requeridos' },
      { status: 400 }
    )
  }

  const { error } = await admin().from('wa_messages').insert({
    conversation_id,
    direction: 'outbound',
    content,
    agent_type: 'human',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin()
    .from('wa_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversation_id)

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 6: Test the simulate endpoint**

```bash
curl -X POST http://localhost:3000/api/wa/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+51999000001", "content": "Hola, quisiera información sobre sus productos de CBD"}'
```

Expected response:
```json
{
  "conversation_id": "<uuid>",
  "response": "Hola! Claro que sí 😊...",
  "mode": "ai",
  "state": "new"
}
```

- [ ] **Step 7: Verify the message was saved in Supabase**

In Supabase dashboard → Table editor → `wa_messages`: should have 2 rows (inbound + outbound) for the conversation.

- [ ] **Step 8: Test escalation trigger**

```bash
curl -X POST http://localhost:3000/api/wa/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+51999000002", "content": "Quiero saber sobre el THC y las dosis exactas que necesito"}'
```

Expected: `"mode": "human"` in response (agent should detect THC mention and escalate).

- [ ] **Step 9: Commit**

```bash
git add app/api/wa/
git commit -m "feat(wa): add simulate, control, and human-message API routes"
```

---

## Task 8: Supervisor Dashboard — Conversation List

**Files:**
- Create: `app/dashboard/admin/whatsapp/page.tsx`
- Create: `app/dashboard/admin/whatsapp/_components/ConversationList.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/dashboard/admin/whatsapp/page.tsx
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConversationList } from './_components/ConversationList'
import Link from 'next/link'
import type { WaConversation } from '@/lib/wa/types'

export default async function WhatsAppDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/dashboard/paciente')

  const { data: conversations } = await supabase
    .from('wa_conversations')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(100)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">WhatsApp — Supervisión</h1>
          <Link
            href="/dashboard/admin/whatsapp/simulator"
            className="bg-green-700 hover:bg-green-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
          >
            Abrir simulador
          </Link>
        </div>
        <ConversationList initialConversations={(conversations ?? []) as WaConversation[]} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ConversationList client component**

```tsx
// app/dashboard/admin/whatsapp/_components/ConversationList.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { WaConversation } from '@/lib/wa/types'

const STATE_LABELS: Record<string, string> = {
  new: 'Nuevo',
  qualifying: 'Calificando',
  nurturing: 'Nutriendo',
  closing: 'Cerrando',
  post_sale: 'Post-venta',
  escalated: '⚠️ Escalado',
  human: '👩‍💼 Humano activo',
}

export function ConversationList({
  initialConversations,
}: {
  initialConversations: WaConversation[]
}) {
  const [conversations, setConversations] = useState<WaConversation[]>(initialConversations)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('wa_conversations_list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wa_conversations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversations((prev) => [payload.new as WaConversation, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setConversations((prev) =>
              prev
                .map((c) =>
                  c.id === (payload.new as WaConversation).id
                    ? (payload.new as WaConversation)
                    : c
                )
                .sort((a, b) => {
                  if (!a.last_message_at) return 1
                  if (!b.last_message_at) return -1
                  return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                })
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  if (conversations.length === 0) {
    return (
      <p className="text-gray-500 text-center py-16 text-sm">
        No hay conversaciones aún.{' '}
        <Link href="/dashboard/admin/whatsapp/simulator" className="text-green-400 underline">
          Abre el simulador
        </Link>{' '}
        para crear una.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Link key={conv.id} href={`/dashboard/admin/whatsapp/${conv.id}`}>
          <div className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition cursor-pointer">
            <div
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                conv.mode === 'human' ? 'bg-red-500' : 'bg-blue-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{conv.phone_number}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {STATE_LABELS[conv.state] ?? conv.state}
                {conv.escalation_reason && (
                  <span className="ml-2 text-yellow-400">· {conv.escalation_reason}</span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 flex-shrink-0">
              {conv.last_message_at
                ? new Date(conv.last_message_at).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Open the dashboard in the browser**

Navigate to `http://localhost:3000/dashboard/admin/whatsapp` (logged in as admin).

Expected: List of conversations with colored dots (blue = AI, red = human). Empty state with link to simulator if no conversations yet.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/admin/whatsapp/page.tsx app/dashboard/admin/whatsapp/_components/
git commit -m "feat(wa): add supervisor dashboard — conversation list with realtime"
```

---

## Task 9: Supervisor Dashboard — Conversation Thread

**Files:**
- Create: `app/dashboard/admin/whatsapp/[id]/page.tsx`
- Create: `app/dashboard/admin/whatsapp/[id]/_components/ChatThread.tsx`
- Create: `app/dashboard/admin/whatsapp/[id]/_components/ControlButtons.tsx`

- [ ] **Step 1: Create the thread page**

```tsx
// app/dashboard/admin/whatsapp/[id]/page.tsx
export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatThread } from './_components/ChatThread'
import { ControlButtons } from './_components/ControlButtons'
import Link from 'next/link'
import type { WaConversation, WaMessage } from '@/lib/wa/types'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/dashboard/paciente')

  const [convResult, messagesResult] = await Promise.all([
    supabase.from('wa_conversations').select('*').eq('id', id).single(),
    supabase
      .from('wa_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true }),
  ])

  if (convResult.error || !convResult.data) notFound()

  const conv = convResult.data as WaConversation
  const messages = (messagesResult.data ?? []) as WaMessage[]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <Link
          href="/dashboard/admin/whatsapp"
          className="text-gray-400 hover:text-white text-sm"
        >
          ← Volver
        </Link>
        <div className="flex-1">
          <div className="font-semibold text-sm">{conv.phone_number}</div>
          <div className="text-xs text-gray-400">
            {conv.state} · {conv.mode === 'ai' ? '🤖 IA activa' : '👩‍💼 Control humano'}
          </div>
        </div>
        <ControlButtons conversationId={id} currentMode={conv.mode} />
      </div>

      {/* Chat thread */}
      <ChatThread
        conversationId={id}
        initialMessages={messages}
        initialMode={conv.mode}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create ChatThread client component**

```tsx
// app/dashboard/admin/whatsapp/[id]/_components/ChatThread.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WaMessage } from '@/lib/wa/types'

const AGENT_LABELS: Record<string, string> = {
  ventas: '🤖 Agente',
  human: '👩‍💼 Tú',
  system: '⚙️ Sistema',
  campaigns: '📣 Campañas',
}

export function ChatThread({
  conversationId,
  initialMessages,
  initialMode,
}: {
  conversationId: string
  initialMessages: WaMessage[]
  initialMode: string
}) {
  const [messages, setMessages] = useState<WaMessage[]>(initialMessages)
  const [mode, setMode] = useState(initialMode)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const msgChannel = supabase
      .channel(`wa_messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wa_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as WaMessage])
        }
      )
      .subscribe()

    const convChannel = supabase
      .channel(`wa_conv_mode:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wa_conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          setMode((payload.new as { mode: string }).mode)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(msgChannel)
      supabase.removeChannel(convChannel)
    }
  }, [conversationId, supabase])

  async function sendHumanMessage() {
    if (!input.trim() || sending) return
    setSending(true)
    const content = input
    setInput('')
    await fetch('/api/wa/human-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversationId, content }),
    })
    setSending(false)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${
                msg.direction === 'inbound'
                  ? 'bg-gray-800 text-gray-100'
                  : msg.agent_type === 'human'
                  ? 'bg-red-800 text-white'
                  : 'bg-blue-800 text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className="text-xs opacity-50 mt-1 text-right">
                {msg.agent_type ? AGENT_LABELS[msg.agent_type] ?? msg.agent_type : 'Paciente'}{' '}
                ·{' '}
                {new Date(msg.sent_at).toLocaleTimeString('es-PE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {mode === 'human' && (
        <div className="border-t border-gray-800 p-4 flex gap-2">
          <input
            className="flex-1 bg-gray-900 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendHumanMessage()}
            placeholder="Escribe como vendedora..."
            disabled={sending}
          />
          <button
            onClick={sendHumanMessage}
            disabled={sending || !input.trim()}
            className="bg-red-700 hover:bg-red-600 disabled:opacity-40 rounded-xl px-4 py-2 text-sm font-medium transition"
          >
            Enviar
          </button>
        </div>
      )}

      {mode === 'ai' && (
        <div className="border-t border-gray-800 px-4 py-3 text-center text-xs text-gray-500">
          🤖 La IA está respondiendo — usa "Tomar control" para intervenir
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create ControlButtons client component**

```tsx
// app/dashboard/admin/whatsapp/[id]/_components/ControlButtons.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ControlButtons({
  conversationId,
  currentMode,
}: {
  conversationId: string
  currentMode: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    await fetch('/api/wa/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        action: currentMode === 'ai' ? 'take' : 'return',
      }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
        currentMode === 'ai'
          ? 'bg-red-700 hover:bg-red-600 text-white'
          : 'bg-green-700 hover:bg-green-600 text-white'
      }`}
    >
      {loading ? '...' : currentMode === 'ai' ? 'Tomar control' : 'Devolver a IA'}
    </button>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Test the thread in the browser**

1. Open `http://localhost:3000/dashboard/admin/whatsapp`
2. Click a conversation (or create one via the simulate endpoint)
3. Verify messages display with correct colors (blue = AI, red = human, gray = patient)
4. Click "Tomar control" — header should update to "Control humano", input should appear
5. Type a message and send — verify it appears in the thread
6. Click "Devolver a IA" — verify mode switches back

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/admin/whatsapp/[id]/
git commit -m "feat(wa): add conversation thread with realtime and human control"
```

---

## Task 10: Web Simulator

**Files:**
- Create: `app/dashboard/admin/whatsapp/simulator/page.tsx`

The simulator lets you send messages as a patient to test the agent end-to-end, without needing a real WhatsApp number.

- [ ] **Step 1: Create the simulator page**

```tsx
// app/dashboard/admin/whatsapp/simulator/page.tsx
'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { SimulateResponse } from '@/lib/wa/types'

interface DisplayMessage {
  direction: 'inbound' | 'outbound'
  content: string
  agentType?: string | null
}

export default function SimulatorPage() {
  const [phoneNumber, setPhoneNumber] = useState('+51999000001')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState<'ai' | 'human'>('ai')
  const bottomRef = useRef<HTMLDivElement>(null)

  async function send() {
    if (!input.trim() || loading) return
    const content = input
    setInput('')
    setMessages((prev) => [...prev, { direction: 'inbound', content }])
    setLoading(true)

    try {
      const res = await fetch('/api/wa/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, content }),
      })
      const data: SimulateResponse = await res.json()
      setConversationId(data.conversation_id)
      setCurrentMode(data.mode)

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { direction: 'outbound', content: data.response!, agentType: 'ventas' },
        ])
      } else if (data.mode === 'human') {
        setMessages((prev) => [
          ...prev,
          {
            direction: 'outbound',
            content: '[ Escalado a vendedora — ella responderá desde el dashboard ]',
            agentType: 'system',
          },
        ])
      }
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  function reset() {
    setMessages([])
    setConversationId(null)
    setCurrentMode('ai')
    setPhoneNumber(
      `+51999${Math.floor(100000 + Math.random() * 900000)}`
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Link href="/dashboard/admin/whatsapp" className="text-gray-400 hover:text-white text-sm">
            ← Dashboard
          </Link>
          <div className="flex gap-2">
            {conversationId && (
              <Link
                href={`/dashboard/admin/whatsapp/${conversationId}`}
                className="text-xs text-blue-400 hover:underline"
                target="_blank"
              >
                Ver en supervisión ↗
              </Link>
            )}
            <button onClick={reset} className="text-xs text-gray-400 hover:text-white">
              Nueva conversación
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 flex-shrink-0">Número:</span>
          <input
            className="flex-1 bg-gray-900 rounded-lg px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-gray-600"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              currentMode === 'ai' ? 'bg-blue-500' : 'bg-red-500'
            }`}
            title={currentMode === 'ai' ? 'IA activa' : 'Control humano'}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center text-sm mt-12">
            Escribe algo para simular un mensaje de paciente
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.direction === 'inbound' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.direction === 'inbound'
                  ? 'bg-green-800 text-white'
                  : msg.agentType === 'system'
                  ? 'bg-gray-700 text-gray-300 italic'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-2 text-sm text-gray-400 animate-pulse">
              Escribiendo...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4 flex gap-2">
        <input
          className="flex-1 bg-gray-900 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-green-600"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Simula un mensaje del paciente..."
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-40 rounded-xl px-4 py-2 text-sm font-medium transition"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: End-to-end validation — new patient flow**

1. Open `http://localhost:3000/dashboard/admin/whatsapp/simulator`
2. Send: `"Hola, tengo insomnio crónico y quiero saber cómo funciona el tratamiento"`
3. Expected: warm response explaining the process and asking about their condition
4. Send: `"¿Cuánto cuesta la consulta?"`
5. Expected: agent provides info about teleconsulta (S/60) without leading with price
6. Open `http://localhost:3000/dashboard/admin/whatsapp` in another tab — verify the conversation appears with blue dot

- [ ] **Step 4: End-to-end validation — escalation**

1. Open a new simulator window (click "Nueva conversación")
2. Send: `"quiero hablar con una persona, no con un bot"`
3. Expected: `"mode": "human"`, simulator shows escalation message
4. Open dashboard — verify conversation now shows red dot + escalation reason

- [ ] **Step 5: End-to-end validation — human control from dashboard**

1. Open any conversation in the dashboard
2. Click "Tomar control"
3. Type a message from the dashboard and send
4. Open simulator for the same phone number and send another message
5. Expected: simulator shows `mode: human` and no AI response

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/admin/whatsapp/simulator/
git commit -m "feat(wa): add web simulator for Phase 0 offline testing"
```

---

## Task 11: Final Validation & Phase 0 Completion

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 2: Validate all routes exist**

```bash
curl -I http://localhost:3000/api/wa/simulate
curl -I http://localhost:3000/api/wa/control
curl -I http://localhost:3000/api/wa/human-message
```
Expected: All return `405 Method Not Allowed` (GET not supported) — which confirms the routes exist.

- [ ] **Step 3: Verify Supabase Realtime works**

1. Open dashboard list in one browser tab
2. Send a message via the simulator in another tab
3. Expected: conversation list updates automatically without page refresh
4. Open a conversation thread, send a message — thread updates without refresh

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(wa): Phase 0 complete — offline simulator + agent + dashboard"
```

---

## Phase 0 → Phase 1 Handoff

Phase 0 is complete when:
- [ ] Conversations flow end-to-end in the simulator
- [ ] Agente Ventas responds correctly for new patients and recurring patients
- [ ] Escalation to human works and dashboard shows alerts
- [ ] Human can take control, send messages, and return to AI
- [ ] Supabase Realtime updates dashboard without page refresh

**Phase 1 (separate plan):** Connect Meta Cloud API webhook, verify phone number with Meta Business Suite, configure `POST /api/wa/webhook` to receive real messages from WhatsApp, and replace `toolBookAppointment` stub with real calendar integration.
