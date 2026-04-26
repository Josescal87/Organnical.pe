import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import CatalogCart from "@/components/CatalogCart";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

type ProductoRow = {
  sku:              string;
  descripcion:      string;
  descripcion_corta: string | null;
  precio:           number;
  precio_oferta:    number | null;
  categoria:        string;
  imagen_url:       string | null;
  requiere_receta:  boolean;
};

export default async function CatalogoPacientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Productos libres (sin receta) — visibles para todos
  const { data: libresData } = await supabase
    .from("productos")
    .select("sku, descripcion, descripcion_corta, precio, precio_oferta, categoria, imagen_url, requiere_receta")
    .eq("requiere_receta", false)
    .eq("activo", true)
    .order("orden")
    .order("descripcion");

  const productosLibres = (libresData ?? []) as ProductoRow[];

  // Verificar si tiene receta activa
  const { data: activeRx } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select("id")
    .eq("patient_id", user.id)
    .gt("valid_until", new Date().toISOString())
    .limit(1);

  const hasActivePrescription = (activeRx?.length ?? 0) > 0;

  // Productos de receta — solo si tiene prescripción vigente
  let productosReceta: ProductoRow[] = [];
  if (hasActivePrescription) {
    const { data: itemsData } = await supabase
      .schema("medical")
      .from("prescription_items")
      .select("producto_sku, prescriptions!inner(patient_id, valid_until)")
      .eq("prescriptions.patient_id", user.id)
      .gt("prescriptions.valid_until", new Date().toISOString());

    const skus = [...new Set((itemsData ?? []).map((i) => i.producto_sku))];

    if (skus.length > 0) {
      const { data: rxProductos } = await supabase
        .from("productos")
        .select("sku, descripcion, descripcion_corta, precio, precio_oferta, categoria, imagen_url, requiere_receta")
        .in("sku", skus)
        .eq("activo", true);
      productosReceta = (rxProductos ?? []) as ProductoRow[];
    }
  }

  const hasProducts = productosLibres.length > 0 || productosReceta.length > 0;

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <BackLink href="/dashboard/paciente" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Catálogo</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {hasActivePrescription ? "Productos disponibles para ti." : "Productos disponibles · Agenda una cita para acceder al catálogo completo."}
        </p>
      </div>

      {!hasProducts ? (
        <div className="bg-white rounded-2xl p-12 border border-zinc-100 text-center">
          <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="font-semibold text-zinc-600">Catálogo en preparación</p>
          <p className="text-sm text-zinc-400 mt-1">Pronto tendremos productos disponibles para ti.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <CatalogCart productosLibres={productosLibres} productosReceta={productosReceta} />

          {!hasActivePrescription && (
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 flex items-center justify-between gap-4">
              <p className="text-sm text-zinc-500">Agenda una consulta para acceder a productos médicos personalizados.</p>
              <Link
                href="/agendar"
                className="shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-white"
                style={{ background: G }}
              >
                Agendar cita
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
