import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";

const FROM = "Organnical <reservas@organnical.com>";
function getResend() { return new Resend(process.env.RESEND_API_KEY); }
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`reclamaciones:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en 15 minutos." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { tipo, nombre, dni, email, telefono, descripcion, pedido } = body;

    if (!tipo || !nombre || !dni || !email || !descripcion || !pedido) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .schema("medical")
      .from("reclamaciones")
      .insert({
        tipo,
        nombre,
        dni,
        email,
        telefono: telefono || null,
        descripcion,
        pedido,
        estado: "pendiente",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("reclamaciones insert error:", error);
      return NextResponse.json({ error: "Error al registrar la reclamación" }, { status: 500 });
    }

    const numeroReclamo = `ORG-REC-${new Date().getFullYear()}-${String(data.id).padStart(5, "0")}`;

    await supabase
      .schema("medical")
      .from("reclamaciones")
      .update({ numero_reclamo: numeroReclamo })
      .eq("id", data.id);

    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: "reservas@organnical.com",
      subject: `[Reclamo] ${numeroReclamo} — ${tipo} de ${nombre}`,
      html: `<h2>Nuevo Libro de Reclamaciones</h2><p><strong>Número:</strong> ${numeroReclamo}</p><p><strong>Tipo:</strong> ${tipo}</p><p><strong>Nombre:</strong> ${nombre}</p><p><strong>DNI:</strong> ${dni}</p><p><strong>Email:</strong> ${email}</p><p><strong>Teléfono:</strong> ${telefono || "—"}</p><hr/><p><strong>Descripción:</strong></p><p>${descripcion}</p><hr/><p><strong>Pedido:</strong></p><p>${pedido}</p>`,
    });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Hemos recibido tu reclamación — ${numeroReclamo}`,
      html: `<h2>Reclamación recibida</h2><p>Hola ${nombre},</p><p>Hemos recibido tu reclamación con el número <strong>${numeroReclamo}</strong>.</p><p>Responderemos en máximo <strong>15 días hábiles</strong> según la Ley 29571.</p><p>Consultas: <a href="mailto:reservas@organnical.com">reservas@organnical.com</a></p><p>Organnical Ventures S.A.C. · RUC 20607170615</p>`,
    });

    return NextResponse.json({ success: true, numero: numeroReclamo });
  } catch (err) {
    console.error("reclamaciones error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
