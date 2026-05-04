// app/hercu/_components/PlanGrid.tsx
'use client'
import Link from 'next/link'
import type { PlanData } from '../lib/plan-schema'

const HERCU_YELLOW = '#f59e0b'
const HERCU_DARK   = '#d97706'
const STROKE       = '#e5e7eb'

const DAY_ORDER = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']

function getTodayKey(): string {
  const d = new Date().getDay()
  return DAY_ORDER[d === 0 ? 6 : d - 1]
}

export default function PlanGrid({ planData }: { planData: PlanData }) {
  const today = getTodayKey()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {planData.schedule.map(day => {
        const isToday = day.day === today
        return (
          <div
            key={day.day}
            style={{
              border: `3px solid ${isToday ? HERCU_DARK : STROKE}`,
              borderRadius: 16, padding: '14px 16px',
              background: isToday ? '#fef3c7' : '#f9fafb',
              boxShadow: isToday ? `3px 3px 0 ${HERCU_DARK}` : `3px 3px 0 ${STROKE}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: isToday ? HERCU_DARK : '#9ca3af',
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                }}>
                  {day.day}{isToday ? ' · HOY' : ''}
                </span>
                <p style={{
                  fontSize: 15, fontWeight: 800, color: '#111827', marginTop: 3,
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                }}>
                  {day.focus}
                </p>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, color: isToday ? HERCU_DARK : '#6b7280',
                background: isToday ? '#fde68a' : '#f3f4f6',
                borderRadius: 99, padding: '3px 10px',
                border: `1.5px solid ${isToday ? HERCU_DARK : STROKE}`,
              }}>
                {day.exercises.length} ejercicios
              </span>
            </div>
            {isToday && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {day.exercises.slice(0, 3).map((ex, i) => (
                  <p key={i} style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>
                    • {ex.name} — {ex.sets} series × {ex.reps}
                  </p>
                ))}
                {day.exercises.length > 3 && (
                  <p style={{ fontSize: 12, color: '#6b7280' }}>+ {day.exercises.length - 3} más</p>
                )}
              </div>
            )}
          </div>
        )
      })}

      <Link
        href="/hercu/chat"
        style={{
          display: 'block', textAlign: 'center', marginTop: 4,
          background: HERCU_YELLOW, color: 'white',
          border: `3px solid ${HERCU_DARK}`, borderRadius: 14,
          padding: '13px', fontWeight: 800, fontSize: 14,
          textDecoration: 'none',
          boxShadow: `3px 3px 0 ${HERCU_DARK}`,
          fontFamily: 'var(--font-nunito), Nunito, sans-serif',
        }}
      >
        💬 Hablar con Hercu
      </Link>
    </div>
  )
}
