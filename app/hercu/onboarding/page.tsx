// app/hercu/onboarding/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HercuMascot from '../_components/HercuMascot'

const HERCU_YELLOW = '#f59e0b'
const HERCU_DARK   = '#d97706'
const STROKE       = '#e5e7eb'

const GOALS = [
  { value: 'fuerza',        label: '💪 Fuerza' },
  { value: 'perder_peso',   label: '🔥 Perder peso' },
  { value: 'resistencia',   label: '🏃 Resistencia' },
  { value: 'flexibilidad',  label: '🧘 Flexibilidad' },
]
const EQUIPMENT = [
  { value: 'peso_corporal', label: '🤸 Solo cuerpo' },
  { value: 'mancuernas',    label: '🏋️ Mancuernas' },
  { value: 'bandas',        label: '🪢 Bandas' },
  { value: 'barra',         label: '⚙️ Barra' },
  { value: 'kettlebell',    label: '⚫ Kettlebell' },
  { value: 'otro',          label: '📦 Otro' },
]
const DAYS = [
  { value: 'lunes',     label: 'Lun' },
  { value: 'martes',    label: 'Mar' },
  { value: 'miercoles', label: 'Mie' },
  { value: 'jueves',    label: 'Jue' },
  { value: 'viernes',   label: 'Vie' },
  { value: 'sabado',    label: 'Sab' },
  { value: 'domingo',   label: 'Dom' },
]
const LEVELS = [
  { value: 'principiante', label: '🌱 Principiante', sub: 'Empezando desde cero' },
  { value: 'intermedio',   label: '⚡ Intermedio',   sub: 'Entreno regularmente' },
  { value: 'avanzado',     label: '🔥 Avanzado',     sub: 'Experiencia sólida' },
]
const DURATIONS = [
  { value: 15,  label: '15 min' },
  { value: 30,  label: '30 min' },
  { value: 45,  label: '45 min' },
  { value: 60,  label: '60 min' },
  { value: 90,  label: '90 min' },
]

type Level = 'principiante' | 'intermedio' | 'avanzado'

interface Form {
  goals:           string[]
  equipment:       string[]
  fitness_level:   Level
  available_days:  string[]
  session_minutes: number
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
        background: active ? HERCU_YELLOW : '#f9fafb',
        border: `2.5px solid ${active ? HERCU_DARK : STROKE}`,
        color: active ? 'white' : '#374151',
        fontWeight: 700, fontSize: 13,
        fontFamily: 'var(--font-nunito), Nunito, sans-serif',
        boxShadow: active ? `2px 2px 0 ${HERCU_DARK}` : `2px 2px 0 ${STROKE}`,
        transform: active ? 'translateY(-1px)' : 'none',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Form>({
    goals: [], equipment: ['peso_corporal'],
    fitness_level: 'principiante', available_days: [], session_minutes: 30,
  })

  function toggleMulti(field: 'goals' | 'equipment' | 'available_days', value: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  const canNext = [
    form.goals.length > 0,
    form.equipment.length > 0,
    true,
    form.available_days.length > 0,
    true,
  ][step]

  async function handleCreate() {
    setLoading(true)
    await fetch('/api/hercu/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    router.push('/hercu')
  }

  const steps = [
    // Step 0: Goals
    <div key="goals">
      <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif', marginBottom: 6 }}>
        ¿Cuál es tu meta?
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Puedes elegir varias</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {GOALS.map(g => (
          <Pill key={g.value} active={form.goals.includes(g.value)} onClick={() => toggleMulti('goals', g.value)}>
            {g.label}
          </Pill>
        ))}
      </div>
    </div>,

    // Step 1: Equipment
    <div key="equip">
      <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif', marginBottom: 6 }}>
        ¿Qué equipo tienes?
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Puedes elegir varios</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {EQUIPMENT.map(e => (
          <Pill key={e.value} active={form.equipment.includes(e.value)} onClick={() => toggleMulti('equipment', e.value)}>
            {e.label}
          </Pill>
        ))}
      </div>
    </div>,

    // Step 2: Level
    <div key="level">
      <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif', marginBottom: 20 }}>
        ¿Cuál es tu nivel?
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LEVELS.map(l => (
          <button
            key={l.value}
            onClick={() => setForm(prev => ({ ...prev, fitness_level: l.value as Level }))}
            style={{
              padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
              background: form.fitness_level === l.value ? '#fef3c7' : '#f9fafb',
              border: `2.5px solid ${form.fitness_level === l.value ? HERCU_DARK : STROKE}`,
              boxShadow: form.fitness_level === l.value ? `3px 3px 0 ${HERCU_DARK}` : `3px 3px 0 ${STROKE}`,
            }}
          >
            <p style={{ fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>{l.label}</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{l.sub}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Days
    <div key="days">
      <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif', marginBottom: 6 }}>
        ¿Qué días puedes entrenar?
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Selecciona todos los días disponibles</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {DAYS.map(d => (
          <Pill key={d.value} active={form.available_days.includes(d.value)} onClick={() => toggleMulti('available_days', d.value)}>
            {d.label}
          </Pill>
        ))}
      </div>
    </div>,

    // Step 4: Duration
    <div key="duration">
      <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif', marginBottom: 6 }}>
        ¿Cuánto tiempo tienes?
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Duración por sesión de entrenamiento</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {DURATIONS.map(d => (
          <Pill key={d.value} active={form.session_minutes === d.value} onClick={() => setForm(prev => ({ ...prev, session_minutes: d.value }))}>
            {d.label}
          </Pill>
        ))}
      </div>
    </div>,

    // Step 5: Confirm
    <div key="confirm" style={{ textAlign: 'center' }}>
      <HercuMascot pose="flex" size={90} anim="bounce" style={{ margin: '0 auto 16px' }} />
      <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif', marginBottom: 8 }}>
        ¡Listo! Vamos a crear tu plan
      </h2>
      <div style={{ textAlign: 'left', background: '#fef3c7', border: `2px solid ${HERCU_DARK}`, borderRadius: 14, padding: '14px 16px', marginBottom: 4, fontSize: 13 }}>
        <p>🎯 <strong>Metas:</strong> {form.goals.join(', ')}</p>
        <p style={{ marginTop: 6 }}>🏋️ <strong>Equipo:</strong> {form.equipment.join(', ')}</p>
        <p style={{ marginTop: 6 }}>⚡ <strong>Nivel:</strong> {form.fitness_level}</p>
        <p style={{ marginTop: 6 }}>📅 <strong>Días:</strong> {form.available_days.join(', ')}</p>
        <p style={{ marginTop: 6 }}>⏱ <strong>Duración:</strong> {form.session_minutes} min/sesión</p>
      </div>
    </div>,
  ]

  // Loading screen (generating plan)
  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, background: '#fffbeb' }}>
      <HercuMascot pose="corriendo" size={100} anim="bounce" />
      <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>
        Hercu está creando tu plan...
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>Esto toma unos segundos</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#fffbeb', padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex: 1, height: 5, borderRadius: 99,
            background: i <= step ? HERCU_YELLOW : STROKE,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Mascot header (only first step) */}
      {step === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <HercuMascot pose="parado" size={72} anim="arrive" />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>¡Hola! Soy Hercu</h1>
            <p style={{ color: '#6b7280', fontSize: 13 }}>Vamos a crear tu plan personalizado</p>
          </div>
        </div>
      )}

      {/* Step content */}
      {steps[step]}

      {/* Navigation */}
      <div style={{ marginTop: 32, display: 'flex', gap: 10 }}>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer',
              background: '#f9fafb', border: `2.5px solid ${STROKE}`, fontWeight: 700,
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            }}
          >
            Atrás
          </button>
        )}
        {step < 5 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext}
            style={{
              flex: 2, padding: '13px', borderRadius: 12, cursor: 'pointer',
              background: HERCU_YELLOW, color: 'white', border: `3px solid ${HERCU_DARK}`,
              fontWeight: 800, fontSize: 15,
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              boxShadow: `3px 3px 0 ${HERCU_DARK}`,
              opacity: canNext ? 1 : 0.4,
            }}
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={handleCreate}
            style={{
              flex: 2, padding: '13px', borderRadius: 12, cursor: 'pointer',
              background: HERCU_YELLOW, color: 'white', border: `3px solid ${HERCU_DARK}`,
              fontWeight: 800, fontSize: 15,
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              boxShadow: `3px 3px 0 ${HERCU_DARK}`,
            }}
          >
            Crear mi plan con Hercu 💪
          </button>
        )}
      </div>
    </div>
  )
}
