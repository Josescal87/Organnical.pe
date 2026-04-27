'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Phase {
  label: string
  duration: number
  action: 'expand' | 'hold' | 'contract' | 'pause'
}

interface Technique {
  id: string
  name: string
  description: string
  phases: Phase[]
  totalCycles: number
}

type Screen = 'selector' | 'running' | 'complete'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TECHNIQUES: Technique[] = [
  {
    id: '4-7-8',
    name: '4-7-8',
    description: 'Reduce ansiedad y ayuda a conciliar el sueño',
    phases: [
      { label: 'Inhala',  duration: 4, action: 'expand' },
      { label: 'Mantén',  duration: 7, action: 'hold' },
      { label: 'Exhala',  duration: 8, action: 'contract' },
    ],
    totalCycles: 8,
  },
  {
    id: 'caja',
    name: 'Respiración de caja',
    description: 'Ideal para reducir el estrés y mejorar la concentración',
    phases: [
      { label: 'Inhala',  duration: 4, action: 'expand' },
      { label: 'Mantén',  duration: 4, action: 'hold' },
      { label: 'Exhala',  duration: 4, action: 'contract' },
      { label: 'Pausa',   duration: 4, action: 'pause' },
    ],
    totalCycles: 6,
  },
  {
    id: 'coherencia',
    name: 'Coherencia cardíaca',
    description: 'Equilibra el sistema nervioso, 5 respiraciones por minuto',
    phases: [
      { label: 'Inhala', duration: 5, action: 'expand' },
      { label: 'Exhala', duration: 5, action: 'contract' },
    ],
    totalCycles: 10,
  },
]

// Scale values for each action
const CIRCLE_SCALE: Record<Phase['action'], number> = {
  expand:   1.4,
  hold:     1.4,
  contract: 0.7,
  pause:    0.7,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RespiracionPage() {
  const [screen, setScreen]               = useState<Screen>('selector')
  const [selectedTech, setSelectedTech]   = useState<Technique>(TECHNIQUES[0])
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [currentCycle, setCurrentCycle]   = useState(0)
  const [elapsed, setElapsed]             = useState(0)

  // We keep a ref for currentPhaseIdx and currentCycle so the interval
  // callback can read up-to-date values without re-creating the interval.
  const phaseIdxRef   = useRef(currentPhaseIdx)
  const cycleRef      = useRef(currentCycle)
  const techRef       = useRef(selectedTech)

  useEffect(() => { phaseIdxRef.current = currentPhaseIdx }, [currentPhaseIdx])
  useEffect(() => { cycleRef.current    = currentCycle     }, [currentCycle])
  useEffect(() => { techRef.current     = selectedTech     }, [selectedTech])

  // ── Exercise engine ──────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'running') return

    const interval = setInterval(() => {
      setElapsed(prev => {
        const tech  = techRef.current
        const phase = tech.phases[phaseIdxRef.current]
        const newElapsed = prev + 1

        if (newElapsed >= phase.duration) {
          const nextPhaseIdx = (phaseIdxRef.current + 1) % tech.phases.length
          const isNewCycle   = nextPhaseIdx === 0

          if (isNewCycle) {
            setCurrentCycle(c => {
              const newCycle = c + 1
              if (newCycle >= tech.totalCycles) {
                setScreen('complete')
              }
              return newCycle
            })
          }

          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(100)
          }

          setCurrentPhaseIdx(nextPhaseIdx)
          setPhaseProgress(0)
          return 0
        }

        setPhaseProgress(newElapsed / phase.duration)
        return newElapsed
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [screen])

  // ── Helpers ──────────────────────────────────────────────────────────────
  function startExercise() {
    setCurrentPhaseIdx(0)
    setPhaseProgress(0)
    setCurrentCycle(0)
    setElapsed(0)
    setScreen('running')
  }

  function reset() {
    setCurrentPhaseIdx(0)
    setPhaseProgress(0)
    setCurrentCycle(0)
    setElapsed(0)
    setScreen('selector')
  }

  const currentPhase = selectedTech.phases[currentPhaseIdx]
  const scale        = CIRCLE_SCALE[currentPhase?.action ?? 'pause']
  const timeLeft     = currentPhase
    ? currentPhase.duration - elapsed
    : 0

  // ── Render ───────────────────────────────────────────────────────────────

  // ── Screen: selector ─────────────────────────────────────────────────────
  if (screen === 'selector') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#f3f0ff' }}>
            Respiración guiada
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#9ca3af' }}>
            Elige una técnica para comenzar
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {TECHNIQUES.map(tech => {
            const isSelected = selectedTech.id === tech.id
            return (
              <button
                key={tech.id}
                onClick={() => setSelectedTech(tech)}
                className="flex flex-col gap-1 rounded-xl border p-4 text-left transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(167,139,250,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  borderColor: isSelected
                    ? '#a78bfa'
                    : 'rgba(167,139,250,0.2)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-base font-semibold"
                    style={{ color: isSelected ? '#a78bfa' : '#f3f0ff' }}
                  >
                    {tech.name}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(167,139,250,0.15)',
                      color: '#a78bfa',
                    }}
                  >
                    {tech.totalCycles} ciclos
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#9ca3af' }}>
                  {tech.description}
                </p>
                {/* Phase summary */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {tech.phases.map((phase, i) => (
                    <span
                      key={i}
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: '#d1d5db',
                      }}
                    >
                      {phase.label} {phase.duration}s
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={startExercise}
          className="w-full rounded-xl py-4 text-base font-semibold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: '#7c3aed',
            color: '#fff',
          }}
        >
          Comenzar
        </button>
      </div>
    )
  }

  // ── Screen: running ───────────────────────────────────────────────────────
  if (screen === 'running') {
    const progressFraction = Math.min(currentCycle / selectedTech.totalCycles, 1)

    return (
      <div className="flex flex-col items-center gap-8">
        {/* Header */}
        <div className="w-full text-center">
          <p className="text-sm font-medium" style={{ color: '#a78bfa' }}>
            {selectedTech.name}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: '#6b7280' }}>
            Ciclo {Math.min(currentCycle + 1, selectedTech.totalCycles)} / {selectedTech.totalCycles}
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: 'rgba(167,139,250,0.15)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progressFraction * 100}%`,
              backgroundColor: '#7c3aed',
            }}
          />
        </div>

        {/* Animated circle */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 240, height: 240 }}
        >
          {/* Outer glow ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
              transform: `scale(${scale})`,
              transition: `transform ${currentPhase.duration}s ease-in-out`,
              filter: 'blur(12px)',
            }}
          />

          {/* Main circle */}
          <div
            className="relative flex flex-col items-center justify-center rounded-full"
            style={{
              width: 160,
              height: 160,
              background: 'radial-gradient(circle at 35% 35%, rgba(167,139,250,0.55) 0%, rgba(109,40,217,0.75) 60%, rgba(76,29,149,0.9) 100%)',
              boxShadow: '0 0 40px rgba(124,58,237,0.4), 0 0 80px rgba(124,58,237,0.15)',
              transform: `scale(${scale})`,
              transition: `transform ${currentPhase.duration}s ease-in-out`,
            }}
          >
            <span
              className="text-lg font-semibold leading-tight"
              style={{ color: '#f3f0ff' }}
            >
              {currentPhase.label}
            </span>
            <span
              className="text-4xl font-bold tabular-nums"
              style={{ color: '#fff' }}
            >
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Phase progress dots */}
        <div className="flex items-center gap-2">
          {selectedTech.phases.map((phase, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === currentPhaseIdx ? 28 : 8,
                  backgroundColor: i === currentPhaseIdx
                    ? '#a78bfa'
                    : 'rgba(167,139,250,0.25)',
                }}
              />
              <span
                className="text-xs transition-colors duration-300"
                style={{
                  color: i === currentPhaseIdx ? '#a78bfa' : '#4b5563',
                  fontSize: '0.65rem',
                }}
              >
                {phase.label}
              </span>
            </div>
          ))}
        </div>

        {/* Terminate button */}
        <button
          onClick={() => setScreen('complete')}
          className="rounded-xl border px-6 py-2.5 text-sm font-medium transition-all active:scale-[0.97]"
          style={{
            borderColor: 'rgba(167,139,250,0.3)',
            color: '#9ca3af',
            backgroundColor: 'transparent',
          }}
        >
          Terminar
        </button>
      </div>
    )
  }

  // ── Screen: complete ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-8 py-8 text-center">
      {/* Celebration circle */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 120,
          height: 120,
          background: 'radial-gradient(circle at 35% 35%, rgba(167,139,250,0.55) 0%, rgba(109,40,217,0.75) 60%, rgba(76,29,149,0.9) 100%)',
          boxShadow: '0 0 40px rgba(124,58,237,0.4)',
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>✓</span>
      </div>

      <div>
        <h2 className="text-2xl font-semibold" style={{ color: '#f3f0ff' }}>
          ¡Excelente!
        </h2>
        <p className="mt-2 text-base" style={{ color: '#d1d5db' }}>
          Completaste {Math.min(currentCycle, selectedTech.totalCycles)} ciclos de{' '}
          <span style={{ color: '#a78bfa' }}>{selectedTech.name}</span>
        </p>
        <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>
          Tu sistema nervioso te lo agradece.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <button
          onClick={reset}
          className="w-full rounded-xl py-4 text-base font-semibold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: '#7c3aed',
            color: '#fff',
          }}
        >
          Hacer otra sesión
        </button>
        <Link
          href="/"
          className="w-full rounded-xl border py-3 text-sm font-medium transition-all active:scale-[0.98]"
          style={{
            borderColor: 'rgba(167,139,250,0.3)',
            color: '#9ca3af',
            display: 'block',
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
