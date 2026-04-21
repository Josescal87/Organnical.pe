"use client";

import { useState } from "react";
import { updateIpressConfig, type IpressConfig } from "./actions";

const CATEGORY_OPTIONS = ["I-1", "I-2", "I-3", "I-4"];

export default function IpressForm({ initial }: { initial: IpressConfig }) {
  const [form, setForm] = useState<IpressConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function onChange(key: keyof IpressConfig, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await updateIpressConfig(form);
    setSaving(false);
    if (res.error) {
      setMsg({ type: "err", text: res.error });
    } else {
      setMsg({ type: "ok", text: "Configuración guardada correctamente." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          label="Código IPRESS (SUSALUD)"
          hint="Asignado por SUSALUD al registrar la IPRESS"
          value={form.ipress_code}
          onChange={(v) => onChange("ipress_code", v)}
          placeholder="Ej: 17-001234"
        />
        <Field
          label="Razón social"
          value={form.ipress_name}
          onChange={(v) => onChange("ipress_name", v)}
          placeholder="Ej: Organnical Salud S.A.C."
        />
        <Field
          label="RUC"
          value={form.ipress_ruc}
          onChange={(v) => onChange("ipress_ruc", v)}
          placeholder="20 dígitos"
          maxLength={11}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
            Categoría IPRESS
          </label>
          <select
            value={form.ipress_category}
            onChange={(e) => onChange("ipress_category", e.target.value)}
            className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-[#0B1D35] focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <Field
        label="Dirección"
        value={form.ipress_address}
        onChange={(v) => onChange("ipress_address", v)}
        placeholder="Ej: Av. Javier Prado Este 4600, San Borja, Lima"
      />

      <Field
        label="URL logo para PDFs"
        hint="Ruta pública de la imagen de cabecera en documentos médicos"
        value={form.pdf_header_logo_url}
        onChange={(v) => onChange("pdf_header_logo_url", v)}
        placeholder="/logo-organnical.png"
      />

      <div className="pt-2 border-t border-zinc-100">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Retención de datos (Ley 29733 + NTS 139-MINSA)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Retención HC (años)"
            hint="NTS 139-MINSA: mínimo 15 años"
            value={form.retention_years_clinical}
            onChange={(v) => onChange("retention_years_clinical", v)}
            placeholder="15"
          />
          <Field
            label="Retención pagos (años)"
            hint="Ley 29733 + SUNAT: mínimo 5 años"
            value={form.retention_years_payments}
            onChange={(v) => onChange("retention_years_payments", v)}
            placeholder="5"
          />
        </div>
      </div>

      {msg && (
        <p className={`text-sm rounded-xl px-4 py-3 ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
        style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
      >
        {saving ? "Guardando…" : "Guardar configuración"}
      </button>
    </form>
  );
}

function Field({
  label, hint, value, onChange, placeholder, maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-zinc-400 -mt-0.5">{hint}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-[#0B1D35] placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
      />
    </div>
  );
}
