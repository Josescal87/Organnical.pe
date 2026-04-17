import { google } from "googleapis";

const TIMEZONE = "America/Lima";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export interface CreateEventParams {
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  attendeeEmails: string[];
}

export interface CalendarEvent {
  eventId: string;
  meetLink: string | null;
  htmlLink: string;
}

export async function createCalendarEvent(
  params: CreateEventParams
): Promise<CalendarEvent> {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const { data } = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    conferenceDataVersion: 1, // generates Google Meet link
    sendUpdates: "none",
    requestBody: {
      summary: params.title,
      description: params.description,
      start: {
        dateTime: params.startTime,
        timeZone: TIMEZONE,
      },
      end: {
        dateTime: params.endTime,
        timeZone: TIMEZONE,
      },
      conferenceData: {
        createRequest: {
          requestId: `organnical-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 15 },
        ],
      },
    },
  });

  const meetLink =
    data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")
      ?.uri ?? null;

  return {
    eventId: data.id!,
    meetLink,
    htmlLink: data.htmlLink!,
  };
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    eventId,
    sendUpdates: "all",
  });
}

/**
 * Returns booked time slots for a given doctor on a given date (ISO date string).
 * Used to block unavailable slots in the booking UI.
 */
export async function getBusySlots(
  date: string // "YYYY-MM-DD"
): Promise<Array<{ start: string; end: string }>> {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const timeMin = `${date}T00:00:00-05:00`;
  const timeMax = `${date}T23:59:59-05:00`;

  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: TIMEZONE,
      items: [{ id: process.env.GOOGLE_CALENDAR_ID! }],
    },
  });

  const busy = data.calendars?.[process.env.GOOGLE_CALENDAR_ID!]?.busy ?? [];
  return busy.map((b) => ({ start: b.start!, end: b.end! }));
}
