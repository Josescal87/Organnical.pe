"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createOrUpdateBackground, type BackgroundFormData, type AllergyItem, type MedicationItem } from "./actions";

const SMOKING_OPTIONS = [
  { value: "never",   label: "Nunca fumó" },
  { value: "former",  label: "Ex-fumador" },
  { value: "current", label: "Fumador activo" },
];

const ALCOHOL_OPTIONS = [
  { value: "none",       label: "No consume" },
  { value: "occasional", label: "Ocasional" },
  { value: "regular",    label: "Regular" },
];

const SEVERITY_OPTIONS: { value: AllergyItem["severity"]; label: string }[] = [
  { value: "leve",     label: "Leve" },
  { value: "moderada", label: "Moderada" },
  { value: "grave",    label: "Grave" },
];

type Props = {
  patientId: string;
  initial: BackgroundFormData;
};

export default function BackgroundForm({ patientId, initial }: Props) {
  const [form, setForm] = useState<BackgroundFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await createOrUpdateBackground(patientId, form);
    setSaving(false);
    setMsg(res.error
      ? { type: "err", text: res.error }
      : { type: "ok", text: "Antecedentes guardados correctamente." }
    );
  }

  // ── helpers para arrays de strings
  function updateStrArray(key: keyof BackgroundFormData, idx: number, val: string) {
    const arr = [...(form[key] as string[])];
    arr[idx] = val;
    setForm(f => ({ ...f, [key]: arr }));
  }
  function addStrItem(key: keyof BackgroundFormData) {
    setForm(f => ({ ...f, [key]: [...(f[key] as string[]), ""] }));
  }
  function removeStrItem(key: keyof BackgroundFormData, idx: number) {
    const arr = (form[key] as string[]).filter((_, i) => i !== idx);
    setForm(f => ({ ...f, [key]: arr }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Condiciones crónicas */}
      <Section title="Condiciones crónicas">
        <StringList
          items={form.chronic_conditions}
          placeholder="Ej: Hipertensión arterial"
          onChange={(i, v) => updateStrArray("chronic_conditions", i, v)}
          onAdd={() => addStrItem("chronic_conditions")}
          onRemove={(i) => removeStrItem("chronic_conditions", i)}
        />
      </Section>

      {/* Alergias */}
      <Section title="Alergias">
        {form.allergies.map((a, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
            <input
              type="text"
              placeholder="Sustancia (ej: penicilina)"
              value={a.substance}
              onChange={e => {
                const arr = [...form.allergies];
                arr[i] = { ...arr[i], substance: e.target.value };
                setForm(f => ({ ...f, allergies: arr }));
              }}
              className={inputCls}
            />
            <input
              type="text"
              placeholder="Reacción (ej: urticaria)"
              value={a.reaction}
              onChange={e => {
                const arr = [...form.allergies];
                arr[i] = { ...arr[i], reaction: e.target.value };
                setForm(f => ({ ...f, allergies: arr }));
              }}
              className={inputCls}
            />
            <div className="flex gap-2">
              <select
                value={a.severity}
                onChange={e => {
                  const arr = [...form.allergies];
                  arr[i] = { ...arr[i], severity: e.target.value as AllergyItem["severity"] };
                  setForm(f => ({ ...f, allergies: arr }));
                }}
                className={`${inputCls} flex-1`}
              >
                {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button type="button" onClick={() => {
                setForm(f => ({ ...f, allergies: f.allergies.filter((_, idx) => idx !== i) }));
              }} className="p-2 text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <AddButton onClick={() => setForm(f => ({ ...f, allergies: [...f.allergies, { substance: "", reaction: "", severity: "leve" }] }))} label="Agregar alergia" />
      </Section>

      {/* Medicamentos actuales */}
      <Section title="Medicamentos actuales">
        {form.current_medications.map((m, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <input type="text" placeholder="Medicamento" value={m.name}
              onChange={e => {
                const arr = [...form.current_medications];
                arr[i] = { ...arr[i], name: e.target.value };
                setForm(f => ({ ...f, current_medications: arr }));
              }} className={inputCls} />
            <input type="text" placeholder="Dosis (ej: 10mg)" value={m.dose}
              onChange={e => {
                const arr = [...form.current_medications];
                arr[i] = { ...arr[i], dose: e.target.value };
                setForm(f => ({ ...f, current_medications: arr }));
              }} className={inputCls} />
            <div className="flex gap-2">
              <input type="text" placeholder="Frecuencia (ej: 1 vez/día)" value={m.frequency}
                onChange={e => {
                  const arr = [...form.current_medications];
                  arr[i] = { ...arr[i], frequency: e.target.value };
                  setForm(f => ({ ...f, current_medications: arr }));
                }} className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => {
                setForm(f => ({ ...f, current_medications: f.current_medications.filter((_, idx) => idx !== i) }));
              }} className="p-2 text-zinc-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <AddButton onClick={() => setForm(f => ({ ...f, current_medications: [...f.current_medications, { name: "", dose: "", frequency: "" }] }))} label="Agregar medicamento" />
      </Section>

      {/* Cirugías previas */}
      <Section title="Cirugías previas">
        <StringList
          items={form.previous_surgeries}
          placeholder="Ej: Apendicectomía 2018"
          onChange={(i, v) => updateStrArray("previous_surgeries", i, v)}
          onAdd={() => addStrItem("previous_surgeries")}
          onRemove={(i) => removeStrItem("previous_surgeries", i)}
        />
      </Section>

      {/* Hospitalizaciones */}
      <Section title="Hospitalizaciones previas">
        <StringList
          items={form.previous_hospitalizations}
          placeholder="Ej: Neumonía 2020, 5 días"
          onChange={(i, v) => updateStrArray("previous_hospitalizations", i, v)}
          onAdd={() => addStrItem("previous_hospitalizations")}
          onRemove={(i) => removeStrItem("previous_hospitalizations", i)}
        />
      </Section>

      {/* Antecedentes familiares */}
      <Section title="Antecedentes familiares">
        <StringList
          items={form.family_history}
          placeholder="Ej: Padre con diabetes tipo 2"
          onChange={(i, v) => updateStrArray("family_history", i, v)}
          onAdd={() => addStrItem("family_history")}
          onRemove={(i) => removeStrItem("family_history", i)}
        />
      </Section>

      {/* Hábitos */}
      <Section title="Hábitos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Tabaquismo</label>
            <div className="flex flex-col gap-2">
              {SMOKING_OPTIONS.map(o => (
                <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="smoking" value={o.value}
                    checked={form.smoking_status === o.value}
                    onChange={() => setForm(f => ({ ...f, smoking_status: o.value }))}
                    className="accent-violet-500" />
                  <span className="text-sm text-zinc-700">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Alcohol</label>
            <div className="flex flex-col gap-2">
              {ALCOHOL_OPTIONS.map(o => (
                <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="alcohol" value={o.value}
                    checked={form.alcohol_use === o.value}
                    onChange={() => setForm(f => ({ ...f, alcohol_use: o.value }))}
                    className="accent-violet-500" />
                  <span className="text-sm text-zinc-700">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {msg && (
        <p className={`text-sm rounded-xl px-4 py-3 ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <button type="submit" disabled={saving}
        className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
        style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}>
        {saving ? "Guardando…" : "Guardar antecedentes"}
      </button>
    </form>
  );
}

// ── Sub-componentes

const inputCls = "rounded-xl border border-zinc-200 px-3 py-2 text-sm text-[#0B1D35] placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-400 w-full";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5">
      <h3 className="font-semibold text-[#0B1D35] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StringList({ items, placeholder, onChange, onAdd, onRemove }: {
  items: string[];
  placeholder: string;
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input type="text" value={item} placeholder={placeholder}
            onChange={e => onChange(i, e.target.value)}
            className={`${inputCls} flex-1`} />
          <button type="button" onClick={() => onRemove(i)}
            className="p-2 text-zinc-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <AddButton onClick={onAdd} label="Agregar" />
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-700 font-semibold mt-1">
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );
}
