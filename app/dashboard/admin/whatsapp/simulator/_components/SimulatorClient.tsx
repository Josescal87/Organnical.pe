'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { ConversationMode, ConversationState, SimulateResponse } from '@/lib/wa/types'

interface SimMessage {
  id: string
  role: 'patient' | 'agent' | 'system'
  content: string
}

function randomPeruPhone() {
  const suffix = Math.floor(10000000 + Math.random() * 90000000)
  return `+519${suffix}`
}

export function SimulatorClient() {
  const [phoneNumber, setPhoneNumber] = useState(randomPeruPhone)
  const [messages, setMessages] = useState<SimMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<ConversationMode>('ai')
  const [state, setState] = useState<ConversationState>('new')
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  function newConversation() {
    setPhoneNumber(randomPeruPhone())
    setMessages([])
    setConversationId(null)
    setMode('ai')
    setState('new')
    setInput('')
    inputRef.current?.focus()
  }

  async function sendMessage() {
    const content = input.trim()
    if (!content || loading) return
    setInput('')

    const patientMsg: SimMessage = {
      id: crypto.randomUUID(),
      role: 'patient',
      content,
    }
    setMessages((prev) => [...prev, patientMsg])
    setLoading(true)

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 0)

    try {
      const res = await fetch('/api/wa/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, content }),
      })

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'system', content: `Error ${res.status}: ${res.statusText}` },
        ])
        return
      }

      const data: SimulateResponse = await res.json()

      if (!conversationId) setConversationId(data.conversation_id)

      const prevMode = mode
      setMode(data.mode)
      setState(data.state)

      if (data.mode === 'human' && prevMode === 'ai') {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'system', content: '🚨 La vendedora tomó el control — la IA dejó de responder' },
        ])
      }

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'agent', content: data.response! },
        ])
      } else if (data.mode === 'ai') {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'system', content: '(El agente no generó respuesta)' },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'system', content: 'Error de red. Revisa la consola.' },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard/admin/whatsapp" className="text-gray-400 hover:text-white text-sm">
          ← Supervisión
        </Link>
        <div className="flex-1">
          <div className="font-semibold text-sm">Simulador de paciente</div>
          <div className="text-xs text-gray-400">Fase 0 — sin WhatsApp real</div>
        </div>
        {conversationId && (
          <Link
            href={`/dashboard/admin/whatsapp/${conversationId}`}
            className="text-blue-400 hover:text-blue-300 text-xs font-medium"
            target="_blank"
          >
            Ver en supervisión →
          </Link>
        )}
      </div>

      {/* Phone number bar */}
      <div className="border-b border-gray-800 px-4 py-2 flex items-center gap-3 bg-gray-900">
        <span className="text-xs text-gray-500 shrink-0">Número:</span>
        <input
          className="flex-1 bg-transparent text-sm text-gray-300 outline-none font-mono"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            setMessages([])
            setConversationId(null)
            setMode('ai')
            setState('new')
          }}
          placeholder="+519XXXXXXXX"
        />
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          mode === 'ai' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'
        }`}>
          {mode === 'ai' ? '🤖 IA' : '👩‍💼 Humano'}
        </span>
        <span className="text-xs text-gray-600 font-mono">{state}</span>
        <button
          onClick={newConversation}
          className="text-xs bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-1.5 transition shrink-0"
        >
          Nueva conversación
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-sm mt-12">
            <div className="text-3xl mb-3">📱</div>
            <div>Escribe un mensaje para iniciar la conversación</div>
            <div className="text-xs mt-1">como si fueras un paciente en WhatsApp</div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-yellow-900/40 text-yellow-300 text-xs rounded-lg px-3 py-1.5 max-w-[80%] text-center">
                  {msg.content}
                </div>
              </div>
            )
          }
          const isPatient = msg.role === 'patient'
          return (
            <div key={msg.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  isPatient
                    ? 'bg-green-800 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 text-sm rounded-2xl px-4 py-2 italic">
              Escribiendo...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4 flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 bg-gray-900 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-green-600"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Escribe como paciente..."
          disabled={loading}
          autoFocus
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-40 rounded-xl px-4 py-2 text-sm font-medium transition"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
