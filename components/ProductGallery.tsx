"use client"
import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  imagenPrincipal: string | null
  galeria: string[] | null
  nombre: string
}

export default function ProductGallery({ imagenPrincipal, galeria, nombre }: Props) {
  const allImages = [
    ...(imagenPrincipal ? [imagenPrincipal] : []),
    ...(galeria ?? []),
  ].filter(Boolean)

  const [selected, setSelected] = useState(0)

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-purple-50 rounded-2xl flex items-center justify-center">
        <span className="text-7xl">🌿</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
        <Image
          src={allImages[selected]}
          alt={nombre}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => setSelected((s) => (s === 0 ? allImages.length - 1 : s - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setSelected((s) => (s === allImages.length - 1 ? 0 : s + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                i === selected ? "border-purple-600" : "border-transparent"
              )}
            >
              <Image src={img} alt={`${nombre} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
