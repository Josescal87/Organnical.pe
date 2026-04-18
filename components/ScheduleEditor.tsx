"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Loader2, Clock } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const DAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
];

// All possible 30-min slots: 7:00 → 19:00
const ALL_SLOTS: number[] = [];
for (let h = 7; h < 19; h++) {
  ALL_SLOTS.push(h);
  ALL_SLOTS.push(h + 0.5);
}

function slotLabel(slot: number) {
  const h = Math.floor(slot);
  const m = slot % 1 === 0.5 ? "30" : "00";
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m}${ampm}`;
}

interface Props {
  initialHours: number[];
  initialDays: number[];
}

export default function ScheduleEditor({ initialHours, initialDays }: Props) {
  const [selectedDays, setSelectedDays]   = useState<Set<number>>(new Set(initialDays.length ? initialDays : [1,2,3,4,5]));
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set(initialHours));
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  function toggleDay(d: number) {
    setSaved(false);
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function toggleSlot(slot: number) {
    setSaved(false);
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }

  // Select a contiguous range on shift-click
  function handleSlotClick(slot: number, e: React.MouseEvent) {
    if (e.shiftKey && selectedSlots.size > 0) {
      const last = Math.max(...Array.from(selectedSlots));
      const [from, to] = slot < last ? [slot, last] : [last, slot];
      const range = ALL_SLOTS.filter((s) => s >= from && s <= to);
      setSelectedSlots((prev) => {
        const next = new Set(prev);
        range.forEach((s) => next.add(s));
        return next;
      });
      return;
    }
    toggleSlot(slot);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autorizado");

      const sortedHours = Array.from(selectedSlots).sort((a, b) => a - b);
      const sortedDays  = Array.from(selectedDays).sort((a, b) => a - b);

      const { error: err } = await supabase
        .schema("medical")
        .from("profiles")
        .update({
          available_hours: sortedHours,
          available_days:  sortedDays,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (err) throw new Error(err.message);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const morning   = ALL_SLOTS.filter((s) => s >= 7  && s < 12);
  const afternoon = ALL_SLOTS.filter((s) => s >= 12 && s < 17);
  const evening   = ALL_SLOTS.filter((s) => s >= 17);
  const slotCount = selectedSlots.size;
  const dayCount  = selectedDays.size;

  return (
    <div className="space-y-5">
      {/* Days */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <h2 className="font-semibold text-sm text-zinc-700 mb-4">Días de atención</h2>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(({ value, label }) => {
            const active = selectedDays.has(value);
            return (
              <button
                key={value}
                onClick={() => toggleDay(value)}
                className={[
                  "rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all",
                  active
                    ? "text-white border-transparent shadow-sm"
                    : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-violet-300 hover:text-violet-600",
                ].join(" ")}
                style={active ? { background: G } : {}}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-sm text-zinc-700">Horarios de atención</h2>
          <span className="text-xs text-zinc-400">Shift+click para seleccionar rango</span>
        </div>
        <p className="text-xs text-zinc-400 mb-5">Los mismos horarios aplican a todos los días seleccionados.</p>

        <div className="space-y-5">
          <SlotSection emoji="🌅" label="Mañana" range="7:00 am – 11:30 am" slots={morning} selected={selectedSlots} onToggle={handleSlotClick} />
          <SlotSection emoji="☀️" label="Tarde"  range="12:00 pm – 4:30 pm" slots={afternoon} selected={selectedSlots} onToggle={handleSlotClick} />
          <SlotSection emoji="🌇" label="Noche"  range="5:00 pm – 6:30 pm" slots={evening}   selected={selectedSlots} onToggle={handleSlotClick} />
        </div>
      </div>

      {/* Summary + Save */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Clock className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          {dayCount === 0 || slotCount === 0 ? (
            <p className="text-sm text-zinc-400">Selecciona al menos un día y un horario.</p>
          ) : (
            <p className="text-sm text-zinc-600">
              <span className="font-semibold text-[#0B1D35]">{dayCount} día{dayCount !== 1 ? "s" : ""}</span>
              {" · "}
              <span className="font-semibold text-[#0B1D35]">{slotCount} bloque{slotCount !== 1 ? "s" : ""}</span>
              {" de 30 min · "}
              ~{slotCount * 30} min por día
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving || dayCount === 0 || slotCount === 0}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: G }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Guardando..." : "Guardar horario"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SlotSection({
  emoji, label, range, slots, selected, onToggle,
}: {
  emoji: string;
  label: string;
  range: string;
  slots: number[];
  selected: Set<number>;
  onToggle: (slot: number, e: React.MouseEvent) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{emoji}</span>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</span>
        <span className="text-xs text-zinc-300 ml-auto">{range}</span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={(e) => onToggle(slot, e)}
            className={[
              "rounded-lg py-1.5 px-1 text-xs font-semibold border transition-all text-center",
              selected.has(slot)
                ? "text-white border-transparent shadow-sm"
                : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-violet-300 hover:text-violet-600",
            ].join(" ")}
            style={selected.has(slot) ? { background: G } : {}}
          >
            {slotLabel(slot)}
          </button>
        ))}
      </div>
    </div>
  );
}
