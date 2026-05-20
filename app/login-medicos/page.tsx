"use client";

import { useState } from "react";
import type { UserRole } from "@/lib/supabase/database.types";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";

const TEAL = "#0B5C5E";
const TEAL2 = "#0E6E71";
const G_TEAL = "linear-gradient(135deg, #0B5C5E 0%, #0E9F7E 60%, #38BDF8 100%)";

const FEATURES = [
  "Agenda de citas en tiempo real",
  "Historial clínico y recetas digitales",
  "Emite recetas con firma electrónica",
  "Telemedicina segura vía Google Meet",
];

function LoginMedicosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/medicos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      toast.error("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const { data: { user: signedInUser } } = await supabase.auth.getUser();
    const role = signedInUser?.user_metadata?.role as UserRole | undefined;

    if (role === "doctor" || role === "admin") {
      window.location.href = next;
    } else {
      toast.error("Esta área es exclusiva para personal médico.");
      await supabase.auth.signOut();
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: TEAL }}>
      {/* ── Left panel — brand médicos ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 10% 90%, #073a3c 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/">
            <Image src="/logo-white.png" alt="Organnical" width={140} height={34} />
          </Link>
          <span className="text-white/40 text-sm font-medium border border-white/20 rounded-full px-2 py-0.5 text-xs">
            Para médicos
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display text-4xl font-black text-white leading-tight">
            Portal médico<br />
            <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G_TEAL }}>
              Organnical
            </span>
          </h2>
          <ul className="space-y-3 pt-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/65">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-300 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/20">© {new Date().getFullYear()} Organnical Ventures S.A.C.</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-16 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/">
              <Image src="/logo-color.png" alt="Organnical" width={140} height={34} className="inline-block" />
            </Link>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1 mb-4">
              <Stethoscope className="w-3.5 h-3.5" />
              Área médica
            </div>
            <h1 className="font-display text-3xl font-black text-[#0B1D35] mb-2">Acceso para médicos</h1>
            <p className="text-zinc-500 text-sm">Ingresa con tu cuenta de personal médico Organnical.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@organnical.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Contraseña
                </label>
                <Link href="/recuperar-password" className="text-xs text-teal-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: G_TEAL }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Ingresar al portal <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              ¿Eres paciente?{" "}
              <Link href="/login" className="font-semibold text-[#A78BFA] hover:underline">
                Ingresa aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginMedicosPage() {
  return (
    <Suspense>
      <LoginMedicosContent />
    </Suspense>
  );
}
