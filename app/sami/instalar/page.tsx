import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Instalar Sami',
  description: 'Instala Sami en tu pantalla de inicio para acceder más rápido.',
}

const steps = [
  {
    number: 1,
    title: 'Abre Safari y toca compartir',
    description: 'Toca el ícono de compartir — el cuadrado con una flecha apuntando hacia arriba — en la barra inferior de Safari.',
  },
  {
    number: 2,
    title: 'Selecciona "Agregar a la pantalla de inicio"',
    description: 'Desplázate por el menú de opciones hasta encontrar "Agregar a la pantalla de inicio" y tócalo.',
  },
  {
    number: 3,
    title: 'Confirma con "Agregar"',
    description: 'Verás una vista previa con el nombre "Sami". Toca "Agregar" en la esquina superior derecha para confirmar.',
  },
]

export default function InstalarPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1
          className="text-2xl font-semibold"
          style={{ color: '#a78bfa' }}
        >
          Instala Sami en tu iPhone
        </h1>
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          Agrega Sami a tu pantalla de inicio para abrirla como una app, sin necesidad del navegador.
        </p>
      </header>

      <ol className="flex flex-col gap-6">
        {steps.map((step) => (
          <li key={step.number} className="flex items-start gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold"
              style={{ backgroundColor: '#2d1f6e', color: '#a78bfa' }}
            >
              {step.number}
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-medium" style={{ color: '#f3f0ff' }}>
                {step.title}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        href="/"
        className="mt-2 inline-block rounded-xl px-6 py-3 text-center text-sm font-medium transition-opacity hover:opacity-80"
        style={{ backgroundColor: '#2d1f6e', color: '#a78bfa' }}
      >
        Volver a Sami
      </Link>
    </div>
  )
}
