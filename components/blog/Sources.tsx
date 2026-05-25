import { ExternalLink, BookOpen } from "lucide-react"
import type { BlogSource, SourceType } from "@/lib/blog"

const TYPE_LABEL: Record<SourceType, string> = {
  pubmed: "PubMed",
  examine: "Examine",
  nhs: "NHS",
  mayo: "Mayo Clinic",
  minsa: "MINSA",
  cochrane: "Cochrane",
  other: "Fuente",
}

const TYPE_COLOR: Record<SourceType, string> = {
  pubmed: "bg-sky-50 text-sky-700 border-sky-100",
  examine: "bg-emerald-50 text-emerald-700 border-emerald-100",
  nhs: "bg-blue-50 text-blue-700 border-blue-100",
  mayo: "bg-amber-50 text-amber-700 border-amber-100",
  minsa: "bg-rose-50 text-rose-700 border-rose-100",
  cochrane: "bg-violet-50 text-violet-700 border-violet-100",
  other: "bg-zinc-50 text-zinc-600 border-zinc-100",
}

export default function Sources({ sources }: { sources: BlogSource[] }) {
  if (!sources?.length) return null

  return (
    <section
      className="mt-10 pt-8 border-t border-zinc-100"
      aria-labelledby="blog-sources-heading"
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-zinc-400" />
        <h2
          id="blog-sources-heading"
          className="text-xs font-bold uppercase tracking-widest text-zinc-400"
        >
          Fuentes
        </h2>
      </div>

      <ol className="space-y-3">
        {sources.map((s, i) => (
          <li key={s.url} className="flex items-start gap-3 text-sm">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-zinc-50 border border-zinc-100 text-xs font-bold text-zinc-500 flex items-center justify-center">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-baseline gap-1.5 text-zinc-700 hover:text-[#7c6fed] transition-colors leading-snug"
              >
                <span>{s.label}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 translate-y-0.5" />
              </a>
              <span
                className={`ml-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TYPE_COLOR[s.type]}`}
              >
                {TYPE_LABEL[s.type]}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
