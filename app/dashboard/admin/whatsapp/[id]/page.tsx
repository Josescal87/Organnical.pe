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
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/dashboard/paciente')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  const [convResult, messagesResult] = await Promise.all([
    supabaseAny.from('wa_conversations').select('*').eq('id', id).single() as Promise<{ data: WaConversation | null; error: unknown }>,
    supabaseAny
      .from('wa_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true }) as Promise<{ data: WaMessage[] | null; error: unknown }>,
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
