'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { SamiContent } from '@/lib/supabase/database.types'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { categoryIcon, categoryLabel } from '@/app/(sami)/_components/content-helpers'

interface Props {
  content: SamiContent
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SLEEP_OPTIONS = [15, 30, 60] as const
type SleepOption = typeof SLEEP_OPTIONS[number]

export default function AudioPlayer({ content }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying]     = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(content.duration_seconds)
  const [sleepTimer, setSleepTimer]   = useState<number | null>(null) // remaining seconds
  const [sessionId, setSessionId]     = useState<string | null>(null)

  // Sleep timer interval ref
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    if (audio.duration && isFinite(audio.duration)) {
      setDuration(audio.duration)
    }
  }

  async function handleEnded() {
    setIsPlaying(false)
    clearSleepInterval()
    await completeSession(audioRef.current?.currentTime ?? currentTime)
  }

  // ── Playback controls ──────────────────────────────────────────────────────

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      await startSession()
      await audio.play()
      setIsPlaying(true)
    }
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

  // ── Sleep timer ────────────────────────────────────────────────────────────

  function clearSleepInterval() {
    if (sleepIntervalRef.current !== null) {
      clearInterval(sleepIntervalRef.current)
      sleepIntervalRef.current = null
    }
  }

  function activateSleepTimer(minutes: SleepOption) {
    clearSleepInterval()
    const totalSeconds = minutes * 60
    setSleepTimer(totalSeconds)

    sleepIntervalRef.current = setInterval(() => {
      setSleepTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearSleepInterval()
          audioRef.current?.pause()
          setIsPlaying(false)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  function cancelSleepTimer() {
    clearSleepInterval()
    setSleepTimer(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSleepInterval()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Derived values ─────────────────────────────────────────────────────────

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const icon = categoryIcon(content.category)
  const label = categoryLabel(content.category)

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!content.audio_url) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="text-5xl">{icon}</span>
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          Audio no disponible todavía.
        </p>
        <Link
          href="/"
          className="text-sm underline underline-offset-2 transition-colors hover:opacity-80"
          style={{ color: '#a78bfa' }}
        >
          ← Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Back link */}
      <Link
        href="/"
        className="flex w-fit items-center gap-1 text-sm transition-colors hover:opacity-80"
        style={{ color: '#a78bfa' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Volver
      </Link>

      {/* Category icon with glow */}
      <div className="flex justify-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full text-5xl"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(167,139,250,0.35) 0%, rgba(109,40,217,0.15) 60%, transparent 100%)',
            boxShadow: '0 0 40px rgba(167,139,250,0.25), 0 0 80px rgba(109,40,217,0.12)',
          }}
        >
          {icon}
        </div>
      </div>

      {/* Title & meta */}
      <div className="text-center">
        <h1
          className="text-xl font-semibold leading-snug"
          style={{ color: '#f3f0ff' }}
        >
          {content.title}
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9ca3af' }}>
          {formatTime(duration)}
          {' · '}
          {label}
        </p>
        {content.description && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6b7280' }}>
            {content.description}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={duration}
          step={1}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full cursor-pointer appearance-none"
          style={{
            accentColor: '#a78bfa',
            height: '4px',
          }}
          aria-label="Progreso de reproducción"
        />
        <div
          className="flex justify-between text-xs tabular-nums"
          style={{ color: '#6b7280' }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {/* Skip back 15s */}
        <button
          onClick={() => skip(-15)}
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80 active:opacity-60"
          aria-label="Retroceder 15 segundos"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#d1d5db' }}
          >
            <path d="M1 4v6h6" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            <text
              x="12"
              y="14"
              textAnchor="middle"
              fontSize="6"
              fill="currentColor"
              stroke="none"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              15
            </text>
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
          }}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            // Pause icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden="true"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            // Play icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden="true"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Skip forward 15s */}
        <button
          onClick={() => skip(15)}
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80 active:opacity-60"
          aria-label="Adelantar 15 segundos"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#d1d5db' }}
          >
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-.49-3.5" />
            <text
              x="12"
              y="14"
              textAnchor="middle"
              fontSize="6"
              fill="currentColor"
              stroke="none"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              15
            </text>
          </svg>
        </button>
      </div>

      {/* Sleep timer */}
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(167,139,250,0.15)',
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          {/* Clock icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#a78bfa' }}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#a78bfa' }}>
            Timer de sueño
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SLEEP_OPTIONS.map((mins) => {
            const isActive = sleepTimer !== null &&
              Math.abs(sleepTimer - mins * 60) < mins * 60 &&
              sleepTimer > 0

            return (
              <button
                key={mins}
                onClick={() => {
                  if (isActive) {
                    cancelSleepTimer()
                  } else {
                    activateSleepTimer(mins)
                  }
                }}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: isActive
                    ? 'rgba(167,139,250,0.25)'
                    : 'rgba(255,255,255,0.06)',
                  borderColor: isActive
                    ? '#a78bfa'
                    : 'rgba(167,139,250,0.2)',
                  color: isActive ? '#a78bfa' : '#d1d5db',
                }}
              >
                {mins} min
              </button>
            )
          })}
        </div>

        {sleepTimer !== null && (
          <p className="mt-3 text-sm" style={{ color: '#9ca3af' }}>
            Apaga en{' '}
            <span className="font-semibold tabular-nums" style={{ color: '#a78bfa' }}>
              {formatTime(sleepTimer)}
            </span>
            {' '}
            <button
              onClick={cancelSleepTimer}
              className="underline underline-offset-2 transition-opacity hover:opacity-80"
              style={{ color: '#6b7280', fontSize: '0.75rem' }}
            >
              cancelar
            </button>
          </p>
        )}
      </div>

      {/* Native audio element (hidden) */}
      <audio
        ref={audioRef}
        src={content.audio_url}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </div>
  )
}
