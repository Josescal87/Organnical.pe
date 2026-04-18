import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Package, Download, CheckCircle, Clock } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import type { Producto } from "@/lib/supabase/database.types";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

type PrescriptionRow = {
  id: string;
  issued_at: string;
  valid_until: string;
  pdf_url: string | null;
  prescription_items: Array<{
    id: string;
    quantity: number;
    dosage_instructions: string | null;
    producto_sku: string;
  }>;
};

export default async function RecetasPacientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Obtener recetas con sus items (solo producto_sku, no join cross-schema)
  const { data: rxData } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select(`
      id, issued_at, valid_until, pdf_url,
      prescription_items (
        id, quantity, dosage_instructions, producto_sku
      )
    `)
    .eq("patient_id", user.id)
    .order("issued_at", { ascending: false });

  const prescriptions = (rxData ?? []) as unknown as PrescriptionRow[];

  // Recopilar todos los SKUs únicos para fetch en lote desde public.productos
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

  const active = prescriptions.filter((p) => new Date(p.valid_until) > new Date());
  const expired = prescriptions.filter((p) => new Date(p.valid_until) <= new Date());

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-8">
        <BackLink href="/dashboard/paciente" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Mis recetas</h1>
        <p className="text-zinc-500 text-sm mt-1">Recetas médicas emitidas por tu médico tratante.</p>
      </div>

      {prescriptions.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-zinc-100 text-center">
          <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="font-semibold text-zinc-600">Aún no tienes recetas</p>
          <p className="text-sm text-zinc-400 mt-1">Las recibirás tras completar tu primera consulta.</p>
        </div>
      )}

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Vigentes
          </h2>
          <div className="space-y-4">
            {active.map((rx) => <RecetaCard key={rx.id} rx={rx} isActive productosBySku={productosBySku} />)}
          </div>
        </section>
      )}

      {expired.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400" /> Vencidas
          </h2>
          <div className="space-y-4 opacity-70">
            {expired.map((rx) => <RecetaCard key={rx.id} rx={rx} isActive={false} productosBySku={productosBySku} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function RecetaCard({
  rx,
  isActive,
  productosBySku,
}: {
  rx: PrescriptionRow;
  isActive: boolean;
  productosBySku: Record<string, { sku: string; descripcion: string; categoria: string }>;
}) {
  const issued = new Date(rx.issued_at);
  const validUntil = new Date(rx.valid_until);
  const items = rx.prescription_items ?? [];

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
      {/* Header */}
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
            Emitida el {issued.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Válida hasta {validUntil.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {rx.pdf_url && (
            <a
              href={rx.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 hover:border-[#A78BFA] hover:text-[#A78BFA] transition-all"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </a>
          )}
          {isActive && (
            <Link
              href="/dashboard/paciente/catalogo"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white"
              style={{ background: G }}
            >
              <Package className="w-3.5 h-3.5" /> Ver productos
            </Link>
          )}
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Productos recetados ({items.length})
          </p>
          <div className="space-y-3">
            {items.map((item) => {
              const producto = productosBySku[item.producto_sku];
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)" }}>
                    <Package className="w-4 h-4 text-[#A78BFA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0B1D35]">
                      {producto?.descripcion ?? item.producto_sku}
                      <span className="ml-2 text-xs font-normal text-zinc-400">×{item.quantity}</span>
                    </p>
                    {producto?.categoria && (
                      <p className="text-xs text-[#A78BFA] font-medium">{producto.categoria}</p>
                    )}
                    {item.dosage_instructions && (
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{item.dosage_instructions}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
