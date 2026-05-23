"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { PublicBrand } from "@/lib/types"

/**
 * Header sticky del subdominio Spirusol. Los links son ABSOLUTOS a organnical.pe
 * porque cambiamos de host — un Link relativo de Next.js no sale del subdominio.
 *
 * Patrón de `landing-page-design`: cambio de estilo al scrollear > 20px (cleaner
 * que un transparente que nunca se solidifica).
 */
const ORGANNICAL = "https://organnical.pe"

const NAV_LINKS = [
  { label: "Tienda", href: `${ORGANNICAL}/tienda?marca=spirusol&utm_source=spirusol_subdomain&utm_medium=header&utm_campaign=nav` },
  { label: "Blog", href: `${ORGANNICAL}/blog` },
  { label: "Consultas", href: `${ORGANNICAL}/agendar?utm_source=spirusol_subdomain&utm_medium=header` },
  { label: "Mi cuenta", href: `${ORGANNICAL}/cuenta` },
]

export default function SpirusolHeader({ marca }: { marca: PublicBrand }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    handler()
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--brand-cream)]/95 backdrop-blur-md border-b border-[var(--brand-green-100)] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {marca.logo_url ? (
            <Image
              src={marca.logo_url}
              alt={marca.nombre}
              width={36}
              height={36}
              className="rounded-full object-contain"
            />
          ) : (
            <span
              aria-hidden="true"
              className="w-9 h-9 rounded-full"
              style={{ background: "var(--brand-green-700)" }}
            />
          )}
          <span
            className="text-xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: scrolled ? "var(--brand-green-900)" : "var(--brand-green-900)",
            }}
          >
            {marca.nombre}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: scrolled ? "var(--brand-green-900)" : "var(--brand-green-900)" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href={`${ORGANNICAL}/tienda?marca=spirusol&utm_source=spirusol_subdomain&utm_medium=header&utm_campaign=launch`}
          className="text-sm font-semibold px-4 py-2 rounded-full transition-all hover:shadow-md"
          style={{
            background: "var(--brand-green-700)",
            color: "var(--brand-cream)",
          }}
        >
          Comprar
        </a>
      </nav>
    </header>
  )
}
