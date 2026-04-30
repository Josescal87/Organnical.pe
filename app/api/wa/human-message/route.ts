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
