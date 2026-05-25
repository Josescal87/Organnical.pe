import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, BookOpen } from "lucide-react"
import { getPublishedPosts } from "@/lib/blog"
import LogoutButton from "@/components/LogoutButton"
import HeaderCartButton from "@/components/HeaderCartButton"

// ISR: revalidar cada 60s para que los posts scheduled aparezcan en máximo ~1min
// después de su publishTimestamp (05:00 Lima del día del `date`).
export const revalidate = 60

export const metadata: Metadata = {
  title: "Blog — Organnical | Medicina Integrativa",
  description:
    "Artículos sobre medicina integrativa, sueño, dolor crónico, ansiedad y salud femenina. Escritos por especialistas certificados en medicina funcional.",
  alternates: { canonical: "https://organnical.pe/blog" },
}

const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")"
const G    = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY = "#0B1D35"

const CATEGORY_COLORS: Record<string, string> = {
  "Dolor Crónico":  "bg-rose-50 text-rose-600",
  "Sueño":          "bg-indigo-50 text-indigo-600",
  "Salud Femenina": "bg-pink-50 text-pink-600",
  "Ansiedad":       "bg-violet-50 text-violet-600",
  "Medicina":       "bg-sky-50 text-sky-600",
}

export default function BlogPage() {
  const [featured, ...rest] = getPublishedPosts()

  return (
    <main className="min-h-screen" style={{ background: "#F8FAFC" }}>

      {/* ── Header sticky ───────────────────────────────────────────── */}
      <div
        className="sticky z-30"
        style={{
          top: "var(--promo-banner-h, 0px)",
          background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)",
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

        <div className="relative max-w-5xl mx-auto px-4 pt-5 pb-5">

          {/* Fila 1: logo + nav central + conteo */}
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-white.png"
                alt="Organnical"
                width={100}
                height={24}
                className="opacity-75 hover:opacity-100 transition-opacity"
              />
            </Link>
            {/* Nav central — desktop */}
            <nav className="hidden sm:flex items-center gap-5 flex-1 justify-center">
              <Link href="/cuenta" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Mi cuenta</Link>
              <Link href="/cuenta/botica" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Botica</Link>
              <Link href="/tienda" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Tienda</Link>
              <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>Blog</span>
            </nav>
            <div className="flex items-center gap-3 flex-shrink-0">
              <HeaderCartButton variant="dark" />
              <LogoutButton />
            </div>
          </div>

          {/* Fila 2: icono + título + subtítulo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: G }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-black text-white leading-tight">Blog</h1>
              <p className="text-white/40 text-xs">Medicina integrativa basada en evidencia</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Post destacado ── */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group block mb-8 bg-white rounded-3xl overflow-hidden border border-zinc-100 hover:shadow-xl transition-all duration-300"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
              <div className="absolute top-3 left-3">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: G }}
                >
                  Destacado
                </span>
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[featured.category] ?? "bg-zinc-100 text-zinc-600"}`}>
                  {featured.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Clock className="w-2.5 h-2.5" /> {featured.readTime} min lectura
                </span>
              </div>
              <h2
                className="font-display text-xl font-black leading-tight mb-2 md:text-2xl group-hover:text-[#7c6fed] transition-colors"
                style={{ color: NAVY }}
              >
                {featured.title}
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-5 line-clamp-2">
                {featured.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-700">{featured.author}</p>
                  <p className="text-[10px] text-zinc-400">{featured.dateFormatted}</p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white rounded-full px-3.5 py-2 group-hover:gap-2.5 transition-all"
                  style={{ background: G }}
                >
                  Leer <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* ── Grid de artículos ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-3xl border border-zinc-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Imagen cuadrada — mismo tamaño que product cards */}
              <div className="relative aspect-square bg-zinc-50 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div
                  className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: G }}
                >
                  {post.category}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Clock className="w-2.5 h-2.5" />
                  {post.readTime} min · {post.dateFormatted}
                </div>

                <h2
                  className="text-xs font-semibold leading-snug line-clamp-2 flex-1"
                  style={{ color: NAVY }}
                >
                  {post.title}
                </h2>

                <div className="flex items-center justify-between mt-auto pt-1">
                  <span className="text-[10px] text-zinc-400 truncate max-w-[70%]">{post.author}</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#A78BFA] group-hover:gap-1.5 transition-all flex-shrink-0">
                    Leer <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── CTA ── */}
        <div
          className="mt-10 rounded-3xl p-8 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a6e 100%)` }}
        >
          <h3 className="font-display text-xl font-black mb-2">
            ¿Listo para dar el primer paso?
          </h3>
          <p className="text-white/60 mb-5 max-w-md mx-auto text-sm">
            Agenda tu consulta con nuestros médicos especializados en medicina integrativa.
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: G }}
          >
            Agendar consulta <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
