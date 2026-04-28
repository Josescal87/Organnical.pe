'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SamiCategory, SamiContent, SamiRegion } from '@/lib/supabase/database.types'
import {
  categoryIcon,
  categoryLabel,
  formatDuration,
  REGION_THEMES,
  REGIONS,
} from '../../_components/content-helpers'

interface Props {
  content: Pick<SamiContent, 'id' | 'slug' | 'title' | 'category' | 'region' | 'duration_seconds' | 'tags'>[]
}

type TabValue = 'todas' | SamiCategory
type RegionFilter = 'todas' | Exclude<SamiRegion, 'universal'>

const CATEGORY_TABS: { value: TabValue; label: string }[] = [
  { value: 'todas',       label: 'Todas' },
  { value: 'meditacion',  label: '🧘 Meditaciones' },
  { value: 'cuento',      label: '🌙 Cuentos' },
  { value: 'ruido',       label: '🌊 Ruido' },
  { value: 'respiracion', label: '💨 Respiración' },
]

type DurationFilter = 'corto' | 'medio' | 'largo'

const DURATION_FILTERS: { value: DurationFilter; label: string }[] = [
  { value: 'corto', label: '< 5 min' },
  { value: 'medio', label: '5–15 min' },
  { value: 'largo', label: '> 15 min' },
]

function matchesDuration(seconds: number, filter: DurationFilter): boolean {
  if (filter === 'corto') return seconds < 300
  if (filter === 'medio') return seconds >= 300 && seconds <= 900
  return seconds > 900
}

export default function ExplorarClient({ content }: Props) {
  const [activeTab, setActiveTab]         = useState<TabValue>('todas')
  const [regionFilter, setRegionFilter]   = useState<RegionFilter>('todas')
  const [durationFilter, setDurationFilter] = useState<DurationFilter | null>(null)

  const filtered = content.filter((item) => {
    const tabMatch      = activeTab === 'todas' || item.category === activeTab
    const regionMatch   = regionFilter === 'todas' || item.region === regionFilter || item.region === 'universal'
    const durMatch      = durationFilter === null || matchesDuration(item.duration_seconds, durationFilter)
    return tabMatch && regionMatch && durMatch
  })

  function toggleDuration(value: DurationFilter) {
    setDurationFilter((prev) => (prev === value ? null : value))
  }

  const activeTheme = regionFilter !== 'todas' ? REGION_THEMES[regionFilter] : REGION_THEMES.sierra

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: '#f3f0ff' }}>
          Explorar
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9ca3af' }}>
          Toda la biblioteca de Sami
        </p>
      </div>

      {/* Region filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setRegionFilter('todas')}
          className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: regionFilter === 'todas' ? 'rgba(167,139,250,0.2)' : 'transparent',
            borderColor:     regionFilter === 'todas' ? '#a78bfa'               : 'rgba(255,255,255,0.1)',
            color:           regionFilter === 'todas' ? '#a78bfa'               : '#6b7280',
          }}
        >
          ✨ Todas
        </button>
        {REGIONS.map(({ id, icon }) => {
          const isActive = regionFilter === id
          const t = REGION_THEMES[id]
          return (
            <button
              key={id}
              onClick={() => setRegionFilter(id)}
              className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? t.glow : 'transparent',
                borderColor:     isActive ? t.accent : 'rgba(255,255,255,0.1)',
                color:           isActive ? t.accent : '#6b7280',
              }}
            >
              {icon} {t.name}
            </button>
          )
        })}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? 'rgba(124,58,237,0.2)' : 'transparent',
                borderColor:     isActive ? '#7c3aed'               : 'transparent',
                color:           isActive ? '#a78bfa'               : '#6b7280',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Duration filters */}
      <div className="flex flex-wrap gap-2">
        {DURATION_FILTERS.map((df) => {
          const isActive = durationFilter === df.value
          return (
            <button
              key={df.value}
              onClick={() => toggleDuration(df.value)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
              style={{
                backgroundColor: isActive ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                borderColor:     isActive ? '#7c3aed'               : 'rgba(167,139,250,0.2)',
                color:           isActive ? '#a78bfa'               : '#9ca3af',
              }}
            >
              {df.label}
            </button>
          )
        })}
      </div>

      {/* Content grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((item) => {
            const itemTheme = item.region !== 'universal'
              ? REGION_THEMES[item.region]
              : activeTheme
            return (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                className="group flex flex-col gap-3 rounded-xl border p-4 transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor:     itemTheme.border,
                }}
              >
                <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                  {categoryIcon(item.category)}
                </span>
                <p
                  className="line-clamp-2 text-sm font-medium leading-snug"
                  style={{ color: '#f3f0ff' }}
                >
                  {item.title}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <span className="text-xs" style={{ color: '#9ca3af' }}>
                    {formatDuration(item.duration_seconds)}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: itemTheme.glow, color: itemTheme.accent }}
                  >
                    {categoryLabel(item.category)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p
          className="rounded-xl border py-12 text-center text-sm"
          style={{
            color:           '#6b7280',
            borderColor:     'rgba(107,114,128,0.2)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          No hay contenido en esta selección aún.
        </p>
      )}
    </div>
  )
}
