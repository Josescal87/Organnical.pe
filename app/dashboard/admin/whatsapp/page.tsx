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
