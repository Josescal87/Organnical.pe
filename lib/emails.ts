import { Resend } from "resend";

const FROM = "Organnical <onboarding@resend.dev>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const SPECIALTY_LABELS: Record<string, string> = {
  sleep:         "🌙 Sueño",
  pain:          "🦴 Dolor Crónico",
  anxiety:       "🧠 Ansiedad",
  womens_health: "🌸 Salud Femenina",
};

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Organnical</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#F472B6 0%,#A78BFA 50%,#38BDF8 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
            <p style="margin:0;color:white;font-size:24px;font-weight:900;letter-spacing:-0.5px">Organnical</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px">Medicina Integrativa</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:white;padding:40px;border-radius:0 0 16px 16px;border:1px solid #E4E4E7;border-top:none">
            ${content}
            <!-- Footer -->
            <hr style="border:none;border-top:1px solid #F4F4F5;margin:32px 0" />
            <p style="margin:0;color:#A1A1AA;font-size:12px;text-align:center">
              Organnical · Medicina Integrativa · Lima, Perú<br/>
              ¿Tienes dudas? Escríbenos a <a href="mailto:reservas@organnical.com" style="color:#A78BFA">reservas@organnical.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAppointmentConfirmation({
  toEmail,
  patientName,
  doctorName,
  specialty,
  slotStart,
  meetLink,
}: {
  toEmail: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  slotStart: string;
  meetLink: string | null;
}) {
  const date = new Date(slotStart);
  const dateStr = date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  const specialtyLabel = SPECIALTY_LABELS[specialty] ?? specialty;

  const meetSection = meetLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
        <tr><td align="center">
          <a href="${meetLink}" style="display:inline-block;background:linear-gradient(135deg,#F472B6 0%,#A78BFA 50%,#38BDF8 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px">
            📹 Unirse a Google Meet
          </a>
        </td></tr>
      </table>
      <p style="margin:0 0 24px;color:#71717A;font-size:13px;text-align:center">Guarda este link para el día de tu consulta.</p>`
    : `<p style="margin:0 0 24px;color:#71717A;font-size:13px;text-align:center">El link de videollamada estará disponible en tu dashboard pronto.</p>`;

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;color:#0B1D35;font-size:22px;font-weight:900">¡Cita confirmada! ✅</h1>
    <p style="margin:0 0 28px;color:#71717A;font-size:15px">Hola ${patientName}, tu consulta ha sido agendada correctamente.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
          <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Médico</p>
          <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">${doctorName}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
          <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Especialidad</p>
          <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">${specialtyLabel}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
          <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Fecha</p>
          <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">${dateStr}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0">
          <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Hora</p>
          <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">${timeStr} (Lima)</p>
        </td>
      </tr>
    </table>

    ${meetSection}

    <p style="margin:0;color:#71717A;font-size:13px">También puedes ver los detalles de tu cita en tu
      <a href="https://organnical-pe.vercel.app/dashboard/paciente/citas" style="color:#A78BFA;font-weight:600">dashboard de paciente</a>.
    </p>
  `);

  return getResend().emails.send({
    from: FROM,
    to: toEmail,
    subject: `✅ Cita confirmada — ${specialtyLabel} · ${dateStr}`,
    html,
  });
}

export async function sendPrescriptionNotification({
  toEmail,
  patientName,
  doctorName,
  items,
  validUntil,
}: {
  toEmail: string;
  patientName: string;
  doctorName: string;
  items: { nombre: string; quantity: number; dosage_instructions: string | null }[];
  validUntil: string;
}) {
  const validStr = new Date(validUntil).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

  const itemsHtml = items.map((it) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F4F4F5">
        <p style="margin:0;color:#0B1D35;font-size:14px;font-weight:600">${it.nombre} <span style="color:#A1A1AA;font-weight:400">×${it.quantity}</span></p>
        ${it.dosage_instructions ? `<p style="margin:2px 0 0;color:#71717A;font-size:12px">${it.dosage_instructions}</p>` : ""}
      </td>
    </tr>
  `).join("");

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;color:#0B1D35;font-size:22px;font-weight:900">Tu receta médica 📋</h1>
    <p style="margin:0 0 28px;color:#71717A;font-size:15px">Hola ${patientName}, el Dr./Dra. ${doctorName} ha emitido una receta para ti.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px">
      <tr><td>
        <p style="margin:0 0 12px;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Productos recetados</p>
        <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
      </td></tr>
    </table>

    <p style="margin:0 0 24px;color:#71717A;font-size:13px">Receta válida hasta <strong style="color:#0B1D35">${validStr}</strong>. Accede al catálogo de productos con tu receta activa.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td align="center">
        <a href="https://organnical-pe.vercel.app/dashboard/paciente/recetas" style="display:inline-block;background:#0B1D35;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px">
          Ver mi receta
        </a>
      </td></tr>
    </table>
  `);

  return getResend().emails.send({
    from: FROM,
    to: toEmail,
    subject: `📋 Tu receta médica de ${doctorName} — Organnical`,
    html,
  });
}

export async function sendNewAppointmentToDoctor({
  toEmail,
  doctorName,
  patientName,
  specialty,
  slotStart,
  appointmentId,
}: {
  toEmail: string;
  doctorName: string;
  patientName: string;
  specialty: string;
  slotStart: string;
  appointmentId: string;
}) {
  const date = new Date(slotStart);
  const dateStr = date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  const specialtyLabel = SPECIALTY_LABELS[specialty] ?? specialty;

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;color:#0B1D35;font-size:22px;font-weight:900">Nueva consulta agendada 🗓</h1>
    <p style="margin:0 0 28px;color:#71717A;font-size:15px">Hola ${doctorName}, tienes una nueva cita programada.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Paciente</p>
        <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">${patientName}</p>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Especialidad</p>
        <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">${specialtyLabel}</p>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Fecha</p>
        <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">${dateStr}</p>
      </td></tr>
      <tr><td style="padding:8px 0">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Hora</p>
        <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">${timeStr} (Lima)</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td align="center">
        <a href="https://organnical-pe.vercel.app/dashboard/medico/consultas/${appointmentId}" style="display:inline-block;background:#0B1D35;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px">
          Ver consulta
        </a>
      </td></tr>
    </table>
  `);

  return getResend().emails.send({
    from: FROM,
    to: toEmail,
    subject: `🗓 Nueva consulta — ${patientName} · ${dateStr}`,
    html,
  });
}
