import type { PublicBrand } from "@/lib/types"
import { FAQ_ITEMS } from "./BrandFAQ"

/**
 * Bloques JSON-LD para SEO del landing Spirusol. Server-rendered (Google
 * necesita verlos en el HTML inicial, no después de hydration).
 *
 * Incluye:
 *   • Organization — Greenner SAC (la productora, no Organnical)
 *   • BreadcrumbList — Inicio → Spirusol
 *   • FAQPage — las 8 preguntas exportadas desde BrandFAQ.tsx
 *
 * El `Organization` global de Organnical sigue viviendo en el root layout y
 * no se duplica acá.
 */
export default function JsonLdScripts({
  marca,
  baseUrl,
}: {
  marca: PublicBrand
  baseUrl: string  // ej: "https://spirusol.organnical.pe" o "https://organnical.pe/marcas/spirusol"
}) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: marca.productor ?? "Greenner SAC",
    description:
      "Productora peruana de espirulina ubicada en Moquegua, con cultivos en Arequipa, Perú.",
    url: baseUrl,
    ...(marca.logo_url && { logo: marca.logo_url }),
    brand: {
      "@type": "Brand",
      name: marca.nombre,
      slogan: marca.tagline ?? undefined,
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "PE",
      addressRegion: "Arequipa",
      addressLocality: "Arequipa",
    },
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://organnical.pe" },
      { "@type": "ListItem", position: 2, name: marca.nombre, item: baseUrl },
    ],
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </>
  )
}
