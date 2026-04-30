"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createOrUpdateBackground, type BackgroundFormData } from "../antecedentes/actions";
import { useRouter } from "next/navigation";

const CHRONIC_CONDITIONS = [
  "Insomnio crónico",
  "Ansiedad generalizada",
  "Estrés crónico",
  "Depresión",
  "Hipertensión",
  "Diabetes tipo 2",
  "Hipotiroidismo",
  "Fibromialgia",
  "Dolor lumbar crónico",
  "Dolor articular crónico",
  "Migraña / Cefalea crónica",
  "Artritis / Artrosis",
  "Menopausia / Perimenopausia",
  "SOP",
  "Endometriosis",
  "Asma / EPOC",
  "Gastritis / Reflujo",
];

const inputCls = "rounded-xl border border-zinc-200 px-3 py-2 text-sm text-[#0B1D35] placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-400 w-full";

type Props = {
  patientId: string;
  initial: BackgroundFormData;
};

export default function ExpressForm({ patientId, initial }: Props) {
  const router = useRouter();
  const [checkedConditions, setCheckedConditions] = useState<string[]>(
    () => initial.chronic_conditions.filter(c => CHRONIC_CONDITIONS.includes(c))
  );
  const [otherConditions, setOtherConditions] = useState<string>(
    () => initial.chronic_conditions.filter(c => !CHRONIC_CONDITIONS.includes(c)).join(", ")
  );
  const [medications, setMedications] = useState<{ name: string; dose: string }[]>(
    () => initial.current_medications.map(m => ({ name: m.name, dose: m.dose }))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function toggleCondition(condition: string) {
    setCheckedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const finalConditions = [
      ...checkedConditions,
      ...(otherConditions.trim() ? [otherConditions.trim()] : []),
    ];

    const res = await createOrUpdateBackground(patientId, {
      ...initial,
      chronic_conditions: finalConditions,
      current_medications: medications.map(m => ({ name: m.name, dose: m.dose, frequency: "" })),
    });

    setSaving(false);
    if (res.error) {
      setMsg({ type: "err", text: res.error });
    } else {
      router.push(`/dashboard/medico/pacientes/${patientId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Antecedentes */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5">
        <h3 className="font-semibold text-[#0B1D35] mb-4">Antecedentes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-4">
          {CHRONIC_CONDITIONS.map(condition => (
            <label key={condition} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedConditions.includes(condition)}
                onChange={() => toggleCondition(condition)}
                className="accent-violet-500 w-4 h-4 rounded"
              />
              <span className="text-sm text-zinc-700">{condition}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Otro</label>
          <input
            type="text"
            value={otherConditions}
            onChange={e => setOtherConditions(e.target.value)}
            placeholder="Otras condiciones no listadas…"
            className={inputCls}
          />
        </div>
      </div>

      {/* Medicamentos habituales */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5">
        <h3 className="font-semibold text-[#0B1D35] mb-4">Medicamentos habituales</h3>
        <div className="space-y-2 mb-3">
          {medications.map((m, i) => (
            <div key={i} className="flex gap-2 items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <input
                type="text"
                placeholder="Medicamento"
                value={m.name}
                onChange={e => {
                  const arr = [...medications];
                  arr[i] = { ...arr[i], name: e.target.value };
                  setMedications(arr);
                }}
                className={`${inputCls} flex-1`}
              />
              <input
                type="text"
                placeholder="Dosis (ej: 10mg)"
                value={m.dose}
                onChange={e => {
                  const arr = [...medications];
                  arr[i] = { ...arr[i], dose: e.target.value };
                  setMedications(arr);
                }}
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => setMedications(prev => prev.filter((_, idx) => idx !== i))}
                className="p-2 text-zinc-400 hover:text-red-500 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMedications(prev => [...prev, { name: "", dose: "" }])}
          className="flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-700 font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar medicamento
        </button>
      </div>

      {msg && (
        <p className={`text-sm rounded-xl px-4 py-3 ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
        style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
      >
        {saving ? "Guardando…" : "Guardar y continuar →"}
      </button>
    </form>
  );
}
