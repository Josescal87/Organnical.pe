'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SamiContent, SamiCategory, SamiRegion } from '@/lib/supabase/database.types'
import {
  C,
  categoryLabel,
  formatDuration,
  narratorLabel,
  REGION_THEMES,
  REGIONS,
  REGION_BADGE_LABELS,
} from './content-helpers'
import SamiMascot from './SamiMascot'
import {
  CartoonCostaScene,
  CartoonSierraScene,
  CartoonSelvaScene,
  CARTOON_KEYFRAMES,
} from './CartoonScenes'

type ActiveRegion = Exclude<SamiRegion, 'universal'>

interface Props {
  content: SamiContent[]
  lastSlug?: string
  lastCategory?: SamiCategory
  greeting: string
}

// ── Category SVG icons (cartoon style) ──────────────────────────────────────

function CatIcon({ cat, size = 26 }: { cat: SamiCategory; size?: number }) {
  if (cat === 'cuento') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M26 17.5C24.5 21.5 20.5 24 16 24C10.5 24 6 19.5 6 14C6 9.5 8.5 5.5 12.5 4C9 6 7 9.5 7 13.5C7 19.5 11.5 24.5 17.5 24.5C21 24.5 24 22.5 26 19.5"
        fill="#a78bfa" stroke={C.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="9" r="2" fill="#a78bfa" stroke={C.stroke} strokeWidth="1.5" />
      <circle cx="27" cy="14" r="1.3" fill="#a78bfa" stroke={C.stroke} strokeWidth="1.2" />
    </svg>
  )
  if (cat === 'ruido') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 20C6 16 10 14 12 17C14 20 18 16 20 13C22 10 26 10 28 14"
        stroke="#5ec9e8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M4 25C6 21 10 19 12 22C14 25 18 21 20 18C22 15 26 15 28 19"
        stroke="#5ec9e8" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5" />
    </svg>
  )
  if (cat === 'meditacion') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="7" r="4" fill="#a78bfa" stroke={C.stroke} strokeWidth="2.5" />
      <path d="M8 28C8 22 11 18 16 18C21 18 24 22 24 28"
        fill="#a78bfa" stroke={C.stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 20L6 24M22 20L26 24" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
  // respiracion
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="16" rx="10" ry="12" fill="#5ae891" opacity=".2" stroke="#5ae891" strokeWidth="2.5" />
      <ellipse cx="16" cy="16" rx="5" ry="7" fill="#5ae891" opacity=".4" stroke={C.stroke} strokeWidth="2" />
      <path d="M16 8V6M16 26V24M8 16H6M26 16H24" stroke="#5ae891" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// ── CartoonCard ──────────────────────────────────────────────────────────────

interface CardProps {
  item: SamiContent
  accent: string
  accentD: string
}

function CartoonCard({ item, accent, accentD }: CardProps) {
  const [hov, setHov] = useState(false)
  const regionBadge = item.region !== 'universal'
    ? REGION_BADGE_LABELS[item.region as Exclude<SamiRegion, 'universal'>]
    : null

  return (
    <Link
      href={`/sami/${item.slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: hov ? `${accent}15` : C.bg2,
        border: `3px solid ${hov ? accent : C.stroke}`,
        borderRadius: 20,
        padding: '14px 12px',
        textDecoration: 'none',
        cursor: 'pointer',
        transform: hov ? 'translateY(-3px) rotate(-0.5deg)' : 'none',
        boxShadow: hov
          ? `0 8px 20px ${accent}30, 4px 4px 0 ${C.stroke}`
          : `3px 3px 0 ${C.stroke}`,
        transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CatIcon cat={item.category} size={26} />
        <span style={{
          fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-nunito), Nunito, sans-serif',
          background: accent, color: 'white',
          border: `2px solid ${accentD}`,
          borderRadius: 99, padding: '2px 8px',
          boxShadow: `2px 2px 0 ${accentD}`,
        }}>
          {formatDuration(item.duration_seconds)}
        </span>
      </div>
      <p style={{
        fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.3,
        fontFamily: 'var(--font-nunito), Nunito, sans-serif',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {item.title}
      </p>
      <div style={{ fontSize: 11, color: C.textD, fontWeight: 600 }}>
        {categoryLabel(item.category)}
        {regionBadge && <span style={{ marginLeft: 4 }}>{regionBadge}</span>}
        {(() => {
          const n = narratorLabel(item.narrator)
          return n ? <span style={{ marginLeft: 4, opacity: 0.7 }}>{n.icono} {n.nombre}</span> : null
        })()}
      </div>
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HomeClient({ content, lastSlug, greeting }: Props) {
  const [activeRegion, setActiveRegion] = useState<ActiveRegion>('sierra')
  const [arriving, setArriving] = useState(false)

  const theme = REGION_THEMES[activeRegion]

  function handleRegionChange(region: ActiveRegion) {
    if (region === activeRegion) return
    setArriving(true)
    setActiveRegion(region)
    setTimeout(() => setArriving(false), 700)
  }

  const regionContent = content
    .filter(item => item.region === activeRegion || item.region === 'universal')
    .slice(0, 6)

  const lastItem = lastSlug ? content.find(c => c.slug === lastSlug) ?? null : null

  return (
    <>
      <style>{CARTOON_KEYFRAMES}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Greeting + mascot */}
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8,
            animation: 'sami-slide-up 0.48s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.02em',
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            }}>
              {greeting}
            </h1>
            <p style={{
              marginTop: 3, fontSize: 13, fontWeight: 700,
              color: theme.accent, transition: 'color 0.5s',
            }}>
              {theme.subtitle}
            </p>
          </div>
          <SamiMascot
            pose={theme.mascotPose}
            size={82}
            anim={arriving ? 'arrive' : 'float'}
            style={{ marginBottom: -2 }}
          />
        </div>

        {/* Region selector */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: C.textD, marginBottom: 8,
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
          }}>
            ELIGE TU REGIÓN
          </p>
          <div style={{
            display: 'flex', borderRadius: 20, overflow: 'hidden',
            border: `3px solid ${C.stroke}`, height: 140, background: C.bg0,
            boxShadow: `4px 4px 0 ${C.stroke}`,
          }}>
            {(REGIONS as { id: ActiveRegion; icon: string }[]).map((reg, idx) => {
              const t = REGION_THEMES[reg.id]
              const isA = reg.id === activeRegion
              return (
                <button
                  key={reg.id}
                  onClick={() => handleRegionChange(reg.id)}
                  style={{
                    flex: 1, position: 'relative', overflow: 'hidden',
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    borderRight: idx < 2 ? `2px solid ${C.stroke}` : 'none',
                    filter: isA ? 'brightness(1.25)' : 'brightness(0.55)',
                    transform: isA ? 'scale(1.03)' : 'scale(1)',
                    transition: 'filter 0.4s, transform 0.4s',
                    zIndex: isA ? 2 : 1,
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0 }}>
                    {reg.id === 'costa'  && <CartoonCostaScene  isNight={true} compact />}
                    {reg.id === 'sierra' && <CartoonSierraScene isNight={true} compact />}
                    {reg.id === 'selva'  && <CartoonSelvaScene  isNight={true} compact />}
                  </div>
                  {isA && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `radial-gradient(ellipse 90% 70% at 50% 30%,${t.accent}25 0%,transparent 70%)`,
                      animation: 'sami-breathe 3s ease-in-out infinite',
                    }} />
                  )}
                  {/* Label pill */}
                  <div style={{
                    position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                    background: isA ? t.accent : C.bg2,
                    border: `2px solid ${isA ? t.accentD : C.stroke}`,
                    borderRadius: 99, padding: '2px 10px',
                    boxShadow: isA ? `2px 2px 0 ${t.accentD}` : `2px 2px 0 ${C.stroke}`,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: isA ? 'white' : C.textD,
                      textShadow: isA ? `0 1px 0 ${t.accentD}` : 'none',
                      whiteSpace: 'nowrap',
                    }}>
                      {t.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>
            {activeRegion === 'costa' ? '🌊' : activeRegion === 'sierra' ? '⛰️' : '🌿'}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: theme.accent, fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            transition: 'color 0.5s',
          }}>
            Desde la {theme.name}
          </span>
          <div style={{ flex: 1, height: 3, background: theme.accent, borderRadius: 99, opacity: 0.3 }} />
        </div>

        {/* Content grid */}
        {regionContent.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {regionContent.map(item => (
              <CartoonCard key={item.id} item={item} accent={theme.accent} accentD={theme.accentD} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            border: `3px solid ${C.stroke}`, borderRadius: 20, padding: '40px 20px',
            background: C.bg2, boxShadow: `3px 3px 0 ${C.stroke}`, textAlign: 'center',
          }}>
            <SamiMascot pose="sentado" size={80} anim="float" />
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>
              El cielo de la {theme.name.toLowerCase()} se está preparando
            </p>
            <p style={{ fontSize: 12, color: C.textD }}>
              Las primeras meditaciones llegarán pronto 🐾
            </p>
          </div>
        )}

        {/* Continue */}
        {lastItem && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: C.textD, fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              }}>
                Continuar
              </span>
              <div style={{ flex: 1, height: 2, background: C.stroke, borderRadius: 99, opacity: 0.5 }} />
            </div>
            <div style={{ maxWidth: 180 }}>
              <CartoonCard item={lastItem} accent={theme.accent} accentD={theme.accentD} />
            </div>
          </div>
        )}

      </div>
    </>
  )
}
