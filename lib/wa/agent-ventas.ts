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
    description: 'Genera el link y la información para agendar una teleconsulta médica (S/60). Úsalo cuando el paciente quiera agendar. patient_id es opcional — omítelo si el paciente es un lead nuevo.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: { type: 'string', description: 'UUID del paciente si está registrado. Omitir para leads nuevos.' },
      },
      required: [],
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
  input: Record<string, unknown>,
  conversationId: string
): Promise<unknown> {
  switch (name) {
    case 'get_catalog':
      return toolGetCatalog()
    case 'get_prescription':
      return toolGetPrescription(String(input.patient_id ?? ''))
    case 'book_appointment':
      return toolBookAppointment(String(input.patient_id ?? ''))
    case 'escalate_to_human':
      return toolEscalateToHuman(conversationId, String(input.reason ?? ''))
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
  const rawHistory: Anthropic.MessageParam[] = messageHistory
    .slice(-20)
    .map((m) => ({
      role: m.direction === 'inbound' ? 'user' : 'assistant',
      content: m.content,
    }))

  // Claude API requires messages to start with role='user'
  const firstUserIdx = rawHistory.findIndex((m) => m.role === 'user')
  const historyMessages = firstUserIdx > 0 ? rawHistory.slice(firstUserIdx) : rawHistory

  let messages: Anthropic.MessageParam[] = [
    ...historyMessages,
    { role: 'user', content: newMessage },
  ]

  // Tool use loop — max 5 iterations to prevent runaway loops
  for (let i = 0; i < 5; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
              block.input as Record<string, unknown>,
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

    if (response.stop_reason === 'max_tokens') {
      const textBlock = response.content.find((b) => b.type === 'text')
      return textBlock?.type === 'text' ? textBlock.text : null
    }

    break
  }

  console.warn('[agente-ventas] tool loop exhausted without end_turn', { conversationId })
  return null
}
