"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { updateWhatsAppOptIn } from "./actions";

export default function WhatsAppOptIn({ userId, initial }: { userId: string; initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !enabled;
    setEnabled(next);
    await updateWhatsAppOptIn(userId, next);
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#0B1D35]">Recordatorios por WhatsApp</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Recibe recordatorios de citas por WhatsApp. Solo mensajes logísticos — nunca datos clínicos.
            Puedes desactivarlo en cualquier momento.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={saving}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-emerald-400" : "bg-zinc-200"}`}
          aria-label={enabled ? "Desactivar WhatsApp" : "Activar WhatsApp"}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>
    </div>
  );
}
