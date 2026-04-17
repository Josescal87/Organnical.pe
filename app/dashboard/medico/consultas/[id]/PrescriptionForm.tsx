"use client";

import { useState, useTransition } from "react";
import { FileText, Plus, Trash2, CheckCircle } from "lucide-react";
import { createPrescription, type PrescriptionItem } from "./actions";
import type { Producto } from "@/lib/supabase/database.types";

type ExistingPrescription = {
  id: string;
  issued_at: string;
  valid_until: string;
  items: { producto_sku: string; quantity: number; dosage_instructions: string | null; nombre: string }[];
};

export default function PrescriptionForm({
  aptId,
  patientId,
  productos,
  existing,
}: {
  aptId: string;
  patientId: string;
  productos: Producto[];
  existing: ExistingPrescription | null;
}) {
  const [items, setItems] = useState<PrescriptionItem[]>([
    { producto_sku: "", quantity: 1, dosage_instructions: "" },
  ]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (existing) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-zinc-100">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Receta emitida
        </p>
        <div className="flex items-center gap-2 mb-4 text-emerald-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">
            Receta emitida el {new Date(existing.issued_at).toLocaleDateString("es-PE")} · válida hasta {new Date(existing.valid_until).toLocaleDateString("es-PE")}
          </span>
        </div>
        <ul className="space-y-2">
          {existing.items.map((it, i) => (
            <li key={i} className="text-sm bg-zinc-50 rounded-xl px-4 py-2.5 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[#0B1D35]">{it.nombre}</p>
                {it.dosage_instructions && (
                  <p className="text-xs text-zinc-500 mt-0.5">{it.dosage_instructions}</p>
                )}
              </div>
              <span className="text-xs font-bold text-zinc-400 shrink-0">×{it.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-zinc-100 flex items-center gap-3 text-emerald-600">
        <CheckCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-semibold">Receta emitida correctamente. El paciente ya puede ver sus productos.</p>
      </div>
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { producto_sku: "", quantity: 1, dosage_instructions: "" }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof PrescriptionItem, value: string | number) {
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  }

  function handleSubmit() {
    setError(null);
    const invalid = items.find((it) => !it.producto_sku || it.quantity < 1);
    if (invalid) { setError("Completa todos los productos antes de emitir."); return; }
    startTransition(async () => {
      const result = await createPrescription(aptId, patientId, validUntil, items);
      if (result.error) { setError(result.error); }
      else { setDone(true); }
    });
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-100">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5" /> Emitir receta
      </p>

      <div className="mb-5">
        <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Válida hasta</label>
        <input
          type="date"
          value={validUntil}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setValidUntil(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
        />
      </div>

      <div className="space-y-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_auto] gap-2 items-start">
            <div className="space-y-1.5">
              <select
                value={item.producto_sku}
                onChange={(e) => updateItem(i, "producto_sku", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
              >
                <option value="">Seleccionar producto...</option>
                {productos.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.descripcion} — S/ {p.precio}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Instrucciones de dosificación (opcional)"
                value={item.dosage_instructions}
                onChange={(e) => updateItem(i, "dosage_instructions", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
              />
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
            />
            <button
              onClick={() => removeItem(i)}
              disabled={items.length === 1}
              className="rounded-xl p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-violet-700 mb-5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Agregar producto
      </button>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
      >
        <FileText className="w-4 h-4" />
        {pending ? "Emitiendo receta..." : "Emitir receta"}
      </button>
    </div>
  );
}
