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
