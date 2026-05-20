"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { BookOpen } from "lucide-react"
import LogoutButton from "@/components/LogoutButton"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")"

interface Props {
  title: string
  category: string
}

export default function BlogPostHeader({ title, category }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 110)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? Math.min(100, (y / total) * 100) : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className="sticky top-0 z-30"
      style={{
        background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
        transition: "box-shadow 0.4s ease",
      }}
    >
      {/* Noise */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{ backgroundImage: NOISE, backgroundRepeat: "repeat", backgroundSize: "180px 180px" }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow blob */}
      <div
        className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: G }}
      />

      <div className="relative max-w-5xl mx-auto px-4 pt-4 pb-4">

        {/* Fila 1: Logo + Nav + Logout — siempre visible */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-white.png"
              alt="Organnical"
              width={100}
              height={24}
              className="opacity-75 hover:opacity-100 transition-opacity"
            />
          </Link>
          <nav className="hidden sm:flex items-center gap-5 flex-1 justify-center">
            <Link href="/cuenta" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Mi cuenta</Link>
            <Link href="/cuenta/botica" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Botica</Link>
            <Link href="/tienda" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Tienda</Link>
            <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>Blog</span>
          </nav>
          <LogoutButton />
        </div>

        {/* Fila 2: Breadcrumb + título — aparece al scrollear */}
        <div
          style={{
            overflow: "hidden",
            maxHeight: scrolled ? "52px" : "0px",
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "translateY(0)" : "translateY(-6px)",
            marginTop: scrolled ? "12px" : "0px",
            transition: "max-height 0.35s ease, opacity 0.3s ease, transform 0.3s ease, margin-top 0.35s ease",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: G }}
            >
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Link href="/blog" className="text-white/35 hover:text-white/60 text-[10px] transition-colors">
                  Blog
                </Link>
                <span className="text-white/20 text-[10px]">/</span>
                <span className="text-white/55 text-[10px]">{category}</span>
              </div>
              <p className="text-white/90 text-xs font-semibold leading-snug truncate">{title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso de lectura */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: G,
            transition: "width 0.12s linear",
          }}
        />
      </div>
    </div>
  )
}
