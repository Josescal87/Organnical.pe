import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { sendExpressDoctorAlert, sendExpressPatientConfirm } from "@/lib/emails";
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
    if (!(await checkRateLimit(`express:${ip}`, 5, 15 * 60 * 1000))) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en 15 minutos." }, { status: 429 });
    }

    const body = await req.json();
    const {
      patientName,
      patientPhone,
      patientDocumentType,
      patientDocumentNumber,
      birthDate,
      motivo,
      preferredTime,
      consentsAcceptedAt,
      consentsSnapshot,
      ...mpFormData
    } = body as {
      patientName: string;
      patientPhone: string;
      patientDocumentType: string;
      patientDocumentNumber: string;
      birthDate?: string;
      motivo?: string;
      preferredTime: "asap" | "today" | "tomorrow";
      consentsAcceptedAt: string;
      consentsSnapshot: Record<string, string>;
    } & Record<string, unknown>;

    if (!patientName || !patientPhone || !patientDocumentNumber || !preferredTime) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Price always from env — never trust client
    const amount = Number(process.env.EXPRESS_PRICE ?? 30);
    const doctorId = process.env.EXPRESS_DOCTOR_ID ?? null;

    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!.trim() });
    const paymentClient = new Payment(mp);

    const paymentResult = await paymentClient.create({
      body: {
        ...mpFormData,
        transaction_amount: amount,
        external_reference: `express:${patientPhone}`,
        statement_descriptor: "Organnical Express",
      },
    });

    if (paymentResult.status !== "approved") {
      return NextResponse.json({
        status: paymentResult.status,
        status_detail: (paymentResult as unknown as Record<string, unknown>).status_detail,
      });
    }

    const paymentId = String(paymentResult.id);
    const adminClient = createAdminClient();

    // Obtener email de la Dra (non-fatal)
    let doctorEmail: string | undefined;
    let doctorName = "Dra. Organnical";
    if (doctorId) {
      try {
        const { data: doctorProfile } = await adminClient
          .schema("medical")
          .from("profiles")
          .select("full_name")
          .eq("id", doctorId)
          .single() as { data: { full_name: string | null } | null };
        if (doctorProfile?.full_name) doctorName = doctorProfile.full_name;

        const { data: doctorAuth } = await adminClient.auth.admin.getUserById(doctorId);
        doctorEmail = doctorAuth?.user?.email;
      } catch (e) {
        console.error("process-express: error fetching doctor:", e);
      }
    }

    // Insertar consulta express
    const { data: consultation, error: insertError } = await adminClient
      .schema("medical")
      .from("express_consultations")
      .insert({
        doctor_id:               doctorId,
        patient_phone:           patientPhone,
        patient_name:            patientName,
        patient_document_type:   patientDocumentType ?? "DNI",
        patient_document_number: patientDocumentNumber,
        birth_date:              birthDate || null,
        motivo:                  motivo || null,
        preferred_time:          preferredTime,
        consents_accepted_at:    consentsAcceptedAt,
        consents_snapshot:       consentsSnapshot,
        mp_payment_id:           paymentId,
        amount_paid:             amount,
        status:                  "paid",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("process-express: insert error:", insertError);
      return NextResponse.json({ error: "Error al guardar la consulta." }, { status: 500 });
    }

    const consultationId = consultation.id as string;

    // Registrar venta (non-fatal)
    try {
      const { data: maxOrden } = await adminClient
        .from("ventas")
        .select("num_orden")
        .order("num_orden", { ascending: false })
        .limit(1)
        .single() as { data: { num_orden: number } | null };
      const nextOrden = (maxOrden?.num_orden ?? 0) + 1;

      const parts = patientName.trim().split(" ");
      await adminClient.from("ventas").insert({
        num_orden:       nextOrden,
        item:            "Consulta Express — Orientación médica",
        unidades:        1,
        precio_item:     amount,
        precio_delivery: 0,
        total:           amount,
        metodo_pago:     "Online - Mercado Pago",
        vendedor:        "Organnical Express",
        nombre:          parts[0],
        apellido:        parts.slice(1).join(" ") || "-",
        fecha_compra:    new Date().toISOString().split("T")[0],
        comentarios:     `Tel: ${patientPhone} | Modalidad: ${preferredTime} | MP:${paymentId} | Consulta:${consultationId}`,
      });
    } catch (e) {
      console.error("process-express: venta insert error:", e);
    }

    // Emails (non-fatal)
    const preferredTimeLabels = {
      asap:     "Lo antes posible (próximas 2h, horario 9am–9pm)",
      today:    "Hoy antes de las 9pm",
      tomorrow: "Mañana entre 9am y 9pm",
    };
    const preferredTimeLabel = preferredTimeLabels[preferredTime] ?? preferredTime;

    if (doctorEmail) {
      sendExpressDoctorAlert({
        toEmail: doctorEmail,
        doctorName,
        patientName,
        patientPhone,
        patientDocumentType: patientDocumentType ?? "DNI",
        patientDocumentNumber,
        birthDate: birthDate ?? "",
        motivo: motivo ?? "",
        preferredTimeLabel,
        consultationId,
        paymentId,
      }).catch((e) => console.error("process-express: doctor email error:", e));
    }

    const payerEmail = (mpFormData as { payer?: { email?: string } }).payer?.email;
    if (payerEmail) {
      sendExpressPatientConfirm({
        toEmail: payerEmail,
        patientName,
        patientPhone,
        preferredTimeLabel,
        amount,
        consultationId,
      }).catch((e) => console.error("process-express: patient email error:", e));
    }

    return NextResponse.json({ status: "approved", consultationId });
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[process-express] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
