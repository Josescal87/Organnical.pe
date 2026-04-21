"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { recordConsent } from "./actions";
import type { ConsentType } from "./constants";

type Meta = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
};

type ExistingConsent = {
  consent_type: string;
  accepted: boolean;
  accepted_at: string | null;
  consent_version: string;
} | null;

type Props = {
  type: ConsentType;
  meta: Meta;
  text: string;
  version: string;
  existing: ExistingConsent;
};

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-100", icon: "text-[#A78BFA]",  badge: "bg-violet-100 text-violet-700" },
  blue:    { bg: "bg-blue-50",    border: "border-blue-100",   icon: "text-blue-500",   badge: "bg-blue-100 text-blue-700" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-100",icon: "text-emerald-500",badge: "bg-emerald-100 text-emerald-700" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-100",  icon: "text-amber-500",  badge: "bg-amber-100 text-amber-700" },
};

export default function ConsentCard({ type, meta, text, version, existing }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(existing?.accepted ?? false);
  const [acceptedAt, setAcceptedAt] = useState(existing?.accepted_at ?? null);

  const colors = colorMap[meta.color] ?? colorMap.violet;

  async function handleAccept() {
    setSaving(true);
    setMsg(null);
    const res = await recordConsent(type, true);
    setSaving(false);
    if (res.error) {
      setMsg(res.error);
    } else {
      setAccepted(true);
      setAcceptedAt(new Date().toISOString());
    }
  }

  const formattedDate = acceptedAt
    ? new Date(acceptedAt).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className={`rounded-2xl border ${colors.border} bg-white overflow-hidden`}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <span className={colors.icon}>{meta.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#0B1D35]">{meta.title}</p>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${colors.badge}`}>
              {version}
            </span>
            {accepted && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Firmado
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{meta.subtitle}</p>
          {formattedDate && (
            <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formattedDate}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded text + action */}
      {expanded && (
        <div className={`px-4 pb-4 border-t ${colors.border}`}>
          <div className={`mt-3 p-3 rounded-xl ${colors.bg} text-xs text-zinc-700 leading-relaxed`}>
            {text}
          </div>

          {!accepted ? (
            <div className="mt-3">
              {msg && (
                <p className="text-xs text-red-600 mb-2">{msg}</p>
              )}
              <button
                onClick={handleAccept}
                disabled={saving}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
              >
                {saving ? "Guardando…" : "Acepto y firmo este consentimiento"}
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Consentimiento firmado y registrado con auditoría.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
