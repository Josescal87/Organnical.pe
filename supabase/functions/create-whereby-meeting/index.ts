import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WHEREBY_API_KEY = Deno.env.get("WHEREBY_API_KEY")!;
const SUPABASE_URL    = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    // Supabase database webhooks envían { type, table, record, old_record }
    const record = payload.record ?? payload;
    const { id, slot_start, slot_end, meeting_link } = record;

    // Si ya tiene sala, no hacer nada
    if (meeting_link) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    if (!id || !slot_start || !slot_end) {
      return new Response(JSON.stringify({ error: "Faltan campos" }), { status: 400 });
    }

    // Crear sala Whereby
    const wherebyRes = await fetch("https://api.whereby.dev/v1/meetings", {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${WHEREBY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate:      slot_start,
        endDate:        slot_end,
        fields:         ["hostRoomUrl"],
        roomNamePrefix: `organnical-consulta-${id.slice(0, 8)}`,
        roomMode:       "normal",
      }),
    });

    if (!wherebyRes.ok) {
      const err = await wherebyRes.text();
      console.error("Whereby error:", err);
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const whereby = await wherebyRes.json();

    // Actualizar la cita con los links
    const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);
    const { error } = await supabase
      .schema("medical")
      .from("appointments")
      .update({
        meeting_link:      whereby.roomUrl,
        meeting_host_link: whereby.hostRoomUrl,
        meeting_provider:  "whereby",
      })
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log(`Whereby creado para cita ${id}: ${whereby.roomUrl}`);
    return new Response(JSON.stringify({ roomUrl: whereby.roomUrl }), { status: 200 });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
