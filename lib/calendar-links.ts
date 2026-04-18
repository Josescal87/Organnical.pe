export interface CalendarEvent {
  title:       string;
  description: string;
  startISO:    string;
  endISO:      string;
  location?:   string;
}

function fmt(iso: string) {
  // "2026-04-17T09:00:00.000Z" → "20260417T090000Z"
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(e: CalendarEvent) {
  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     e.title,
    dates:    `${fmt(e.startISO)}/${fmt(e.endISO)}`,
    details:  e.description,
    ...(e.location ? { location: e.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function outlookUrl(e: CalendarEvent) {
  const params = new URLSearchParams({
    path:     "/calendar/action/compose",
    rru:      "addevent",
    subject:  e.title,
    startdt:  e.startISO,
    enddt:    e.endISO,
    body:     e.description,
    ...(e.location ? { location: e.location } : {}),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
}

export function icsContent(e: CalendarEvent) {
  const uid = `${Date.now()}@organnical.pe`;
  const now  = fmt(new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Organnical//Organnical.pe//ES",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${fmt(e.startISO)}`,
    `DTEND:${fmt(e.endISO)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${e.description.replace(/\n/g, "\\n")}`,
    e.location ? `LOCATION:${e.location}` : "",
    `URL:${e.location ?? "https://organnical.pe"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function downloadIcs(e: CalendarEvent) {
  const blob = new Blob([icsContent(e)], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "cita-organnical.ics";
  a.click();
  URL.revokeObjectURL(url);
}
