// app/api/hercu/chat/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { buildChatSystemPrompt } from '@/app/hercu/lib/prompts'
import { chatWithHercu } from '@/app/hercu/lib/ai-client'
import type { PlanData } from '@/app/hercu/lib/plan-schema'
import { z } from 'zod'

const BodySchema = z.object({ message: z.string().min(1).max(500) })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr) {
    console.error('[hercu/chat] auth error:', authErr)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const allowed = await checkRateLimit(`hercu-chat:${user.id}`, 20, 600_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Demasiados mensajes, intenta en unos minutos' }, { status: 429 })
  }

  const body = BodySchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })

  // Obtener plan activo
  const { data: plan, error: planErr } = await supabase
    .schema('hercu').from('hercu_plans')
    .select('id, plan_data')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
  if (planErr) console.error('[hercu/chat] plan fetch error:', planErr)
  if (planErr || !plan) return NextResponse.json({ error: 'Sin plan activo' }, { status: 404 })

  // Obtener historial (últimos 20 mensajes)
  const { data: history } = await supabase
    .schema('hercu').from('hercu_messages')
    .select('role, content')
    .eq('plan_id', plan.id)
    .order('created_at', { ascending: true })
    .limit(20)

  const messages = [
    ...(history ?? []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: body.data.message },
  ]

  // Llamar a Claude
  const aiResponse = await chatWithHercu(buildChatSystemPrompt(plan.plan_data as PlanData), messages)

  // Guardar mensaje del usuario
  const { error: userMsgErr } = await supabase.schema('hercu').from('hercu_messages').insert({
    plan_id: plan.id, user_id: user.id, role: 'user', content: body.data.message,
  })
  if (userMsgErr) console.error('[hercu/chat] failed to insert user message:', userMsgErr)

  // Guardar respuesta de Hercu
  const { error: assistantMsgErr } = await supabase.schema('hercu').from('hercu_messages').insert({
    plan_id: plan.id, user_id: user.id, role: 'assistant', content: aiResponse.message,
  })
  if (assistantMsgErr) console.error('[hercu/chat] failed to insert assistant message:', assistantMsgErr)

  // Actualizar plan si hubo cambios
  if (aiResponse.updated_plan !== null) {
    const { error: planUpdateErr } = await supabase.schema('hercu').from('hercu_plans')
      .update({ plan_data: aiResponse.updated_plan })
      .eq('id', plan.id)
    if (planUpdateErr) console.error('[hercu/chat] failed to update plan:', planUpdateErr)
  }

  return NextResponse.json(aiResponse)
}
