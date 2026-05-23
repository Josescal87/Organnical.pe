import type { BrandCertificate } from "@/lib/supabase/database.types"
import { ShieldCheck, Leaf, FlaskConical } from "lucide-react"

/**
 * Tres badges con icono + nombre del certificado + ID. Tooltip nativo (title)
 * para no inflar bundle. Spec Spirusol §6.4.
 */
const ICONS = {
  "vegan-verified":      Leaf,
  "registro-sanitario":  ShieldCheck,
  "informe-laboratorio": FlaskConical,
} as const

const LABELS: Record<string, string> = {
  "vegan-verified":      "Vegan Verified",
  "registro-sanitario":  "Registro Sanitario",
  "informe-laboratorio": "Análisis IIN",
}

export default function CertificateBadges({ certificados }: { certificados: BrandCertificate[] }) {
  if (!certificados?.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {certificados.map((cert) => {
        const Icon = ICONS[cert.tipo as keyof typeof ICONS] ?? ShieldCheck
        const label = LABELS[cert.tipo] ?? cert.tipo
        const tooltip = [
          `${label} · ${cert.id}`,
          `Emisor: ${cert.emisor}`,
          cert.valido_hasta ? `Válido hasta ${cert.valido_hasta}` : null,
          cert.fecha ? `Fecha: ${cert.fecha}` : null,
        ].filter(Boolean).join(" · ")

        return (
          <span
            key={`${cert.tipo}-${cert.id}`}
            title={tooltip}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2.5 py-1 text-xs font-medium text-emerald-800"
          >
            <Icon size={12} className="flex-shrink-0" />
            <span>{label}</span>
            <span className="text-emerald-600/70 font-normal">· {cert.id}</span>
          </span>
        )
      })}
    </div>
  )
}
