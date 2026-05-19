import { NextResponse } from "next/server"
import { getDeliveryRates, DELIVERY_RATES_TTL_SECONDS } from "@/lib/delivery-rates"
import { FREE_DELIVERY_THRESHOLD, PICKUP_DISTRITO, DELIVERY_FALLBACK } from "@/lib/pricing"

export const revalidate = 300

export async function GET() {
  try {
    const rates = await getDeliveryRates()
    const response = NextResponse.json({
      rates,
      freeThreshold: FREE_DELIVERY_THRESHOLD,
      pickupDistrito: PICKUP_DISTRITO,
      fallback: DELIVERY_FALLBACK,
    })
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${DELIVERY_RATES_TTL_SECONDS}, stale-while-revalidate=${DELIVERY_RATES_TTL_SECONDS * 2}`
    )
    return response
  } catch (err) {
    console.error("delivery-rates: unexpected error:", err)
    return NextResponse.json({ error: "Error consultando tarifas" }, { status: 500 })
  }
}
