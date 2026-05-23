import type { Metadata } from "next"
import { getMarcaBySlug } from "@/lib/marcas"

/**
 * Layout de páginas de marca (`/marcas/[brand]/*` y rewrites desde subdominios).
 *
 * Responsabilidades:
 *   1. Resolver la marca por slug (deduplicado vía `cache()` con el page).
 *   2. Inyectar los `theme_tokens` jsonb como CSS variables scopeadas al wrapper,
 *      para que los componentes de la marca puedan usar tokens propios sin
 *      contaminar el design system global de Organnical.
 *   3. Definir el `title.template` de la marca (cada page agrega su propio título).
 *
 * No renderiza header global aquí — lo arma cada `page.tsx`. Para Spirusol
 * usa `<OrgannicalNavbar>` + `<OrgannicalFooter>` (paridad visual con la home
 * de organnical.pe, hrefs absolutos al host principal). Decisión 2026-05-22.
 */
interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { brand } = await params
  const marca = await getMarcaBySlug(brand)
  if (!marca) return {}
  return {
    title: { default: marca.nombre, template: `%s | ${marca.nombre}` },
    description: marca.descripcion ?? undefined,
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName: marca.nombre,
      ...(marca.logo_url && { images: [{ url: marca.logo_url, width: 1200, height: 1200, alt: marca.nombre }] }),
    },
  }
}

export default async function MarcaLayout({ children, params }: LayoutProps) {
  const { brand } = await params
  const marca = await getMarcaBySlug(brand)

  // Si la marca no existe, el page hace notFound(). Acá devolvemos children sin
  // tokens para no romper el árbol.
  if (!marca) return <>{children}</>

  // Tokens jsonb → CSS vars: `green_900` → `--brand-green-900`. Scopeadas al data-brand.
  const cssVars = Object.entries(marca.theme_tokens)
    .map(([k, v]) => `  --brand-${k.replace(/_/g, "-")}: ${v};`)
    .join("\n")

  const scopedStyle = `
[data-brand="${marca.slug}"] {
${cssVars}
}
  `.trim()

  return (
    <div data-brand={marca.slug}>
      {/* Inyectamos los tokens como CSS vars scopeadas. Server-render — sin FOUC. */}
      <style dangerouslySetInnerHTML={{ __html: scopedStyle }} />
      {children}
    </div>
  )
}
