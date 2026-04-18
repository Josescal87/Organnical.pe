import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type ComboRow = { sesiones: number; precio: number; label: string | null };

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("consulta_combos")
    .select("sesiones, precio, label")
    .order("sesiones") as { data: ComboRow[] | null };

  return NextResponse.json(data ?? []);
}

export async function PUT(req: NextRequest) {
  // Solo accessible con service key (desde Ruby)
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.SUPABASE_SECRET_KEY}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const combos = await req.json() as ComboRow[];

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  for (const combo of combos) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from("consulta_combos").upsert({
      sesiones: combo.sesiones,
      precio:   combo.precio,
      label:    combo.label,
    });
  }

  return NextResponse.json({ ok: true });
}
