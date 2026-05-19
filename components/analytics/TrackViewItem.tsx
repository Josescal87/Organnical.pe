"use client"
import { useEffect } from "react"
import { trackViewItem } from "@/lib/analytics"
import type { PublicProduct } from "@/lib/types"

export default function TrackViewItem({ producto }: { producto: PublicProduct }) {
  useEffect(() => {
    trackViewItem(producto)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto.sku])
  return null
}
