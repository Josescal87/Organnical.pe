"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-password`,
    });

    if (authError) {
      setError("No pudimos enviar el correo. Verifica el email e intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: NAVY }}>
      <div className="w-full max-w-md bg-[#F8FAFC] rounded-2xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image src="/logo-color.png" alt="Organnical" width={140} height={34} className="inline-block mb-6" />
          </Link>

          {sent ? (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h1 className="font-display text-2xl font-black text-[#0B1D35]">Revisa tu correo</h1>
              <p className="text-zinc-500 text-sm">
                Te enviamos un enlace a <span className="font-semibold text-zinc-700">{email}</span> para
                restablecer tu contraseña. Puede tardar unos minutos.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-zinc-500 text-sm">
                Ingresa tu correo y te enviaremos un enlace para restablecerla.
              </p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: G }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Enviar enlace <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/login" className="font-semibold text-[#A78BFA] hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
