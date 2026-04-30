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
