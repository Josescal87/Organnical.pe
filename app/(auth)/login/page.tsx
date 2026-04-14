"use client";

import { useState } from "react";
import type { UserRole } from "@/lib/supabase/database.types";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // Read role from JWT metadata (no DB call needed)
    const { data: { user: signedInUser } } = await supabase.auth.getUser();
    const role = signedInUser?.user_metadata?.role as UserRole | undefined;
    if (role === "doctor" || role === "admin") {
      router.push("/dashboard/medico");
    } else {
      router.push("/dashboard/paciente");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex" style={{ background: NAVY }}>
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 20% 80%, #1a3a6e 0%, transparent 60%)" }}
        />
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo-white.png" alt="Organnical" width={150} height={36} />
          </Link>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="font-display text-4xl font-black text-white leading-tight">
            Medicina integrativa<br />
            <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>
              a tu alcance
            </span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Accede a tu historial de consultas, recetas médicas y plan de tratamiento personalizado.
          </p>
          <div className="flex gap-6 pt-4">
            {[["2", "Médicos activos"], ["1,200+", "Pacientes atendidos"], ["48h", "Primera cita"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-white">{n}</p>
                <p className="text-xs text-white/40">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/20">© {new Date().getFullYear()} Organical Ventures S.A.C.</p>
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
            <h1 className="font-display text-3xl font-black text-[#0B1D35] mb-2">Bienvenido de vuelta</h1>
            <p className="text-zinc-500 text-sm">Ingresa con tu cuenta para continuar.</p>
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
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Contraseña
                </label>
                <Link href="/recuperar-password" className="text-xs text-[#A78BFA] hover:underline">
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
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
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
                <>Ingresar <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-[#A78BFA] hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-zinc-400 leading-relaxed">
            Al ingresar aceptas nuestros{" "}
            <Link href="/terminos" className="hover:underline">Términos</Link>
            {" y "}
            <Link href="/privacidad" className="hover:underline">Política de Privacidad</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
