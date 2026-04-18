"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Loader2, Clock, Copy } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const DAYS = [
  { value: 1, label: "Lunes",   short: "Lun" },
  { value: 2, label: "Martes",  short: "Mar" },
  { value: 3, label: "Miérc.", short: "Mié" },
  { value: 4, label: "Jueves",  short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado",  short: "Sáb" },
];

// 30-min slots 7:00 → 19:00
const ALL_SLOTS: number[] = [];
for (let h = 7; h < 19; h++) {
  ALL_SLOTS.push(h);
  ALL_SLOTS.push(h + 0.5);
}

function slotLabel(slot: number) {
  const h    = Math.floor(slot);
  const m    = slot % 1 === 0.5 ? "30" : "00";
  const ampm = h < 12 ? "am" : "pm";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m}${ampm}`;
}

type WeeklySchedule = Record<number, number[]>; // day → slots

interface Props {
  initialSchedule: WeeklySchedule;
}

export default function ScheduleEditor({ initialSchedule }: Props) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => {
    const s: WeeklySchedule = {};
    DAYS.forEach(({ value }) => {
      s[value] = initialSchedule[value] ?? [];
    });
    return s;
  });
  const [activeDay, setActiveDay] = useState<number>(1);
  const [lastToggled, setLastToggled] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  function toggleSlot(slot: number, e: React.MouseEvent) {
    setSaved(false);
    setSchedule((prev) => {
      const current = new Set(prev[activeDay] ?? []);

      // Shift+click: fill range from lastToggled to this slot
      if (e.shiftKey && lastToggled !== null) {
        const [from, to] = lastToggled < slot
          ? [lastToggled, slot]
          : [slot, lastToggled];
        ALL_SLOTS.filter((s) => s >= from && s <= to).forEach((s) => current.add(s));
        return { ...prev, [activeDay]: Array.from(current).sort((a, b) => a - b) };
      }

      if (current.has(slot)) current.delete(slot);
      else current.add(slot);
      setLastToggled(slot);
      return { ...prev, [activeDay]: Array.from(current).sort((a, b) => a - b) };
    });
  }

  function clearDay() {
    setSaved(false);
    setSchedule((prev) => ({ ...prev, [activeDay]: [] }));
  }

  function copyFromDay(fromDay: number) {
    setSaved(false);
    setSchedule((prev) => ({ ...prev, [activeDay]: [...(prev[fromDay] ?? [])] }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autorizado");

      // Convert to string keys for JSONB
      const jsonSchedule: Record<string, number[]> = {};
      Object.entries(schedule).forEach(([k, v]) => {
        jsonSchedule[k] = v;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (supabase.schema("medical") as any)
        .from("profiles")
        .update({ weekly_schedule: jsonSchedule, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (err) throw new Error(err.message);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const currentSlots = new Set(schedule[activeDay] ?? []);
  const morning   = ALL_SLOTS.filter((s) => s >= 7  && s < 12);
  const afternoon = ALL_SLOTS.filter((s) => s >= 12 && s < 17);
  const evening   = ALL_SLOTS.filter((s) => s >= 17);

  const totalSlots = Object.values(schedule).reduce((acc, s) => acc + s.length, 0);
  const activeDays = DAYS.filter(({ value }) => (schedule[value]?.length ?? 0) > 0);

  // Days with slots (for copy-from dropdown)
  const otherDaysWithSlots = DAYS.filter(
    ({ value }) => value !== activeDay && (schedule[value]?.length ?? 0) > 0
  );

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4">
        <div className="flex flex-wrap gap-2 mb-1">
          {DAYS.map(({ value, short, label }) => {
            const count   = schedule[value]?.length ?? 0;
            const isActive = value === activeDay;
            return (
              <button
                key={value}
                onClick={() => { setActiveDay(value); setLastToggled(null); }}
                className={[
                  "relative rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all",
                  isActive
                    ? "text-white border-transparent shadow-sm"
                    : count > 0
                    ? "bg-violet-50 border-violet-200 text-violet-700"
                    : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:border-zinc-300",
                ].join(" ")}
                style={isActive ? { background: G } : {}}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{short}</span>
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] font-bold ${isActive ? "opacity-80" : "text-violet-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          {(schedule[activeDay]?.length ?? 0) === 0
            ? `${DAYS.find((d) => d.value === activeDay)?.label} — sin horarios`
            : `${DAYS.find((d) => d.value === activeDay)?.label} — ${schedule[activeDay].length} bloque${schedule[activeDay].length !== 1 ? "s" : ""} · ${schedule[activeDay].length * 30} min`}
        </p>
      </div>

      {/* Slot grid for active day */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Horarios — {DAYS.find((d) => d.value === activeDay)?.label}
          </p>
          <div className="flex items-center gap-2">
            {otherDaysWithSlots.length > 0 && (
              <div className="relative group">
                <button className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-violet-600 transition-colors border border-zinc-200 rounded-lg px-2.5 py-1.5">
                  <Copy className="w-3 h-3" />
                  Copiar de...
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-10 hidden group-hover:block min-w-[120px]">
                  {otherDaysWithSlots.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => copyFromDay(value)}
                      className="block w-full text-left px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {currentSlots.size > 0 && (
              <button
                onClick={clearDay}
                className="text-xs text-zinc-400 hover:text-red-500 transition-colors border border-zinc-200 rounded-lg px-2.5 py-1.5"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 mb-4">
          Click para activar/desactivar · Shift+click para seleccionar un rango
        </p>

        <div className="space-y-4">
          <SlotGroup label="Mañana" range="7:00 – 11:30 am" slots={morning} selected={currentSlots} onToggle={toggleSlot} />
          <SlotGroup label="Tarde"  range="12:00 – 4:30 pm"  slots={afternoon} selected={currentSlots} onToggle={toggleSlot} />
          <SlotGroup label="Noche"  range="5:00 – 6:30 pm"  slots={evening}   selected={currentSlots} onToggle={toggleSlot} />
        </div>
      </div>

      {/* Weekly summary */}
      {activeDays.length > 0 && (
        <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Resumen semanal</p>
          <div className="space-y-1.5">
            {activeDays.map(({ value, label }) => {
              const slots = schedule[value];
              const first = slotLabel(slots[0]);
              const last  = slotLabel(slots[slots.length - 1]);
              return (
                <div key={value} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-600 w-20">{label}</span>
                  <span className="text-zinc-400">{first} – {last}</span>
                  <span className="text-zinc-400">{slots.length} bloques</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 text-sm text-zinc-600">
          {totalSlots === 0
            ? <span className="text-zinc-400">Aún no has configurado ningún horario.</span>
            : <><span className="font-semibold text-[#0B1D35]">{activeDays.length} día{activeDays.length !== 1 ? "s" : ""}</span> · <span className="font-semibold text-[#0B1D35]">{totalSlots} bloques</span> en total esta semana</>}
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
            disabled={saving || totalSlots === 0}
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

function SlotGroup({
  label, range, slots, selected, onToggle,
}: {
  label: string;
  range: string;
  slots: number[];
  selected: Set<number>;
  onToggle: (slot: number, e: React.MouseEvent) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-zinc-500">{label}</span>
        <span className="text-[11px] text-zinc-300">{range}</span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={(e) => onToggle(slot, e)}
            className={[
              "rounded-lg py-1.5 text-xs font-semibold border transition-all text-center select-none",
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
