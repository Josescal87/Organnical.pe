import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("consulta_config")
    .select("precio, descuento_porcentaje, promo_label")
    .eq("id", 1)
    .single() as { data: { precio: number; descuento_porcentaje: number; promo_label: string } | null };

  const precioBase = data?.precio ?? 60;
  const descuento = data?.descuento_porcentaje ?? 0;
  const precioFinal = Math.round(precioBase * (1 - descuento / 100) * 100) / 100;

  return NextResponse.json({
    precioBase,
    descuento,
    precioFinal,
    promoLabel: data?.promo_label ?? "",
  });
}
