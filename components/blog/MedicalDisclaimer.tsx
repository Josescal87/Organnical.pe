import Link from "next/link"
import { Info, Stethoscope } from "lucide-react"

export default function MedicalDisclaimer() {
  return (
    <aside
      role="note"
      aria-label="Aviso médico"
      className="mt-8 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-5 md:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-100 text-zinc-500">
          <Info className="h-4 w-4" />
        </span>
        <div className="flex-1 text-sm text-zinc-600 leading-relaxed">
          <p className="font-semibold text-zinc-800 mb-1">Aviso médico</p>
          <p>
            Este contenido es informativo y educativo. <strong>No reemplaza el diagnóstico ni el tratamiento</strong> de un profesional de la salud. Si tienes una condición médica preexistente, estás embarazada o tomas medicación, consulta antes de incorporar cualquier suplemento.
          </p>
          <Link
            href="/agendar"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7c6fed] hover:text-[#5b4fcf] transition-colors"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Evaluación con médico especializado
          </Link>
        </div>
      </div>
    </aside>
  )
}
