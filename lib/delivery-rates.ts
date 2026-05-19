import { createAdminClient } from "@/lib/supabase/server"
import { unstable_cache } from "next/cache"

const FALLBACK_RATES: Record<string, number> = {
  "Miraflores": 10, "San Isidro": 10, "San Borja": 10, "Surco": 10,
  "La Molina": 10, "Barranco": 10, "Chorrillos": 10, "Jesús María": 10,
  "Lince": 10, "Magdalena del Mar": 10, "Pueblo Libre": 10, "San Miguel": 10,
  "Breña": 10, "Cercado de Lima": 10, "Rímac": 10,
  "San Martín de Porres": 15, "Los Olivos": 15, "Independencia": 15,
  "Comas": 15, "Carabayllo": 15, "Ate": 15, "Santa Anita": 15,
  "La Victoria": 15, "El Agustino": 15, "San Juan de Lurigancho": 15,
  "San Juan de Miraflores": 15, "Villa María del Triunfo": 15, "Villa El Salvador": 15,
  "Lurín": 20, "Pachacámac": 20, "Callao": 20,
}

export const DELIVERY_RATES_CACHE_TAG = "delivery-rates"
export const DELIVERY_RATES_TTL_SECONDS = 300

async function fetchRatesFromDb(): Promise<Record<string, number>> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("delivery_precios")
    .select("distrito, tarifa")
    .eq("activo", true)

  if (error) {
    console.error("delivery-rates: db error, usando fallback:", error.message)
    return { ...FALLBACK_RATES }
  }
  if (!data || data.length === 0) {
    console.warn("delivery-rates: tabla vacía, usando fallback")
    return { ...FALLBACK_RATES }
  }
  const map: Record<string, number> = {}
  for (const row of data as Array<{ distrito: string; tarifa: number }>) {
    map[row.distrito] = Number(row.tarifa)
  }
  return map
}

const cachedFetchRates = unstable_cache(
  fetchRatesFromDb,
  ["delivery-rates-v1"],
  { revalidate: DELIVERY_RATES_TTL_SECONDS, tags: [DELIVERY_RATES_CACHE_TAG] }
)

export async function getDeliveryRates(): Promise<Record<string, number>> {
  return cachedFetchRates()
}

export async function calculateDeliveryCostAsync(subtotal: number, distrito?: string): Promise<number> {
  const { PICKUP_DISTRITO, FREE_DELIVERY_THRESHOLD, DELIVERY_FALLBACK } = await import("@/lib/pricing")
  if (distrito === PICKUP_DISTRITO) return 0
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
  if (!distrito) return DELIVERY_FALLBACK
  const rates = await getDeliveryRates()
  return distrito in rates ? rates[distrito] : DELIVERY_FALLBACK
}
