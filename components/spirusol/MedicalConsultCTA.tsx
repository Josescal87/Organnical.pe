import { Stethoscope, Calendar } from "lucide-react"

/**
 * Sección 8 — Cross-sell a telemedicina. CTAs con UTM `cross_sell_medico`
 * (spec §C.8). Linkea a las rutas existentes /consulta-express y /agendar.
 */
const ORGANNICAL = "https://organnical.pe"
const UTM = "utm_source=spirusol_subdomain&utm_medium=landing&utm_campaign=cross_sell_medico"

export default function MedicalConsultCTA() {
  return (
    <section
      className="py-20 md:py-24 relative overflow-hidden"
      style={{ background: "var(--brand-green-100)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 80% 50%, var(--brand-sun-100) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Stethoscope
          size={40}
          className="mx-auto mb-6"
          style={{ color: "var(--brand-green-700)" }}
        />
        <h2
          className="font-bold tracking-tight text-balance leading-tight mb-5"
          style={{
            fontFamily: "var(--font-fraunces)",
            color: "var(--brand-green-900)",
            fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",
          }}
        >
          ¿No estás seguro si te conviene?
        </h2>
        <p
          className="mx-auto mb-8 leading-relaxed text-pretty"
          style={{
            color: "var(--brand-green-900)",
            opacity: 0.8,
            fontSize: "clamp(0.95rem, 1vw + 0.5rem, 1.0625rem)",
            maxWidth: "55ch",
          }}
        >
          Conversa con un médico integrativo de Organnical. Te orientamos sobre dosis, contraindicaciones (anticoagulantes, autoinmunes) y cómo encajar Spirusol con tu salud.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`${ORGANNICAL}/consulta-express?${UTM}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{
              background: "var(--brand-green-700)",
              color: "var(--brand-cream)",
              minWidth: "200px",
            }}
          >
            Consulta Express S/30 →
          </a>
          <a
            href={`${ORGANNICAL}/agendar?${UTM}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors"
            style={{
              border: "1px solid var(--brand-green-700)",
              color: "var(--brand-green-900)",
              minWidth: "200px",
            }}
          >
            <Calendar size={14} /> Agendar consulta →
          </a>
        </div>
      </div>
    </section>
  )
}
