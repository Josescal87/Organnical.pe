"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Loader2, Clock } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

// All possible 30-min slots: 8:00 → 18:00 (exclusive of 18:00)
const ALL_SLOTS: number[] = [];
for (let h = 8; h < 18; h++) {
  ALL_SLOTS.push(h);       // e.g. 8.0 = 8:00
  ALL_SLOTS.push(h + 0.5); // e.g. 8.5 = 8:30
}

function slotLabel(slot: number) {
  const h = Math.floor(slot);
  const m = slot % 1 === 0.5 ? "30" : "00";
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m} ${ampm}`;
}

interface Props {
  initialHours: number[];
}

export default function ScheduleEditor({ initialHours }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set(initialHours));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(slot: number) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const sortedHours = Array.from(selected).sort((a, b) => a - b);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autorizado");

      const { error: err } = await supabase
        .schema("medical")
        .from("profiles")
        .update({ available_hours: sortedHours, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (err) throw new Error(err.message);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const morning = ALL_SLOTS.filter((s) => s < 12);
  const afternoon = ALL_SLOTS.filter((s) => s >= 12);
  const count = selected.size;

  return (
    <div className="space-y-6">
      {/* Morning */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🌅</span>
          <h2 className="font-semibold text-sm text-zinc-700">Mañana</h2>
          <span className="text-xs text-zinc-400 ml-auto">8:00 am – 11:30 am</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {morning.map((slot) => (
            <SlotButton key={slot} slot={slot} selected={selected.has(slot)} onToggle={toggle} />
          ))}
        </div>
      </div>

      {/* Afternoon */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">☀️</span>
          <h2 className="font-semibold text-sm text-zinc-700">Tarde</h2>
          <span className="text-xs text-zinc-400 ml-auto">12:00 pm – 5:30 pm</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {afternoon.map((slot) => (
            <SlotButton key={slot} slot={slot} selected={selected.has(slot)} onToggle={toggle} />
          ))}
        </div>
      </div>

      {/* Summary + Save */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Clock className="w-4 h-4 text-zinc-400" />
          <p className="text-sm text-zinc-600">
            {count === 0
              ? "No hay horarios seleccionados."
              : `${count} bloque${count !== 1 ? "s" : ""} seleccionado${count !== 1 ? "s" : ""} · ~${count * 30} min de atención diaria`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
          {error && (
            <span className="text-xs text-red-500">{error}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90"
            style={{ background: G }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Guardando..." : "Guardar horario"}
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-400 text-center">
        Los horarios aplican de lunes a viernes. Los fines de semana no se muestran a los pacientes.
      </p>
    </div>
  );
}

function SlotButton({
  slot,
  selected,
  onToggle,
}: {
  slot: number;
  selected: boolean;
  onToggle: (s: number) => void;
}) {
  return (
    <button
      onClick={() => onToggle(slot)}
      className={[
        "rounded-xl py-2 px-1 text-xs font-semibold border transition-all text-center",
        selected
          ? "text-white border-transparent shadow-sm"
          : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-violet-300 hover:text-violet-600",
      ].join(" ")}
      style={selected ? { background: G, border: "none" } : {}}
    >
      {slotLabel(slot)}
    </button>
  );
}
