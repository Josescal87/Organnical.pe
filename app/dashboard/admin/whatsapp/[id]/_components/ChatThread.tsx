'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ConversationMode, WaMessage } from '@/lib/wa/types'

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
  initialMode: ConversationMode
}) {
  const [messages, setMessages] = useState<WaMessage[]>(initialMessages)
  const [mode, setMode] = useState<ConversationMode>(initialMode)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

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
          const incoming = payload.new as WaMessage
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          )
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
          setMode((payload.new as { mode: ConversationMode }).mode)
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
    const content = input.trim()
    setInput('')
    try {
      const res = await fetch('/api/wa/human-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, content }),
      })
      if (!res.ok) {
        setInput(content)
        alert('Error al enviar el mensaje. Intenta de nuevo.')
      }
    } catch {
      setInput(content)
      alert('Error de red. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
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
          🤖 La IA está respondiendo — usa &quot;Tomar control&quot; para intervenir
        </div>
      )}
    </div>
  )
}
