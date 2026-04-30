import { Resend } from "resend";

const resend         = new Resend("re_MwvUmuWy_ENKbxhhgegCS3BsxcB8jVebV");
const BASE_URL       = "https://organnical.pe";
const APPOINTMENT_ID = "9135b44c-fb09-497e-9516-fca6708da95b";
const meetLink       = "https://organnical.whereby.com/organnical-consulta-9135b44cc89ffde6-eee0-43d4-941b-2a1f53eeefd5";
const hostMeetLink   = "https://organnical.whereby.com/organnical-consulta-9135b44cc89ffde6-eee0-43d4-941b-2a1f53eeefd5?roomKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZWV0aW5nSWQiOiIxMjg3MzMzMDQiLCJyb29tUmVmZXJlbmNlIjp7InJvb21OYW1lIjoiL29yZ2FubmljYWwtY29uc3VsdGEtOTEzNWI0NGNjODlmZmRlNi1lZWUwLTQzZDQtOTQxYi0yYTFmNTNlZWVmZDUiLCJvcmdhbml6YXRpb25JZCI6IjMzOTA0MyJ9LCJpc3MiOiJodHRwczovL2FjY291bnRzLnNydi53aGVyZWJ5LmNvbSIsImlhdCI6MTc3NzQwOTcxMywicm9vbUtleVR5cGUiOiJtZWV0aW5nSG9zdCJ9.G7_w_RRtnar02IFwAppan_M4SJ3j9tnB-ODJuz630KQ";

const slotStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
const limaOpts  = { timeZone: "America/Lima" };
const dateStr   = slotStart.toLocaleDateString("es-PE", { ...limaOpts, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeStr   = slotStart.toLocaleTimeString("es-PE", { ...limaOpts, hour: "2-digit", minute: "2-digit" });

const doctorHtml = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px">
  <tr><td style="padding:32px 40px">
    <h1 style="margin:0 0 8px;color:#0B1D35;font-size:22px;font-weight:900">Nueva consulta agendada 🗓</h1>
    <p style="margin:0 0 28px;color:#71717A;font-size:15px">Hola Dra. Poma, tienes una nueva cita programada.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Paciente</p>
        <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">Jose Escalante</p>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Especialidad</p>
        <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">🌙 Sueño</p>
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
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
      <tr><td align="center">
        <a href="${hostMeetLink}" style="display:inline-block;background:#0B1D35;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px">
          📹 Iniciar videoconsulta
        </a>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td align="center">
        <a href="${BASE_URL}/dashboard/medico/consultas/${APPOINTMENT_ID}" style="display:inline-block;background:#F8FAFC;color:#0B1D35;text-decoration:none;padding:10px 24px;border-radius:12px;font-weight:600;font-size:13px;border:1px solid #E4E4E7">
          Ver consulta en dashboard
        </a>
      </td></tr>
    </table>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

const patientHtml = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px">
  <tr><td style="padding:32px 40px">
    <h1 style="margin:0 0 8px;color:#0B1D35;font-size:22px;font-weight:900">¡Cita confirmada! ✅</h1>
    <p style="margin:0 0 28px;color:#71717A;font-size:15px">Hola Jose, tu consulta ha sido agendada correctamente.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Médico</p>
        <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">Dra. Poma</p>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #E4E4E7">
        <p style="margin:0;color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase">Especialidad</p>
        <p style="margin:4px 0 0;color:#0B1D35;font-size:14px;font-weight:600">🌙 Sueño</p>
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
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
      <tr><td align="center">
        <a href="${meetLink}" style="display:inline-block;background:linear-gradient(135deg,#F472B6 0%,#A78BFA 50%,#38BDF8 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px">
          📹 Unirse a videoconsulta
        </a>
      </td></tr>
    </table>
    <p style="margin:0;color:#71717A;font-size:13px">También puedes ver los detalles en tu
      <a href="${BASE_URL}/dashboard/paciente/citas" style="color:#A78BFA;font-weight:600">dashboard de paciente</a>.
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

const [r1, r2] = await Promise.all([
  resend.emails.send({
    from:    "Organnical <reservas@organnical.com>",
    to:      "triyi39@gmail.com",
    subject: `🗓 Nueva consulta — Jose Escalante · ${dateStr}`,
    html:    doctorHtml,
  }),
  resend.emails.send({
    from:    "Organnical <reservas@organnical.com>",
    to:      "jose.escalanten@gmail.com",
    subject: `✅ Cita confirmada — 🌙 Sueño · ${dateStr}`,
    html:    patientHtml,
  }),
]);

if (r1.error) console.error("Error email médico:", r1.error);
else console.log("Email médico enviado:", r1.data);

if (r2.error) console.error("Error email paciente:", r2.error);
else console.log("Email paciente enviado:", r2.data);
