// app/hercu/chat/page.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import HercuMascot from '../_components/HercuMascot'

const HERCU_YELLOW = '#f59e0b'
const HERCU_DARK   = '#d97706'
const STROKE       = '#e5e7eb'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function HercuChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy Hercu 💪 ¿Qué quieres ajustar en tu plan de entrenamiento? Puedes pedirme que cambie días, ejercicios, intensidad... o simplemente hazme una pregunta.' },
  ])
  const [input,        setInput]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [planUpdated,  setPlanUpdated]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    setPlanUpdated(false)
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res  = await fetch('/api/hercu/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message ?? 'Hubo un error, intenta de nuevo.' }])
      if (data.updated_plan) setPlanUpdated(true)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hubo un error de conexión. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `2.5px solid ${STROKE}`, background: '#fffbeb', flexShrink: 0,
      }}>
        <Link href="/hercu" style={{ fontSize: 20, textDecoration: 'none', color: '#374151' }}>←</Link>
        <HercuMascot pose="flex" size={44} anim="float" />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 900, fontSize: 15, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>Hercu</p>
          <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Tu coach de entrenamiento</p>
        </div>
        {planUpdated && (
          <span style={{
            fontSize: 11, fontWeight: 800, color: '#059669',
            background: '#d1fae5', borderRadius: 99, padding: '3px 10px',
            border: '1.5px solid #6ee7b7',
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
          }}>
            Plan actualizado ✓
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.5,
              background: msg.role === 'user' ? HERCU_YELLOW : '#f3f4f6',
              color: msg.role === 'user' ? 'white' : '#111827',
              border: `2px solid ${msg.role === 'user' ? HERCU_DARK : STROKE}`,
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontWeight: 600,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 14px', borderRadius: 16, fontSize: 14,
              background: '#f3f4f6', border: `2px solid ${STROKE}`,
              color: '#6b7280', fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            }}>
              Hercu está pensando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 14px', borderTop: `2.5px solid ${STROKE}`,
        display: 'flex', gap: 8, background: 'white', flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Escribe a Hercu..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 99, outline: 'none',
            border: `2.5px solid ${STROKE}`, fontSize: 14,
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: HERCU_YELLOW, color: 'white',
            border: `2.5px solid ${HERCU_DARK}`, borderRadius: 99,
            padding: '10px 16px', fontWeight: 800, cursor: 'pointer',
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            opacity: loading || !input.trim() ? 0.4 : 1,
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
