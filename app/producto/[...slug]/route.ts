import { NextResponse } from "next/server"

// URLs heredadas del store WordPress/Woo (organnical-store, catálogo cannabis discontinuado).
// Devolvemos 410 Gone para que Google las desindexe limpio en lugar de soft-404 (que era
// el comportamiento previo cuando next.config redirigía a "/" — Google lo leía como engaño
// y desindexaba lentamente). 410 acelera la limpieza del índice.

export const dynamic = "force-static"
export const revalidate = false

export async function GET() {
  return new NextResponse(null, { status: 410 })
}
