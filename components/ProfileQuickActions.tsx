"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, MessageCircle, Loader2 } from "lucide-react";
import { buildWaUrl } from "@/lib/whatsapp-messages";

export default function ProfileQuickActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex flex-col sm:flex-row gap-3">
      <a
        href={buildWaUrl("Hola, necesito ayuda con mi cuenta en Organnical")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100"
      >
        <MessageCircle className="w-4 h-4" />
        Ayuda por WhatsApp
      </a>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100 disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        Cerrar sesión
      </button>
    </div>
  );
}
