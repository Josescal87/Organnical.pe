"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DoctorEHRData = {
  cmp:             string;
  rne:             string;
  specialty_label: string;
};

const inputCls = "rounded-xl border border-zinc-200 px-3 py-2 text-sm text-[#0B1D35] focus:outline-none focus:ring-2 focus:ring-violet-400 w-full bg-white";
const labelCls = "text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block";

export default function DoctorEHRForm({ userId, initialData }: { userId: string; initialData: DoctorEHRData }) {
  const [form, setForm] = useState<DoctorEHRData>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .schema("medical")
      .from("profiles")
      .update({
        cmp:             form.cmp             || null,
        rne:             form.rne             || null,
        specialty_label: form.specialty_label || null,
        updated_at:      new Date().toISOString(),
      })
      .eq("id", userId);

    setSaving(false);
    setMsg(error
      ? { type: "err", text: error.message }
      : { type: "ok", text: "Datos profesionales guardados." }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-100 p-5">
      <h3 className="font-semibold text-[#0B1D35] mb-4">Datos profesionales (EHR)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>CMP</label>
          <input type="text" value={form.cmp} onChange={e => setForm(f => ({ ...f, cmp: e.target.value }))}
            placeholder="12345" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>RNE (Especialista)</label>
          <input type="text" value={form.rne} onChange={e => setForm(f => ({ ...f, rne: e.target.value }))}
            placeholder="RNE-XXXX" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Especialidad</label>
          <input type="text" value={form.specialty_label} onChange={e => setForm(f => ({ ...f, specialty_label: e.target.value }))}
            placeholder="Medicina del dolor" className={inputCls} />
        </div>
      </div>
      {msg && (
        <p className={`text-sm rounded-xl px-4 py-2 mt-3 ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}
      <button type="submit" disabled={saving}
        className="mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
        style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}>
        {saving ? "Guardando…" : "Guardar datos profesionales"}
      </button>
    </form>
  );
}
