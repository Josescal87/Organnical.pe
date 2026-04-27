import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: { default: 'Sami by Organnical', template: '%s · Sami' },
  description: 'Tu espacio de bienestar. Meditación, cuentos para dormir y respiración guiada.',
  manifest: '/sami-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sami',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1a1040',
}

export default async function SamiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0a1e', color: '#f3f0ff' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: '#1a1040' }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <span
            className="text-xl font-semibold tracking-wide"
            style={{ color: '#a78bfa' }}
          >
            sami
          </span>
        </div>

        <a
          href="https://organnical.pe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors"
          style={{ color: '#6b7280' }}
        >
          by Organnical
        </a>
      </nav>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
