import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createCalendarEvent } from "@/lib/google-calendar";
import { createWherebyMeeting } from "@/lib/whereby/client";
import {
  sendAppointmentConfirmation,
  sendNewAppointmentToDoctor,
  sendAdminSaleNotification,
} from "@/lib/emails";
import { getAdminEmails } from "@/lib/get-admin-emails";
import type { AppointmentSpecialty, MedicalAppointmentInsert } from "@/lib/supabase/database.types";
import { SPECIALTY_LABELS } from "@/lib/specialty-labels";
import { checkRateLimit } from "@/lib/rate-limit";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    if (!(await checkRateLimit(`mp-appointment:${user.id}`, 10, 15 * 60 * 1000))) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en 15 minutos." }, { status: 429 });
    }

    const body = await req.json();
    const { doctorId, specialty, slotStart, sessions, precioFinal: _ignored, ...formData } = body as {
      doctorId:    string;
      specialty:   string;
      slotStart:   string;
      sessions:    number;
      precioFinal: number;
    } & Record<string, unknown>;

    if (!doctorId || !specialty || !slotStart || !sessions) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Check for per-user price override (e.g. test accounts)
    const { data: profileOverride } = await supabase
      .schema("medical")
      .from("profiles")
      .select("precio_override")
      .eq("id", user.id)
      .single() as { data: { precio_override: number | null } | null };

    let totalCharged: number;
    let pricePerSession: number;

    if (profileOverride?.precio_override != null) {
      totalCharged  = profileOverride.precio_override;
      pricePerSession = profileOverride.precio_override;
    } else {
      // Fetch server-side price — never trust client-supplied amount
      const { data: comboRows } = await supabase
        .from("consulta_combos")
        .select("precio")
        .eq("sesiones", sessions)
        .limit(1) as unknown as { data: { precio: number }[] | null };
      const combo = comboRows?.[0] ?? null;

      if (combo?.precio) {
        totalCharged = combo.precio;
        pricePerSession = Math.round((combo.precio / sessions) * 100) / 100;
      } else {
        const { data: config } = await supabase
          .from("consulta_config")
          .select("precio, descuento_porcentaje")
          .eq("id", 1)
          .single() as { data: { precio: number; descuento_porcentaje: number } | null };
        const precioBase = config?.precio ?? 60;
        const descuento  = config?.descuento_porcentaje ?? 0;
        pricePerSession  = Math.round(precioBase * (1 - descuento / 100) * 100) / 100;
        totalCharged     = Math.round(pricePerSession * sessions * 100) / 100;
      }
    }

    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!.trim() });
    const paymentClient = new Payment(mp);

    const paymentResult = await paymentClient.create({
      body: {
        ...formData,
        transaction_amount: totalCharged,
        external_reference: user.id,
        statement_descriptor: "Organnical",
      },
    });

    const mpResult = paymentResult as unknown as Record<string, unknown>;
    if (paymentResult.status !== "approved") {
      return NextResponse.json({ status: paymentResult.status, status_detail: mpResult.status_detail });
    }
    const paymentId = String(paymentResult.id);

    const adminClient = createAdminClient();
    const specialtyLabel = SPECIALTY_LABELS[specialty] ?? specialty;

    // Datos del paciente
    const { data: patientProfile } = await supabase
      .schema("medical").from("profiles").select("full_name").eq("id", user.id).single();
    const patientName = patientProfile?.full_name ?? "Paciente";

    // Datos del médico
    const { data: doctorProfile } = await supabase
      .schema("medical").from("profiles").select("full_name").eq("id", doctorId).single();
    const doctorName = doctorProfile?.full_name ?? "Médico";

    const { data: maxOrden } = await adminClient
      .from("ventas").select("num_orden").order("num_orden", { ascending: false }).limit(1).single() as
      { data: { num_orden: number } | null };
    let nextOrden = (maxOrden?.num_orden ?? 0) + 1;

    const parts    = patientName.trim().split(" ");
    const nombre   = parts[0];
    const apellido = parts.slice(1).join(" ") || "-";
    const fecha    = new Date().toISOString().split("T")[0];

    // Obtener email del médico para invitarlo al evento de Calendar
    const { data: doctorAuthData } = await createAdminClient().auth.admin.getUserById(doctorId);
    const doctorEmail = doctorAuthData?.user?.email;

    const appointmentIds: string[] = [];
    const meetLinks: (string | null)[] = [];

    // Crear N citas (una por sesión, cada +7 días)
    for (let i = 0; i < sessions; i++) {
      const startDate = addDays(new Date(slotStart), i * 7);
      const endDate   = new Date(startDate.getTime() + 25 * 60 * 1000);

      // Whereby room (non-fatal)
      let meetLink: string | null = null;
      let hostMeetLink: string | null = null;
      try {
        const whereby = await createWherebyMeeting(
          startDate.toISOString(),
          endDate.toISOString(),
          `consulta-${specialty}`
        );
        if (whereby) {
          meetLink     = whereby.roomUrl;
          hostMeetLink = whereby.hostRoomUrl;
        }
      } catch (e) {
        console.error(`Whereby error session ${i + 1}:`, e);
      }

      // Google Calendar (non-fatal) — for calendar invites; uses Whereby URL as location
      try {
        const attendees = [user.email!];
        if (doctorEmail) attendees.push(doctorEmail);
        await createCalendarEvent({
          title: `Consulta Organnical — ${specialtyLabel} · ${patientName}`,
          description: [
            `Teleconsulta de ${specialtyLabel}`,
            `Paciente: ${patientName}`,
            `Médico: ${doctorName}`,
            sessions > 1 ? `Sesión ${i + 1} de ${sessions}` : "",
            meetLink ? `Link videollamada: ${meetLink}` : "",
            ``,
            `Plataforma: Organnical — Medicina Integrativa`,
            `Soporte: reservas@organnical.com | +51 952 476 574`,
          ].filter(Boolean).join("\n"),
          startTime: startDate.toISOString(),
          endTime:   endDate.toISOString(),
          attendeeEmails: attendees,
        });
      } catch (e) {
        console.error(`Calendar error session ${i + 1}:`, e);
      }

      meetLinks.push(meetLink);

      // Crear cita en DB
      const apptData: MedicalAppointmentInsert = {
        patient_id:        user.id,
        doctor_id:         doctorId,
        slot_start:        startDate.toISOString(),
        slot_end:          endDate.toISOString(),
        status:            "confirmed",
        specialty:         specialty as AppointmentSpecialty,
        meeting_link:      meetLink,
        meeting_host_link: hostMeetLink,
        meeting_provider:  meetLink ? "whereby" : undefined,
      };

      const { data: appt, error: insertError } = await supabase
        .schema("medical").from("appointments").insert(apptData).select("id").single();
      if (insertError) {
        console.error(`Appointment insert error session ${i + 1}:`, insertError);
        continue;
      }
      appointmentIds.push(appt.id);

      // Venta en Ruby
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any).from("ventas").insert({
        num_orden:       nextOrden++,
        item:            sessions > 1 ? `Teleconsulta — ${specialtyLabel} (Sesión ${i + 1}/${sessions})` : `Teleconsulta — ${specialtyLabel}`,
        unidades:        1,
        precio_item:     pricePerSession,
        precio_delivery: 0,
        total:           pricePerSession,
        metodo_pago:     "Online - Mercado Pago",
        vendedor:        "Organnical.pe",
        nombre,
        apellido,
        fecha_compra:    fecha,
        comentarios:     `MP:${paymentId} | Cita ID: ${appt.id} | Médico: ${doctorName}`,
      });

      // Email confirmación al paciente
      sendAppointmentConfirmation({
        toEmail: user.email!, patientName, doctorName, specialty,
        slotStart: startDate.toISOString(), meetLink,
      }).catch((e) => console.error(`Patient confirm email session ${i + 1}:`, e));
    }

    // Email al médico (solo primera sesión)
    if (doctorEmail && appointmentIds[0]) {
      sendNewAppointmentToDoctor({
        toEmail:       doctorEmail,
        doctorName,
        patientName,
        specialty,
        slotStart,
        appointmentId: appointmentIds[0],
      }).catch((e) => console.error("Doctor email error:", e));
    }

    // Email a admins
    const totalPagado = totalCharged;
    getAdminEmails().then((adminEmails) =>
      sendAdminSaleNotification({
        adminEmails,
        saleType: "appointment",
        patientName,
        items: [{ descripcion: `Teleconsulta — ${specialtyLabel} ×${sessions} sesión${sessions > 1 ? "es" : ""}`, qty: sessions, precio: pricePerSession }],
        total: totalPagado,
        paymentMethod: "Mercado Pago",
      })
    ).catch((e) => console.error("Admin email error:", e));

    return NextResponse.json({
      status:         "approved",
      appointmentIds,
      meetLinks,
      sessions,
    });
  } catch (err) {
    const detail = err instanceof Error
      ? { message: err.message, stack: err.stack }
      : err;
    console.error("[process-appointment] error:", JSON.stringify(detail, null, 2));
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
