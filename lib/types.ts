import type { BrandCertificate, BrandThemeTokens, NutritionFacts } from "@/lib/supabase/database.types"

export interface PublicProduct {
  id: string
  sku: string
  descripcion: string
  descripcion_corta: string | null
  descripcion_larga: string | null
  ingredientes: string | null
  modo_uso: string | null
  advertencias: string | null
  presentacion: string | null
  categoria: string
  precio_publico: number
  precio_oferta: number | null
  slug_publico: string
  imagen_url: string | null
  imagenes_galeria: string[] | null
  tags: string[] | null
  peso_g: number | null
  stock?: number | null
  // Brand + nutrition (spec Spirusol — opcional, solo poblado para marcas con ficha extendida)
  marca_id?: string | null
  marca?: PublicBrand | null
  nutrition_facts?: NutritionFacts | null
  registro_sanitario?: string | null
  vida_util_meses?: number | null
  laboratorio?: string | null
  origen?: string | null
}

/** Datos públicos de una marca (lo que muestra la landing y el bloque "Header de marca" del PDP). */
export interface PublicBrand {
  id: string
  slug: string
  nombre: string
  tagline: string | null
  logo_url: string | null
  hero_image: string | null
  descripcion: string | null
  origen: string | null
  productor: string | null
  certificados: BrandCertificate[]
  theme_tokens: BrandThemeTokens
}

export interface CartItem {
  producto: PublicProduct
  cantidad: number
}

export interface DireccionEntrega {
  nombre: string
  apellido: string
  celular: string
  email: string
  doc_type: string
  dni: string
  distrito: string
  direccion: string
  referencia: string
}

export interface OrdenTienda {
  id: string
  mp_payment_id: string | null
  mp_status: string | null
  items: CartItem[]
  subtotal: number
  delivery: number
  total: number
  estado: "pendiente" | "pagado" | "en_despacho" | "entregado" | "cancelado"
  direccion: DireccionEntrega | null
  created_at: string
  boleta_id?: string | null
  boleta_link?: string | null
}
