"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";

const BENEFITS = [
  "Consultas 100% online con médicos certificados MINSA",
  "Historial médico y recetas guardadas de forma segura",
  "Acceso a tratamientos personalizados basados en evidencia",
  "Primera cita disponible en menos de 48 horas",
];

export default function RegistroPage() {
  const router = useRouter();

  useEffect(() => {
    window.gtag?.("event", "begin_checkout")
    window.fbq?.("track", "InitiateCheckout")
  }, [])

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "patient" },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("Este correo ya tiene una cuenta. Inicia sesión.");
      } else {
        setError("Ocurrió un error al crear tu cuenta. Intenta de nuevo.");
      }
      setLoading(false);
      return;
    }

    window.gtag?.("event", "sign_up", { method: "email" })
    window.fbq?.("track", "CompleteRegistration")
    router.push("/dashboard/paciente");
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
        <div className="relative z-10 space-y-5">
          <h2 className="font-display text-3xl font-black text-white leading-tight">
            Tu salud, en manos de{" "}
            <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>
              especialistas
            </span>
          </h2>
          <ul className="space-y-3 pt-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/60">
                <CheckCircle className="w-4 h-4 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
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
            <h1 className="font-display text-3xl font-black text-[#0B1D35] mb-2">Crea tu cuenta</h1>
            <p className="text-zinc-500 text-sm">Regístrate para agendar tu primera consulta.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                Nombre completo
              </label>
              <input
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
              />
            </div>

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
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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
              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background: password.length > i * 3
                          ? i < 2 ? "#F472B6" : i < 3 ? "#A78BFA" : "#38BDF8"
                          : "#e4e4e7"
                      }}
                    />
                  ))}
                </div>
              )}
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
                <>Crear mi cuenta <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-[#A78BFA] hover:underline">
              Inicia sesión
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-zinc-400 leading-relaxed">
            Al registrarte aceptas nuestros{" "}
            <Link href="/terminos" className="hover:underline">Términos</Link>
            {" y "}
            <Link href="/privacidad" className="hover:underline">Política de Privacidad</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
