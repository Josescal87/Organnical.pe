"use client"
import { useEffect, useState } from "react"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  display: "swap",
})

export default function PwaGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setStandalone(isStandalone)
    setReady(true)
  }, [])

  if (!ready) return <div style={{ position: "fixed", inset: 0, backgroundColor: "#0b0818" }} />
  if (!standalone) return <InstallPrompt />
  return <>{children}</>
}

function InstallPrompt() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
  const isIos = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ backgroundColor: "#0b0818" }}
    >
      {/* Subtle stars */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 42% 8%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 68% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 30%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 25% 55%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 60%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 90%, rgba(255,255,255,0.3) 0%, transparent 100%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-xs">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <span
            className={`${playfair.className} text-5xl`}
            style={{ color: "#c4b5fd", letterSpacing: "0.02em" }}
          >
            sami
          </span>
          <span className="text-xs" style={{ color: "rgba(167,139,250,0.4)" }}>
            by organnical
          </span>
        </div>

        <div style={{ width: "32px", height: "1px", backgroundColor: "rgba(167,139,250,0.2)" }} />

        {/* Message */}
        <div className="flex flex-col gap-2">
          <p className="text-base font-medium" style={{ color: "#e9e3ff" }}>
            Sami está diseñado para tu celular.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(167,139,250,0.6)" }}>
            Instálalo en tu pantalla de inicio para acceder a tu espacio de bienestar.
          </p>
        </div>

        {/* Instructions */}
        {isIos && (
          <div
            className="rounded-2xl p-5 text-sm text-left w-full flex flex-col gap-3"
            style={{ backgroundColor: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.12)" }}
          >
            <p className="font-semibold text-xs uppercase tracking-widest" style={{ color: "rgba(167,139,250,0.5)" }}>
              En iPhone o iPad
            </p>
            <div className="flex flex-col gap-2" style={{ color: "rgba(243,240,255,0.75)" }}>
              <p>1. Toca el botón <strong>Compartir</strong> <span style={{ fontSize: "1.1em" }}>⬆</span></p>
              <p>2. Desplázate y toca <strong>"Agregar a inicio"</strong></p>
              <p>3. Toca <strong>Agregar</strong> en la esquina superior derecha</p>
            </div>
          </div>
        )}

        {isAndroid && (
          <div
            className="rounded-2xl p-5 text-sm text-left w-full flex flex-col gap-3"
            style={{ backgroundColor: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.12)" }}
          >
            <p className="font-semibold text-xs uppercase tracking-widest" style={{ color: "rgba(167,139,250,0.5)" }}>
              En Android
            </p>
            <div className="flex flex-col gap-2" style={{ color: "rgba(243,240,255,0.75)" }}>
              <p>1. Toca el menú <strong>⋮</strong> del navegador</p>
              <p>2. Toca <strong>"Agregar a pantalla de inicio"</strong></p>
              <p>3. Confirma tocando <strong>Agregar</strong></p>
            </div>
          </div>
        )}

        {!isIos && !isAndroid && (
          <div
            className="rounded-2xl p-5 text-sm text-left w-full"
            style={{ backgroundColor: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.12)", color: "rgba(243,240,255,0.75)" }}
          >
            Abre este link desde tu celular para instalarlo en la pantalla de inicio.
          </div>
        )}

        <p className="text-xs" style={{ color: "rgba(167,139,250,0.3)" }}>
          Disponible para iOS y Android
        </p>
      </div>
    </div>
  )
}
