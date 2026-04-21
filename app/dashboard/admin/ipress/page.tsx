export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import IpressForm from "./IpressForm";
import type { IpressConfig } from "./actions";
import { Building2, ShieldCheck } from "lucide-react";

const CONFIG_KEYS: (keyof IpressConfig)[] = [
  "ipress_code",
  "ipress_name",
  "ipress_ruc",
  "ipress_address",
  "ipress_category",
  "pdf_header_logo_url",
];

const DEFAULT_CONFIG: IpressConfig = {
  ipress_code:         "",
  ipress_name:         "",
  ipress_ruc:          "",
  ipress_address:      "",
  ipress_category:     "I-2",
  pdf_header_logo_url: "/logo-organnical.png",
};

export default async function AdminIpressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .schema("medical")
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? user.user_metadata?.role;
  if (role !== "admin") redirect("/dashboard");

  const { data: rows } = await supabase
    .schema("medical")
    .from("system_config")
    .select("key, value")
    .in("key", CONFIG_KEYS);

  const config: IpressConfig = { ...DEFAULT_CONFIG };
  for (const row of rows ?? []) {
    if (row.key in config) {
      (config as Record<string, string>)[row.key] = row.value;
    }
  }

  const isConfigured = config.ipress_code !== "" && config.ipress_code !== "PENDIENTE";

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <BackLink href="/dashboard/medico" />
        <div className="flex items-center gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50">
            <Building2 className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">Configuración IPRESS</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Datos del establecimiento de salud para SUSALUD</p>
          </div>
        </div>
      </div>

      {!isConfigured && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Configuración pendiente</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Debes completar el código IPRESS asignado por SUSALUD antes de emitir documentos médicos
              válidos. Regístrate en{" "}
              <span className="font-mono">app20.susalud.gob.pe</span> si aún no tienes código.
            </p>
          </div>
        </div>
      )}

      {isConfigured && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">IPRESS configurada — {config.ipress_category}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Código: <span className="font-mono">{config.ipress_code}</span></p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <IpressForm initial={config} />
      </div>

      <p className="text-xs text-zinc-400 mt-4">
        Esta información aparecerá en el encabezado de todos los documentos médicos (historias clínicas y recetas).
        Requerido para la acreditación SIHCE ante MINSA (RM 164-2025).
      </p>
    </div>
  );
}
