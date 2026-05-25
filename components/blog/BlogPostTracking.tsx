"use client"

import { useEffect } from "react"

interface Props {
  postSlug: string
  postCategory: string
}

type GtagFn = (...args: unknown[]) => void
declare global {
  interface Window {
    gtag?: GtagFn
  }
}

// Umbrales fijos. Disparamos una sola vez por umbral por sesión de página.
const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const

/**
 * Componente cliente que vive dentro de /blog/[slug] y emite eventos GA4
 * específicos del blog v2:
 *
 *   - blog_scroll_depth: disparado al cruzar 25/50/75/100% del scroll
 *   - blog_source_click: click en un link del bloque <Sources>
 *   - blog_related_product_click: click en una tarjeta de <RelatedProducts>
 *   - blog_cta_click: click en cualquiera de los 3 CTAs (mid/sidebar/bottom)
 *
 * Los clicks se capturan vía event delegation en `document` — los elementos
 * trackeables tienen `data-track="<kind>"` + `data-track-*` con metadata.
 * Esto evita convertir Sources/RelatedProducts (server components) en client.
 */
export default function BlogPostTracking({ postSlug, postCategory }: Props) {
  useEffect(() => {
    function track(eventName: string, params: Record<string, unknown>): void {
      if (!window.gtag) return
      try {
        window.gtag("event", eventName, {
          post_slug: postSlug,
          post_category: postCategory,
          ...params,
        })
      } catch {
        // GA4 no debe romper la UX si falla por adblock o algo.
      }
    }

    // ── Scroll depth ──────────────────────────────────────────────────
    const fired = new Set<number>()

    function onScroll(): void {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      const percent = Math.min(100, Math.round((scrolled / maxScroll) * 100))

      for (const threshold of SCROLL_THRESHOLDS) {
        if (percent >= threshold && !fired.has(threshold)) {
          fired.add(threshold)
          track("blog_scroll_depth", { percent: threshold })
        }
      }
    }

    // Llamamos una vez al montar — usuarios que ya scrollearon antes de hidratación
    // no se pierden el evento.
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    // ── Click delegation ──────────────────────────────────────────────
    function onClick(event: MouseEvent): void {
      const target = event.target
      if (!(target instanceof Element)) return

      const trackEl = target.closest<HTMLElement>("[data-track]")
      if (!trackEl) return

      const kind = trackEl.dataset.track
      if (!kind) return

      switch (kind) {
        case "source": {
          track("blog_source_click", {
            source_type: trackEl.dataset.sourceType ?? "other",
            source_index: Number(trackEl.dataset.sourceIndex ?? 0),
            source_url: trackEl.dataset.sourceUrl ?? "",
          })
          break
        }
        case "related-product": {
          track("blog_related_product_click", {
            product_slug: trackEl.dataset.productSlug ?? "",
          })
          break
        }
        case "cta": {
          track("blog_cta_click", {
            cta_position: trackEl.dataset.ctaPosition ?? "unknown",
            cta_kind: trackEl.dataset.ctaKind ?? "unknown",
            cta_destination: trackEl.dataset.ctaDestination ?? "",
          })
          break
        }
      }
    }

    document.addEventListener("click", onClick)

    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClick)
    }
  }, [postSlug, postCategory])

  return null
}
