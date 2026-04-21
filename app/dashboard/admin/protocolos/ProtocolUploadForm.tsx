"use client";

import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";

export default function ProtocolUploadForm({ slug, currentUrl }: { slug: string; currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setSaving(true); setError(null); setSaved(false);

    const res = await fetch("/api/admin/protocolos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, url: url.trim() }),
    });
    const data = await res.json() as { error?: string };

    setSaving(false);
    if (data.error) { setError(data.error); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  }

  return (
    <form onSubmit={handleSave} className="flex gap-2 items-start">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://... (URL pública del PDF)"
        className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
      />
      <button
        type="submit"
        disabled={saving || !url.trim()}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #A78BFA 0%, #38BDF8 100%)" }}
      >
        {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
        {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
