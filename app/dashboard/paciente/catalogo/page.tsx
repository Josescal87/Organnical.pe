import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Lock, ShoppingBag } from "lucide-react";
import CatalogCart from "@/components/CatalogCart";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

type ProductoRow = {
  sku:         string;
  descripcion: string;
  precio:      number;
  categoria:   string;
};

export default async function CatalogoPacientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Paso 1: Verificar si tiene recetas activas
  const { data: activeRx } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select("id")
    .eq("patient_id", user.id)
    .gt("valid_until", new Date().toISOString())
    .limit(1);

  const hasActivePrescription = (activeRx?.length ?? 0) > 0;

  if (!hasActivePrescription) {
    return (
      <div className="p-6 md:p-10 max-w-5xl">
        <div className="mb-8">
          <Link href="/dashboard/paciente" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
          </Link>
          <h1 className="font-display text-2xl font-black text-[#0B1D35]">Catálogo</h1>
          <p className="text-zinc-500 text-sm mt-1">Acceso disponible con receta médica vigente.</p>
        </div>

        <div className="bg-white rounded-2xl p-12 border border-zinc-100 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(167,139,250,0.12)" }}>
            <Lock className="w-7 h-7 text-[#A78BFA]" />
          </div>
          <p className="font-display font-bold text-lg text-[#0B1D35] mb-2">Catálogo privado</p>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
            El catálogo de productos solo es accesible cuando tienes una receta médica vigente.
          </p>
          <Link
            href="/dashboard/paciente/citas"
            className="inline-flex items-center gap-2 mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: G }}
          >
            Ver mis citas
          </Link>
        </div>
      </div>
    );
  }

  // Paso 2: Obtener SKUs de productos en recetas activas del paciente
  // Nota: los joins cross-schema no son posibles via PostgREST, por eso hacemos 2 queries.
  const { data: itemsData } = await supabase
    .schema("medical")
    .from("prescription_items")
    .select("producto_sku, prescriptions!inner(patient_id, valid_until)")
    .eq("prescriptions.patient_id", user.id)
    .gt("prescriptions.valid_until", new Date().toISOString());

  const skus = [...new Set((itemsData ?? []).map((i) => i.producto_sku))];

  // Paso 3: Obtener detalles desde public.productos (catálogo maestro de OrgannicalRuby)
  const { data: productosData } = skus.length > 0
    ? await supabase
        .from("productos")
        .select("sku, descripcion, precio, categoria")
        .in("sku", skus)
    : { data: [] };

  const products = (productosData ?? []) as ProductoRow[];

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard/paciente" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
        </Link>
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Catálogo</h1>
        <p className="text-zinc-500 text-sm mt-1">Productos recetados disponibles para ti.</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-zinc-100 text-center">
          <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="font-semibold text-zinc-600">Sin productos asignados aún</p>
          <p className="text-sm text-zinc-400 mt-1">Tu médico aún no ha asignado productos a tu receta.</p>
        </div>
      ) : (
        <>
          <CatalogCart products={products} />
        </>
      )}
    </div>
  );
}
