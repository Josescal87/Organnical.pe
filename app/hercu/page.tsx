// app/hercu/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HercuMascot from './_components/HercuMascot'
import PlanGrid from './_components/PlanGrid'
import type { PlanData } from './lib/plan-schema'

export default async function HercuDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/hercu/auth/login')

  const { data: profile } = await supabase
    .schema('hercu').from('hercu_profiles')
    .select('onboarding_done')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_done) redirect('/hercu/onboarding')

  const { data: plan } = await supabase
    .schema('hercu').from('hercu_plans')
    .select('id, name, plan_data, updated_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>
            Tu Plan
          </h1>
          {plan && (
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2, fontWeight: 600 }}>
              {plan.name}
            </p>
          )}
        </div>
        <HercuMascot pose="flex" size={72} anim="float" style={{ marginBottom: -4 }} />
      </div>

      {plan ? (
        <PlanGrid planData={plan.plan_data as PlanData} />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
          <HercuMascot pose="sentado" size={80} anim="float" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontWeight: 700, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>
            No tienes un plan activo aún.
          </p>
        </div>
      )}
    </>
  )
}
