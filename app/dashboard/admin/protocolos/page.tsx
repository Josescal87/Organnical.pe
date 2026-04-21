export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { BookOpen, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import ProtocolUploadForm from "./ProtocolUploadForm";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

const REQUIRED_PROTOCOLS = [
  { slug: "telemedicina",     label: "Protocolo de Atención en Telemedicina",              norma: "DS 030-2020-SA" },
  { slug: "cannabis",         label: "Protocolo de Prescripción Cannabis Medicinal",        norma: "Ley 30681 / DS 005-2019-SA" },
  { slug: "emergencias",      label: "Protocolo de Emergencias y Derivaciones",             norma: "NTS 139-MINSA/2018" },
  { slug: "bioseguridad",     label: "Manual de Bioseguridad Digital",                      norma: "RM 164-2025/MINSA" },
  { slug: "datos_personales", label: "Protocolo de Protección de Datos Personales",        norma: "Ley 29733" },
];

export default async function ProtocolosAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .schema("medical").from("profiles").select("role").eq("id", user.id).single();
  if (profileData?.role !== "admin") redirect("/dashboard");

  const admin = adminClient();
  const { data: configData } = await admin
    .schema("medical")
    .from("system_config")
    .select("key, value")
    .like("key", "protocol_%");

  const protocols: Record<string, string> = {};
  for (const row of configData ?? []) {
    protocols[row.key.replace("protocol_", "")] = row.value;
  }

  const uploaded = REQUIRED_PROTOCOLS.filter((p) => protocols[p.slug]);
  const missing = REQUIRED_PROTOCOLS.filter((p) => !protocols[p.slug]);

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-8">
        <BackLink href="/dashboard/admin" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Protocolos Clínicos</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {uploaded.length}/{REQUIRED_PROTOCOLS.length} protocolos cargados · Requeridos para inspección DIRIS
        </p>
      </div>

      {missing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">{missing.length} protocolo{missing.length !== 1 ? "s" : ""} pendiente{missing.length !== 1 ? "s" : ""}</p>
            <p className="text-amber-600 text-xs mt-0.5">Sube los PDFs antes de la inspección DIRIS. Cada protocolo debe estar firmado por el responsable médico.</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {REQUIRED_PROTOCOLS.map((proto) => {
          const url = protocols[proto.slug];
          return (
            <div key={proto.slug} className="bg-white rounded-2xl border border-zinc-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  {url
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-semibold text-sm text-[#0B1D35]">{proto.label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Norma: {proto.norma}</p>
                  </div>
                </div>
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" /> Ver PDF
                  </a>
                )}
              </div>
              <ProtocolUploadForm slug={proto.slug} currentUrl={url ?? null} />
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-zinc-50 rounded-2xl border border-zinc-100 p-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" /> Instrucciones
        </p>
        <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4">
          <li>Cada protocolo debe estar en formato PDF, firmado por el médico responsable.</li>
          <li>Los protocolos son revisados durante la inspección virtual de DIRIS Lima.</li>
          <li>Sube la URL pública del PDF almacenado (puedes usar Supabase Storage bucket <code>protocols</code>).</li>
          <li>Actualiza los protocolos cada vez que haya cambios normativos relevantes.</li>
        </ul>
      </div>
    </div>
  );
}
