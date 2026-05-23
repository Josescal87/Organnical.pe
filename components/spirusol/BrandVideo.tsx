"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

/**
 * Video de marca con click-to-play. Diseñado para encajar en el design system
 * Spirusol sin desentonar — borde brand-green, play button verde, glow opcional
 * que respeta `prefers-reduced-motion`.
 *
 * UX:
 *   • Estado idle: poster JPG fill + overlay sutil + play button grande +
 *     duración como hint en esquina (avisa cuánto dura sin obligar al click).
 *   • Click: monta `<video controls autoPlay>` con el audio activo. Native
 *     controls del browser — el user puede pausar, mutear, saltar, ir
 *     fullscreen sin que repliquemos UI custom.
 *
 * Performance:
 *   • `preload="metadata"`: el browser solo descarga los headers/poster,
 *     no el archivo entero, hasta que el user haga click.
 *   • `playsInline`: en iOS evita el fullscreen takeover involuntario.
 *   • `next/image` para el poster con `fill` + sizes → optimizado automáticamente.
 */
interface BrandVideoProps {
  src: string
  poster: string
  duration?: number
  ariaLabel?: string
}

export default function BrandVideo({
  src,
  poster,
  duration,
  ariaLabel,
}: BrandVideoProps) {
  const [started, setStarted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  function play() {
    setStarted(true)
    // Doble RAF para que React monte el <video> antes de llamar play()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        videoRef.current?.play().catch(() => {
          // Si el browser bloquea (raro con user gesture), los controls nativos
          // quedan visibles y el user puede darle play manualmente.
        })
      })
    })
  }

  return (
    <div className="relative w-full h-full bg-black">
      {started ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={play}
          aria-label={ariaLabel ?? "Reproducir video"}
          className="group absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
        >
          <Image
            src={poster}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          {/* Overlay degradado oscuro arriba→abajo: el play button blanco/verde
              gana contraste sobre cualquier escena (clara o oscura). */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.45) 100%)",
            }}
          />

          {/* Play button centrado con halo. El halo se anima sólo si el user
              no pidió reduce-motion (Tailwind motion-safe variant). */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full motion-safe:animate-ping"
                style={{
                  background: "var(--brand-green-500)",
                  opacity: 0.35,
                }}
              />
              <div
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: "var(--brand-green-700)",
                  border: "3px solid rgba(255,255,255,0.85)",
                }}
              >
                <Play
                  className="text-white ml-1.5 w-7 h-7 md:w-9 md:h-9"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
            </div>
          </div>

          {/* Hint de duración + label de marca, bottom-left subtle */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 pointer-events-none">
            <p
              className="text-white/90 text-xs sm:text-sm font-semibold tracking-wide"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
              Reproducir historia
            </p>
            {duration && (
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  color: "var(--brand-green-900)",
                }}
              >
                {Math.round(duration)}s
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  )
}
