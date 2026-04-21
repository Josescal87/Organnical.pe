export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { ShieldCheck, FileText, Video, Leaf, Lock } from "lucide-react";
import ConsentCard from "./ConsentCard";
import {
  CONSENT_TEXTS,
  CONSENT_VERSIONS,
  getMyConsents,
  type ConsentType,
} from "./actions";

const CONSENT_META: Record<
  ConsentType,
  { title: string; subtitle: string; icon: React.ReactNode; color: string }
> = {
  general_treatment: {
    title: "Consentimiento para tratamiento",
    subtitle: "Autorización general para diagnóstico y tratamiento médico",
    icon: <FileText className="w-5 h-5" />,
    color: "violet",
  },
  telemedicine: {
    title: "Consentimiento para telemedicina",
    subtitle: "Autorización para atención médica mediante videollamada",
    icon: <Video className="w-5 h-5" />,
    color: "blue",
  },
  cannabis_use: {
    title: "Consentimiento para cannabis medicinal",
    subtitle: "Informado sobre uso terapéutico según Ley N° 30681",
    icon: <Leaf className="w-5 h-5" />,
    color: "emerald",
  },
  data_processing: {
    title: "Tratamiento de datos personales",
    subtitle: "Autorización conforme a Ley N° 29733",
    icon: <Lock className="w-5 h-5" />,
    color: "amber",
  },
};

export default async function ConsentimientoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role;
  if (role !== "patient") redirect("/dashboard/medico");

  const existingConsents = await getMyConsents();
  const consentMap = Object.fromEntries(
    existingConsents.map((c) => [c.consent_type, c])
  );

  const allAccepted = (Object.keys(CONSENT_META) as ConsentType[]).every(
    (t) => consentMap[t]?.accepted === true
  );

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <BackLink href="/dashboard/paciente" />
        <div className="flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">
              Consentimientos informados
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Requeridos para el inicio y continuidad de tu atención médica
            </p>
          </div>
        </div>
      </div>

      {allAccepted && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Todos los consentimientos firmados
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Tu expediente está completo para recibir atención médica.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {(Object.keys(CONSENT_META) as ConsentType[]).map((type) => (
          <ConsentCard
            key={type}
            type={type}
            meta={CONSENT_META[type]}
            text={CONSENT_TEXTS[type]}
            version={CONSENT_VERSIONS[type]}
            existing={consentMap[type] ?? null}
          />
        ))}
      </div>

      <p className="text-xs text-zinc-400 mt-6 text-center">
        Los consentimientos son almacenados de forma segura con hash SHA-256 y
        auditoría de acceso conforme a RM 164-2025/MINSA.
      </p>
    </div>
  );
}
