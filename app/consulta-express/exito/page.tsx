"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Loader2, AlertCircle, MessageCircle } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const TEAL = "#0B5C5E";

const TIME_LABELS: Record<string, string> = {
  asap:     "Lo antes posible (próximas 2h, horario 9am–9pm)",
  today:    "Hoy antes de las 9pm",
  tomorrow: "Mañana entre 9am y 9pm",
};

type ConfirmState =
  | { phase: "loading" }
  | { phase: "success"; patientName: string; patientPhone: string; preferredTime: string; amount: number; consultationId: string }
  | { phase: "pending" }
  | { phase: "error"; message: string };

function ExitoContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ConfirmState>({ phase: "loading" });

  useEffect(() => {
    const paymentId =
      searchParams.get("payment_id") ??
      searchParams.get("collection_id");
    const consultationId = searchParams.get("external_reference");
    const status =
      searchParams.get("status") ??
      searchParams.get("collection_status");

    if (!paymentId || !consultationId) {
      setState({ phase: "error", message: "Parámetros de pago no encontrados." });
      return;
    }

    if (status !== "approved") {
      setState({ phase: "pending" });
      return;
    }

    const params = new URLSearchParams({
      payment_id: paymentId,
      external_reference: consultationId,
      status: status ?? "approved",
    });

    fetch(`/api/mercadopago/confirm-express?${params.toString()}`)
      .then((r) => r.json())
      .then((data: {
        status?: string;
        error?: string;
        consultationId?: string;
        patientName?: string;
        patientPhone?: string;
        preferredTime?: string;
        amount?: number;
      }) => {
        if (data.status === "approved" && data.consultationId) {
          setState({
            phase: "success",
            consultationId: data.consultationId,
            patientName: data.patientName ?? "",
            patientPhone: data.patientPhone ?? "",
            preferredTime: data.preferredTime ?? "asap",
            amount: data.amount ?? 0,
          });
          window.gtag?.("event", "consulta_express_pagada", {
            value: data.amount,
            currency: "PEN",
            transaction_id: data.consultationId,
          });
        } else if (data.error) {
          setState({ phase: "error", message: data.error });
        } else {
          setState({ phase: "pending" });
        }
      })
      .catch(() => setState({ phase: "error", message: "Error al confirmar el pago. Contáctanos por WhatsApp." }));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Image src="/logo-color.png" alt="Organnical" width={110} height={28} />
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {state.phase === "loading" && (
          <div className="flex flex-col items-center gap-4 py-20 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: TEAL }} />
            <p className="text-sm">Confirmando tu pago…</p>
          </div>
        )}

        {state.phase === "success" && (
          <div className="text-center space-y-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "rgba(11,92,94,0.12)" }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: TEAL }} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black text-[#0B1D35] mb-2">¡Consulta confirmada!</h1>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                La Dra te escribirá por WhatsApp al <strong>+51 {state.patientPhone.replace("+51", "")}</strong>.{" "}
                {TIME_LABELS[state.preferredTime] ?? state.preferredTime}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 max-w-sm mx-auto text-left space-y-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Resumen</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Paciente</span>
                  <span className="font-semibold text-[#0B1D35]">{state.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">WhatsApp</span>
                  <span className="font-semibold text-[#0B1D35]">{state.patientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Modalidad</span>
                  <span className="font-semibold text-[#0B1D35]">
                    {state.preferredTime === "asap" ? "Lo antes posible"
                      : state.preferredTime === "today" ? "Hoy"
                      : "Mañana"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pagado</span>
                  <span className="font-semibold text-emerald-600">S/ {state.amount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-w-sm mx-auto">
              <p className="text-xs text-zinc-400">Revisa también tu correo — te enviamos una confirmación de pago.</p>
              <a
                href={`https://wa.me/51952476574?text=${encodeURIComponent(
                  `Hola, acabo de pagar una consulta express en Organnical. Mi nombre es ${state.patientName}. ID: ${state.consultationId}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Escribir por WhatsApp
              </a>
              <div>
                <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        )}

        {state.phase === "pending" && (
          <div className="text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">Pago en revisión</h1>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
              Tu pago está siendo procesado. Recibirás una confirmación por email en los próximos minutos.
            </p>
            <a
              href="https://wa.me/51952476574"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700"
            >
              <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
            </a>
          </div>
        )}

        {state.phase === "error" && (
          <div className="text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">Algo salió mal</h1>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">{state.message}</p>
            <div className="flex flex-col gap-3 items-center">
              <a
                href="https://wa.me/51952476574"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700"
              >
                <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
              </a>
              <Link href="/consulta-express" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
                Intentar de nuevo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <ExitoContent />
    </Suspense>
  );
}

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}
