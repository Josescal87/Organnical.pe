'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import type { SamiContent } from '@/lib/supabase/database.types'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { C, categoryLabel, narratorLabel, REGION_THEMES, REGION_PLAYER_STYLES } from '@/app/sami/_components/content-helpers'
import SamiMascot from '@/app/sami/_components/SamiMascot'
import { CartoonCostaScene, CartoonSierraScene, CartoonSelvaScene, CARTOON_KEYFRAMES } from '@/app/sami/_components/CartoonScenes'
import type { SamiCategory } from '@/lib/supabase/database.types'

interface Props {
  content: SamiContent
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function CatIcon({ cat, size = 32 }: { cat: SamiCategory; size?: number }) {
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
      <path d="M4 20C6 16 10 14 12 17C14 20 18 16 20 13C22 10 26 10 28 14" stroke="#5ec9e8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M4 25C6 21 10 19 12 22C14 25 18 21 20 18C22 15 26 15 28 19" stroke="#5ec9e8" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5" />
    </svg>
  )
  if (cat === 'meditacion') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="7" r="4" fill="#a78bfa" stroke={C.stroke} strokeWidth="2.5" />
      <path d="M8 28C8 22 11 18 16 18C21 18 24 22 24 28" fill="#a78bfa" stroke={C.stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 20L6 24M22 20L26 24" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="16" rx="10" ry="12" fill="#5ae891" opacity=".2" stroke="#5ae891" strokeWidth="2.5" />
      <ellipse cx="16" cy="16" rx="5" ry="7" fill="#5ae891" opacity=".4" stroke={C.stroke} strokeWidth="2" />
      <path d="M16 8V6M16 26V24M8 16H6M26 16H24" stroke="#5ae891" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function AudioPlayer({ content }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying]     = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(content.duration_seconds)
  const [sessionId, setSessionId]     = useState<string | null>(null)
  const [showRipple, setShowRipple]   = useState(false)

  const region = content.region === 'universal' ? 'sierra' : content.region
  const theme = REGION_THEMES[region]
  const playerStyle = REGION_PLAYER_STYLES[content.region] ?? REGION_PLAYER_STYLES.universal

  // ── Session helpers ────────────────────────────────────────────────────────

  const startSession = useCallback(async () => {
    if (sessionId) return
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .schema('sami')
      .from('listening_sessions')
      .insert({ user_id: user.id, content_id: content.id })
      .select('id')
      .single()
    if (data) setSessionId(data.id)
  }, [sessionId, content.id])

  const completeSession = useCallback(async (secondsListened: number) => {
    if (!sessionId) return
    const supabase = createBrowserClient()
    await supabase
      .schema('sami')
      .from('listening_sessions')
      .update({ completed: true, seconds_listened: Math.floor(secondsListened) })
      .eq('id', sessionId)
  }, [sessionId])

  // ── Audio event handlers ───────────────────────────────────────────────────

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration)
  }

  async function handleEnded() {
    setIsPlaying(false)
    await completeSession(audioRef.current?.currentTime ?? currentTime)
  }

  // ── Playback controls ──────────────────────────────────────────────────────

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) { audio.pause(); return }
    setShowRipple(true)
    setTimeout(() => setShowRipple(false), 600)
    void startSession()
    const promise = audio.play()
    if (promise !== undefined) promise.catch((err: Error) => console.error('audio.play() failed:', err))
  }

  function seek(value: number) {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrentTime(value)
  }

  function skip(seconds: number) {
    const audio = audioRef.current
    if (!audio) return
    const next = Math.max(0, Math.min(duration, audio.currentTime + seconds))
    audio.currentTime = next
    setCurrentTime(next)
  }

  // ── No audio ───────────────────────────────────────────────────────────────

  if (!content.audio_url) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 20px', textAlign: 'center' }}>
        <SamiMascot pose="sentado" size={100} anim="float" />
        <p style={{ fontSize: 14, color: C.textD }}>Audio no disponible todavía.</p>
        <Link href="/sami" style={{ fontSize: 14, color: theme.accent, textDecoration: 'underline' }}>
          ← Volver al inicio
        </Link>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{CARTOON_KEYFRAMES}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Cartoon scene header */}
        <div style={{ position: 'relative', height: 200, borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
          {region === 'costa'  && <CartoonCostaScene  isNight={true} />}
          {region === 'sierra' && <CartoonSierraScene isNight={true} />}
          {region === 'selva'  && <CartoonSelvaScene  isNight={true} />}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, transparent 35%, ${theme.bg} 100%)`,
          }} />
          {/* Back button */}
          <Link
            href="/sami"
            style={{
              position: 'absolute', top: 12, left: 12,
              background: C.bg2, border: `2px solid ${C.stroke}`, borderRadius: 99,
              padding: '6px 14px', color: theme.accent, fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-nunito), Nunito, sans-serif', cursor: 'pointer',
              boxShadow: `2px 2px 0 ${C.stroke}`, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ← Volver
          </Link>
        </div>

        {/* Mascot + title card */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: '0 16px 16px', marginTop: -40, position: 'relative', zIndex: 10,
        }}>
          <SamiMascot
            pose={isPlaying ? 'corriendo' : 'sentado'}
            size={120}
            anim={isPlaying ? 'bounce' : 'float'}
          />

          {/* Title card */}
          <div style={{
            background: C.bg2, border: `3px solid ${theme.accent}`, borderRadius: 22,
            padding: '14px 18px', textAlign: 'center',
            boxShadow: `4px 4px 0 ${theme.accentD}`,
            width: '100%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <CatIcon cat={content.category} size={32} />
            </div>
            <h1 style={{
              fontSize: 18, fontWeight: 900, color: C.text, lineHeight: 1.2,
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            }}>
              {content.title}
            </h1>
            {content.description && (
              <p style={{ marginTop: 6, fontSize: 12, color: C.textD, lineHeight: 1.6 }}>
                {content.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: theme.accent, color: 'white',
                border: `2px solid ${theme.accentD}`, borderRadius: 99, padding: '3px 12px',
                boxShadow: `2px 2px 0 ${theme.accentD}`,
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              }}>
                {theme.name}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: C.bg3, color: C.textM,
                border: `2px solid ${C.stroke}`, borderRadius: 99, padding: '3px 12px',
                boxShadow: `2px 2px 0 ${C.stroke}`,
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              }}>
                {categoryLabel(content.category)}
              </span>
            </div>
            {(() => {
              const n = narratorLabel(content.narrator)
              return n ? (
                <p style={{
                  marginTop: 6, fontSize: 11, color: C.textD, fontWeight: 600,
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                }}>
                  narrado por {n.icono} {n.nombre}
                </p>
              ) : null
            })()}
          </div>
        </div>

        {/* Progress + waveform area */}
        <div style={{
          background: C.bg2, border: `3px solid ${C.stroke}`, borderRadius: 18,
          padding: '12px 14px', margin: '0 16px 12px',
          boxShadow: `3px 3px 0 ${C.stroke}`,
        }}>
          {/* Waveform visualization */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', height: 36, marginBottom: 8 }}>
            {Array.from({ length: 40 }).map((_, i) => {
              const barH = 10 + Math.sin(i * 0.6) * 9 + Math.sin(i * 0.22) * 7
              const frac = i / 40
              const progress = duration > 0 ? currentTime / duration : 0
              const past = frac < progress
              const curr = Math.abs(frac - progress) < 0.025
              return (
                <div key={i} style={{
                  width: 4, borderRadius: 99, flexShrink: 0,
                  height: `${barH}px`,
                  background: curr ? theme.accentL : past ? theme.accent : `${theme.accent}25`,
                  border: curr ? `1px solid ${theme.accentD}` : 'none',
                  transition: 'background 0.2s',
                }} />
              )
            })}
          </div>
          {/* Seek bar */}
          <input
            type="range" min={0} max={duration} step={1} value={currentTime}
            onChange={e => seek(Number(e.target.value))}
            style={{
              width: '100%', cursor: 'pointer', appearance: 'none',
              height: 6, borderRadius: 99, outline: 'none',
              accentColor: playerStyle.progressColor,
              background: `linear-gradient(to right,${theme.accent} ${(duration > 0 ? currentTime / duration : 0) * 100}%,${C.bg3} ${(duration > 0 ? currentTime / duration : 0) * 100}%)`,
            }}
            aria-label="Progreso de reproducción"
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, fontWeight: 700, color: C.textD, marginTop: 4,
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 16px 32px' }}>
          {/* Skip back 15s */}
          <button
            onClick={() => skip(-15)}
            style={{
              background: C.bg2, border: `3px solid ${C.stroke}`, borderRadius: '50%',
              width: 48, height: 48, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `3px 3px 0 ${C.stroke}`,
            }}
            aria-label="Retroceder 15 segundos"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.purpL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
              <text x="12" y="14.5" textAnchor="middle" fontSize="5.5" fill={C.purpL} stroke="none" fontFamily="Nunito" fontWeight="bold">15</text>
            </svg>
          </button>

          {/* Play/Pause — big cartoon button */}
          <button
            onClick={togglePlay}
            style={{
              width: 76, height: 76, borderRadius: '50%',
              border: `4px solid ${C.stroke}`, cursor: 'pointer',
              background: `linear-gradient(160deg,${theme.accent} 0%,${theme.accentD} 100%)`,
              boxShadow: `4px 4px 0 ${theme.accentD}, 0 8px 24px ${theme.accent}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              transform: isPlaying ? 'scale(0.94) translateY(3px)' : 'scale(1)',
              transition: 'transform 0.15s',
            }}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {/* Ripple */}
            {showRipple && (
              <div
                aria-hidden
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: `2px solid ${theme.accent}`,
                  animation: 'sami-ripple 0.6s ease-out forwards',
                  pointerEvents: 'none',
                }}
              />
            )}
            {isPlaying ? (
              <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
                <rect x="6" y="5" width="7" height="22" rx="3" stroke={C.stroke} strokeWidth="1.5" />
                <rect x="19" y="5" width="7" height="22" rx="3" stroke={C.stroke} strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
                <path d="M8 6L26 16L8 26Z" stroke={C.stroke} strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Skip forward 15s */}
          <button
            onClick={() => skip(15)}
            style={{
              background: C.bg2, border: `3px solid ${C.stroke}`, borderRadius: '50%',
              width: 48, height: 48, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `3px 3px 0 ${C.stroke}`,
            }}
            aria-label="Adelantar 15 segundos"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.purpL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-.49-3.5" />
              <text x="12" y="14.5" textAnchor="middle" fontSize="5.5" fill={C.purpL} stroke="none" fontFamily="Nunito" fontWeight="bold">15</text>
            </svg>
          </button>
        </div>

        {/* Native audio element */}
        <audio
          ref={audioRef}
          src={content.audio_url}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      </div>
    </>
  )
}
