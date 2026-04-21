"use client";

import { useState, useCallback, useRef } from "react";
import { Search, Plus, Trash2, CheckCircle2, Lock, AlertTriangle, Download, Loader2 } from "lucide-react";
import {
  saveEncounterDraft,
  signEncounter,
  searchCIE10,
  type EncounterFormData,
  type DiagnosisItem,
} from "./ehr-actions";

// ── Tipos ──────────────────────────────────────────────────────────────────────

type Encounter = {
  id: string;
  status: string;
  signed_at: string | null;
  signed_by: string | null;
  doctor_signature_hash: string | null;
  chief_complaint: string;
  illness_history: string;
  relevant_history: string | null;
  vital_weight_kg: number | null;
  vital_height_cm: number | null;
  vital_bmi: number | null;
  vital_bp_systolic: number | null;
  vital_bp_diastolic: number | null;
  vital_heart_rate: number | null;
  vital_respiratory_rate: number | null;
  vital_temperature_c: number | null;
  vital_spo2_pct: number | null;
  physical_exam_notes: string | null;
  diagnoses: DiagnosisItem[];
  treatment_plan: string;
  indications: string | null;
  follow_up_days: number | null;
  lab_orders: string | null;
  cannabis_indication: string | null;
  expected_outcomes: string | null;
};

type Props = {
  aptId: string;
  existing: Encounter | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const inputCls = "rounded-xl border border-zinc-200 px-3 py-2 text-sm text-[#0B1D35] placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-400 w-full bg-white";
const labelCls = "text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block";

function numStr(v: number | null | undefined): string {
  return v != null ? String(v) : "";
}

function initForm(e: Encounter | null): EncounterFormData {
  if (!e) return {
    chief_complaint: "", illness_history: "", relevant_history: "",
    vital_weight_kg: "", vital_height_cm: "", vital_bp_systolic: "", vital_bp_diastolic: "",
    vital_heart_rate: "", vital_respiratory_rate: "", vital_temperature_c: "", vital_spo2_pct: "",
    physical_exam_notes: "", diagnoses: [], treatment_plan: "", indications: "",
    follow_up_days: "", lab_orders: "", cannabis_indication: "", expected_outcomes: "",
  };
  return {
    chief_complaint:       e.chief_complaint ?? "",
    illness_history:       e.illness_history ?? "",
    relevant_history:      e.relevant_history ?? "",
    vital_weight_kg:       numStr(e.vital_weight_kg),
    vital_height_cm:       numStr(e.vital_height_cm),
    vital_bp_systolic:     numStr(e.vital_bp_systolic),
    vital_bp_diastolic:    numStr(e.vital_bp_diastolic),
    vital_heart_rate:      numStr(e.vital_heart_rate),
    vital_respiratory_rate: numStr(e.vital_respiratory_rate),
    vital_temperature_c:   numStr(e.vital_temperature_c),
    vital_spo2_pct:        numStr(e.vital_spo2_pct),
    physical_exam_notes:   e.physical_exam_notes ?? "",
    diagnoses:             (e.diagnoses as DiagnosisItem[]) ?? [],
    treatment_plan:        e.treatment_plan ?? "",
    indications:           e.indications ?? "",
    follow_up_days:        numStr(e.follow_up_days),
    lab_orders:            e.lab_orders ?? "",
    cannabis_indication:   e.cannabis_indication ?? "",
    expected_outcomes:     e.expected_outcomes ?? "",
  };
}

// ── CIE-10 Picker ──────────────────────────────────────────────────────────────

type CIE10Result = { code: string; description: string; specialty: string | null };

function CIE10Picker({ onAdd }: { onAdd: (item: CIE10Result) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CIE10Result[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchCIE10(q);
      setResults(res as CIE10Result[]);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar código o descripción CIE-10…"
          className={`${inputCls} pl-9`}
        />
      </div>
      {(results.length > 0 || loading) && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-zinc-200 shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-4 py-2 text-xs text-zinc-400">Buscando…</div>
          )}
          {results.map(r => (
            <button
              key={r.code}
              type="button"
              onClick={() => { onAdd(r); setQuery(""); setResults([]); }}
              className="w-full text-left px-4 py-2.5 hover:bg-violet-50 flex items-start gap-3 border-b border-zinc-50 last:border-0"
            >
              <span className="font-mono text-xs font-bold text-violet-600 mt-0.5 flex-shrink-0">{r.code}</span>
              <span className="text-xs text-zinc-700 leading-snug">{r.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componentes de sección ────────────────────────────────────────────────────

function Section({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">{tag}</span>
        <h3 className="font-semibold text-[#0B1D35]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Formulario principal ───────────────────────────────────────────────────────

export default function ClinicalEncounterForm({ aptId, existing }: Props) {
  const isSigned = existing?.status === "signed";
  const [form, setForm] = useState<EncounterFormData>(() => initForm(existing));
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [signConfirm, setSignConfirm] = useState(false);
  const [signedResult, setSignedResult] = useState<{ at: string; hash: string } | null>(
    existing?.status === "signed" && existing.signed_at
      ? { at: existing.signed_at, hash: existing.doctor_signature_hash ?? "" }
      : null
  );
  const [encounterId, setEncounterId] = useState<string | null>(existing?.id ?? null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  function set(field: keyof EncounterFormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await saveEncounterDraft(aptId, form);
    setSaving(false);
    setMsg(res.error
      ? { type: "err", text: res.error }
      : { type: "ok", text: "Borrador guardado." }
    );
  }

  async function handleSign() {
    setSigning(true); setMsg(null);
    const res = await signEncounter(aptId, form);
    setSigning(false);
    if (res.error) {
      setMsg({ type: "err", text: res.error });
      setSignConfirm(false);
    } else {
      setSignedResult({ at: res.signedAt!, hash: res.hash! });
      setSignConfirm(false);
      // Trigger PDF generation in background
      triggerPdfGeneration(res.encounterId);
    }
  }

  async function triggerPdfGeneration(eid?: string) {
    const id = eid ?? encounterId;
    if (!id) return;
    setGeneratingPdf(true);
    try {
      const resp = await fetch("/api/ehr/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "encounter", id }),
      });
      const data = await resp.json() as { pdf_url?: string };
      if (data.pdf_url) setPdfUrl(data.pdf_url);
    } catch {}
    setGeneratingPdf(false);
  }

  async function handleDownload() {
    setGeneratingPdf(true);
    try {
      // Intentar obtener signed URL
      let resp = await fetch(`/api/ehr/document/${encounterId ?? aptId}?type=encounter`);
      let data = await resp.json() as { url?: string; error?: string };

      // Si falla (archivo no existe aún), regenerar PDF primero
      if (!data.url) {
        const genResp = await fetch("/api/ehr/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "encounter", id: encounterId ?? aptId }),
        });
        const genData = await genResp.json() as { pdf_url?: string; error?: string };
        if (genData.error) { alert(`Error generando PDF: ${genData.error}`); setGeneratingPdf(false); return; }

        // Intentar signed URL de nuevo
        resp = await fetch(`/api/ehr/document/${encounterId ?? aptId}?type=encounter`);
        data = await resp.json() as { url?: string; error?: string };
      }

      if (data.url) window.open(data.url, "_blank");
      else alert(`Error: ${data.error ?? "No se pudo obtener el PDF"}`);
    } catch (e) {
      alert(`Error inesperado: ${String(e)}`);
    }
    setGeneratingPdf(false);
  }

  // Si está firmada, mostrar vista solo-lectura
  if (isSigned || signedResult) {
    const at = signedResult?.at ?? existing?.signed_at ?? "";
    const hash = signedResult?.hash ?? existing?.doctor_signature_hash ?? "";
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">Historia clínica firmada</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              {new Date(at).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" })}
            </p>
            <p className="text-[10px] font-mono text-emerald-500 mt-1 break-all">SHA-256: {hash}</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={generatingPdf}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 flex-shrink-0 self-start"
          >
            {generatingPdf
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando…</>
              : <><Download className="w-3.5 h-3.5" /> Descargar HC</>
            }
          </button>
        </div>
        <SignedReadOnly data={form} />
      </div>
    );
  }

  return (
    <form onSubmit={handleDraft} className="space-y-4">

      {/* S — Subjetivo */}
      <Section title="Anamnesis (Subjetivo)" tag="S">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Motivo de consulta *</label>
            <textarea rows={2} value={form.chief_complaint} onChange={e => set("chief_complaint", e.target.value)}
              placeholder="Motivo principal por el que el paciente acude a consulta"
              className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Historia de la enfermedad actual *</label>
            <textarea rows={4} value={form.illness_history} onChange={e => set("illness_history", e.target.value)}
              placeholder="Inicio, evolución, síntomas acompañantes, tratamientos previos…"
              className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Antecedentes relevantes</label>
            <textarea rows={2} value={form.relevant_history} onChange={e => set("relevant_history", e.target.value)}
              placeholder="Antecedentes patológicos relevantes para esta consulta"
              className={inputCls} />
          </div>
        </div>
      </Section>

      {/* O — Objetivo */}
      <Section title="Signos vitales y Examen físico (Objetivo)" tag="O">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Peso (kg)",    field: "vital_weight_kg",      placeholder: "70.5" },
            { label: "Talla (cm)",   field: "vital_height_cm",      placeholder: "170" },
            { label: "PA sistólica", field: "vital_bp_systolic",    placeholder: "120" },
            { label: "PA diastólica",field: "vital_bp_diastolic",   placeholder: "80" },
            { label: "FC (lpm)",     field: "vital_heart_rate",     placeholder: "72" },
            { label: "FR (rpm)",     field: "vital_respiratory_rate",placeholder: "16" },
            { label: "Temp. (°C)",   field: "vital_temperature_c",  placeholder: "36.6" },
            { label: "SpO2 (%)",     field: "vital_spo2_pct",       placeholder: "98" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className={labelCls}>{label}</label>
              <input type="number" step="any" placeholder={placeholder}
                value={form[field as keyof EncounterFormData] as string}
                onChange={e => set(field as keyof EncounterFormData, e.target.value)}
                className={inputCls} />
            </div>
          ))}
        </div>
        {form.vital_weight_kg && form.vital_height_cm && (
          <p className="text-xs text-zinc-500 mb-3">
            IMC calculado: <strong>{(parseFloat(form.vital_weight_kg) / Math.pow(parseFloat(form.vital_height_cm) / 100, 2)).toFixed(1)}</strong> kg/m²
          </p>
        )}
        <div>
          <label className={labelCls}>Examen físico por sistemas</label>
          <textarea rows={3} value={form.physical_exam_notes} onChange={e => set("physical_exam_notes", e.target.value)}
            placeholder="Hallazgos al examen físico por sistemas…"
            className={inputCls} />
        </div>
      </Section>

      {/* A — Análisis */}
      <Section title="Diagnósticos CIE-10 (Análisis)" tag="A">
        <div className="mb-3">
          <CIE10Picker onAdd={result => {
            if (form.diagnoses.some(d => d.cie10_code === result.code)) return;
            setForm(f => ({
              ...f,
              diagnoses: [...f.diagnoses, {
                cie10_code:        result.code,
                cie10_description: result.description,
                type:              f.diagnoses.length === 0 ? "principal" : "secondary",
                certainty:         "definitivo",
              }],
            }));
          }} />
        </div>
        {form.diagnoses.length === 0 && (
          <p className="text-xs text-zinc-400 text-center py-3">Busca y agrega al menos un diagnóstico CIE-10</p>
        )}
        <div className="space-y-2">
          {form.diagnoses.map((d, i) => (
            <div key={d.cie10_code} className="flex items-start gap-2 p-3 rounded-xl border border-zinc-100 bg-zinc-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-violet-600">{d.cie10_code}</span>
                  <span className="text-xs text-zinc-700 leading-snug">{d.cie10_description}</span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <select value={d.type}
                    onChange={e => {
                      const arr = [...form.diagnoses];
                      if (e.target.value === "principal") {
                        arr.forEach((x, j) => { if (j !== i) arr[j] = { ...x, type: "secondary" }; });
                      }
                      arr[i] = { ...arr[i], type: e.target.value as DiagnosisItem["type"] };
                      setForm(f => ({ ...f, diagnoses: arr }));
                    }}
                    className="rounded-lg border border-zinc-200 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400">
                    <option value="principal">Principal</option>
                    <option value="secondary">Secundario</option>
                  </select>
                  <select value={d.certainty}
                    onChange={e => {
                      const arr = [...form.diagnoses];
                      arr[i] = { ...arr[i], certainty: e.target.value as DiagnosisItem["certainty"] };
                      setForm(f => ({ ...f, diagnoses: arr }));
                    }}
                    className="rounded-lg border border-zinc-200 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400">
                    <option value="definitivo">Definitivo</option>
                    <option value="presuntivo">Presuntivo</option>
                  </select>
                </div>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, diagnoses: f.diagnoses.filter((_, j) => j !== i) }))}
                className="p-1.5 text-zinc-400 hover:text-red-500 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* P — Plan */}
      <Section title="Plan de tratamiento (Plan)" tag="P">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Plan de tratamiento *</label>
            <textarea rows={3} value={form.treatment_plan} onChange={e => set("treatment_plan", e.target.value)}
              placeholder="Plan terapéutico, indicaciones generales, objetivos del tratamiento…"
              className={inputCls} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Indicaciones al paciente</label>
              <textarea rows={2} value={form.indications} onChange={e => set("indications", e.target.value)}
                placeholder="Indicaciones específicas para el paciente…"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pedidos de laboratorio / imágenes</label>
              <textarea rows={2} value={form.lab_orders} onChange={e => set("lab_orders", e.target.value)}
                placeholder="Exámenes solicitados…"
                className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Control en (días)</label>
            <input type="number" min="1" max="365" value={form.follow_up_days}
              onChange={e => set("follow_up_days", e.target.value)}
              placeholder="30"
              className={`${inputCls} max-w-[140px]`} />
          </div>
        </div>
      </Section>

      {/* Cannabis — Ley 30681 */}
      <Section title="Justificación cannabis medicinal (Ley 30681)" tag="🌿">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Indicación terapéutica</label>
            <textarea rows={2} value={form.cannabis_indication} onChange={e => set("cannabis_indication", e.target.value)}
              placeholder="Justificación clínica para el uso de cannabis medicinal según Ley 30681…"
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Resultados esperados</label>
            <textarea rows={2} value={form.expected_outcomes} onChange={e => set("expected_outcomes", e.target.value)}
              placeholder="Objetivos terapéuticos y criterios de respuesta esperados…"
              className={inputCls} />
          </div>
        </div>
      </Section>

      {/* Mensajes */}
      {msg && (
        <p className={`text-sm rounded-xl px-4 py-3 ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="submit" disabled={saving}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 transition-colors">
          {saving ? "Guardando…" : "Guardar borrador"}
        </button>
        <button type="button" onClick={() => setSignConfirm(true)}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}>
          <Lock className="w-4 h-4" /> Firmar historia clínica
        </button>
      </div>

      {/* Modal confirmación firma */}
      {signConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[#0B1D35]">Firmar historia clínica</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Una vez firmada, la HC no puede modificarse. Esta acción genera un hash SHA-256 con tu identidad y timestamp.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSignConfirm(false)}
                className="flex-1 rounded-xl py-2 text-sm font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                Cancelar
              </button>
              <button type="button" onClick={handleSign} disabled={signing}
                className="flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}>
                {signing ? "Firmando…" : "Confirmar firma"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

// ── Vista solo-lectura para HC firmada ────────────────────────────────────────

function SignedReadOnly({ data }: { data: EncounterFormData }) {
  const fields: { label: string; value: string | undefined }[] = [
    { label: "Motivo de consulta",    value: data.chief_complaint },
    { label: "Historia de enfermedad", value: data.illness_history },
    { label: "Antecedentes relevantes", value: data.relevant_history },
    { label: "Signos vitales",
      value: [
        data.vital_weight_kg   && `Peso: ${data.vital_weight_kg} kg`,
        data.vital_height_cm   && `Talla: ${data.vital_height_cm} cm`,
        data.vital_bp_systolic && `PA: ${data.vital_bp_systolic}/${data.vital_bp_diastolic} mmHg`,
        data.vital_heart_rate  && `FC: ${data.vital_heart_rate} lpm`,
        data.vital_temperature_c && `T°: ${data.vital_temperature_c}°C`,
        data.vital_spo2_pct    && `SpO2: ${data.vital_spo2_pct}%`,
      ].filter(Boolean).join("  ·  ")
    },
    { label: "Examen físico",         value: data.physical_exam_notes },
    { label: "Plan de tratamiento",   value: data.treatment_plan },
    { label: "Indicaciones",          value: data.indications },
    { label: "Pedidos",               value: data.lab_orders },
    { label: "Indicación cannabis",   value: data.cannabis_indication },
    { label: "Resultados esperados",  value: data.expected_outcomes },
  ].filter(f => f.value);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-4">
      {data.diagnoses.length > 0 && (
        <div>
          <p className={`${labelCls} mb-2`}>Diagnósticos CIE-10</p>
          <div className="space-y-1.5">
            {data.diagnoses.map(d => (
              <div key={d.cie10_code} className="flex items-center gap-2 text-sm">
                <span className="font-mono text-xs font-bold text-violet-600">{d.cie10_code}</span>
                <span className="text-zinc-700">{d.cie10_description}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${d.type === "principal" ? "bg-violet-100 text-violet-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {d.type === "principal" ? "Principal" : "Secundario"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {fields.map(f => (
        <div key={f.label}>
          <p className={labelCls}>{f.label}</p>
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">{f.value}</p>
        </div>
      ))}
    </div>
  );
}
