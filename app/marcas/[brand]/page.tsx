import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { getMarcaBySlug, getProductosByMarcaId } from "@/lib/marcas"

import OrgannicalNavbar from "@/components/spirusol/OrgannicalNavbar"
import OrgannicalFooter from "@/components/spirusol/OrgannicalFooter"
import BrandHero from "@/components/spirusol/BrandHero"
import NutrientStatGrid from "@/components/spirusol/NutrientStatGrid"
import StorytellingArequipa from "@/components/spirusol/StorytellingArequipa"
import NutritionComparison from "@/components/spirusol/NutritionComparison"
import UsageCards from "@/components/spirusol/UsageCards"
import BrandProductGrid from "@/components/spirusol/BrandProductGrid"
import CertificateGallery from "@/components/spirusol/CertificateGallery"
import MedicalConsultCTA from "@/components/spirusol/MedicalConsultCTA"
import BrandFAQ from "@/components/spirusol/BrandFAQ"
import JsonLdScripts from "@/components/spirusol/JsonLdScripts"

interface Props {
  params: Promise<{ brand: string }>
}

/**
 * Landing de marca — `/marcas/[brand]` (servida también desde spirusol.organnical.pe
 * vía rewrite del middleware).
 *
 * El spec §4.3 pide que el canonical apunte a la URL real del subdominio cuando
 * se sirve desde ahí — no a `/marcas/spirusol`. Detectamos el host con
 * `headers()` para devolver el canonical correcto sin duplicar la página.
 *
 * Server Component sin caché agresivo: la marca cambia poco pero los productos
 * sí (precio, stock); confiamos en el `revalidate=300` de /tienda + RSC-fetch
 * default de Next 15.
 */

const ORGANNICAL_HOST = "organnical.pe"

function getCanonical(slug: string, hostHeader: string | null): string {
  const subdomainHost = `${slug}.${ORGANNICAL_HOST}`
  // Si la request llegó desde el subdominio dedicado, canonical apunta ahí.
  // Cualquier otro host (organnical.pe directo, vercel.app preview, dev) cae al path interno.
  if (hostHeader === subdomainHost || hostHeader?.startsWith(`${slug}.`)) {
    return `https://${subdomainHost}/`
  }
  return `https://${ORGANNICAL_HOST}/marcas/${slug}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const marca = await getMarcaBySlug(brand)
  if (!marca) return { title: "Marca no encontrada" }

  const h = await headers()
  const canonical = getCanonical(marca.slug, h.get("host"))

  // OG image siempre se sirve desde organnical.pe (Vercel) — independiente del
  // host de la request. Asset pendiente: ver /public/brands/spirusol/README.md.
  const ogImageUrl = `https://${ORGANNICAL_HOST}/brands/${marca.slug}/og-image.jpg`

  return {
    title: `${marca.nombre} — ${marca.tagline ?? "Espirulina premium peruana"}`,
    description: marca.descripcion ?? undefined,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_PE",
      url: canonical,
      siteName: marca.nombre,
      title: `${marca.nombre} — ${marca.tagline ?? ""}`,
      description: marca.descripcion ?? undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${marca.nombre} — ${marca.tagline ?? ""}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImageUrl],
    },
  }
}

export default async function MarcaPage({ params }: Props) {
  const { brand } = await params
  const marca = await getMarcaBySlug(brand)
  if (!marca) notFound()

  const productos = await getProductosByMarcaId(marca.id)
  const h = await headers()
  const canonical = getCanonical(marca.slug, h.get("host"))

  return (
    <>
      <JsonLdScripts marca={marca} baseUrl={canonical.replace(/\/$/, "")} />

      <OrgannicalNavbar />

      <main
        className="min-h-screen"
        style={{
          fontFamily: "var(--font-dm-sans)",
          background: "var(--brand-cream)",
        }}
      >
        <BrandHero marca={marca} />
        <NutrientStatGrid />
        <StorytellingArequipa marca={marca} />
        <NutritionComparison />
        <UsageCards />
        <BrandProductGrid productos={productos} />
        <CertificateGallery />
        <MedicalConsultCTA />
        <BrandFAQ />
      </main>

      <OrgannicalFooter />
    </>
  )
}
