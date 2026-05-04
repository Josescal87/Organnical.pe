// app/hercu/auth/signup/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import HercuMascot from '../../_components/HercuMascot'

const S = {
  page:   { minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fffbeb' } as React.CSSProperties,
  card:   { width: '100%', maxWidth: 380 } as React.CSSProperties,
  input:  { padding: '12px 16px', borderRadius: 12, border: '2.5px solid #e5e7eb', fontSize: 14, width: '100%', boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'var(--font-nunito), Nunito, sans-serif' },
  btn:    { background: '#f59e0b', color: 'white', border: '3px solid #d97706', borderRadius: 12, padding: '13px', fontWeight: 800, fontSize: 15, cursor: 'pointer', width: '100%', fontFamily: 'var(--font-nunito), Nunito, sans-serif' } as React.CSSProperties,
}

export default function HercuSignup() {
  const supabase = createClient()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [sent,     setSent]     = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/hercu/onboarding` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  if (sent) return (
    <div style={S.page}>
      <div style={{ ...S.card, textAlign: 'center' }}>
        <HercuMascot pose="flex" size={80} anim="bounce" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>¡Revisa tu email!</h2>
        <p style={{ color: '#6b7280', marginTop: 8 }}>Te enviamos un link de confirmación a <strong>{email}</strong>. Haz clic en él para activar tu cuenta.</p>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <HercuMascot pose="flex" size={64} anim="float" />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>Únete a Hercu</h1>
            <p style={{ color: '#6b7280', fontSize: 13 }}>Crea tu cuenta gratis</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={S.input} />
          <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={S.input} />
          {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/hercu/auth/login" style={{ color: '#f59e0b', fontWeight: 700 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
