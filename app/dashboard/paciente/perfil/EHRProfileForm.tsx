"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type EHRData = {
  birth_date:    string;
  gender:        string;
  blood_type:    string;
  document_type: string;
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS     = [{ value: "M", label: "Masculino" }, { value: "F", label: "Femenino" }, { value: "otro", label: "Otro" }];
const DOC_TYPES   = ["DNI", "CE", "Pasaporte"];

const inputCls = "rounded-xl border border-zinc-200 px-3 py-2 text-sm text-[#0B1D35] focus:outline-none focus:ring-2 focus:ring-violet-400 w-full bg-white";
const labelCls = "text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block";

export default function EHRProfileForm({ userId, initialData }: { userId: string; initialData: EHRData }) {
  const [form, setForm] = useState<EHRData>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set(field: keyof EHRData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .schema("medical")
      .from("profiles")
      .update({
        birth_date:    form.birth_date    || null,
        gender:        form.gender        || null,
        blood_type:    form.blood_type    || null,
        document_type: form.document_type || null,
        updated_at:    new Date().toISOString(),
      })
      .eq("id", userId);

    setSaving(false);
    setMsg(error
      ? { type: "err", text: error.message }
      : { type: "ok", text: "Datos médicos guardados." }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-100 p-5">
      <h3 className="font-semibold text-[#0B1D35] mb-4">Datos médicos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Fecha de nacimiento</label>
          <input type="date" value={form.birth_date} onChange={e => set("birth_date", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sexo</label>
          <select value={form.gender} onChange={e => set("gender", e.target.value)} className={inputCls}>
            <option value="">Seleccionar…</option>
            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Tipo de documento</label>
          <select value={form.document_type} onChange={e => set("document_type", e.target.value)} className={inputCls}>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Grupo sanguíneo</label>
          <select value={form.blood_type} onChange={e => set("blood_type", e.target.value)} className={inputCls}>
            <option value="">No sé / No informar</option>
            {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
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
        {saving ? "Guardando…" : "Guardar datos médicos"}
      </button>
    </form>
  );
}
