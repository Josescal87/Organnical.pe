'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SamiContent, SamiCategory, SamiRegion } from '@/lib/supabase/database.types'
import { categoryIcon, formatDuration, REGION_THEMES, REGIONS } from './content-helpers'

type ActiveRegion = Exclude<SamiRegion, 'universal'>

interface Props {
  content: SamiContent[]
  lastSlug?: string
  lastCategory?: SamiCategory
  greeting: string
}

const PARTICLES: Record<ActiveRegion, Array<{ x: number; y: number; s: number; d: number; dl: number }>> = {
  costa: [
    { x: 8,  y: 78, s: 3,   d: 4.2, dl: 0   }, { x: 23, y: 85, s: 2,   d: 5.1, dl: 0.8 },
    { x: 36, y: 72, s: 4,   d: 3.8, dl: 1.5 }, { x: 50, y: 80, s: 2,   d: 6.0, dl: 0.3 },
    { x: 63, y: 74, s: 3,   d: 4.5, dl: 2.1 }, { x: 78, y: 82, s: 2,   d: 5.3, dl: 1.2 },
    { x: 89, y: 70, s: 4,   d: 3.9, dl: 0.6 }, { x: 14, y: 90, s: 2,   d: 7.0, dl: 1.8 },
    { x: 44, y: 88, s: 3,   d: 4.8, dl: 2.4 }, { x: 72, y: 92, s: 2,   d: 5.6, dl: 0.9 },
    { x: 30, y: 95, s: 2.5, d: 4.0, dl: 1.1 }, { x: 58, y: 96, s: 3,   d: 5.5, dl: 0.4 },
  ],
  sierra: [
    { x: 10, y: 18, s: 1.5, d: 2.0, dl: 0   }, { x: 27, y: 32, s: 2,   d: 1.5, dl: 0.7 },
    { x: 42, y: 12, s: 1.5, d: 3.0, dl: 1.4 }, { x: 56, y: 25, s: 2,   d: 2.2, dl: 0.2 },
    { x: 71, y: 8,  s: 1.5, d: 1.8, dl: 1.9 }, { x: 83, y: 38, s: 2,   d: 2.5, dl: 0.5 },
    { x: 94, y: 20, s: 1.5, d: 3.2, dl: 2.3 }, { x: 19, y: 42, s: 2,   d: 1.6, dl: 1.1 },
    { x: 64, y: 48, s: 1.5, d: 2.8, dl: 0.4 }, { x: 79, y: 28, s: 2,   d: 2.0, dl: 1.7 },
    { x: 31, y: 58, s: 1.5, d: 2.4, dl: 2.0 }, { x: 87, y: 52, s: 2,   d: 1.9, dl: 0.8 },
    { x: 48, y: 68, s: 1.5, d: 2.6, dl: 1.5 }, { x: 6,  y: 30, s: 2,   d: 3.1, dl: 0.3 },
  ],
  selva: [
    { x: 12, y: 28, s: 2.5, d: 3.5, dl: 0   }, { x: 28, y: 48, s: 2,   d: 4.0, dl: 1.2 },
    { x: 44, y: 22, s: 3,   d: 3.2, dl: 0.5 }, { x: 59, y: 62, s: 2,   d: 4.8, dl: 1.8 },
    { x: 73, y: 33, s: 2.5, d: 3.7, dl: 0.3 }, { x: 86, y: 54, s: 2,   d: 4.2, dl: 2.2 },
    { x: 20, y: 68, s: 2.5, d: 3.0, dl: 0.9 }, { x: 38, y: 78, s: 2,   d: 5.0, dl: 1.5 },
    { x: 54, y: 72, s: 3,   d: 3.5, dl: 0.6 }, { x: 67, y: 84, s: 2,   d: 4.5, dl: 2.0 },
    { x: 81, y: 18, s: 2.5, d: 3.8, dl: 1.3 }, { x: 93, y: 72, s: 2,   d: 4.0, dl: 0.7 },
    { x: 5,  y: 44, s: 2.5, d: 3.3, dl: 1.7 }, { x: 48, y: 38, s: 2,   d: 4.7, dl: 2.5 },
    { x: 76, y: 63, s: 2.5, d: 3.6, dl: 0.4 }, { x: 34, y: 55, s: 2,   d: 4.1, dl: 1.0 },
  ],
}

const PARTICLE_ANIM: Record<ActiveRegion, string> = {
  costa:  'sami-wave',
  sierra: 'sami-twinkle',
  selva:  'sami-firefly',
}

const REGION_SUBTITLES: Record<ActiveRegion, string> = {
  costa:  'Bioluminiscencia del Pacífico',
  sierra: 'Vía Láctea desde la puna',
  selva:  'Luciérnagas del Amazonas',
}

interface ContentCardProps {
  item: SamiContent
  accent: string
}

function ContentCard({ item, accent }: ContentCardProps) {
  return (
    <Link
      href={`/${item.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: `${accent}28`,
        // @ts-ignore
        '--hover-shadow': `0 8px 32px ${accent}30`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${accent}30`
        ;(e.currentTarget as HTMLElement).style.borderColor = `${accent}55`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = ''
        ;(e.currentTarget as HTMLElement).style.borderColor = `${accent}28`
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl leading-none">{categoryIcon(item.category)}</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {formatDuration(item.duration_seconds)}
        </span>
      </div>
      <p className="line-clamp-2 text-sm font-medium leading-snug" style={{ color: '#f3f0ff' }}>
        {item.title}
      </p>
    </Link>
  )
}

export default function HomeClient({ content, lastSlug, lastCategory, greeting }: Props) {
  const [activeRegion, setActiveRegion] = useState<ActiveRegion>('sierra')
  const theme = REGION_THEMES[activeRegion]

  const regionContent = content
    .filter(item => item.region === activeRegion || item.region === 'universal')
    .slice(0, 6)

  const lastItem = lastSlug ? content.find(c => c.slug === lastSlug) ?? null : null

  return (
    <>
      <style>{`
        @keyframes sami-twinkle {
          0%, 100% { opacity: 0.07; transform: scale(0.4); }
          50%       { opacity: 1;    transform: scale(1.9); }
        }
        @keyframes sami-wave {
          0%, 100% { opacity: 0.25; transform: translate(0, 0); }
          30%      { opacity: 0.95; transform: translate(7px, -13px); }
          70%      { opacity: 0.5;  transform: translate(-5px, -8px); }
        }
        @keyframes sami-firefly {
          0%   { opacity: 0;    transform: translate(0, 0); }
          18%  { opacity: 0.9; }
          55%  { opacity: 0.4;  transform: translate(10px, -30px); }
          88%  { opacity: 0.75; }
          100% { opacity: 0;    transform: translate(-4px, -56px); }
        }
        @keyframes sami-shoot {
          0%   { opacity: 0;   transform: translate(0, 0); }
          7%   { opacity: 1; }
          93%  { opacity: 0.8; }
          100% { opacity: 0;   transform: translate(440px, 95px); }
        }
        @keyframes sami-glow {
          0%, 100% { opacity: 0.08; }
          50%      { opacity: 0.28; }
        }
        @keyframes sami-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-11px); }
        }
        @keyframes sami-stars-pulse {
          0%, 100% { opacity: 0.65; }
          50%      { opacity: 1; }
        }
        .sami-star-bg {
          animation: sami-stars-pulse 9s ease-in-out infinite;
        }
      `}</style>

      {/* Two-layer atmospheric nebula */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(ellipse 130% 60% at 50% -8%, ${theme.accent}38 0%, transparent 58%),
            radial-gradient(ellipse 65% 45% at 88% 108%, ${theme.accent}1a 0%, transparent 52%)
          `,
        }}
      />

      {/* Animated particle layers — all three regions pre-rendered, cross-fade */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]">
        {(['costa', 'sierra', 'selva'] as const).map(region => {
          const t = REGION_THEMES[region]
          const isActive = region === activeRegion
          return (
            <div
              key={region}
              className="absolute inset-0 transition-opacity duration-800"
              style={{ opacity: isActive ? 1 : 0 }}
            >
              {PARTICLES[region].map((p, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.s}px`,
                    height: `${p.s}px`,
                    backgroundColor: t.accent,
                    boxShadow: `0 0 ${p.s * 4}px ${p.s * 1.5}px ${t.accent}65`,
                    animation: `${PARTICLE_ANIM[region]} ${p.d}s ${p.dl}s infinite ease-in-out`,
                  }}
                />
              ))}

              {/* Shooting star — Sierra only */}
              {region === 'sierra' && (
                <div
                  className="absolute"
                  style={{
                    top: '10%',
                    left: '6%',
                    width: '90px',
                    height: '1.5px',
                    borderRadius: '99px',
                    background: `linear-gradient(90deg, transparent 0%, ${t.accent}70 25%, white 55%, transparent 100%)`,
                    animation: 'sami-shoot 11s 6s infinite ease-out',
                    transformOrigin: 'left center',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Page */}
      <div className="relative z-10 flex flex-col gap-10">

        {/* Greeting */}
        <div className="pt-2">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#f3f0ff' }}>
            {greeting}
          </h1>
          <p
            className="mt-2 text-sm font-semibold transition-colors duration-700"
            style={{ color: theme.accent }}
          >
            {REGION_SUBTITLES[activeRegion]}
          </p>
        </div>

        {/* Region tabs */}
        <div className="grid grid-cols-3 gap-3">
          {REGIONS.map(({ id, icon }) => {
            const isActive = activeRegion === id
            const t = REGION_THEMES[id]
            return (
              <button
                key={id}
                onClick={() => setActiveRegion(id)}
                className="relative flex flex-col items-center gap-2.5 overflow-hidden rounded-2xl border px-3 py-6 text-center transition-all duration-500"
                style={{
                  backgroundColor: isActive ? `${t.accent}14` : 'rgba(255,255,255,0.03)',
                  borderColor: isActive ? `${t.accent}60` : 'rgba(255,255,255,0.07)',
                  boxShadow: isActive
                    ? `0 0 30px ${t.accent}2a, inset 0 0 28px ${t.accent}08`
                    : 'none',
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                {isActive && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse 75% 75% at 50% 50%, ${t.accent}16 0%, transparent 70%)`,
                      animation: 'sami-glow 3s ease-in-out infinite',
                    }}
                  />
                )}
                <span className="relative text-2xl leading-none">{icon}</span>
                <div className="relative">
                  <p
                    className="text-sm font-semibold leading-none"
                    style={{ color: isActive ? t.accent : '#9ca3af' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="mt-1 text-[11px] leading-tight"
                    style={{ color: isActive ? `${t.accent}80` : '#4b5563' }}
                  >
                    {t.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Section header */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2
              className="text-xs font-semibold uppercase tracking-widest transition-colors duration-700"
              style={{ color: theme.accent, opacity: 0.7 }}
            >
              Esta noche · {theme.name}
            </h2>
            <span
              className="flex-1 border-t transition-colors duration-700"
              style={{ borderColor: `${theme.accent}25` }}
            />
          </div>
          <p className="text-xs" style={{ color: '#4b5563' }}>
            {REGION_SUBTITLES[activeRegion]}
          </p>
        </div>

        {/* Content grid */}
        {regionContent.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {regionContent.map(item => (
              <ContentCard key={item.id} item={item} accent={theme.accent} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-5 rounded-2xl border px-8 py-16 text-center transition-all duration-700"
            style={{
              borderColor: `${theme.accent}18`,
              backgroundColor: `${theme.accent}07`,
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{
                backgroundColor: `${theme.accent}14`,
                boxShadow: `0 0 50px ${theme.accent}28`,
                animation: 'sami-float 4s ease-in-out infinite',
              }}
            >
              {REGIONS.find(r => r.id === activeRegion)?.icon}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#f3f0ff' }}>
                El cielo de la {theme.name.toLowerCase()} se está preparando
              </p>
              <p className="mt-1.5 text-xs" style={{ color: '#4b5563' }}>
                Las primeras meditaciones llegarán pronto
              </p>
            </div>
          </div>
        )}

        {/* Continue */}
        {lastItem && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: '#4b5563' }}
              >
                Continuar
              </h2>
              <span className="flex-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="max-w-[180px]">
              <ContentCard item={lastItem} accent={theme.accent} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
