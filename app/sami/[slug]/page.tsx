import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { SamiContent } from '@/lib/supabase/database.types'
import AudioPlayer from './_components/AudioPlayer'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: content } = await supabase
    .schema('sami')
    .from('content')
    .select('title')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!content) return { title: 'Contenido no encontrado' }

  return { title: content.title }
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: content } = await supabase
    .schema('sami')
    .from('content')
    .select('id, slug, title, description, category, duration_seconds, audio_url, thumbnail_url, tags, script_text, tts_voice, is_published, created_at, updated_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!content) notFound()

  return <AudioPlayer content={content as SamiContent} />
}
