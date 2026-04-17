"use client";

import { useState, useTransition } from "react";
import { Stethoscope, Save } from "lucide-react";
import { updateClinicalNotes } from "./actions";

export default function ClinicalNotesEditor({
  aptId,
  initialNotes,
}: {
  aptId: string;
  initialNotes: string | null;
}) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateClinicalNotes(aptId, notes);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-100">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
        <Stethoscope className="w-3.5 h-3.5" /> Notas clínicas
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        placeholder="Escribe las observaciones clínicas de la consulta..."
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs">
          {error && <span className="text-red-500">{error}</span>}
          {saved && <span className="text-emerald-600 font-medium">✓ Notas guardadas</span>}
        </span>
        <button
          onClick={handleSave}
          disabled={pending}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-[#0B1D35] hover:bg-[#162d52] disabled:opacity-50 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {pending ? "Guardando..." : "Guardar notas"}
        </button>
      </div>
    </div>
  );
}
