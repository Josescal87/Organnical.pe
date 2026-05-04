// app/api/hercu/onboarding/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OnboardingBodySchema } from '@/app/hercu/lib/plan-schema'
import { buildGeneratePlanPrompt } from '@/app/hercu/lib/prompts'
import { generatePlan } from '@/app/hercu/lib/ai-client'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = OnboardingBodySchema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  }

  const profile = { ...body.data, days_per_week: body.data.available_days.length }

  // Guardar perfil (upsert por si el usuario repite el onboarding)
  const { error: profileErr } = await supabase
    .schema('hercu')
    .from('hercu_profiles')
    .upsert({ user_id: user.id, ...profile, onboarding_done: false })
  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

  // Generar plan con Claude
  let planData: import('@/app/hercu/lib/plan-schema').PlanData
  try {
    planData = await generatePlan(buildGeneratePlanPrompt(profile))
  } catch (e) {
    console.error('[hercu/onboarding] generatePlan failed:', e)
    return NextResponse.json({ error: 'Error generando el plan' }, { status: 500 })
  }

  // Crear nuevo plan
  const planName = `Mi plan de ${profile.goals[0] ?? 'entrenamiento'}`
  const { data: plan, error: planErr } = await supabase
    .schema('hercu')
    .from('hercu_plans')
    .insert({ user_id: user.id, name: planName, plan_data: planData, is_active: true })
    .select()
    .single()
  if (planErr) return NextResponse.json({ error: planErr.message }, { status: 500 })

  // Desactivar planes anteriores (después de crear el nuevo, para no dejar al usuario sin plan activo)
  const { error: deactivateErr } = await supabase.schema('hercu').from('hercu_plans')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true)
    .neq('id', plan.id)
  if (deactivateErr) return NextResponse.json({ error: deactivateErr.message }, { status: 500 })

  // Marcar onboarding completo
  const { error: doneErr } = await supabase.schema('hercu').from('hercu_profiles')
    .update({ onboarding_done: true })
    .eq('user_id', user.id)
  if (doneErr) return NextResponse.json({ error: doneErr.message }, { status: 500 })

  return NextResponse.json({ plan })
}
