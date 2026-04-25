import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendAdminSaleNotification } from "@/lib/emails";
import { getAdminEmails } from "@/lib/get-admin-emails";

function verifyWebhookSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] MERCADOPAGO_WEBHOOK_SECRET not set — rejecting request");
    return false;
  }
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => { const [k, ...v] = p.split("="); return [k.trim(), v.join("=")] })
  );
  const { ts, v1 } = parts as { ts?: string; v1?: string };
  if (!ts || !v1) return false;

  const manifest = [
    `id:${dataId}`,
    xRequestId ? `request-id:${xRequestId}` : null,
    `ts:${ts}`,
  ].filter(Boolean).join(";") + ";";

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
  } catch {
    return false;
  }
}

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP sends type="payment" for payment events
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const paymentId = String(body.data.id);

    if (!verifyWebhookSignature(req, paymentId)) {
      console.warn("[webhook] Invalid signature for payment", paymentId);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!.trim() });
    const paymentClient = new Payment(mp);
    const payment = await paymentClient.get({ id: paymentId });

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();

    // Deduplication — skip if already registered
    const { data: existing } = await supabase
      .from("ventas")
      .select("id")
      .ilike("comentarios", `%MP:${paymentId}%`)
      .limit(1);
    if (existing?.length) return NextResponse.json({ ok: true });

    const userId = payment.external_reference ?? "";
    const items = ((payment.additional_info?.items ?? []) as unknown) as {
      id: string; title: string; quantity: number; unit_price: number;
    }[];
    const total  = payment.transaction_amount ?? 0;

    // Obtener nombre del paciente
    let patientName = "Paciente";
    let nombre = "Paciente";
    let apellido = "-";
    if (userId) {
      const { data: profile } = await supabase
        .schema("medical")
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      if (profile?.full_name) {
        patientName = profile.full_name;
        const parts = patientName.trim().split(" ");
        nombre   = parts[0];
        apellido = parts.slice(1).join(" ") || "-";
      }
    }

    // Número de orden siguiente
    const { data: maxOrden } = await supabase
      .from("ventas")
      .select("num_orden")
      .order("num_orden", { ascending: false })
      .limit(1)
      .single() as { data: { num_orden: number } | null };
    const baseOrden = (maxOrden?.num_orden ?? 0) + 1;

    const fecha = new Date().toISOString().split("T")[0];

    // Insertar una fila por item
    if (items.length > 0) {
      for (let idx = 0; idx < items.length; idx++) {
        const it = items[idx];
        const qty        = it.quantity || 1;
        const unitPrice  = it.unit_price || 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("ventas").insert({
          num_orden:       baseOrden + idx,
          item:            it.title,
          unidades:        qty,
          precio_item:     unitPrice,
          precio_delivery: 0,
          total:           unitPrice * qty,
          metodo_pago:     "Online - Mercado Pago",
          vendedor:        "Organnical.pe",
          nombre,
          apellido,
          fecha_compra:    fecha,
          comentarios:     `MP:${paymentId}`,
        });
      }
    } else {
      // Fallback: una sola fila con el total
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("ventas").insert({
        num_orden:       baseOrden,
        item:            "Productos Organnical",
        unidades:        1,
        precio_item:     total,
        precio_delivery: 0,
        total,
        metodo_pago:     "Online - Mercado Pago",
        vendedor:        "Organnical.pe",
        nombre,
        apellido,
        fecha_compra:    fecha,
        comentarios:     `MP:${paymentId}`,
      });
    }

    // Email a admins (non-fatal)
    const adminEmails = await getAdminEmails();
    sendAdminSaleNotification({
      adminEmails,
      saleType: "product",
      patientName,
      items: items.length
        ? items.map((i) => ({
            descripcion: i.title,
            qty:         Number(i.quantity) || 1,
            precio:      Number(i.unit_price) || 0,
          }))
        : [{ descripcion: "Productos Organnical", qty: 1, precio: total }],
      total,
      paymentMethod: "Mercado Pago",
    }).catch((e) => console.error("Admin sale email error:", e));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
