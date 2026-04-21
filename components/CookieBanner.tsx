"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "organnical_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl bg-white rounded-2xl border border-zinc-200 shadow-xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-5 h-5 text-violet-500" />
        </div>
        <div className="flex-1 text-sm text-zinc-600">
          <p>
            Usamos cookies técnicas necesarias para el funcionamiento de la plataforma y cumplimiento
            de la{" "}
            <Link href="/privacidad" className="text-violet-600 hover:underline">
              Ley N.° 29733
            </Link>
            . No usamos cookies publicitarias sin tu consentimiento.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={reject}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-zinc-500 border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #A78BFA 0%, #38BDF8 100%)" }}
          >
            Aceptar
          </button>
          <button onClick={reject} className="text-zinc-300 hover:text-zinc-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
