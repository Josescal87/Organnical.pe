import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function CambiarContrasenaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0B1D35] flex items-center justify-center px-6 py-16">
      {children}
    </div>
  )
}
