// app/hercu/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hercu — Tu coach de entrenamiento',
  description: 'Crea tu plan de ejercicios personalizado con Hercu',
}

const HERCU_KEYFRAMES = `
@keyframes hercu-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes hercu-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes hercu-arrive { from{opacity:0;transform:translateY(20px) scale(.9)} to{opacity:1;transform:none} }
`

export default function HercuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{HERCU_KEYFRAMES}</style>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', minHeight: '100dvh' }}>
        {children}
      </div>
    </>
  )
}
