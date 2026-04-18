import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const formData = await req.json();

    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!.trim() });
    const paymentClient = new Payment(mp);

    const result = await paymentClient.create({
      body: {
        ...formData,
        external_reference: user.id,
        statement_descriptor: "Organnical",
      },
    });

    return NextResponse.json({
      status:     result.status,
      payment_id: result.id,
    });
  } catch (err) {
    console.error("MP process-payment error:", JSON.stringify(err));
    const message = typeof err === "object" ? JSON.stringify(err) : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
