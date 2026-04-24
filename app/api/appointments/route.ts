import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendAppointmentConfirmation, sendNewAppointmentToDoctor, sendAdminSaleNotification } from "@/lib/emails";
import { getAdminEmails } from "@/lib/get-admin-emails";
import { createWherebyMeeting } from "@/lib/whereby/client";
import type { AppointmentSpecialty, MedicalAppointmentInsert } from "@/lib/supabase/database.types";
import { SPECIALTY_LABELS } from "@/lib/specialty-labels";
import { sanitizeError } from "@/lib/sanitize-error";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    // specialty reemplaza vertical; slotStart reemplaza scheduledAt
    const { doctorId, specialty, slotStart } = body as {
      doctorId:  string;
      specialty: string;
      slotStart: string; // ISO string
    };

    if (!doctorId || !specialty || !slotStart) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar perfil completo y consentimientos (SUSALUD gate)
    const [profileCheck, consentsCheck] = await Promise.all([
      supabase.schema("medical").from("profiles")
        .select("full_name, document_id, birth_date")
        .eq("id", user.id).single(),
      supabase.schema("medical").from("consent_records")
        .select("consent_type")
        .eq("patient_id", user.id).eq("accepted", true),
    ]);

    const profile = profileCheck.data;
    if (!profile?.document_id || !profile?.birth_date) {
      return NextResponse.json({ error: "Completa tu perfil (DNI y fecha de nacimiento) antes de agendar." }, { status: 403 });
    }

    const REQUIRED_CONSENTS = ["general_treatment", "telemedicine", "cannabis_use", "data_processing"];
    const accepted = new Set((consentsCheck.data ?? []).map((c) => c.consent_type));
    const missing = REQUIRED_CONSENTS.filter((t) => !accepted.has(t));
    if (missing.length > 0) {
      return NextResponse.json({ error: "Debes aceptar todos los consentimientos médicos antes de agendar." }, { status: 403 });
    }

    const patientName = profile?.full_name ?? "Paciente";

    // Obtener perfil del doctor desde medical schema
    const { data: doctorData } = await supabase
      .schema("medical")
      .from("profiles")
      .select("full_name")
      .eq("id", doctorId)
      .single();

    const doctorName = doctorData?.full_name ?? "Médico";

    const startDate = new Date(slotStart);
    const endDate   = new Date(startDate.getTime() + 25 * 60 * 1000); // +25 min

    const specialtyLabel = SPECIALTY_LABELS[specialty] ?? specialty;

    // Verificar conflicto de horario — previene double booking
    const { data: conflicts } = await supabase
      .schema("medical")
      .from("appointments")
      .select("id")
      .eq("doctor_id", doctorId)
      .in("status", ["confirmed", "pending"])
      .lt("slot_start", endDate.toISOString())
      .gt("slot_end", startDate.toISOString())
      .limit(1);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: "Este horario ya no está disponible. Por favor elige otro." },
        { status: 409 }
      );
    }

    // Intentar crear sala Whereby (HIPAA-compliant) — fallback a Google Meet
    let meetLink: string | null = null;
    let meetHostLink: string | null = null;
    let meetingProvider: string = "google_meet";
    let calendarLink: string | null = null;

    const whereby = await createWherebyMeeting(
      startDate.toISOString(),
      endDate.toISOString(),
      `consulta-${Date.now()}`
    );

    if (whereby) {
      meetLink      = whereby.roomUrl;
      meetHostLink  = whereby.hostRoomUrl;
      meetingProvider = "whereby";
    } else {
      // Fallback: Google Calendar con Meet
      try {
        const calendarEvent = await createCalendarEvent({
          title: `Consulta Organnical — ${specialtyLabel} · ${patientName}`,
          description: [
            `Teleconsulta de ${specialtyLabel}`,
            `Paciente: ${patientName}`,
            `Médico: ${doctorName}`,
            ``,
            `Plataforma: Organnical — Medicina Integrativa`,
            `Soporte: reservas@organnical.com | +51 952 476 574`,
          ].join("\n"),
          startTime: startDate.toISOString(),
          endTime:   endDate.toISOString(),
          attendeeEmails: [user.email!],
        });
        meetLink     = calendarEvent.meetLink;
        calendarLink = calendarEvent.htmlLink;
      } catch (calErr) {
        console.error("Google Calendar error (non-fatal):", calErr);
      }
    }

    // Insertar cita en medical.appointments
    const appointmentData: MedicalAppointmentInsert = {
      patient_id:        user.id,
      doctor_id:         doctorId,
      slot_start:        startDate.toISOString(),
      slot_end:          endDate.toISOString(),
      status:            "confirmed",
      specialty:         specialty as AppointmentSpecialty,
      meeting_link:      meetLink,
      meeting_provider:  meetingProvider as "google_meet" | "whereby",
      meeting_host_link: meetHostLink,
    };

    const { data: appointment, error: insertError } = await supabase
      .schema("medical")
      .from("appointments")
      .insert(appointmentData)
      .select("id")
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 });
    }

    // Registrar venta en Ruby (non-fatal)
    let precioFinalVenta = 60;
    try {
      const { data: cfg } = await supabase
        .from("consulta_config")
        .select("precio, descuento_porcentaje")
        .eq("id", 1)
        .single() as { data: { precio: number; descuento_porcentaje: number } | null };
      const precioBase = cfg?.precio ?? 60;
      const descuento  = cfg?.descuento_porcentaje ?? 0;
      const precioFinal = Math.round(precioBase * (1 - descuento / 100) * 100) / 100;
      precioFinalVenta = precioFinal;

      const { data: maxOrden } = await supabase
        .from("ventas")
        .select("num_orden")
        .order("num_orden", { ascending: false })
        .limit(1)
        .single() as { data: { num_orden: number } | null };
      const nextNum = (maxOrden?.num_orden ?? 0) + 1;

      const parts    = patientName.trim().split(" ");
      const nombre   = parts[0] ?? patientName;
      const apellido = parts.slice(1).join(" ") || "-";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("ventas").insert({
        num_orden:        nextNum,
        item:             `Teleconsulta — ${specialtyLabel}`,
        unidades:         1,
        precio_item:      precioFinal,
        precio_delivery:  0,
        total:            precioFinal,
        metodo_pago:      "Online",
        vendedor:         "Organnical.pe",
        nombre,
        apellido,
        fecha_compra:     new Date().toISOString().split("T")[0],
        comentarios:      `Cita ID: ${appointment.id} | Médico: ${doctorName}`,
      });
    } catch (ventaErr) {
      console.error("Venta insert error (non-fatal):", ventaErr);
    }

    // Emails de confirmación (no-fatal)
    sendAppointmentConfirmation({
      toEmail: user.email!, patientName, doctorName, specialty, slotStart, meetLink,
    }).catch((e) => console.error("Resend patient email error:", e));

    // Email a admins (non-fatal)
    getAdminEmails().then((adminEmails) =>
      sendAdminSaleNotification({
        adminEmails,
        saleType: "appointment",
        patientName,
        items: [{ descripcion: `Teleconsulta — ${specialtyLabel}`, qty: 1, precio: precioFinalVenta }],
        total: precioFinalVenta,
        paymentMethod: "Online",
      }).catch((e) => console.error("Admin appointment email error:", e))
    ).catch((e) => console.error("getAdminEmails error:", e));

    // Notificar al médico
    const { data: doctorAuth } = await createAdminClient().auth.admin.getUserById(doctorId);
    if (doctorAuth?.user?.email) {
      sendNewAppointmentToDoctor({
        toEmail:       doctorAuth.user.email,
        doctorName,
        patientName,
        specialty,
        slotStart,
        appointmentId: appointment.id,
      }).catch((e) => console.error("Resend doctor email error:", e));
    }

    return NextResponse.json({
      success:       true,
      appointmentId: appointment.id,
      meetLink,
      calendarLink,
    });
  } catch (err) {
    console.error("Booking error:", sanitizeError(err));
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
