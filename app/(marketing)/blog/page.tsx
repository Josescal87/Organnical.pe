import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, Tag } from "lucide-react"
import { posts } from "@/lib/blog"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY = "#0B1D35"

const CATEGORY_COLORS: Record<string, string> = {
  "Dolor Crónico": "bg-rose-50 text-rose-600",
  "Sueño": "bg-indigo-50 text-indigo-600",
  "Salud Femenina": "bg-pink-50 text-pink-600",
  "Ansiedad": "bg-violet-50 text-violet-600",
  "Medicina": "bg-sky-50 text-sky-600",
}

export const metadata = {
  title: "Blog — Organnical | Medicina Integrativa",
  description:
    "Artículos sobre medicina integrativa, cannabis medicinal, sueño, dolor crónico, ansiedad y salud femenina. Escritos por especialistas certificados.",
}

export default function BlogPage() {
  const [featured, ...rest] = posts

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: NAVY }}>
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 50% 0%, #1a3a6e 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#F472B6] animate-pulse" />
            <span className="text-sm font-medium text-white/80">Medicina basada en evidencia</span>
          </div>
          <h1 className="font-display text-5xl font-black text-white leading-tight md:text-6xl mb-5">
            Blog{" "}
            <span
              style={{
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                backgroundImage: G,
              }}
            >
              Organnical
            </span>
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            Artículos sobre medicina integrativa escritos por nuestro equipo de especialistas.
            Evidencia científica al servicio de tu bienestar.
          </p>
        </div>
      </section>

      <main className="bg-[#F8FAFC] min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-16">

          {/* ── Featured post ── */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group block mb-14 bg-white rounded-3xl overflow-hidden border border-zinc-100 hover:border-violet-200 hover:shadow-2xl transition-all duration-300"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                <div className="absolute top-4 left-4">
                  <span className="rounded-full px-3 py-1 text-xs font-bold text-white shadow"
                    style={{ background: G }}>
                    Destacado
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[featured.category] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="w-3 h-3" /> {featured.readTime} min lectura
                  </span>
                </div>
                <h2 className="font-display text-2xl font-black text-[#0B1D35] leading-tight mb-3 md:text-3xl group-hover:text-[#7c6fed] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">{featured.author}</p>
                    <p className="text-xs text-zinc-400">{featured.dateFormatted}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white rounded-full px-4 py-2 group-hover:gap-3 transition-all"
                    style={{ background: G }}
                  >
                    Leer artículo <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* ── Grid de artículos ── */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                    <Clock className="w-3 h-3" />
                    {post.readTime} min lectura
                    <span className="text-zinc-200">·</span>
                    {post.dateFormatted}
                  </div>

                  <h2 className="font-display font-bold text-[#0B1D35] text-lg leading-snug mb-3 group-hover:text-[#7c6fed] transition-colors line-clamp-3 flex-1">
                    {post.title}
                  </h2>

                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-5">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <span className="text-xs text-zinc-400 font-medium">{post.author}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#A78BFA] group-hover:gap-2 transition-all">
                      Leer <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Tags cloud ── */}
          <div className="mt-14 p-8 bg-white rounded-2xl border border-zinc-100">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Temas</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(posts.flatMap((p) => p.tags))).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-violet-50 hover:text-[#7c6fed] hover:border-violet-100 transition-colors cursor-default"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div
            className="mt-10 rounded-3xl p-10 text-center text-white"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a6e 100%)` }}
          >
            <h3 className="font-display text-2xl font-black mb-3">
              ¿Listo para dar el primer paso?
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto text-sm">
              Agenda tu consulta con nuestros médicos especializados en medicina integrativa.
            </p>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: G }}
            >
              Agendar consulta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
