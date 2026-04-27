import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { SamiCategory, SamiContent } from '@/lib/supabase/database.types'
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
  let lastContent: Pick<SamiContent, 'slug' | 'title' | 'category'> | null = null

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Step 1: get the content_id from the most recent session
    const { data: lastSessionData } = await supabase
      .schema('sami')
      .from('listening_sessions')
      .select('content_id')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Step 2: if there is a session, fetch the content record
    if (lastSessionData?.content_id) {
      const { data: lastContentData } = await supabase
        .schema('sami')
        .from('content')
        .select('slug, title, category')
        .eq('id', lastSessionData.content_id)
        .maybeSingle()
      lastContent = lastContentData
    }
  }

  return (
    <HomeClient
      content={content ?? []}
      lastSlug={lastContent?.slug}
      lastTitle={lastContent?.title}
      lastCategory={lastContent?.category}
      greeting={getGreeting()}
    />
  )
}
