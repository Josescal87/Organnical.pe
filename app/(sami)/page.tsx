import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { SamiCategory } from '@/lib/supabase/database.types'
import HomeClient from './_components/HomeClient'

export const metadata: Metadata = {
  title: 'Inicio',
}

function getGreeting(): string {
  // Lima is UTC-5
  const nowUtc = new Date()
  const limaHour = (nowUtc.getUTCHours() - 5 + 24) % 24
  if (limaHour >= 6 && limaHour < 12)  return 'Buenos días'
  if (limaHour >= 12 && limaHour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function SamiHomePage() {
  const supabase = await createClient()

  // Fetch all published content
  const { data: content } = await supabase
    .schema('sami')
    .from('content')
    .select('id, slug, title, description, category, duration_seconds, thumbnail_url, tags, audio_url, script_text, tts_voice, is_published, created_at, updated_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Try to fetch last session for the logged-in user
  let lastSlug: string | undefined
  let lastTitle: string | undefined
  let lastCategory: SamiCategory | undefined

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: lastSession } = await supabase
      .schema('sami')
      .from('listening_sessions')
      .select('content_id, sami_content:content_id(slug, title, category)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (lastSession) {
      // Supabase returns the join as an object or array; handle both shapes
      const joined = lastSession.sami_content
      const joinedItem = Array.isArray(joined) ? joined[0] : joined
      if (joinedItem && typeof joinedItem === 'object' && 'slug' in joinedItem) {
        lastSlug     = (joinedItem as { slug: string; title: string; category: SamiCategory }).slug
        lastTitle    = (joinedItem as { slug: string; title: string; category: SamiCategory }).title
        lastCategory = (joinedItem as { slug: string; title: string; category: SamiCategory }).category
      }
    }
  }

  return (
    <HomeClient
      content={content ?? []}
      lastSlug={lastSlug}
      lastTitle={lastTitle}
      lastCategory={lastCategory}
      greeting={getGreeting()}
    />
  )
}
