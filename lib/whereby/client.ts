// Whereby — HIPAA-compliant video platform
// Docs: https://docs.whereby.com/reference/whereby-rest-api-reference

export type WherebyMeeting = {
  meetingId: string;
  roomUrl: string;       // Patient-facing URL
  hostRoomUrl: string;   // Doctor-facing URL (with host controls)
  startDate: string;
  endDate: string;
};

export async function createWherebyMeeting(
  startDate: string,
  endDate: string,
  roomNamePrefix: string = "consulta"
): Promise<WherebyMeeting | null> {
  const apiKey = process.env.WHEREBY_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.whereby.dev/v1/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      fields: ["hostRoomUrl"],
      roomNamePrefix: `/${process.env.WHEREBY_SUBDOMAIN ?? "organnical"}/${roomNamePrefix}`,
      roomMode: "normal",
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return {
    meetingId:   data.meetingId,
    roomUrl:     data.roomUrl,
    hostRoomUrl: data.hostRoomUrl,
    startDate,
    endDate,
  };
}
