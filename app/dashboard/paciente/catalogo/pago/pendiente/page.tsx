import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

export default function PagoPendientePage() {
  return (
    <div className="p-6 md:p-10 max-w-lg mx-auto text-center">
      <div className="bg-white rounded-2xl border border-zinc-100 p-12 shadow-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(251,191,36,0.12)" }}
        >
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">Pago en proceso</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Tu pago está siendo procesado. Recibirás un correo de confirmación cuando se acredite.
        </p>
        <Link
          href="/dashboard/paciente"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: G }}
        >
          <ArrowLeft className="w-4 h-4" /> Ir al inicio
        </Link>
      </div>
    </div>
  );
}
