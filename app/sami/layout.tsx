import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import PwaGuard from './_components/PwaGuard'

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['400'],
  display: 'swap',
})

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

export default function SamiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PwaGuard>
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0b0818', color: '#f3f0ff' }}>
      {/* Stars background */}
      <div aria-hidden className="sami-star-bg pointer-events-none fixed inset-0 z-0" style={{
        backgroundImage: `
          radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 42% 8%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 68% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 85% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 25% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 78% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 10% 75%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 35% 80%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 62% 85%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 90% 90%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 48% 95%, rgba(255,255,255,0.3) 0%, transparent 100%)
        `,
      }} />

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5"
        style={{
          backgroundColor: 'rgba(11,8,24,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          paddingBottom: '12px',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`${playfair.className} text-2xl`}
            style={{ color: '#c4b5fd', letterSpacing: '0.02em' }}
          >
            sami
          </span>
          <span className="text-xs" style={{ color: 'rgba(167,139,250,0.35)', marginTop: '4px' }}>
            by organnical
          </span>
        </div>

        <Link
          href="/instalar"
          className="rounded-full border px-3 py-1 text-xs transition-all hover:opacity-80"
          style={{ borderColor: 'rgba(167,139,250,0.2)', color: '#6b7280' }}
        >
          instalar
        </Link>
      </nav>

      {/* Content */}
      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
    </PwaGuard>
  )
}
