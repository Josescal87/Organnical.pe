import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inicio',
}

export default function SamiHomePage() {
  const categories = [
    { icon: '🧘', label: 'Meditaciones' },
    { icon: '🌙', label: 'Cuentos para dormir' },
    { icon: '🌊', label: 'Ruido blanco' },
    { icon: '💨', label: 'Respiración guiada' },
  ]

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12 md:py-20">
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-5xl font-bold tracking-tight md:text-6xl"
          style={{ color: '#a78bfa' }}
        >
          sami
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#9ca3af' }}>
          by Organnical
        </p>
      </div>

      {/* Subtitle */}
      <p className="text-center text-lg" style={{ color: '#f3f0ff' }}>
        Tu espacio de bienestar está en camino ✨
      </p>

      {/* Categories Grid */}
      <div className="grid w-full gap-4 grid-cols-2 md:grid-cols-4">
        {categories.map((category) => (
          <div
            key={category.label}
            className="group relative overflow-hidden rounded-lg border p-6 transition-all hover:border-opacity-60"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(167,139,250,0.2)',
            }}
          >
            {/* Badge */}
            <div
              className="absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: 'rgba(167,139,250,0.2)',
                color: '#a78bfa',
              }}
            >
              Próximamente
            </div>

            {/* Content */}
            <div className="flex flex-col items-center gap-3 pt-4">
              <span className="text-4xl">{category.icon}</span>
              <p className="text-center text-sm font-medium" style={{ color: '#f3f0ff' }}>
                {category.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
