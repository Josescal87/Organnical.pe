"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { updateAppointmentStatus } from "./actions";
import type { AppointmentStatus } from "@/lib/supabase/database.types";

const TRANSITIONS: Record<
  AppointmentStatus,
  { label: string; next: "confirmed" | "completed" | "cancelled"; icon: React.ReactNode; style: string }[]
> = {
  pending: [
    { label: "Confirmar cita", next: "confirmed", icon: <CheckCircle className="w-4 h-4" />, style: "bg-sky-600 hover:bg-sky-700 text-white" },
    { label: "Cancelar",       next: "cancelled", icon: <XCircle    className="w-4 h-4" />, style: "bg-zinc-100 hover:bg-zinc-200 text-zinc-600" },
  ],
  confirmed: [
    { label: "Marcar completada", next: "completed", icon: <CheckCircle className="w-4 h-4" />, style: "bg-emerald-600 hover:bg-emerald-700 text-white" },
    { label: "Cancelar",          next: "cancelled", icon: <XCircle    className="w-4 h-4" />, style: "bg-zinc-100 hover:bg-zinc-200 text-zinc-600" },
  ],
  completed: [],
  cancelled: [],
};

export default function StatusButtons({
  aptId,
  currentStatus,
}: {
  aptId: string;
  currentStatus: AppointmentStatus;
}) {
  const transitions = TRANSITIONS[currentStatus];
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!transitions.length) return null;

  function handleUpdate(next: "confirmed" | "completed" | "cancelled") {
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatus(aptId, next);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-100">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5" /> Gestión de estado
      </p>
      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <button
            key={t.next}
            onClick={() => handleUpdate(t.next)}
            disabled={pending}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors ${t.style}`}
          >
            {t.icon}
            {pending ? "Actualizando..." : t.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
    </div>
  );
}
