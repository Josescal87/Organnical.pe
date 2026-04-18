import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FileText, Package, Download } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import type { Producto } from "@/lib/supabase/database.types";

type PrescriptionRow = {
  id: string;
  issued_at: string;
  valid_until: string;
  pdf_url: string | null;
  patient_id: string;
  prescription_items: Array<{
    id: string;
    quantity: number;
    dosage_instructions: string | null;
    producto_sku: string;
  }>;
};

export default async function RecetasMedicoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rxData } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select(`
      id, issued_at, valid_until, pdf_url, patient_id,
      prescription_items (
        id, quantity, dosage_instructions, producto_sku
      )
    `)
    .eq("doctor_id", user.id)
    .order("issued_at", { ascending: false });

  const prescriptions = (rxData ?? []) as unknown as PrescriptionRow[];

  // Recopilar SKUs únicos para fetch en lote desde public.productos
  const allSkus = [...new Set(
    prescriptions.flatMap((rx) => rx.prescription_items?.map((i) => i.producto_sku) ?? [])
  )];

  const { data: productosData } = allSkus.length > 0
    ? await supabase
        .from("productos")
        .select("sku, descripcion, categoria")
        .in("sku", allSkus)
    : { data: [] };

  const productosBySku = Object.fromEntries(
    (productosData ?? [] as Pick<Producto, "sku" | "descripcion" | "categoria">[]).map((p) => [p.sku, p])
  );

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-8">
        <BackLink href="/dashboard/medico" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Recetas emitidas</h1>
        <p className="text-zinc-500 text-sm mt-1">{prescriptions.length} receta{prescriptions.length !== 1 ? "s" : ""} en el historial.</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-zinc-100 text-center">
          <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="font-semibold text-zinc-600">Aún no has emitido recetas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => {
            const issued = new Date(rx.issued_at);
            const validUntil = new Date(rx.valid_until);
            const isActive = validUntil > new Date();
            const items = rx.prescription_items ?? [];

            return (
              <div key={rx.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="p-5 flex items-start justify-between gap-4 border-b border-zinc-50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isActive ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {isActive ? "Vigente" : "Vencida"}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-[#0B1D35]">
                      Emitida {issued.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Válida hasta {validUntil.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  {rx.pdf_url && (
                    <a
                      href={rx.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 hover:border-[#A78BFA] hover:text-[#A78BFA] transition-all flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Productos ({items.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => {
                        const producto = productosBySku[item.producto_sku];
                        return (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600"
                          >
                            <Package className="w-3 h-3 text-[#A78BFA]" />
                            {producto?.descripcion ?? item.producto_sku} ×{item.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
