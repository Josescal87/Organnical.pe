'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SamiCategory, SamiContent, SamiRegion } from '@/lib/supabase/database.types'
import {
  C,
  categoryLabel,
  formatDuration,
  narratorLabel,
  REGION_THEMES,
  REGIONS,
} from '../../_components/content-helpers'
import SamiMascot from '../../_components/SamiMascot'
import { CARTOON_KEYFRAMES } from '../../_components/CartoonScenes'

interface Props {
  content: Pick<SamiContent, 'id' | 'slug' | 'title' | 'category' | 'region' | 'duration_seconds' | 'tags' | 'narrator'>[]
}

type TabValue = 'todas' | SamiCategory
type RegionFilter = 'todas' | Exclude<SamiRegion, 'universal'>
type DurationFilter = 'corto' | 'medio' | 'largo'

const CATEGORY_TABS: { value: TabValue; label: string }[] = [
  { value: 'todas',       label: 'Todas' },
  { value: 'meditacion',  label: 'Meditación' },
  { value: 'cuento',      label: 'Cuentos' },
  { value: 'ruido',       label: 'Ruido' },
  { value: 'respiracion', label: 'Respiración' },
]

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

const PILL_BASE: React.CSSProperties = {
  flexShrink: 0, borderRadius: 99, cursor: 'pointer',
  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
  fontWeight: 800, border: 'none', transition: 'all 0.18s',
}

export default function ExplorarClient({ content }: Props) {
  const [activeTab, setActiveTab]           = useState<TabValue>('todas')
  const [regionFilter, setRegionFilter]     = useState<RegionFilter>('todas')
  const [durationFilter, setDurationFilter] = useState<DurationFilter | null>(null)

  const filtered = content.filter((item) => {
    const tabMatch    = activeTab === 'todas' || item.category === activeTab
    const regionMatch = regionFilter === 'todas' || item.region === regionFilter || item.region === 'universal'
    const durMatch    = durationFilter === null || matchesDuration(item.duration_seconds, durationFilter)
    return tabMatch && regionMatch && durMatch
  })

  function toggleDuration(value: DurationFilter) {
    setDurationFilter(prev => prev === value ? null : value)
  }

  const activeTheme = regionFilter !== 'todas' ? REGION_THEMES[regionFilter] : REGION_THEMES.sierra

  return (
    <>
      <style>{CARTOON_KEYFRAMES}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Page heading */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              fontSize: 24, fontWeight: 900, color: C.text,
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            }}>
              Explorar
            </h1>
            <p style={{ fontSize: 13, color: C.textD, marginTop: 2, fontWeight: 500 }}>
              Toda la biblioteca de Sami
            </p>
          </div>
          <SamiMascot pose="parado" size={68} anim="float" style={{ marginBottom: -2 }} />
        </div>

        {/* Region filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {(['todas', ...Object.keys(REGIONS.reduce((a, r) => ({ ...a, [r.id]: r }), {}))].map((id, _i) => {
            const isA = regionFilter === id
            const rr = id !== 'todas' ? REGION_THEMES[id as Exclude<SamiRegion, 'universal'>] : null
            return (
              <button
                key={id}
                onClick={() => setRegionFilter(id as RegionFilter)}
                style={{
                  ...PILL_BASE,
                  padding: '6px 14px', fontSize: 12,
                  background: isA ? (rr ? rr.accent : C.purp) : C.bg2,
                  border: `2px solid ${isA ? (rr ? rr.accentD : C.purpD) : C.stroke}`,
                  color: isA ? 'white' : C.textD,
                  boxShadow: isA ? `2px 2px 0 ${rr ? rr.accentD : C.purpD}` : `2px 2px 0 ${C.stroke}`,
                  transform: isA ? 'translateY(-1px)' : 'none',
                }}
              >
                {id === 'todas' ? '✨ Todas' : `${id === 'costa' ? '🌊' : id === 'sierra' ? '⛰️' : '🌿'} ${REGION_THEMES[id as Exclude<SamiRegion, 'universal'>].name}`}
              </button>
            )
          }))}
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {CATEGORY_TABS.map(tab => {
            const isA = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  ...PILL_BASE,
                  padding: '5px 12px', fontSize: 11,
                  background: isA ? C.purp : C.bg2,
                  border: `2px solid ${isA ? C.purpD : C.stroke}`,
                  color: isA ? 'white' : C.textD,
                  boxShadow: isA ? `2px 2px 0 ${C.purpD}` : `2px 2px 0 ${C.stroke}`,
                  transform: isA ? 'translateY(-1px)' : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Duration filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DURATION_FILTERS.map(df => {
            const isA = durationFilter === df.value
            return (
              <button
                key={df.value}
                onClick={() => toggleDuration(df.value)}
                style={{
                  ...PILL_BASE,
                  padding: '4px 12px', fontSize: 11,
                  background: isA ? C.purp : C.bg2,
                  border: `2px solid ${isA ? C.purpD : C.stroke}`,
                  color: isA ? 'white' : C.textD,
                  boxShadow: isA ? `2px 2px 0 ${C.purpD}` : `2px 2px 0 ${C.stroke}`,
                }}
              >
                {df.label}
              </button>
            )
          })}
        </div>

        {/* Content grid */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {filtered.map(item => {
              const ir = item.region !== 'universal' ? REGION_THEMES[item.region] : activeTheme
              return (
                <Link
                  key={item.id}
                  href={`/sami/${item.slug}`}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 10,
                    background: C.bg2,
                    border: `3px solid ${C.stroke}`,
                    borderRadius: 20, padding: '14px 12px',
                    textDecoration: 'none', cursor: 'pointer',
                    boxShadow: `3px 3px 0 ${C.stroke}`,
                    transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = `${ir.accent}15`
                    el.style.borderColor = ir.accent
                    el.style.transform = 'translateY(-3px) rotate(-0.5deg)'
                    el.style.boxShadow = `0 8px 20px ${ir.accent}30, 4px 4px 0 ${C.stroke}`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = C.bg2
                    el.style.borderColor = C.stroke
                    el.style.transform = 'none'
                    el.style.boxShadow = `3px 3px 0 ${C.stroke}`
                  }}
                >
                  <p style={{
                    fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.3,
                    fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {item.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: C.textD, fontWeight: 600 }}>
                      {formatDuration(item.duration_seconds)}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, background: ir.accent, color: 'white',
                      border: `1.5px solid ${ir.accentD}`, borderRadius: 99, padding: '1px 7px',
                      boxShadow: `1px 1px 0 ${ir.accentD}`,
                      fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                    }}>
                      {categoryLabel(item.category)}
                    </span>
                    {(() => {
                      const n = narratorLabel(item.narrator)
                      return n ? (
                        <span style={{ fontSize: 10, color: C.textD, fontWeight: 600 }}>
                          {n.icono} {n.nombre}
                        </span>
                      ) : null
                    })()}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            border: `3px solid ${C.stroke}`, borderRadius: 20, padding: '40px 20px',
            background: C.bg2, boxShadow: `3px 3px 0 ${C.stroke}`, textAlign: 'center',
          }}>
            <SamiMascot pose="sentado" size={80} anim="float" />
            <p style={{ fontSize: 14, color: C.textD, fontFamily: 'var(--font-nunito), Nunito, sans-serif', fontWeight: 700 }}>
              Nada por aquí aún 🐾
            </p>
          </div>
        )}
      </div>
    </>
  )
}
