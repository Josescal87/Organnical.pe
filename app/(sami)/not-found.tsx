import Link from 'next/link'

export default function SamiNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p
        className="text-7xl font-bold"
        style={{ color: '#7c3aed' }}
      >
        404
      </p>
      <h1 className="text-2xl font-semibold" style={{ color: '#f3f0ff' }}>
        Esta página no existe
      </h1>
      <p className="text-sm" style={{ color: '#9ca3af' }}>
        El contenido que buscas no está disponible.
      </p>
      <Link
        href="/sami"
        className="mt-2 rounded-full px-6 py-2 text-sm font-medium transition-opacity hover:opacity-80"
        style={{ backgroundColor: '#7c3aed', color: '#ffffff' }}
      >
        Volver a Sami
      </Link>
    </div>
  )
}
