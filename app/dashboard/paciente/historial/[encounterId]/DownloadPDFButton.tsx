"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function DownloadPDFButton({ encounterId }: { encounterId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ehr/document/${encounterId}?type=encounter`);
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.open(data.url, "_blank");
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 transition-colors"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</>
        : <><Download className="w-4 h-4" /> Descargar PDF</>
      }
    </button>
  );
}
