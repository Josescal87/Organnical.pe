import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };

const ALLOWED_ORIGIN = "https://organnical.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendEmails(p: Record<string, unknown>) {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: admins } = await sb
    .from("usuarios")
    .select("email")
    .eq("rol", "admin");

  const toEmails = [
    ...new Set([
      ...(admins || []).map((u: { email: string }) => u.email),
      p.vendedor_email as string,
    ]),
  ].filter(Boolean);

  if (!toEmails.length) return;

  const productosRows = ((p.productos as { descripcion: string; unidades: number; precio: number }[]) || [])
    .map((x) =>
      "<tr><td>" + x.descripcion + "</td><td align='center'>" + x.unidades +
      "</td><td align='right'>S/. " + Number(x.precio).toFixed(2) + "</td></tr>"
    )
    .join("");

  const html =
    "<!DOCTYPE html><html><body style='font-family:sans-serif;background:#f0eef8;padding:20px'>" +
    "<div style='max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden'>" +
    "<div style='background:#B8336A;padding:24px;text-align:center'>" +
    "<h2 style='color:#fff;margin:0'>Nueva Venta Registrada</h2></div>" +
    "<div style='padding:24px'>" +
    "<p style='font-size:28px;font-weight:800;color:#B8336A;margin:0 0 16px'>Orden #" + p.num_orden + "</p>" +
    "<table style='width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px'>" +
    "<tr><td style='color:#888;padding:4px 0;width:130px'>Cliente</td><td style='font-weight:600'>" + p.cliente + "</td></tr>" +
    "<tr><td style='color:#888;padding:4px 0'>Celular</td><td>" + (p.celular || "-") + "</td></tr>" +
    "<tr><td style='color:#888;padding:4px 0'>Distrito</td><td>" + (p.distrito || "-") + "</td></tr>" +
    "<tr><td style='color:#888;padding:4px 0'>Direccion</td><td>" + (p.direccion || "-") + "</td></tr>" +
    "<tr><td style='color:#888;padding:4px 0'>Metodo pago</td><td>" + p.metodo_pago + "</td></tr>" +
    "<tr><td style='color:#888;padding:4px 0'>Vendedor</td><td>" + p.vendedor_nombre + "</td></tr>" +
    "<tr><td style='color:#888;padding:4px 0'>Fecha</td><td>" + p.fecha + "</td></tr>" +
    "</table>" +
    "<p style='font-size:12px;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:6px'>Productos</p>" +
    "<table style='width:100%;font-size:13px;border-collapse:collapse'>" +
    "<tr style='background:#f0eef8'><th style='padding:6px;text-align:left'>Producto</th><th>Und.</th><th>Precio</th></tr>" +
    productosRows +
    "</table>" +
    "<div style='background:#B8336A;border-radius:8px;padding:12px 16px;margin-top:16px;display:flex;justify-content:space-between'>" +
    "<span style='color:#fff;font-weight:600'>TOTAL</span>" +
    "<span style='color:#fff;font-weight:800;font-size:20px'>S/. " + Number(p.total).toFixed(2) + "</span>" +
    "</div>" +
    (p.link_comprobante
      ? "<p style='margin-top:12px'><a href='" + p.link_comprobante + "' style='color:#B8336A'>Ver comprobante</a></p>"
      : "") +
    "</div>" +
    "<div style='background:#f9f7ff;padding:12px;text-align:center'>" +
    "<p style='margin:0;font-size:11px;color:#aaa'>Sistema de Gestion Interna - Organnical Ruby</p>" +
    "</div></div></body></html>";

  const RESEND_KEY = Deno.env.get("RESEND_API_KEY");

  await Promise.allSettled(
    toEmails.map((email) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + RESEND_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Organnical Ruby <reservas@organnical.com>",
          to: [email],
          subject: "Nueva Venta #" + p.num_orden + " - " + p.cliente,
          html: html,
        }),
      }).then((r) => r.json())
    )
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return unauthorized();

  try {
    const p = await req.json();

    // Responder inmediatamente y procesar en background para evitar EarlyDrop
    EdgeRuntime.waitUntil(sendEmails(p));

    return new Response(
      JSON.stringify({ ok: true, queued: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
