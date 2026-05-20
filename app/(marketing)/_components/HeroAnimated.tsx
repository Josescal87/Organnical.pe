"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useInView, type Variants } from "framer-motion"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY_BG = "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)"

const LINES = [
  ["Productos", "que"],
  ["sí", "funcionan,"],
  ["respaldados", "por", "médicos"],
]
const ALL_WORDS = LINES.flat()

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
}

const ctaVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

export default function HeroAnimated() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden pt-24 pb-20 px-6 text-center"
      style={{ background: NAVY_BG }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-25 pointer-events-none" />
      {/* Radial glow — blue depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 30%, #1a3a6e 0%, transparent 65%)" }}
      />
      {/* Subtle violet accent top-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 40% at 80% 10%, rgba(167,139,250,0.12) 0%, transparent 60%)" }}
      />

      <div className="relative mx-auto max-w-3xl">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", damping: 18, stiffness: 280, delay: 0.05 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-1.5 mb-8 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-semibold text-white">Bienestar natural desde la raíz</span>
        </motion.div>

        {/* Headline — word by word */}
        <h1 className="font-display text-4xl font-black text-white leading-tight mb-4 md:text-6xl">
          {LINES.map((line, li) => (
            <span key={li} className="flex flex-wrap justify-center gap-x-[0.28em] gap-y-1 mb-1">
              {line.map((word, wi) => {
                const globalIndex = LINES.slice(0, li).flat().length + wi
                const isItalic = li === 1
                return (
                  <motion.span
                    key={`${li}-${wi}`}
                    variants={wordVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    transition={{ duration: 0.45, delay: 0.12 + globalIndex * 0.055, ease: "easeOut" }}
                    style={isItalic ? { fontStyle: "italic" } : undefined}
                  >
                    {word}
                  </motion.span>
                )
              })}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.12 + ALL_WORDS.length * 0.055 + 0.1, ease: "easeOut" }}
          className="text-white/55 text-lg mb-10 max-w-xl mx-auto"
        >
          Suplementos, gummies y wellness certificados. Envío gratis desde S/300.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 + ALL_WORDS.length * 0.055 + 0.26 } } }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div
            variants={ctaVariants}
            transition={{ type: "spring", damping: 18, stiffness: 280 }}
          >
            <Link
              href="/tienda"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#A78BFA] shadow-xl transition-all hover:shadow-2xl hover:scale-[1.03]"
            >
              Ver tienda <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={ctaVariants}
            transition={{ type: "spring", damping: 18, stiffness: 280 }}
          >
            <Link
              href="/agendar"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/15 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25"
            >
              Agendar consulta médica
            </Link>
          </motion.div>
        </motion.div>

        {/* Express link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.12 + ALL_WORDS.length * 0.055 + 0.55, duration: 0.5 }}
          className="text-white/40 text-sm mt-5"
        >
          ¿Necesitas orientación hoy mismo?{" "}
          <Link
            href="/consulta-express"
            className="font-semibold text-[#F472B6]/70 hover:text-[#F472B6] transition-colors underline underline-offset-2"
          >
            Consulta Express S/30 →
          </Link>
        </motion.p>

      </div>
    </section>
  )
}
