"use client";

import { CreditCard } from "lucide-react";

export type DocType = "DNI" | "CE" | "Pasaporte";

export const DOC_TYPES: DocType[] = ["DNI", "CE", "Pasaporte"];

export const DOC_PLACEHOLDERS: Record<DocType, string> = {
  DNI: "12345678",
  CE: "001234567",
  Pasaporte: "AB123456",
};

export const DOC_MAX_LENGTH: Record<DocType, number> = {
  DNI: 8,
  CE: 12,
  Pasaporte: 12,
};

export function validateDocId(type: DocType, value: string): string | null {
  if (!value.trim()) return null;
  if (type === "DNI") {
    if (!/^\d{8}$/.test(value)) return "El DNI debe tener exactamente 8 dígitos.";
  } else if (type === "CE") {
    if (!/^[A-Za-z0-9]{9,12}$/.test(value)) return "El CE debe tener entre 9 y 12 caracteres alfanuméricos.";
  } else if (type === "Pasaporte") {
    if (!/^[A-Za-z0-9]{6,12}$/.test(value)) return "El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos.";
  }
  return null;
}

interface Props {
  docType: DocType;
  docId: string;
  onDocTypeChange: (t: DocType) => void;
  onDocIdChange: (v: string) => void;
  required?: boolean;
  error?: string | null;
  className?: string;
  inputClassName?: string;
  dark?: boolean;
}

export default function DocumentInput({
  docType,
  docId,
  onDocTypeChange,
  onDocIdChange,
  required = false,
  error,
  className = "",
  inputClassName = "",
  dark = false,
}: Props) {
  const isNumeric = docType === "DNI";

  function handleIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = isNumeric
      ? e.target.value.replace(/\D/g, "")
      : e.target.value.replace(/\s/g, "").toUpperCase();
    onDocIdChange(v);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${dark ? "text-white/50" : "text-zinc-600"}`}>
        Documento de identidad{required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          value={docType}
          onChange={(e) => {
            onDocTypeChange(e.target.value as DocType);
            onDocIdChange("");
          }}
          className={`rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2 transition-all w-32 shrink-0 ${
            dark
              ? "border-white/15 bg-white/[0.08] text-white focus:border-[#A78BFA] focus:ring-[#A78BFA]/30"
              : "border-zinc-200 bg-white text-zinc-800 focus:border-[#A78BFA] focus:ring-[#A78BFA]/20"
          }`}
        >
          {DOC_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#0B1D35] text-white">{t}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${dark ? "text-white/25" : "text-zinc-300"}`} />
          <input
            type="text"
            inputMode={isNumeric ? "numeric" : "text"}
            autoComplete="off"
            required={required}
            maxLength={DOC_MAX_LENGTH[docType]}
            placeholder={DOC_PLACEHOLDERS[docType]}
            value={docId}
            onChange={handleIdChange}
            className={`w-full rounded-xl border pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 transition-all ${inputClassName} ${
              dark
                ? `${error ? "border-red-400/50" : "border-white/15"} bg-white/[0.08] text-white placeholder:text-white/25 focus:border-[#A78BFA] focus:ring-[#A78BFA]/30`
                : `${error ? "border-rose-400" : "border-zinc-200"} bg-white text-zinc-800 placeholder-zinc-400 focus:border-[#A78BFA] focus:ring-[#A78BFA]/20`
            }`}
          />
        </div>
      </div>
      {error && <p className={`text-xs mt-1 ${dark ? "text-red-400" : "text-rose-500"}`}>{error}</p>}
    </div>
  );
}
