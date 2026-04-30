/**
 * One-off: crea sala Whereby, actualiza la cita y envía emails con el link
 * para la cita insertada manualmente vía SQL.
 *
 * Uso:
 *   npx tsx scripts/send-appointment-emails.ts
 */

import { createClient } from "@supabase/supabase-js";
import { sendAppointmentConfirmation, sendNewAppointmentToDoctor } from "../lib/emails";
import { createWherebyMeeting } from "../lib/whereby/client";
import type { Database } from "../lib/supabase/database.types";

// ── env ──────────────────────────────────────────────────────────────────────
const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY");
  process.exit(1);
}

const adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_SECRET, {
  auth: { persistSession: false },
});

// ── datos fijos de la cita ────────────────────────────────────────────────────
const PATIENT_EMAIL = "reinjoque@gmail.com";
const DOCTOR_NAME   = "Dra. Poma";

async function main() {
  // 1. Buscar paciente en auth.users
  const { data: usersData, error: usersErr } =
    await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (usersErr) throw usersErr;

  const patient = usersData.users.find((u) => u.email === PATIENT_EMAIL);
  if (!patient) throw new Error(`No se encontró usuario con email ${PATIENT_EMAIL}`);
  console.log(`✓ Paciente: id=${patient.id}`);

  // 2. Buscar doctora en medical.profiles por nombre
  const { data: doctorProfile, error: doctorErr } = await adminClient
    .schema("medical")
    .from("profiles")
    .select("id, full_name")
    .eq("full_name", DOCTOR_NAME)
    .single();
  if (doctorErr || !doctorProfile) throw doctorErr ?? new Error("Doctora no encontrada");
  console.log(`✓ Doctora: ${doctorProfile.full_name} id=${doctorProfile.id}`);

  // 3. Buscar la cita (más reciente entre los dos)
  const { data: appointments, error: apptErr } = await adminClient
    .schema("medical")
    .from("appointments")
    .select("id, slot_start, slot_end, specialty, meeting_link, status")
    .eq("patient_id", patient.id)
    .eq("doctor_id", doctorProfile.id)
    .order("slot_start", { ascending: false })
    .limit(1);
  if (apptErr) throw apptErr;
  if (!appointments || appointments.length === 0)
    throw new Error("No se encontró la cita — ¿ejecutaste el SQL?");

  const appointment = appointments[0];
  console.log(`✓ Cita encontrada: ${appointment.slot_start}  id=${appointment.id}`);

  // 4. Crear sala Whereby
  // 4. Crear sala Whereby — llamada directa para ver el error real
  console.log("\nCreando sala Whereby...");
  const wherebyRes = await fetch("https://api.whereby.dev/v1/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHEREBY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate:      appointment.slot_start,
      endDate:        appointment.slot_end,
      fields:         ["hostRoomUrl"],
      roomNamePrefix: `/consulta-${Date.now()}`,
      roomMode:       "normal",
    }),
  });

  const wherebyBody = await wherebyRes.json();
  if (!wherebyRes.ok) {
    console.error("Whereby API error:", wherebyRes.status, JSON.stringify(wherebyBody));
    throw new Error("No se pudo crear la sala Whereby");
  }

  const whereby = {
    roomUrl:     wherebyBody.roomUrl as string,
    hostRoomUrl: wherebyBody.hostRoomUrl as string,
  };
  const _ = whereby; // usado abajo

  console.log(`✓ Sala creada`);
  console.log(`  Paciente (roomUrl):     ${whereby.roomUrl}`);
  console.log(`  Doctora  (hostRoomUrl): ${whereby.hostRoomUrl}`);

  // 5. Actualizar la cita en la BD
  const { error: updateErr } = await adminClient
    .schema("medical")
    .from("appointments")
    .update({
      meeting_link:      whereby.roomUrl,
      meeting_provider:  "whereby",
      meeting_host_link: whereby.hostRoomUrl,
    })
    .eq("id", appointment.id);
  if (updateErr) throw updateErr;
  console.log("✓ Cita actualizada en BD");

  // 6. Obtener nombres y emails
  const { data: patientProfile } = await adminClient
    .schema("medical")
    .from("profiles")
    .select("full_name")
    .eq("id", patient.id)
    .single();

  const patientName = patientProfile?.full_name ?? PATIENT_EMAIL;
  const doctorName  = doctorProfile.full_name ?? DOCTOR_NAME;

  const { data: doctorAuth } = await adminClient.auth.admin.getUserById(doctorProfile.id);
  const doctorEmail = doctorAuth?.user?.email;

  // 7. Email al paciente (con link de videollamada)
  console.log("\nEnviando email al paciente...");
  await sendAppointmentConfirmation({
    toEmail:     PATIENT_EMAIL,
    patientName,
    doctorName,
    specialty:   appointment.specialty,
    slotStart:   appointment.slot_start,
    meetLink:    whereby.roomUrl,
  });
  console.log("✓ Email paciente enviado");

  // 8. Email a la doctora (con link de host)
  if (doctorEmail) {
    console.log("Enviando email a la doctora...");
    await sendNewAppointmentToDoctor({
      toEmail:       doctorEmail,
      doctorName,
      patientName,
      specialty:     appointment.specialty,
      slotStart:     appointment.slot_start,
      appointmentId: appointment.id,
    });
    console.log("✓ Email doctora enviado");
  } else {
    console.warn("⚠ La doctora no tiene email en auth.users — email omitido.");
  }

  console.log("\n✓ Todo listo.");
  console.log(`  Link paciente: ${whereby.roomUrl}`);
  console.log(`  Link doctora:  ${whereby.hostRoomUrl}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
