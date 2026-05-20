"use client";

import { useState } from "react";
import { markContacted, markCompleted } from "./actions";
import { Loader2, CheckCircle, MessageCircle } from "lucide-react";

export function MarkContactedButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      disabled={disabled || loading}
      onClick={async () => {
        setLoading(true);
        await markContacted(id);
        setLoading(false);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3" />}
      Marcar contactada
    </button>
  );
}

export function MarkCompletedButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
      >
        <CheckCircle className="w-3 h-3" />
        Marcar completada
      </button>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas post-consulta (opcional)..."
        rows={2}
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
      />
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await markCompleted(id, notes);
            setLoading(false);
            setOpen(false);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          Confirmar
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
