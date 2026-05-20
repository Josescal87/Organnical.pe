"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
    >
      <LogOut size={13} />
      <span className="hidden sm:inline">Salir</span>
    </button>
  )
}
