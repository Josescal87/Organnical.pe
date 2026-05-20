"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import DocumentInput, { type DocType, validateDocId } from "@/components/DocumentInput";
import { CONSENT_TEXTS } from "@/app/dashboard/paciente/consentimiento/constants";
import {
  ArrowLeft, ArrowRight, Loader2, CheckCircle, MessageCircle,
  ChevronDown, ChevronUp, Zap, ShieldCheck, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: "es-PE" });

type Step = "datos" | "cuando" | "pago" | "done";
type PreferredTime = "asap" | "today" | "tomorrow";

const TIME_OPTIONS: { id: PreferredTime; label: string; sla: string; icon: string }[] = [
  { id: "asap",     label: "Lo antes posible", sla: "La Dra te escribe en las próximas 2 h (horario 9 am–9 pm).", icon: "⚡" },
  { id: "today",    label: "Hoy",              sla: "La Dra te escribe hoy antes de las 9 pm.",                  icon: "📅" },
  { id: "tomorrow", label: "Mañana",            sla: "La Dra te escribe mañana entre 9 am y 9 pm.",              icon: "🌅" },
];

const CONSENT_LABELS: Record<string, string> = {
  general_treatment: "Consentimiento de tratamiento",
  telemedicine:      "Consentimiento de telemedicina",
  cannabis_use:      "Información sobre cannabis medicinal",
  data_processing:   "Protección de datos personales",
};

const EXPRESS_PRICE = Number(process.env.NEXT_PUBLIC_EXPRESS_PRICE ?? 30);
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const TEAL = "#0B5C5E";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("51") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("9") && digits.length === 9) return `+51${digits}`;
  return digits;
}

export default function ConsultaExpressPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("datos");

  // Step 1 — datos
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [docType, setDocType] = useState<DocType>("DNI");
  const [docId, setDocId] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [dataErrors, setDataErrors] = useState<Record<string, string>>({});

  // Reniec validation
  type ReniecStatus = null | "loading" | "valid" | "invalid";
  const [reniecStatus, setReniecStatus] = useState<ReniecStatus>(null);
  const [reniecName, setReniecName] = useState<string | null>(null);
  const reniecTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2 — cuando
  const [preferredTime, setPreferredTime] = useState<PreferredTime | null>(null);

  // Step 3 — consentimientos + pago
  const [consentsAccepted, setConsentsAccepted] = useState(true);
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  // Done
  const [consultationId, setConsultationId] = useState<string | null>(null);

  useEffect(() => {
    if (docType !== "DNI" || !/^\d{8}$/.test(docId)) {
      setReniecStatus(null);
      setReniecName(null);
      return;
    }
    if (reniecTimer.current) clearTimeout(reniecTimer.current);
    setReniecStatus("loading");
    reniecTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/reniec/validate?dni=${docId}`);
        const data = await res.json() as { valid: boolean; nombres?: string | null; error?: string };
        if (data.valid) {
          setReniecStatus("valid");
          setReniecName(data.nombres ?? null);
        } else {
          setReniecStatus("invalid");
          setReniecName(null);
        }
      } catch {
        setReniecStatus(null);
      }
    }, 600);
  }, [docId, docType]);

  function validateStep1() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Ingresa tu nombre completo.";
    if (!phone.trim()) errs.phone = "Ingresa tu número de celular.";
    else if (!/^9\d{8}$/.test(phone.replace(/\D/g, "").replace(/^51/, ""))) errs.phone = "El celular debe empezar con 9 y tener 9 dígitos.";
    const docErr = validateDocId(docType, docId);
    if (docErr) errs.docId = docErr;
    if (reniecStatus === "invalid") errs.docId = "DNI no encontrado en RENIEC. Verifica el número.";
    if (!isAdult) errs.isAdult = "Debes confirmar que eres mayor de edad para continuar.";
    setDataErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const stepIndex = { datos: 0, cuando: 1, pago: 2, done: 3 };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-color.png" alt="Organnical" width={110} height={28} />
          </Link>
          {step !== "done" && (
            <div className="flex items-center gap-1.5">
              {(["datos", "cuando", "pago"] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: stepIndex[step] >= i ? 32 : 16,
                    background: stepIndex[step] >= i ? G : "#E4E4E7",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── STEP 1: datos ── */}
        {step === "datos" && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ background: "rgba(11,92,94,0.08)", color: TEAL }}>
                <Zap className="w-3 h-3" /> Consulta Express
              </div>
              <h1 className="font-display text-2xl font-black text-[#0B1D35]">Tus datos</h1>
              <p className="text-zinc-500 text-sm mt-1">La Dra te contactará por WhatsApp para tu consulta.</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4 shadow-sm">
              {/* Nombre */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5 uppercase tracking-wide">Nombre completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                {dataErrors.name && <p className="text-xs text-rose-500 mt-1">{dataErrors.name}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5 uppercase tracking-wide">Celular WhatsApp *</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500">🇵🇪 +51</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="9XXXXXXXX"
                    inputMode="numeric"
                    className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                {dataErrors.phone && <p className="text-xs text-rose-500 mt-1">{dataErrors.phone}</p>}
              </div>

              {/* DNI/CE/Pasaporte */}
              <div>
                <DocumentInput
                  required
                  docType={docType}
                  docId={docId}
                  onDocTypeChange={(t) => { setDocType(t); setDocId(""); setReniecStatus(null); setReniecName(null); }}
                  onDocIdChange={setDocId}
                  error={dataErrors.docId}
                />
                {/* Reniec status badge */}
                {docType === "DNI" && docId.length === 8 && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    {reniecStatus === "loading" && (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" /><span className="text-zinc-400">Verificando en RENIEC…</span></>
                    )}
                    {reniecStatus === "valid" && (
                      <><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600 font-medium">{reniecName ? `Verificado: ${reniecName}` : "DNI verificado"}</span></>
                    )}
                    {reniecStatus === "invalid" && (
                      <><AlertCircle className="w-3.5 h-3.5 text-rose-500" /><span className="text-rose-600">DNI no encontrado en RENIEC</span></>
                    )}
                  </div>
                )}
              </div>

              {/* Mayor de edad */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAdult}
                    onChange={(e) => setIsAdult(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-teal-600 flex-shrink-0"
                  />
                  <span className="text-sm text-zinc-700">Confirmo que soy mayor de 18 años</span>
                </label>
                {dataErrors.isAdult && <p className="text-xs text-rose-500 mt-1 ml-7">{dataErrors.isAdult}</p>}
              </div>

              {/* Motivo */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1.5 uppercase tracking-wide">Motivo de consulta <span className="normal-case text-zinc-400">(opcional)</span></label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="¿Cuál es tu principal síntoma o inquietud?"
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => { if (validateStep1()) setStep("cuando"); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: G }}
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: cuando ── */}
        {step === "cuando" && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setStep("datos")}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Atrás
              </button>
              <h1 className="font-display text-2xl font-black text-[#0B1D35]">¿Cuándo quieres atenderte?</h1>
              <p className="text-zinc-500 text-sm mt-1">La Dra te escribirá por WhatsApp al número que ingresaste.</p>
            </div>

            <div className="space-y-3">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPreferredTime(opt.id)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    preferredTime === opt.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-zinc-100 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className={`font-bold text-sm ${preferredTime === opt.id ? "text-teal-800" : "text-[#0B1D35]"}`}>
                        {opt.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${preferredTime === opt.id ? "text-teal-700" : "text-zinc-500"}`}>
                        {opt.sla}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              disabled={!preferredTime}
              onClick={() => setStep("pago")}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: G }}
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 3: pago ── */}
        {step === "pago" && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setStep("cuando")}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Atrás
              </button>
              <h1 className="font-display text-2xl font-black text-[#0B1D35]">Consentimientos y pago</h1>
              <p className="text-zinc-500 text-sm mt-1">Revisa los términos y paga S/ {EXPRESS_PRICE} para confirmar tu consulta.</p>
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Paciente</span>
                <span className="font-semibold text-[#0B1D35]">{name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">WhatsApp</span>
                <span className="font-semibold text-[#0B1D35]">+51 {phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Cuándo</span>
                <span className="font-semibold text-[#0B1D35]">
                  {TIME_OPTIONS.find((t) => t.id === preferredTime)?.label}
                </span>
              </div>
              <div className="border-t border-zinc-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-zinc-600">Total</span>
                <span className="font-black text-lg text-[#0B1D35]">S/ {EXPRESS_PRICE}</span>
              </div>
            </div>

            {/* Consentimientos */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-semibold text-amber-900">Consentimientos informados MINSA</p>
              <p className="text-xs text-amber-700">Para proceder con la consulta, necesitas aceptar los siguientes documentos:</p>
              <div className="space-y-2">
                {Object.entries(CONSENT_LABELS).map(([key, label]) => (
                  <div key={key} className="bg-white rounded-xl border border-amber-100">
                    <button
                      type="button"
                      onClick={() => setExpandedConsent(expandedConsent === key ? null : key)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-700"
                    >
                      <span>{label}</span>
                      {expandedConsent === key
                        ? <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
                    </button>
                    {expandedConsent === key && (
                      <div className="px-4 pb-4">
                        <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                          {CONSENT_TEXTS[key as keyof typeof CONSENT_TEXTS]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentsAccepted}
                  onChange={(e) => setConsentsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-teal-600"
                />
                <span className="text-xs text-amber-800">
                  He leído y acepto los consentimientos informados. Entiendo que la Dra me contactará por WhatsApp y que el pago de S/ {EXPRESS_PRICE} es por la consulta de orientación.
                </span>
              </label>
            </div>

            {payError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                {payError}
              </div>
            )}

            {/* MercadoPago Brick */}
            {!paying ? (
              <div className={!consentsAccepted ? "opacity-50 pointer-events-none" : ""}>
                <Payment
                  initialization={{ amount: EXPRESS_PRICE }}
                  customization={{
                    paymentMethods: { creditCard: "all", debitCard: "all" },
                    visual: {
                      style: {
                        customVariables: {
                          baseColor: "#0B5C5E",
                          baseColorFirstVariant: "#0E9F7E",
                          baseColorSecondVariant: "#38BDF8",
                        },
                      },
                    },
                  }}
                  onSubmit={async ({ formData }) => {
                    if (!consentsAccepted) {
                      setPayError("Debes aceptar los consentimientos para continuar.");
                      return;
                    }
                    setPaying(true);
                    setPayError(null);
                    try {
                      const res = await fetch("/api/mercadopago/process-express", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...formData,
                          patientName: name,
                          patientPhone: normalizePhone(phone),
                          patientDocumentType: docType,
                          patientDocumentNumber: docId,
                          motivo,
                          preferredTime,
                          consentsAcceptedAt: new Date().toISOString(),
                          consentsSnapshot: CONSENT_TEXTS,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error ?? "Error al procesar el pago");
                      if (data.status !== "approved") throw new Error("Pago no aprobado");
                      setConsultationId(data.consultationId);
                      window.gtag?.("event", "consulta_express_pagada", {
                        value: EXPRESS_PRICE,
                        currency: "PEN",
                        transaction_id: data.consultationId,
                      });
                      setStep("done");
                    } catch (err) {
                      setPayError(err instanceof Error ? err.message : "Error al procesar el pago.");
                      setPaying(false);
                    }
                  }}
                  onError={(err) => {
                    console.error("MP Express brick error:", err);
                    setPayError("Error en el formulario de pago. Intenta de nuevo.");
                    setPaying(false);
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-8 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Procesando tu pago...</span>
              </div>
            )}
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="text-center py-12 space-y-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "rgba(11,92,94,0.12)" }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: TEAL }} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black text-[#0B1D35] mb-2">¡Consulta confirmada!</h1>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                La Dra te escribirá por WhatsApp al <strong>+51 {phone}</strong>.{" "}
                {TIME_OPTIONS.find((t) => t.id === preferredTime)?.sla}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 max-w-sm mx-auto text-left space-y-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Resumen</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Paciente</span>
                  <span className="font-semibold text-[#0B1D35]">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">WhatsApp</span>
                  <span className="font-semibold text-[#0B1D35]">+51 {phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Modalidad</span>
                  <span className="font-semibold text-[#0B1D35]">
                    {TIME_OPTIONS.find((t) => t.id === preferredTime)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pagado</span>
                  <span className="font-semibold text-emerald-600">S/ {EXPRESS_PRICE}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-w-sm mx-auto">
              <p className="text-xs text-zinc-400">
                Revisa también tu correo — te enviamos una confirmación de pago.
              </p>
              <Link
                href="/"
                className="block text-center text-sm font-semibold text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>

            {/* WhatsApp fallback */}
            <div className="max-w-sm mx-auto pt-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-400 mb-2">¿Tienes alguna pregunta mientras esperas?</p>
              <a
                href={`https://wa.me/51952476574?text=${encodeURIComponent("Hola, acabo de pagar una consulta express en Organnical. Mi nombre es " + name + ". ID: " + (consultationId ?? ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
