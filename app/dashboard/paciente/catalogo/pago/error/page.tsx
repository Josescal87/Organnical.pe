import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

export default function PagoErrorPage() {
  return (
    <div className="p-6 md:p-10 max-w-lg mx-auto text-center">
      <div className="bg-white rounded-2xl border border-zinc-100 p-12 shadow-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(239,68,68,0.10)" }}
        >
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">Pago no completado</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Hubo un problema con tu pago. No se realizó ningún cobro. Puedes intentarlo nuevamente.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard/paciente/catalogo"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{ background: G }}
          >
            <RefreshCw className="w-4 h-4" /> Volver al catálogo
          </Link>
          <Link
            href="/dashboard/paciente"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-zinc-600 border border-zinc-200 hover:border-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
