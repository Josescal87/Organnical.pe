import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Respiración',
}

export default function RespiracionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
