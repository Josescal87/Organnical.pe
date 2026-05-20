import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { sendExpressDoctorAlert, sendExpressPatientConfirm } from "@/lib/emails";
import { getAdminEmails } from "@/lib/get-admin-emails";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const paymentId =
      req.nextUrl.searchParams.get("payment_id") ??
      req.nextUrl.searchParams.get("collection_id");
    const consultationId = req.nextUrl.searchParams.get("external_reference");
    const status =
      req.nextUrl.searchParams.get("status") ??
      req.nextUrl.searchParams.get("collection_status");

    if (!paymentId || !consultationId) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    if (status !== "approved") {
      return NextResponse.json({ status: status ?? "unknown" });
    }

    const adminClient = createAdminClient();

    const { data: existing } = await adminClient
      .schema("medical")
      .from("express_consultations")
      .select(
        "id, status, amount_paid, patient_name, patient_phone, patient_document_type, patient_document_number, birth_date, motivo, preferred_time, doctor_id"
      )
      .eq("id", consultationId)
      .single() as {
        data: {
          id: string;
          status: string;
          amount_paid: number;
          patient_name: string;
          patient_phone: string;
          patient_document_type: string;
          patient_document_number: string;
          birth_date: string | null;
          motivo: string | null;
          preferred_time: "asap" | "today" | "tomorrow";
          doctor_id: string | null;
        } | null;
      };

    if (!existing) {
      return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
    }

    // Idempotency — already processed
    if (existing.status === "paid") {
      return NextResponse.json({
        status: "approved",
        consultationId,
        patientName: existing.patient_name,
        patientPhone: existing.patient_phone,
        preferredTime: existing.preferred_time,
        amount: existing.amount_paid,
      });
    }

    // Verify with MercadoPago (never trust URL params alone)
    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!.trim() });
    const paymentClient = new Payment(mp);
    const paymentResult = await paymentClient.get({ id: paymentId });

    if (paymentResult.status !== "approved") {
      return NextResponse.json({ status: paymentResult.status });
    }

    const { error: updateError } = await adminClient
      .schema("medical")
      .from("express_consultations")
      .update({ status: "paid", mp_payment_id: paymentId })
      .eq("id", consultationId);

    if (updateError) {
      console.error("confirm-express: update error:", updateError);
      return NextResponse.json({ error: "Error al confirmar la consulta" }, { status: 500 });
    }

    const {
      doctor_id: doctorId,
      patient_name: patientName,
      patient_phone: patientPhone,
      patient_document_type: patientDocumentType,
      patient_document_number: patientDocumentNumber,
      birth_date: birthDate,
      motivo,
      preferred_time: preferredTime,
      amount_paid: amount,
    } = existing;

    // Doctor info (non-fatal)
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
        console.error("confirm-express: error fetching doctor:", e);
      }
    }

    // Register venta (non-fatal)
    try {
      const { data: recentVentas } = await adminClient
        .from("ventas")
        .select("num_orden")
        .order("created_at", { ascending: false })
        .limit(100) as { data: Array<{ num_orden: number | string }> | null };
      const maxNum = recentVentas
        ? Math.max(0, ...recentVentas.map(r => parseInt(String(r.num_orden), 10) || 0))
        : 0;
      const nextOrden = maxNum + 1;
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
        dni:             patientDocumentNumber,
        nombre:          parts[0],
        apellido:        parts.slice(1).join(" ") || "-",
        fecha_compra:    new Date().toISOString().split("T")[0],
        comentarios:     `Tel: ${patientPhone} | Modalidad: ${preferredTime} | MP:${paymentId} | Consulta:${consultationId}`,
      });
    } catch (e) {
      console.error("confirm-express: venta insert error:", e);
    }

    // Emails (non-fatal)
    const preferredTimeLabels = {
      asap:     "Lo antes posible (próximas 2h, horario 9am–9pm)",
      today:    "Hoy antes de las 9pm",
      tomorrow: "Mañana entre 9am y 9pm",
    };
    const preferredTimeLabel = preferredTimeLabels[preferredTime] ?? preferredTime;

    const adminEmails = await getAdminEmails().catch(() => []);
    const allAlertEmails = [
      ...new Set(
        [doctorEmail, ...adminEmails, "reservas@organnical.com"].filter(Boolean) as string[]
      ),
    ];
    for (const email of allAlertEmails) {
      sendExpressDoctorAlert({
        toEmail: email,
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
      }).catch((e) => console.error(`confirm-express: alert email error (${email}):`, e));
    }

    const payerEmail = (paymentResult as unknown as { payer?: { email?: string } }).payer?.email;
    if (payerEmail) {
      sendExpressPatientConfirm({
        toEmail: payerEmail,
        patientName,
        patientPhone,
        preferredTimeLabel,
        amount,
        consultationId,
      }).catch((e) => console.error("confirm-express: patient email error:", e));
    }

    return NextResponse.json({
      status: "approved",
      consultationId,
      patientName,
      patientPhone,
      preferredTime,
      amount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[confirm-express] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
