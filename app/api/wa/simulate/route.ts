import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { handleIncomingMessage } from '@/lib/wa/orchestrator'
import type { SimulateRequest } from '@/lib/wa/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const allowed = await checkRateLimit(`wa-simulate:${user.id}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  try {
    const body = (await req.json()) as SimulateRequest
    const { phone_number, content } = body

    if (!phone_number || !content) {
      return NextResponse.json(
        { error: 'phone_number y content son requeridos' },
        { status: 400 }
      )
    }

    const result = await handleIncomingMessage(phone_number, content)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[wa/simulate]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
