"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, X } from "lucide-react";

export default function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  async function cancel() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .schema("medical")
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">¿Cancelar cita?</span>
        <button
          onClick={cancel}
          disabled={loading}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sí, cancelar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-500 border border-zinc-200 hover:border-rose-300 hover:text-rose-500 transition-all flex items-center gap-1"
    >
      <X className="w-3 h-3" /> Cancelar
    </button>
  );
}
