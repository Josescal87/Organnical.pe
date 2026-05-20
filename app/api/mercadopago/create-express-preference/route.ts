import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!(await checkRateLimit(`express-pref:${ip}`, 5, 15 * 60 * 1000))) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en 15 minutos." }, { status: 429 });
    }

    const {
      patientName, patientPhone, patientDocumentType, patientDocumentNumber,
      motivo, preferredTime, consentsAcceptedAt, consentsSnapshot, couponCode,
    } = await req.json();

    if (!patientName || !patientPhone || !patientDocumentNumber || !preferredTime) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const basePrice = Number(process.env.EXPRESS_PRICE ?? 30);
    let amount = basePrice;
    let appliedCoupon: string | null = null;

    if (couponCode) {
      const validCode = process.env.EXPRESS_COUPON_CODE?.toUpperCase().trim();
      const discount = Number(process.env.EXPRESS_COUPON_DISCOUNT ?? 0);
      if (couponCode.toUpperCase().trim() === validCode && discount > 0) {
        amount = Math.max(1, basePrice - discount);
        appliedCoupon = couponCode.toUpperCase().trim();
      }
    }

    const adminClient = createAdminClient();

    const { data: consultation, error: insertError } = await adminClient
      .schema("medical")
      .from("express_consultations")
      .insert({
        doctor_id:               process.env.EXPRESS_DOCTOR_ID ?? null,
        patient_phone:           patientPhone,
        patient_name:            patientName,
        patient_document_type:   patientDocumentType ?? "DNI",
        patient_document_number: patientDocumentNumber,
        motivo:                  motivo || null,
        preferred_time:          preferredTime,
        consents_accepted_at:    consentsAcceptedAt,
        consents_snapshot:       consentsSnapshot,
        amount_paid:             amount,
        coupon_code:             appliedCoupon,
        status:                  "pending",
      })
      .select("id")
      .single();

    if (insertError || !consultation) {
      console.error("create-express-preference: insert error:", insertError);
      return NextResponse.json({ error: "Error al crear la consulta." }, { status: 500 });
    }

    const consultationId = consultation.id as string;
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://organnical.pe").trim();

    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!.trim() });
    const preference = new Preference(mp);

    const response = await preference.create({
      body: {
        items: [{
          id:          "express-consultation",
          title:       "Consulta Express — Orientación médica",
          quantity:    1,
          unit_price:  amount,
          currency_id: "PEN",
        }],
        payer: { name: patientName },
        back_urls: {
          success: `${baseUrl}/consulta-express/exito`,
          failure: `${baseUrl}/consulta-express?error=pago_fallido`,
          pending: `${baseUrl}/consulta-express/exito`,
        },
        auto_return: "approved",
        external_reference: consultationId,
        statement_descriptor: "Organnical Express",
      },
    });

    if (!response.init_point) {
      return NextResponse.json({ error: "Error al crear preferencia de pago." }, { status: 500 });
    }

    return NextResponse.json({ init_point: response.init_point, consultationId });
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[create-express-preference] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
