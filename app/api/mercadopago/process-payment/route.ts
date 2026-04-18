import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { sendAdminSaleNotification } from "@/lib/emails";
import { getAdminEmails } from "@/lib/get-admin-emails";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

type CartItem = { sku: string; descripcion: string; precio: number; qty: number };

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { cart, ...formData } = body as { cart: CartItem[] } & Record<string, unknown>;

    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!.trim() });
    const paymentClient = new Payment(mp);

    const result = await paymentClient.create({
      body: {
        ...formData,
        external_reference: user.id,
        statement_descriptor: "Organnical",
      },
    });

    // Registrar venta y notificar admins si aprobado
    if (result.status === "approved" && cart?.length) {
      const adminClient = createAdminClient();

      // Nombre del paciente
      let patientName = "Paciente";
      const { data: profile } = await adminClient
        .schema("medical")
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) patientName = profile.full_name;

      const parts    = patientName.trim().split(" ");
      const nombre   = parts[0];
      const apellido = parts.slice(1).join(" ") || "-";
      const fecha    = new Date().toISOString().split("T")[0];
      const paymentId = String(result.id);

      // Número de orden siguiente
      const { data: maxOrden } = await adminClient
        .from("ventas")
        .select("num_orden")
        .order("num_orden", { ascending: false })
        .limit(1)
        .single() as { data: { num_orden: number } | null };
      const baseOrden = (maxOrden?.num_orden ?? 0) + 1;

      for (let idx = 0; idx < cart.length; idx++) {
        const item = cart[idx];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (adminClient as any).from("ventas").insert({
          num_orden:       baseOrden + idx,
          item:            item.descripcion,
          unidades:        item.qty,
          precio_item:     item.precio,
          precio_delivery: 0,
          total:           item.precio * item.qty,
          metodo_pago:     "Online - Mercado Pago",
          vendedor:        "Organnical.pe",
          nombre,
          apellido,
          fecha_compra:    fecha,
          comentarios:     `MP:${paymentId}`,
        });
      }

      const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);

      // Email a admins
      getAdminEmails()
        .then((adminEmails) =>
          sendAdminSaleNotification({
            adminEmails,
            saleType: "product",
            patientName,
            items: cart.map((i) => ({ descripcion: i.descripcion, qty: i.qty, precio: i.precio })),
            total,
            paymentMethod: "Mercado Pago",
          })
        )
        .catch((e) => console.error("Admin sale email error:", e));
    }

    return NextResponse.json({ status: result.status, payment_id: result.id });
  } catch (err) {
    console.error("MP process-payment error:", JSON.stringify(err));
    const message = typeof err === "object" ? JSON.stringify(err) : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
