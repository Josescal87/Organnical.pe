export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SimulatorClient } from './_components/SimulatorClient'

export default async function SimulatorPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/dashboard/paciente')

  return <SimulatorClient />
}
