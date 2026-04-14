import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag, User } from "lucide-react"
import { getPost, getAllSlugs, posts, type ContentBlock } from "@/lib/blog"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY = "#0B1D35"

const CATEGORY_COLORS: Record<string, string> = {
  "Dolor Crónico": "bg-rose-50 text-rose-600",
  "Sueño": "bg-indigo-50 text-indigo-600",
  "Salud Femenina": "bg-pink-50 text-pink-600",
  "Ansiedad": "bg-violet-50 text-violet-600",
  "Medicina": "bg-sky-50 text-sky-600",
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Blog Organnical`,
    description: post.excerpt,
  }
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={index}
          className="font-display text-2xl font-black text-[#0B1D35] mt-10 mb-4 leading-tight"
        >
          {block.text}
        </h2>
      )
    case "h3":
      return (
        <h3
          key={index}
          className="font-display text-xl font-bold text-[#0B1D35] mt-8 mb-3"
        >
          {block.text}
        </h3>
      )
    case "p":
      return (
        <p key={index} className="text-zinc-600 leading-relaxed mb-5 text-[17px]">
          {block.text}
        </p>
      )
    case "ul":
      return (
        <ul key={index} className="mb-5 space-y-2 ml-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-600 text-[17px]">
              <span
                className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: G }}
              />
              {item}
            </li>
          ))}
        </ul>
      )
    case "ol":
      return (
        <ol key={index} className="mb-5 space-y-2.5 ml-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-600 text-[17px]">
              <span
                className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
                style={{ background: G }}
              >
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      )
    case "quote":
      return (
        <blockquote
          key={index}
          className="my-8 pl-5 border-l-4 rounded-r-xl bg-violet-50/60 py-5 pr-5"
          style={{ borderColor: "#A78BFA" }}
        >
          <p className="text-[#5b4fcf] font-medium italic leading-relaxed text-lg">
            &ldquo;{block.text}&rdquo;
          </p>
        </blockquote>
      )
    default:
      return null
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-28 pb-0 overflow-hidden" style={{ background: NAVY }}>
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, #1a3a6e 0%, transparent 70%)" }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-6 pb-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al blog
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? "bg-zinc-100 text-zinc-600"}`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="w-3 h-3" /> {post.readTime} min lectura
            </span>
          </div>

          <h1 className="font-display text-3xl font-black text-white leading-tight md:text-4xl lg:text-5xl mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/45">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {post.author} · {post.authorRole}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.dateFormatted}
            </span>
          </div>
        </div>
      </section>

      {/* ── Featured image ── */}
      <div className="relative -mt-1 mx-auto max-w-4xl px-6">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: "16/7" }}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* ── Content ── */}
      <main className="bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12">

            {/* Article body */}
            <article className="bg-white rounded-3xl p-8 md:p-12 border border-zinc-100 shadow-sm">
              <p className="text-lg text-zinc-500 leading-relaxed mb-8 font-medium border-b border-zinc-50 pb-8">
                {post.excerpt}
              </p>
              {post.content.map((block, i) => renderBlock(block, i))}

              {/* Tags */}
              <div className="mt-10 pt-8 border-t border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Etiquetas</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-500"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* CTA Card */}
              <div
                className="rounded-2xl p-6 text-white"
                style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a6e 100%)` }}
              >
                <h3 className="font-display font-black text-lg mb-2">¿Tienes esta condición?</h3>
                <p className="text-white/60 text-sm mb-5 leading-relaxed">
                  Agenda una consulta con nuestros médicos especializados y recibe un plan personalizado.
                </p>
                <Link
                  href="/registro"
                  className="block w-full text-center rounded-full py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: G }}
                >
                  Agendar consulta
                </Link>
                <p className="text-center text-xs text-white/30 mt-3">Primera consulta sin compromiso</p>
              </div>

              {/* Author card */}
              <div className="bg-white rounded-2xl p-6 border border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Autor</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: G }}
                  >
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-zinc-800">{post.author}</p>
                    <p className="text-xs text-zinc-400">{post.authorRole}</p>
                  </div>
                </div>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-zinc-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                    Artículos relacionados
                  </p>
                  <div className="space-y-4">
                    {related.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/blog/${r.slug}`}
                        className="group flex gap-3 items-start"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <Image src={r.image} alt={r.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-800 leading-snug line-clamp-2 group-hover:text-[#7c6fed] transition-colors">
                            {r.title}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">{r.dateFormatted}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* ── Bottom nav ── */}
          <div className="mt-10 flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#7c6fed] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Todos los artículos
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
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
