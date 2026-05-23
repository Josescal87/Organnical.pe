import Image from "next/image"
import Link from "next/link"
import type { PublicBrand } from "@/lib/types"

/**
 * Chip pequeño con logo + nombre de marca + link a la landing de marca.
 * Se muestra encima del nombre del producto en el PDP cuando el producto
 * tiene `marca` poblada. Spec Spirusol §6.1.
 */
export default function BrandHeaderChip({ marca }: { marca: PublicBrand }) {
  return (
    <Link
      href={`/marcas/${marca.slug}`}
      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {marca.logo_url ? (
        <Image
          src={marca.logo_url}
          alt={marca.nombre}
          width={20}
          height={20}
          className="rounded-full object-contain"
        />
      ) : (
        <span
          aria-hidden="true"
          className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
        />
      )}
      <span>{marca.nombre}</span>
      {marca.tagline && (
        <span className="hidden sm:inline text-gray-400 font-normal">· {marca.tagline}</span>
      )}
    </Link>
  )
}
