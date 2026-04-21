"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function AuditExportButton() {
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [open, setOpen] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const url = `/api/admin/audit-export?from=${from}T00:00:00Z&to=${to}T23:59:59Z`;
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `audit-log-${from}-${to}.csv`;
      a.click();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Exportar CSV
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl border border-zinc-100 shadow-lg p-4 w-64">
          <p className="text-xs font-semibold text-zinc-600 mb-3">Rango de fechas</p>
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Desde</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-2 py-1.5 text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Hasta</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-2 py-1.5 text-xs" />
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #A78BFA 0%, #38BDF8 100%)" }}
          >
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando…</> : <><Download className="w-3.5 h-3.5" /> Descargar</>}
          </button>
        </div>
      )}
    </div>
  );
}
