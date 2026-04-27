'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SamiContent, SamiCategory } from '@/lib/supabase/database.types'

interface Props {
  content: SamiContent[]
  lastSlug?: string
  lastTitle?: string
  lastCategory?: SamiCategory
  greeting: string
}

const moods = [
  { id: 'ansioso',   label: 'Ansioso',    emoji: '😰', tags: ['ansiedad', 'estrés', 'calma'] },
  { id: 'cansado',   label: 'Sin dormir', emoji: '😴', tags: ['sueño', 'descanso', 'relajación'] },
  { id: 'estresado', label: 'Estresado',  emoji: '😤', tags: ['estrés', 'respiración', 'pausa'] },
  { id: 'bien',      label: 'Tranquilo',  emoji: '😌', tags: ['bienestar', 'meditación', 'foco'] },
] as const

function categoryIcon(cat: SamiCategory): string {
  const icons: Record<SamiCategory, string> = {
    meditacion: '🧘',
    cuento:     '🌙',
    ruido:      '🌊',
    respiracion: '💨',
  }
  return icons[cat]
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

interface ContentCardProps {
  item: SamiContent
}

function ContentCard({ item }: ContentCardProps) {
  return (
    <Link
      href={`/${item.slug}`}
      className="group flex flex-col gap-3 rounded-xl border p-4 transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(167,139,250,0.2)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl leading-none">{categoryIcon(item.category)}</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: 'rgba(167,139,250,0.15)',
            color: '#a78bfa',
          }}
        >
          {formatDuration(item.duration_seconds)}
        </span>
      </div>
      <p
        className="line-clamp-2 text-sm font-medium leading-snug"
        style={{ color: '#f3f0ff' }}
      >
        {item.title}
      </p>
    </Link>
  )
}

export default function HomeClient({
  content,
  lastSlug,
  lastTitle,
  lastCategory,
  greeting,
}: Props) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const filteredContent = selectedMood
    ? (() => {
        const mood = moods.find((m) => m.id === selectedMood)
        if (!mood) return content.slice(0, 6)
        return content.filter((item) => {
          const itemTags = item.tags ?? []
          return mood.tags.some((tag) => itemTags.includes(tag))
        })
      })()
    : content.slice(0, 6)

  const lastItem = lastSlug
    ? content.find((c) => c.slug === lastSlug) ?? null
    : null

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: '#f3f0ff' }}>
          {greeting}
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9ca3af' }}>
          ¿Cómo te sientes hoy?
        </p>
      </div>

      {/* Mood selector */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {moods.map((mood) => {
          const isActive = selectedMood === mood.id
          return (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(isActive ? null : mood.id)}
              className="flex flex-col items-center gap-2 rounded-xl border py-4 transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                backgroundColor: isActive
                  ? 'rgba(167,139,250,0.2)'
                  : 'rgba(255,255,255,0.04)',
                borderColor: isActive
                  ? '#a78bfa'
                  : 'rgba(167,139,250,0.2)',
              }}
            >
              <span className="text-2xl leading-none">{mood.emoji}</span>
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? '#a78bfa' : '#d1d5db' }}
              >
                {mood.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Para ti hoy */}
      <section>
        <h2
          className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest"
          style={{ color: '#6b7280' }}
        >
          <span
            className="inline-block h-px flex-1"
            style={{ backgroundColor: 'rgba(107,114,128,0.3)' }}
          />
          Para ti hoy
          <span
            className="inline-block h-px flex-1"
            style={{ backgroundColor: 'rgba(107,114,128,0.3)' }}
          />
        </h2>

        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredContent.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p
            className="rounded-xl border py-10 text-center text-sm"
            style={{
              color: '#6b7280',
              borderColor: 'rgba(107,114,128,0.2)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            {selectedMood
              ? 'No hay contenido para este estado aún. Intenta otro.'
              : 'Contenido en camino...'}
          </p>
        )}
      </section>

      {/* Continuar */}
      {lastItem && (
        <section>
          <h2
            className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest"
            style={{ color: '#6b7280' }}
          >
            <span
              className="inline-block h-px flex-1"
              style={{ backgroundColor: 'rgba(107,114,128,0.3)' }}
            />
            Continuar
            <span
              className="inline-block h-px flex-1"
              style={{ backgroundColor: 'rgba(107,114,128,0.3)' }}
            />
          </h2>
          <div className="max-w-xs">
            <ContentCard item={lastItem} />
          </div>
        </section>
      )}
    </div>
  )
}
