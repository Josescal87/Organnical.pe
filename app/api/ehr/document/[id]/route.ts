export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BUCKET = "medical-documents";
const SIGNED_URL_TTL = 300; // 5 minutos

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const type = req.nextUrl.searchParams.get("type") ?? "encounter";

  const admin = adminClient();
  let storagePath: string | null = null;
  let patientId: string | null   = null;

  if (type === "encounter") {
    const { data: enc } = await admin
      .schema("medical")
      .from("clinical_encounters")
      .select("patient_id, doctor_id, status")
      .eq("id", id)
      .single();

    if (!enc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (enc.status !== "signed") return NextResponse.json({ error: "HC no firmada" }, { status: 400 });

    const role = user.user_metadata?.role;
    const canAccess =
      enc.patient_id === user.id ||
      enc.doctor_id  === user.id ||
      role === "admin";

    if (!canAccess) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    storagePath = `encounters/${enc.patient_id}/${id}.pdf`;
    patientId   = enc.patient_id;

  } else if (type === "prescription") {
    const { data: rx } = await admin
      .schema("medical")
      .from("prescriptions")
      .select("patient_id, doctor_id")
      .eq("id", id)
      .single();

    if (!rx) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const role = user.user_metadata?.role;
    const canAccess =
      rx.patient_id === user.id ||
      rx.doctor_id  === user.id ||
      role === "admin";

    if (!canAccess) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    storagePath = `prescriptions/${rx.patient_id}/${id}.pdf`;
    patientId   = rx.patient_id;
  } else {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const { data: signedData, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (error || !signedData?.signedUrl) {
    return NextResponse.json({ error: "No se pudo generar URL" }, { status: 500 });
  }

  // Audit log (non-fatal)
  try {
    await admin.schema("medical").rpc("log_event", {
      p_action: "download", p_resource_type: `${type}_pdf`,
      p_resource_id: id, p_patient_id: patientId,
    });
  } catch {}

  return NextResponse.json({ url: signedData.signedUrl, expires_in: SIGNED_URL_TTL });
}
