"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

type VerifyResult = {
  found: boolean;
  prescription_number?: string;
  issued_at?: string;
  valid_until?: string;
  status?: "VÁLIDA" | "VENCIDA";
  doctor_name?: string;
  doctor_cmp?: string;
  doctor_specialty?: string;
  ipress_code?: string;
  diagnosis_cie10?: string | null;
};

export default function VerificarRecetaPage() {
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!numero.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verificar-receta?numero=${encodeURIComponent(numero.trim().toUpperCase())}`);
      const data = await res.json() as VerifyResult & { error?: string };
      if (data.error) { setError(data.error); return; }
      setResult(data);
    } catch {
      setError("Error de conexión. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-20">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-violet-500 hover:underline mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-violet-50">
            <Search className="w-7 h-7 text-violet-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B1D35] mb-2">Verificar Receta</h1>
          <p className="text-zinc-500 text-sm">
            Ingresa el número de receta para verificar su autenticidad y vigencia.
            Este portal no muestra datos clínicos del paciente.
          </p>
        </div>

        <form onSubmit={handleVerify} className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6 shadow-sm">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Número de receta
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value.toUpperCase())}
              placeholder="Ej: ORG-2026-000001"
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-300 bg-zinc-50"
            />
            <button
              type="submit"
              disabled={loading || !numero.trim()}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Verificar
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {result && !result.found && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center">
            <XCircle className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <p className="font-semibold text-zinc-700">Receta no encontrada</p>
            <p className="text-xs text-zinc-400 mt-1">El número ingresado no corresponde a ninguna receta en nuestro sistema.</p>
          </div>
        )}

        {result?.found && (
          <div className={`rounded-2xl border p-6 ${result.status === "VÁLIDA" ? "bg-emerald-50 border-emerald-200" : "bg-zinc-50 border-zinc-200"}`}>
            <div className="flex items-center gap-3 mb-5">
              {result.status === "VÁLIDA"
                ? <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                : <XCircle className="w-8 h-8 text-zinc-400 flex-shrink-0" />
              }
              <div>
                <p className={`text-xl font-extrabold ${result.status === "VÁLIDA" ? "text-emerald-700" : "text-zinc-600"}`}>
                  Receta {result.status}
                </p>
                <p className="text-xs text-zinc-400 font-mono">{result.prescription_number}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Row label="Médico prescriptor" value={`Dr(a). ${result.doctor_name}`} />
              <Row label="CMP" value={result.doctor_cmp} />
              <Row label="Especialidad" value={result.doctor_specialty} />
              {result.diagnosis_cie10 && <Row label="Diagnóstico CIE-10" value={result.diagnosis_cie10} />}
              <Row label="Fecha de emisión" value={result.issued_at ? new Date(result.issued_at).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" }) : "—"} />
              <Row label="Válida hasta" value={result.valid_until ? new Date(result.valid_until).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" }) : "—"} />
              <Row label="IPRESS emisora" value={result.ipress_code} />
            </div>

            <p className="text-xs text-zinc-400 mt-5 border-t border-zinc-200 pt-4">
              Este portal no muestra el nombre del paciente ni los productos prescritos para proteger
              la privacidad del paciente conforme a la Ley N.° 29733.
              La receta es válida únicamente para el paciente indicado en el documento original.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-zinc-500 flex-shrink-0">{label}</span>
      <span className="font-semibold text-[#0B1D35] text-right">{value}</span>
    </div>
  );
}
