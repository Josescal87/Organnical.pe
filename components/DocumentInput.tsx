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
      <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-1.5">
        Documento de identidad{required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          value={docType}
          onChange={(e) => {
            onDocTypeChange(e.target.value as DocType);
            onDocIdChange("");
          }}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-800 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all w-32 shrink-0"
        >
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
          <input
            type="text"
            inputMode={isNumeric ? "numeric" : "text"}
            autoComplete="off"
            required={required}
            maxLength={DOC_MAX_LENGTH[docType]}
            placeholder={DOC_PLACEHOLDERS[docType]}
            value={docId}
            onChange={handleIdChange}
            className={`w-full rounded-xl border ${error ? "border-rose-400" : "border-zinc-200"} bg-white pl-9 pr-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all ${inputClassName}`}
          />
        </div>
      </div>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
