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
