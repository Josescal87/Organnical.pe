"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Video, ChevronRight } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";

const QUIZ_STEPS = [
  {
    question: "¿Qué te trae hoy?",
    sub: "Elige la que más resuene. Puedes cambiarla después.",
    type: "glyph",
    options: [
      { label: "Cuesta dormir o descansar",            icon: "◑" },
      { label: "Dolor que no se va",                    icon: "◍" },
      { label: "Ansiedad o bajón emocional",            icon: "○" },
      { label: "Ciclo, hormonas o menopausia",          icon: "◉" },
      { label: "Otra cosa / todavía no lo tengo claro", icon: "◌" },
    ],
  },
  {
    question: "¿Hace cuánto lo vienes cargando?",
    sub: "Esto ayuda a tu médico a priorizar el plan.",
    type: "dots",
    options: [
      { label: "Semanas",               icon: "1" },
      { label: "Meses",                 icon: "2" },
      { label: "Un año o más",          icon: "3" },
      { label: "Prácticamente siempre", icon: "4" },
    ],
  },
  {
    question: "¿Con qué horario te acomoda empezar?",
    sub: "Te mostramos doctores disponibles en ese rango.",
    type: "arrow",
    options: [
      { label: "Lo antes posible (hoy / mañana)", icon: "" },
      { label: "Esta semana",                      icon: "" },
      { label: "Tengo flexibilidad",               icon: "" },
      { label: "Solo noches / fines de semana",    icon: "" },
    ],
  },
];

type Specialty = {
  icon: string;
  title: string;
  slug: string;
};

export default function HeroSection({ specialties }: { specialties: Specialty[] }) {
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(1);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: NAVY }}>
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 70% 50%, #1a3a6e 0%, transparent 70%)" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center pt-28 pb-16 lg:pt-32 lg:pb-20 min-h-screen">

          {/* Left — text */}
          <div className="max-w-xl">
            <div className="hero-badge mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2">
              <span className="h-2 w-2 rounded-full animate-pulse bg-[#F472B6]" />
              <span className="text-sm font-medium text-white/80">Telemedicina Integrativa · Perú</span>
            </div>

            <h1 className="hero-title font-display text-5xl font-black text-white leading-[1.06] tracking-tight md:text-[3.8rem] lg:text-[4.2rem]">
              El médico que{" "}
              <span className="font-display italic" style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>
                te escucha
              </span>{" "}
              y trata la raíz del problema.
            </h1>

            <p className="hero-subtitle mt-6 text-lg text-white/55 leading-relaxed">
              Medicina integrativa basada en evidencia. Tratamientos personalizados
              para sueño, dolor crónico, ansiedad y salud femenina.
            </p>

            <div className="hero-ctas mt-8">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">¿Qué necesitas tratar?</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {specialties.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => setActiveSpecialty(activeSpecialty === s.title ? null : s.title)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      activeSpecialty === s.title
                        ? "text-white border-transparent"
                        : "border-white/20 text-white/60 hover:border-white/40 hover:text-white/90"
                    }`}
                    style={activeSpecialty === s.title ? { background: G, borderColor: "transparent" } : {}}
                  >
                    {s.icon} {s.title}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/registro"
                  className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all shadow-2xl hover:opacity-90"
                  style={{ background: G, boxShadow: "0 16px 36px rgba(167,139,250,0.35)" }}
                >
                  Agendar consulta
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/[0.08] transition-all"
                >
                  <Video className="w-4 h-4" />
                  Ver cómo funciona
                </a>
              </div>
            </div>

            <p className="mt-5 text-xs text-white/35">
              Consultas desde <span className="text-white/60 font-semibold">S/ 60</span> · Primera cita disponible en menos de 48 h
            </p>

            <div className="hero-trust mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
              {["Médicos con CMP activo", "Documentación oficial", "Sin suscripción"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#A78BFA]" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — mini quiz */}
          <div className="hero-card relative flex items-center justify-center mt-4 lg:mt-0">
            <div className="w-full max-w-sm rounded-3xl bg-white overflow-hidden" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.22)" }}>
              {quizStep <= 3 ? (() => {
                const step = QUIZ_STEPS[quizStep - 1];
                return (
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-[10px] font-semibold tracking-widest text-[#A78BFA] uppercase">Mini-Quiz · 45 seg</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map((n) => (
                          <span key={n} className={`h-1 rounded-full transition-all ${n === quizStep ? "w-8 bg-zinc-800" : n < quizStep ? "w-6 bg-[#A78BFA]" : "w-4 bg-zinc-200"}`} />
                        ))}
                      </div>
                    </div>

                    <h3 className="font-display text-[1.4rem] font-black text-zinc-900 leading-tight mb-1.5">{step.question}</h3>
                    <p className="text-sm text-zinc-400 mb-5">{step.sub}</p>

                    <div className="flex flex-col gap-2">
                      {step.options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setQuizStep(quizStep + 1)}
                          className="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                        >
                          {step.type === "glyph" && (
                            <span className="text-base leading-none text-zinc-400 group-hover:text-violet-400 transition-colors select-none w-5 text-center">{opt.icon}</span>
                          )}
                          {step.type === "dots" && (
                            <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-white border border-zinc-200 flex flex-wrap items-center justify-center gap-[3px] p-2 group-hover:border-violet-300 transition-colors">
                              {Array.from({ length: parseInt(opt.icon) }).map((_, i) => (
                                <span key={i} className="w-[5px] h-[5px] rounded-full bg-zinc-400 group-hover:bg-violet-400 transition-colors" />
                              ))}
                            </span>
                          )}
                          {step.type === "arrow" && (
                            <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-white border border-zinc-200 flex items-center justify-center group-hover:border-violet-300 transition-colors">
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                            </span>
                          )}
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {quizStep > 1 && (
                      <button onClick={() => setQuizStep(quizStep - 1)} className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                        ← atrás
                      </button>
                    )}
                  </div>
                );
              })() : (
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: G }}>
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-black text-zinc-900 mb-2">Tenemos médicos para ti</h3>
                  <p className="text-sm text-zinc-500 mb-7 leading-relaxed">
                    Hay especialistas con disponibilidad hoy. Agenda en 2 minutos.
                  </p>
                  <Link
                    href="/registro"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: G, boxShadow: "0 12px 28px rgba(167,139,250,0.35)" }}
                  >
                    Agendar mi consulta <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button onClick={() => setQuizStep(1)} className="mt-3 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                    ← Volver al inicio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
