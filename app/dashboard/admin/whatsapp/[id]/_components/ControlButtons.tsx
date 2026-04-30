'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ConversationMode } from '@/lib/wa/types'

export function ControlButtons({
  conversationId,
  currentMode,
}: {
  conversationId: string
  currentMode: ConversationMode
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/wa/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          action: currentMode === 'ai' ? 'take' : 'return',
        }),
      })
      if (!res.ok) {
        alert('Error al cambiar el modo. Intenta de nuevo.')
        return
      }
      router.refresh()
    } catch {
      alert('Error de red. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
        currentMode === 'ai'
          ? 'bg-red-700 hover:bg-red-600 text-white'
          : 'bg-green-700 hover:bg-green-600 text-white'
      }`}
    >
      {loading ? '...' : currentMode === 'ai' ? 'Tomar control' : 'Devolver a IA'}
    </button>
  )
}
