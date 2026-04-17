import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCalendarEvent } from "@/lib/google-calendar";
import type { AppointmentSpecialty, MedicalAppointmentInsert } from "@/lib/supabase/database.types";

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

    // Crear evento en Google Calendar con link de Google Meet
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

    // Insertar cita en medical.appointments
    const appointmentData: MedicalAppointmentInsert = {
      patient_id:   user.id,
      doctor_id:    doctorId,
      slot_start:   startDate.toISOString(),
      slot_end:     endDate.toISOString(),
      status:       "confirmed",
      specialty:    specialty as AppointmentSpecialty,
      meeting_link: calendarEvent.meetLink,
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

    return NextResponse.json({
      success:       true,
      appointmentId: appointment.id,
      meetLink:      calendarEvent.meetLink,
      calendarLink:  calendarEvent.htmlLink,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Booking error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
