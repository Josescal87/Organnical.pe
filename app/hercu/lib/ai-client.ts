import Anthropic from '@anthropic-ai/sdk'
import { PlanDataSchema, HercuAIResponseSchema } from './plan-schema'
import type { PlanData, HercuAIResponse } from './plan-schema'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-haiku-4-5-20251001'

export async function generatePlan(systemPrompt: string): Promise<PlanData> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Crea mi plan de entrenamiento.' }],
  })
  const block = res.content[0]
  if (block.type !== 'text' || !block.text.trim()) {
    throw new Error('Model returned no text content')
  }
  return PlanDataSchema.parse(JSON.parse(block.text.trim()))
}

export async function chatWithHercu(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<HercuAIResponse> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })
  const text = res.content[0].type === 'text' ? res.content[0].text.trim() : ''
  try {
    return HercuAIResponseSchema.parse(JSON.parse(text))
  } catch {
    return { message: text || 'Lo siento, hubo un error procesando tu mensaje.', updated_plan: null }
  }
}
