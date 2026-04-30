import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/lib/wa/orchestrator'
import type { SimulateRequest } from '@/lib/wa/types'

export async function POST(req: NextRequest) {
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
