'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ControlButtons({
  conversationId,
  currentMode,
}: {
  conversationId: string
  currentMode: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    await fetch('/api/wa/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        action: currentMode === 'ai' ? 'take' : 'return',
      }),
    })
    setLoading(false)
    router.refresh()
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
