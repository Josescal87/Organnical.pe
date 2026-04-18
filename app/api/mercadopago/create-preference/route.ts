import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

type CartItem = {
  sku:         string;
  descripcion: string;
  precio:      number;
  qty:         number;
};

export async function POST(req: NextRequest) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      console.error("MERCADOPAGO_ACCESS_TOKEN not set");
      return NextResponse.json({ error: "Pasarela de pago no configurada" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { items } = await req.json() as { items: CartItem[] };
    if (!items?.length) return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://organnical.pe").trim();

    const mp = new MercadoPagoConfig({ accessToken: token.trim() });
    const preference = new Preference(mp);

    const response = await preference.create({
      body: {
        items: items.map((i) => ({
          id:          i.sku,
          title:       i.descripcion,
          quantity:    i.qty,
          unit_price:  i.precio,
          currency_id: "PEN",
        })),
        payer: { email: user.email },
        back_urls: {
          success: `${baseUrl}/dashboard/paciente/catalogo/pago/exito`,
          failure: `${baseUrl}/dashboard/paciente/catalogo/pago/error`,
          pending: `${baseUrl}/dashboard/paciente/catalogo/pago/pendiente`,
        },
        auto_return: "approved",
        external_reference: user.id,
        statement_descriptor: "Organnical",
      },
    });

    if (!response.id) {
      console.error("MP response missing id:", response);
      return NextResponse.json({ error: "Respuesta inesperada de Mercado Pago" }, { status: 500 });
    }

    const amount = items.reduce((s, i) => s + i.precio * i.qty, 0);
    return NextResponse.json({ preference_id: response.id, amount });
  } catch (err) {
    console.error("MercadoPago preference error:", JSON.stringify(err, null, 2));
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object"
        ? JSON.stringify(err)
        : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
