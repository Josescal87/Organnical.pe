import type { Metadata, Viewport } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Nunito, Nunito_Sans } from 'next/font/google'
import PwaGuard from './_components/PwaGuard'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-nunito-sans',
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
  themeColor: '#0c0920',
}

export default function SamiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PwaGuard>
    <div
      className={`${nunito.variable} ${nunitoSans.variable} relative min-h-screen overflow-x-hidden`}
      style={{
        backgroundColor: '#0c0920',
        color: '#f0ecff',
        fontFamily: 'var(--font-nunito-sans), sans-serif',
      }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4"
        style={{
          backgroundColor: '#0c0920',
          borderBottom: '3px solid #3d2b6e',
          boxShadow: '0 3px 0 #3b2d80',
          paddingTop: 'calc(env(safe-area-inset-top) + 10px)',
          paddingBottom: '10px',
        }}
      >
        <Link href="/sami">
          <Image
            src="/sami/logo.png"
            alt="Sami by Organnical"
            width={52}
            height={52}
            className="object-contain"
            priority
          />
        </Link>

        <Link
          href="/sami/explorar"
          className="rounded-full px-4 py-1.5 text-sm font-extrabold transition-all active:scale-95"
          style={{
            fontFamily: 'var(--font-nunito)',
            background: 'linear-gradient(160deg,#8b6fe8 0%,#5b45b0 100%)',
            border: '3px solid #3d2b6e',
            borderRadius: 99,
            color: 'white',
            boxShadow: '0 4px 0 #3d2b6e',
            textShadow: '0 1px 0 #3d2b6e',
          }}
        >
          Explorar
        </Link>
      </nav>

      {/* Content */}
      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 py-6">
        {children}
      </main>
    </div>
    </PwaGuard>
  )
}
