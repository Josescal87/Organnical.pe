import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ExplorarClient from './_components/ExplorarClient'

export const metadata: Metadata = {
  title: 'Explorar',
}

export default async function ExplorarPage() {
  const supabase = await createClient()

  const { data: content } = await supabase
    .schema('sami')
    .from('content')
    .select('id, slug, title, category, region, duration_seconds, tags')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return <ExplorarClient content={content ?? []} />
}
