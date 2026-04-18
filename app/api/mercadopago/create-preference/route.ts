import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

type CartItem = {
  sku:         string;
  descripcion: string;
  precio:      number;
  qty:         number;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { items } = await req.json() as { items: CartItem[] };
    if (!items?.length) return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://organnical.pe";

    const preference = new Preference(mp);
    const response = await preference.create({
      body: {
        items: items.map((i) => ({
          id:         i.sku,
          title:      i.descripcion,
          quantity:   i.qty,
          unit_price: i.precio,
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

    return NextResponse.json({ init_point: response.init_point });
  } catch (err) {
    console.error("MercadoPago preference error:", err);
    return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 });
  }
}
