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
