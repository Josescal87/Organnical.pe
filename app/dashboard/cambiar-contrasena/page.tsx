"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from "lucide-react"

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

export default function CambiarContrasenaPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError("No se pudo actualizar la contraseña. Intenta de nuevo.")
      setLoading(false)
      return
    }

    await supabase.auth.updateUser({ data: { force_password_change: false } })

    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role

    setDone(true)
    setTimeout(() => {
      router.push(role === "doctor" || role === "admin"
        ? "/dashboard/medico"
        : "/dashboard/paciente"
      )
    }, 1800)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="w-full max-w-md bg-[#F8FAFC] rounded-2xl p-8 shadow-xl">
      <div className="mb-8 text-center">
        <Link href="/">
          <Image
            src="/logo-color.png"
            alt="Organnical"
            width={140}
            height={34}
            className="inline-block mb-6"
          />
        </Link>

        {done ? (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">
              Contraseña guardada
            </h1>
            <p className="text-zinc-500 text-sm">Redirigiendo a tu dashboard...</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">
              Crea tu contraseña
            </h1>
            <p className="text-zinc-500 text-sm">
              Por seguridad, debes establecer una contraseña personal antes de continuar.
            </p>
          </>
        )}
      </div>

      {!done && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
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

          <div>
            <label
              htmlFor="confirm"
              className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              type={showPass ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
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
              <>Guardar contraseña <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-sm text-zinc-400 hover:text-zinc-600 py-2 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      )}
    </div>
  )
}
