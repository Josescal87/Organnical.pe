export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { BackLink } from "@/components/BackLink";
import { Award, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import Link from "next/link";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export default async function LegitScriptPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.role !== "admin") redirect("/dashboard/medico");

  const admin = adminClient();

  const [configResult, doctorsResult, protocolsResult] = await Promise.all([
    admin.schema("medical").from("system_config").select("key, value"),
    admin.schema("medical").from("profiles").select("cmp, rne").eq("role", "doctor"),
    admin.schema("medical").from("system_config").select("key").like("key", "protocol_%"),
  ]);

  const config = Object.fromEntries((configResult.data ?? []).map((r) => [r.key, r.value]));
  const doctors = doctorsResult.data ?? [];
  const protocols = (protocolsResult.data ?? []).map((r) => r.key);

  const ipressCode = config["ipress_code"];
  const hasCookieLaw = true; // CookieBanner component is mounted
  const hasPrivacyPage = true;
  const hasTermsPage = true;
  const hasVerifyPage = true;
  const allDoctorsHaveCMP = doctors.length > 0 && doctors.every((d) => d.cmp && d.cmp !== "PENDIENTE");
  const allDoctorsHaveRNE = doctors.length > 0 && doctors.every((d) => d.rne && d.rne !== "PENDIENTE");
  const hasIPRESS = !!ipressCode && ipressCode !== "PENDIENTE";
  const requiredProtocols = ["protocol_telemedicina", "protocol_cannabis", "protocol_emergencias", "protocol_bioseguridad", "protocol_datos_personales"];
  const allProtocols = requiredProtocols.every((p) => protocols.includes(p));

  const checks: { label: string; ok: boolean; href?: string; note?: string }[] = [
    {
      label: "Política de privacidad completa (Ley 29733 + retención + transferencias internacionales)",
      ok: hasPrivacyPage,
      href: "/privacidad",
    },
    {
      label: "Términos y condiciones con sección telemedicina + Ley 30681",
      ok: hasTermsPage,
      href: "/terminos",
    },
    {
      label: "Banner de cookies (GDPR / LegitScript requirement)",
      ok: hasCookieLaw,
      note: "Componente CookieBanner activo en layout",
    },
    {
      label: "Verificación pública de recetas (trazabilidad sin exponer datos del paciente)",
      ok: hasVerifyPage,
      href: "/verificar-receta",
    },
    {
      label: "Código IPRESS registrado (SUSALUD RENIPRESS)",
      ok: hasIPRESS,
      href: "/dashboard/admin/ipress",
      note: ipressCode ? `Código: ${ipressCode}` : "Sin código IPRESS",
    },
    {
      label: "Todos los médicos con CMP activo",
      ok: allDoctorsHaveCMP,
      href: "/dashboard/admin/personal",
      note: `${doctors.filter((d) => d.cmp && d.cmp !== "PENDIENTE").length} / ${doctors.length} médicos`,
    },
    {
      label: "Todos los médicos con RNE (especialistas)",
      ok: allDoctorsHaveRNE,
      href: "/dashboard/admin/personal",
      note: `${doctors.filter((d) => d.rne && d.rne !== "PENDIENTE").length} / ${doctors.length} médicos`,
    },
    {
      label: "5 protocolos clínicos cargados (DIRIS)",
      ok: allProtocols,
      href: "/dashboard/admin/protocolos",
      note: `${protocols.length} / ${requiredProtocols.length} protocolos`,
    },
  ];

  const completed = checks.filter((c) => c.ok).length;
  const total = checks.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-8">
        <BackLink href="/dashboard/admin/ipress" />
        <div className="flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 flex-shrink-0">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">LegitScript — Checklist</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {completed} / {total} requisitos completos · {pct}% listo
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? "linear-gradient(90deg, #34d399, #10b981)"
                : "linear-gradient(90deg, #A78BFA, #38BDF8)",
            }}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1">{pct}% completado para aplicar a LegitScript</p>
      </div>

      <div className="space-y-2 mb-8">
        {checks.map((c, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              c.ok ? "border-emerald-100 bg-emerald-50/30" : "border-zinc-100 bg-white"
            }`}
          >
            {c.ok
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              : <Circle className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-0.5" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${c.ok ? "text-emerald-700" : "text-zinc-700"}`}>
                {c.label}
              </p>
              {c.note && (
                <p className="text-xs text-zinc-400 mt-0.5">{c.note}</p>
              )}
            </div>
            {c.href && (
              <Link
                href={c.href}
                className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline flex-shrink-0"
              >
                Ver <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Apply CTA */}
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
        <p className="text-sm font-bold text-zinc-700 mb-1">Aplicar a LegitScript</p>
        <p className="text-xs text-zinc-500 mb-3">
          Una vez que todos los requisitos estén completos, aplica en legitscript.com. Fee anual ~$1,500 USD.
          Revisión 2–4 semanas.
        </p>
        <a
          href="https://www.legitscript.com/certification/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #A78BFA 0%, #38BDF8 100%)" }}
        >
          Ir a LegitScript.com <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
