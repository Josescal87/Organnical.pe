import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, ArrowRight, Video, Clock, Shield, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Servicios y Precios — Organnical | Teleconsulta Médica Integrativa",
  description: "Consultas médicas especializadas desde S/ 60. Sueño, dolor crónico, ansiedad y salud femenina. Médicos certificados MINSA. Sin suscripción, pagas solo tu consulta.",
}

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const NAVY = "#0B1D35"

const SPECIALTIES = [
  { icon: "🌙", title: "Sueño", desc: "Insomnio crónico, apnea, sueño no reparador, ritmo circadiano", slug: "sueno", vertical: "sleep" },
  { icon: "🦴", title: "Dolor Crónico", desc: "Fibromialgia, dolor neuropático, lumbalgia, musculoesquelético", slug: "dolor-cronico", vertical: "pain" },
  { icon: "🧠", title: "Ansiedad", desc: "TAG, burnout, estrés crónico, síntomas físicos sin causa orgánica", slug: "ansiedad", vertical: "anxiety" },
  { icon: "🌸", title: "Salud Femenina", desc: "SPM, perimenopausia, menopausia, desequilibrio hormonal", slug: "salud-femenina", vertical: "womens_health" },
]

const INCLUDED = [
  "Consulta de 30-45 minutos con médico certificado CMP",
  "Historia clínica firmada digitalmente",
  "Receta médica válida en farmacias peruanas (si aplica)",
  "Plan de tratamiento documentado",
  "Link de videollamada Google Meet",
  "Invitación a Google Calendar",
]

const FOLLOWUP_INCLUDED = [
  "Revisión de avance del protocolo",
  "Ajuste de tratamiento según resultados",
  "Consulta de 20-30 minutos",
  "Actualización de historia clínica",
]

export default function ServiciosPage() {
  return (
    <main className="bg-white">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: NAVY }}>
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 0%, #1a3a6e 0%, transparent 70%)" }} />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#F472B6] animate-pulse" />
            <span className="text-sm font-medium text-white/80">Precios transparentes · Sin sorpresas</span>
          </div>
          <h1 className="font-display text-5xl font-black text-white leading-tight md:text-6xl mb-5">
            Servicios y{" "}
            <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>
              Precios
            </span>
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            Consultas médicas especializadas por videollamada. Pagas solo lo que usas, sin suscripción ni compromisos.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section className="px-6 py-20 bg-[#F8FAFC]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Tarifas</p>
            <h2 className="font-display text-4xl font-black text-[#0B1D35]">Lo que pagas es lo que ves</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 1 sesión */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">1 consulta</p>
              <div className="mb-1">
                <span className="font-display text-5xl font-black text-[#0B1D35]">S/ 60</span>
              </div>
              <p className="text-sm text-zinc-400 mb-8">por sesión · pago único</p>
              <ul className="space-y-3 flex-1 mb-8">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <CheckCircle className="w-4 h-4 text-[#A78BFA] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/agendar"
                className="block w-full text-center rounded-full py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: G }}
              >
                Agendar consulta
              </Link>
            </div>

            {/* 3 sesiones — popular */}
            <div className="bg-white rounded-3xl border-2 p-8 shadow-xl flex flex-col relative overflow-hidden" style={{ borderColor: "#A78BFA" }}>
              <div className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: G }}>
                Popular
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#A78BFA] mb-4">3 consultas</p>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="font-display text-5xl font-black text-[#0B1D35]">S/ 170</span>
                <span className="text-sm text-zinc-400 line-through">S/ 180</span>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mb-1">Ahorra S/ 10</p>
              <p className="text-sm text-zinc-400 mb-8">S/ 56.67 por sesión</p>
              <ul className="space-y-3 flex-1 mb-8">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <CheckCircle className="w-4 h-4 text-[#A78BFA] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-sm text-zinc-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Sesiones agendadas con 7 días de intervalo
                </li>
              </ul>
              <Link
                href="/agendar"
                className="block w-full text-center rounded-full py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: G }}
              >
                Agendar 3 consultas
              </Link>
            </div>

            {/* 5 sesiones */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">5 consultas</p>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="font-display text-5xl font-black text-[#0B1D35]">S/ 270</span>
                <span className="text-sm text-zinc-400 line-through">S/ 300</span>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mb-1">Ahorra S/ 30</p>
              <p className="text-sm text-zinc-400 mb-8">S/ 54 por sesión</p>
              <ul className="space-y-3 flex-1 mb-8">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <CheckCircle className="w-4 h-4 text-[#A78BFA] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-sm text-zinc-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Ideal para tratamientos de 4-6 semanas
                </li>
              </ul>
              <Link
                href="/agendar"
                className="block w-full text-center rounded-full py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: G }}
              >
                Agendar 5 consultas
              </Link>
            </div>
          </div>

          {/* Follow-up note */}
          <div className="mt-8 bg-white rounded-2xl border border-zinc-100 p-6 flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <p className="font-bold text-[#0B1D35] text-sm mb-1">Consultas de seguimiento</p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Después de tu primera consulta, las de seguimiento son <strong className="text-[#0B1D35]">más económicas</strong>. El precio exacto se muestra al agendar según tu médico y disponibilidad.
              </p>
            </div>
            <ul className="space-y-2 sm:min-w-[220px]">
              {FOLLOWUP_INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
                  <CheckCircle className="w-3.5 h-3.5 text-[#A78BFA] flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Specialties ── */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Especialidades</p>
            <h2 className="font-display text-4xl font-black text-[#0B1D35]">¿Qué necesitas tratar?</h2>
            <p className="text-zinc-500 mt-3 max-w-lg mx-auto">El mismo precio aplica para todas las especialidades. El plan de tratamiento varía según tu condición y médico.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPECIALTIES.map((s) => (
              <Link
                key={s.slug}
                href={`/especialidades/${s.slug}`}
                className="group bg-[#F8FAFC] rounded-2xl p-6 border border-zinc-100 hover:border-violet-200 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-[#0B1D35] mb-2 group-hover:text-[#A78BFA] transition-colors">{s.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">{s.desc}</p>
                <span className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1">
                  Ver especialidad <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust + what's included ── */}
      <section className="px-6 py-20 bg-[#F8FAFC]">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <h3 className="font-bold text-[#0B1D35]">Médicos certificados MINSA</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">CMP activo verificable en SISERMED. Formación en medicina integrativa y funcional.</p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <h3 className="font-bold text-[#0B1D35]">Cita en menos de 48 h</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Sin listas de espera de meses. Agendas hoy, te atiendes esta semana.</p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Video className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <h3 className="font-bold text-[#0B1D35]">100% online desde Perú</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Videoconsulta con Google Meet. Receta y HC válidos en cualquier farmacia del Perú.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ precios ── */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-black text-[#0B1D35] text-center mb-10">Preguntas sobre precios</h2>
          <div className="space-y-4">
            {[
              { q: "¿El precio incluye la receta?", a: "Sí. Si tu médico determina que necesitas medicación, la receta está incluida en el precio de la consulta. No hay cobro adicional." },
              { q: "¿Cuándo se cobra?", a: "Al confirmar la cita en el paso final del wizard de agendamiento. El pago es previo a la consulta, con tarjeta de crédito o débito vía MercadoPago." },
              { q: "¿Qué pasa si necesito cancelar?", a: "Con 24 horas o más de anticipación: devolución completa. Entre 2 y 24 horas: crédito para otra cita. Menos de 2 horas: sin devolución. Ver política completa." },
              { q: "¿El precio varía según el médico?", a: "No. El precio base es el mismo para todos los médicos y especialidades. Los combos de 3 y 5 sesiones tienen descuento fijo." },
              { q: "¿Puedo fraccionar el pago?", a: "Actualmente el pago es en una sola cuota. Para combos de 3 o 5 sesiones, el total se cobra al agendar la primera cita." },
            ].map((faq) => (
              <details key={faq.q} className="bg-[#F8FAFC] rounded-2xl border border-zinc-100">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[#0B1D35] text-sm list-none">
                  {faq.q}
                  <ArrowRight className="w-4 h-4 text-[#A78BFA] flex-shrink-0 rotate-90" />
                </summary>
                <p className="px-5 pb-5 text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center mt-6 text-sm text-zinc-400">
            ¿Más dudas?{" "}
            <Link href="/preguntas-frecuentes" className="text-[#A78BFA] hover:underline">Ver todas las preguntas frecuentes</Link>
            {" "}o escríbenos a{" "}
            <a href="mailto:reservas@organnical.com" className="text-[#A78BFA] hover:underline">reservas@organnical.com</a>
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-20" style={{ background: NAVY }}>
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 mb-6">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm text-white/70">+3,000 pacientes atendidos</span>
          </div>
          <h2 className="font-display text-4xl font-black text-white mb-4">
            Empieza hoy desde S/ 60
          </h2>
          <p className="text-white/55 mb-8 max-w-lg mx-auto">
            Sin suscripción. Sin tarifa de activación. Pagas solo tu consulta y recibes atención médica de calidad en menos de 48 horas.
          </p>
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: G, boxShadow: "0 16px 36px rgba(167,139,250,0.35)" }}
          >
            Agendar mi consulta <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/30 text-xs mt-4">
            ¿Prefieres hablar primero?{" "}
            <a href="https://wa.me/51952476574" className="text-white/50 hover:text-white transition-colors">Escríbenos por WhatsApp</a>
          </p>
        </div>
      </section>

    </main>
  )
}
