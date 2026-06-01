import { NextResponse } from "next/server";

// DEPRECADO (2026-06-02): el fulfillment de venta de producto del store público
// vive ahora en app/api/mp/webhook (+ lib/store-fulfillment → fulfillPaidOrder).
// El checkout vivo configura notification_url → /api/mp/webhook, así que esta
// ruta no tiene caller legítimo. Se neutraliza a no-op para evitar doble-disparo
// (ventas duplicadas en `ventas` + correos a la lista vieja vía getAdminEmails)
// en caso de que MercadoPago tenga un webhook global "fantasma" apuntando aquí.
//
// NOTA: el checkout autenticado del catálogo del paciente (botica) usa
// app/api/mercadopago/process-payment (flujo síncrono Brick), que NO depende de
// esta ruta. No se toca.
export async function POST() {
  console.warn(
    "mercadopago/webhook: ruta legacy deshabilitada — usar mp/webhook + fulfillPaidOrder"
  );
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
