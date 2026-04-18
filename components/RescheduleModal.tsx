"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Calendar, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const DEFAULT_HOURS = [9, 9.5, 10, 10.5, 11, 14, 14.5, 15, 15.5, 16, 16.5, 17];
type WeeklySchedule = Record<string, number[]>;

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function generateSlots(date: Date, schedule: WeeklySchedule, booked: string[]): string[] {
  const hours = schedule[String(date.getDay())];
  if (!hours?.length) return [];
  return hours
    .map((h) => {
      const slot = new Date(date);
      slot.setHours(Math.floor(h), h % 1 === 0.5 ? 30 : 0, 0, 0);
      return slot.toISOString();
    })
    .filter((iso) => {
      const s = new Date(iso);
      return (
        s > new Date() &&
        !booked.some((b) => {
          const bk = new Date(b);
          return (
            bk.toDateString() === s.toDateString() &&
            bk.getHours() === s.getHours() &&
            bk.getMinutes() === s.getMinutes()
          );
        })
      );
    });
}

interface Props {
  appointmentId: string;
  doctorId: string;
  currentSlotStart: string;
}

export function RescheduleModal({ appointmentId, doctorId, currentSlotStart }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState("");
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    "1": DEFAULT_HOURS, "2": DEFAULT_HOURS, "3": DEFAULT_HOURS,
    "4": DEFAULT_HOURS, "5": DEFAULT_HOURS,
  });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const allDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));
  const visibleDays = allDays.slice(dayOffset, dayOffset + 7);
  const slots = generateSlots(selectedDate, schedule, bookedSlots);

  // Fetch doctor's weekly schedule on open
  useEffect(() => {
    if (!open) return;
    createClient()
      .schema("medical")
      .from("profiles")
      .select("weekly_schedule")
      .eq("id", doctorId)
      .single()
      .then(({ data }) => {
        if (data?.weekly_schedule) setSchedule(data.weekly_schedule as WeeklySchedule);
      });
  }, [open, doctorId]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!open) return;
    setLoadingSlots(true);
    setSelectedSlot("");
    const dateStr = selectedDate.toISOString().split("T")[0];
    createClient()
      .schema("medical")
      .from("appointments")
      .select("slot_start")
      .eq("doctor_id", doctorId)
      .gte("slot_start", `${dateStr}T00:00:00`)
      .lte("slot_start", `${dateStr}T23:59:59`)
      .in("status", ["pending", "confirmed"])
      .then(({ data }) => {
        setBookedSlots(
          (data ?? []).map((d) => d.slot_start).filter((s) => s !== currentSlotStart)
        );
        setLoadingSlots(false);
      });
  }, [open, doctorId, selectedDate, currentSlotStart]);

  function handleClose() {
    setOpen(false);
    setSelectedDate(addDays(new Date(), 1));
    setSelectedSlot("");
    setDayOffset(0);
  }

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSaving(true);
    const slotStart = new Date(selectedSlot);
    const slotEnd = new Date(slotStart.getTime() + 25 * 60 * 1000);
    const { error } = await createClient()
      .schema("medical")
      .from("appointments")
      .update({ slot_start: slotStart.toISOString(), slot_end: slotEnd.toISOString() })
      .eq("id", appointmentId);
    setSaving(false);
    if (error) {
      toast.error("No se pudo reprogramar. Intenta de nuevo.");
    } else {
      toast.success("Cita reprogramada correctamente.");
      handleClose();
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-500 border border-zinc-200 hover:border-[#A78BFA] hover:text-[#A78BFA] transition-all flex items-center gap-1"
      >
        <Calendar className="w-3 h-3" /> Reprogramar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-black text-[#0B1D35]">Reprogramar cita</h3>
              <button onClick={handleClose} className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Date picker */}
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Elige una fecha</p>
            <div className="flex items-center gap-1 mb-4">
              <button
                onClick={() => setDayOffset(Math.max(0, dayOffset - 7))}
                disabled={dayOffset === 0}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 disabled:opacity-20 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 grid grid-cols-7 gap-1">
                {visibleDays.map((day) => {
                  const sel = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`flex flex-col items-center py-2 rounded-xl text-xs transition-all ${
                        sel ? "text-white font-bold" : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                      style={sel ? { background: G } : {}}
                    >
                      <span className="text-[9px] opacity-70 uppercase">
                        {day.toLocaleDateString("es-PE", { weekday: "short" })}
                      </span>
                      <span className="text-sm font-bold leading-tight">{day.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setDayOffset(Math.min(allDays.length - 7, dayOffset + 7))}
                disabled={dayOffset + 7 >= allDays.length}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 disabled:opacity-20 transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slot picker */}
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Elige un horario</p>
            <div className="min-h-[88px] mb-5">
              {loadingSlots ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-6">Sin horarios disponibles este día.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((iso) => {
                    const t = new Date(iso);
                    const sel = iso === selectedSlot;
                    return (
                      <button
                        key={iso}
                        onClick={() => setSelectedSlot(iso)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                          sel
                            ? "text-white"
                            : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-100"
                        }`}
                        style={sel ? { background: G } : {}}
                      >
                        {t.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              disabled={!selectedSlot || saving}
              onClick={handleConfirm}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: G }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar nueva fecha
            </button>
          </div>
        </div>
      )}
    </>
  );
}
