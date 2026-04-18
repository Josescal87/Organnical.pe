import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendAppointmentConfirmation, sendNewAppointmentToDoctor } from "@/lib/emails";
import type { AppointmentSpecialty, MedicalAppointmentInsert } from "@/lib/supabase/database.types";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

const SPECIALTY_LABELS: Record<string, string> = {
  sleep:         "Sueño",
  pain:          "Dolor Crónico",
  anxiety:       "Ansiedad",
  womens_health: "Salud Femenina",
};

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

    // Obtener perfil del paciente desde medical schema
    const { data: patientData } = await supabase
      .schema("medical")
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const patientName = patientData?.full_name ?? "Paciente";

    // Obtener perfil del doctor desde medical schema
    const { data: doctorData } = await supabase
      .schema("medical")
      .from("profiles")
      .select("full_name")
      .eq("id", doctorId)
      .single();

    const doctorName = doctorData?.full_name ?? "Médico";

    const startDate = new Date(slotStart);
    const endDate   = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora

    const specialtyLabel = SPECIALTY_LABELS[specialty] ?? specialty;

    // Crear evento en Google Calendar (opcional — si falla la cita se crea igual)
    let meetLink: string | null = null;
    let calendarLink: string | null = null;
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

    // Insertar cita en medical.appointments
    const appointmentData: MedicalAppointmentInsert = {
      patient_id:   user.id,
      doctor_id:    doctorId,
      slot_start:   startDate.toISOString(),
      slot_end:     endDate.toISOString(),
      status:       "confirmed",
      specialty:    specialty as AppointmentSpecialty,
      meeting_link: meetLink,
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
    try {
      const { data: cfg } = await supabase
        .from("consulta_config")
        .select("precio, descuento_porcentaje")
        .eq("id", 1)
        .single() as { data: { precio: number; descuento_porcentaje: number } | null };
      const precioBase = cfg?.precio ?? 60;
      const descuento  = cfg?.descuento_porcentaje ?? 0;
      const precioFinal = Math.round(precioBase * (1 - descuento / 100) * 100) / 100;

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
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
