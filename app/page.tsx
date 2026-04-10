"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star, Shield, Clock, Video, CheckCircle, ArrowRight,
  Heart, Phone, Lock, FileText, Zap,
} from "lucide-react";

const u = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;

/* ─────────────────────────── DATA ─────────────────────────── */

const specialties = [
  {
    icon: "🌙",
    title: "Sueño",
    subtitle: "Medicina del sueño",
    description: "Insomnio crónico, apnea y trastornos del ritmo circadiano con enfoque integrativo.",
    photo: "1541480601022-2308c0f02487",
    tag: "Más solicitado",
  },
  {
    icon: "🦴",
    title: "Dolor Crónico",
    subtitle: "Manejo del dolor",
    description: "Protocolos para dolor neuropático, fibromialgia y musculoesquelético.",
    photo: "1571019613454-1cb2f99b2d8b",
    tag: null,
  },
  {
    icon: "🧠",
    title: "Ansiedad",
    subtitle: "Salud mental",
    description: "Estrés crónico, ansiedad generalizada y bienestar emocional sostenible.",
    photo: "1506126613408-eca07ce68773",
    tag: null,
  },
  {
    icon: "🌸",
    title: "Salud Femenina",
    subtitle: "Bienestar hormonal",
    description: "SPM, endometriosis, menopausia y equilibrio hormonal con evidencia.",
    photo: "1552058544-f2b08422138a",
    tag: null,
  },
];

const doctors = [
  {
    name: "Dra. Valeria Mendoza",
    specialty: "Medicina del Sueño",
    cmp: "CMP 89742",
    photo: "1559839734-2b71ea197ec2",
    rating: 4.9,
    reviews: 312,
    nextAvail: "Hoy, 4:00 PM",
  },
  {
    name: "Dr. Andrés Castillo",
    specialty: "Dolor Crónico",
    cmp: "CMP 71234",
    photo: "1612349317150-e413f6a5b16d",
    rating: 4.8,
    reviews: 198,
    nextAvail: "Mañana, 10:00 AM",
  },
  {
    name: "Dra. Sofía Paredes",
    specialty: "Salud Femenina",
    cmp: "CMP 94561",
    photo: "1594824476967-48c8b964273f",
    rating: 4.9,
    reviews: 441,
    nextAvail: "Hoy, 6:30 PM",
  },
  {
    name: "Dr. Luis Ramírez",
    specialty: "Ansiedad & Estrés",
    cmp: "CMP 62198",
    photo: "1582750433449-648ed127bb54",
    rating: 4.7,
    reviews: 267,
    nextAvail: "Vie, 11:00 AM",
  },
];

const testimonials = [
  {
    name: "María C.",
    location: "Lima",
    photo: "1494790108377-be9c29b29330",
    rating: 5,
    text: "Llevaba mucho tiempo buscando atención especializada para mi insomnio. La Dra. Mendoza me dio un seguimiento personalizado que ninguna otra consulta me había dado.",
    specialty: "Paciente · Sueño",
  },
  {
    name: "Carlos R.",
    location: "Miraflores",
    photo: "1507003211169-0a1dd7228f2d",
    rating: 5,
    text: "El Dr. Castillo se tomó el tiempo para entender mi situación de dolor crónico y me explicó cada paso del protocolo. La atención y el seguimiento son excepcionales.",
    specialty: "Paciente · Dolor Crónico",
  },
  {
    name: "Ana P.",
    location: "San Isidro",
    photo: "1438761681033-6461ffad8d80",
    rating: 5,
    text: "Por fin encontré a alguien que me escuchó sobre mi salud femenina. La Dra. Paredes me brindó una atención muy humana y profesional.",
    specialty: "Paciente · Salud Femenina",
  },
];

const stats = [
  { value: "2,400+", label: "Pacientes atendidos" },
  { value: "98%", label: "Satisfacción*" },
  { value: "<48h", label: "Primera cita" },
  { value: "4", label: "Especialidades" },
];

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    description: "Regístrate en menos de 3 minutos con tu correo y DNI. Sin tarjeta de crédito requerida.",
    detail: "Proceso 100% digital",
    photo: "1486312338219-ce68d2c6f44d",
  },
  {
    number: "02",
    title: "Elige tu médico",
    description: "Filtra por especialidad, horario y disponibilidad. Lee reseñas reales de otros pacientes.",
    detail: "Agenda en tiempo real",
    photo: "1556742049-0cfed4f6a45d",
  },
  {
    number: "03",
    title: "Recibe tu tratamiento",
    description: "Tu médico emite una receta digital válida en el Perú. Accede a tus productos directamente.",
    detail: "Receta con firma digital",
    photo: "1631217868264-e5b90bb7e133",
  },
];

/* ─────────────────────────── COMPONENT ─────────────────────────── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ══════════════════════════════ NAVBAR ══════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-zinc-100"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-[72px]">
          <Link
            href="/"
            className={`text-2xl font-extrabold tracking-tight transition-colors duration-300 ${
              scrolled ? "text-[#1a1a1a]" : "text-white"
            }`}
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            organnical
          </Link>

          <nav
            className={`hidden gap-8 text-sm font-medium md:flex transition-colors duration-300 ${
              scrolled ? "text-zinc-500" : "text-white/80"
            }`}
          >
            <a href="#especialidades" className="hover:text-[#7c6fed] transition-colors">Especialidades</a>
            <a href="#medicos" className="hover:text-[#7c6fed] transition-colors">Médicos</a>
            <a href="#como-funciona" className="hover:text-[#7c6fed] transition-colors">Cómo funciona</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors hidden sm:block ${
                scrolled ? "text-zinc-500 hover:text-[#1a1a1a]" : "text-white/80 hover:text-white"
              }`}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-full bg-[#16a34a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#15803d] transition-colors shadow-lg shadow-green-900/20"
            >
              Comenzar
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ══════════════════════════════ HERO ══════════════════════════════ */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={u("1576091160399-112ba8d25d1d", 1920, 1080)}
              alt="Consulta médica online"
              fill
              priority
              className="object-cover object-center"
            />
            {/* Cinematic gradient: very dark left → fades right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#030712]/75 to-[#030712]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
            <div className="max-w-2xl pt-32 pb-24">
              {/* Pill badge */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-sm font-medium text-white/90">Telemedicina Integrativa · Perú</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl font-extrabold text-white leading-[1.08] tracking-tight md:text-[5.5rem]">
                Medicina que{" "}
                <span
                  style={{
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    backgroundImage: "linear-gradient(135deg, #9b8ff5 0%, #e8836e 100%)",
                  }}
                >
                  te escucha
                </span>{" "}
                de verdad.
              </h1>

              <p className="mt-7 text-xl text-white/65 leading-relaxed max-w-xl">
                Conectamos pacientes con médicos especializados en medicina integrativa.
                Tratamientos personalizados, receta legal y seguimiento continuo.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/registro"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-8 py-4 text-base font-semibold text-white hover:bg-[#15803d] transition-all shadow-2xl shadow-green-900/40"
                >
                  Agenda tu primera consulta
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all"
                >
                  <Video className="w-4 h-4" />
                  Ver cómo funciona
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/55">
                {["Médicos con CMP activo", "Recetas válidas en Perú", "Consulta 100% online"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Floating availability card — desktop only */}
          <div className="absolute bottom-12 right-10 hidden xl:block">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 text-white shadow-2xl min-w-[220px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#16a34a] flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Próxima consulta</p>
                  <p className="text-sm font-bold">Disponible hoy</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  3 médicos online ahora
                </span>
                <span className="text-[#22c55e] font-semibold">Ver →</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ TRUST BAR ══════════════════════════════ */}
        <section className="bg-zinc-50 border-b border-zinc-100 px-6 py-5">
          <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {[
              { icon: Shield, text: "Médicos certificados MINSA" },
              { icon: FileText, text: "Receta con firma digital" },
              { icon: Clock, text: "Primera cita en < 48h" },
              { icon: Heart, text: "+2,400 pacientes" },
              { icon: Lock, text: "100% confidencial" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-zinc-500">
                <Icon className="w-4 h-4 text-[#7c6fed]" />
                {text}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════ ESPECIALIDADES ══════════════════════════════ */}
        <section id="especialidades" className="px-6 py-28 bg-white">
          <div className="mx-auto max-w-6xl">
            {/* Section header — left aligned */}
            <div className="mb-16 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#e8836e] mb-3">
                Especialidades
              </p>
              <h2 className="text-4xl font-extrabold text-[#1a1a1a] leading-tight md:text-5xl">
                Tratamos lo que más{" "}
                <span
                  style={{
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    backgroundImage: "linear-gradient(135deg, #7c6fed 0%, #e8836e 100%)",
                  }}
                >
                  importa
                </span>
              </h2>
            </div>

            {/* Image cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {specialties.map((s) => (
                <div
                  key={s.title}
                  className="group relative overflow-hidden rounded-3xl cursor-pointer"
                  style={{ aspectRatio: "3/4" }}
                >
                  <Image
                    src={u(s.photo, 600, 800)}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/0 transition-opacity duration-300" />

                  {s.tag && (
                    <div className="absolute top-4 left-4 rounded-full bg-[#16a34a] px-3 py-1 text-xs font-semibold text-white">
                      {s.tag}
                    </div>
                  )}

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <span className="text-3xl block mb-2">{s.icon}</span>
                    <h3 className="text-xl font-bold mb-0.5">{s.title}</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider mb-3">{s.subtitle}</p>
                    {/* Description slides up on hover */}
                    <p className="text-sm text-white/75 leading-relaxed translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ MÉDICOS ══════════════════════════════ */}
        <section id="medicos" className="py-28 bg-[#f8fafc]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-[#e8836e] mb-3">
                  Nuestro equipo
                </p>
                <h2 className="text-4xl font-extrabold text-[#1a1a1a] leading-tight md:text-5xl">
                  Tu médico te espera
                </h2>
              </div>
              <Link
                href="/registro"
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#7c6fed] hover:gap-3 transition-all"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {doctors.map((d) => (
                <div
                  key={d.name}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Photo */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={u(d.photo, 400, 500)}
                      alt={d.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Available badge */}
                    <div className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-[#16a34a] border border-[#16a34a]/20">
                      Disponible
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-[#1a1a1a] mb-0.5">{d.name}</h3>
                    <p className="text-sm text-[#7c6fed] font-medium mb-1">{d.specialty}</p>
                    <p className="text-xs text-zinc-400 mb-3">{d.cmp}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {d.rating} ({d.reviews})
                      </span>
                    </div>

                    {/* Next available */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      {d.nextAvail}
                    </div>

                    <Link
                      href="/registro"
                      className="block w-full text-center rounded-full bg-[#eef0ff] text-[#7c6fed] text-sm font-semibold py-2.5 hover:bg-[#7c6fed] hover:text-white transition-colors"
                    >
                      Agendar consulta
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ CÓMO FUNCIONA ══════════════════════════════ */}
        <section id="como-funciona" className="py-28 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-20 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#e8836e] mb-3">
                Proceso
              </p>
              <h2 className="text-4xl font-extrabold text-[#1a1a1a] leading-tight md:text-5xl">
                Tres pasos hacia{" "}
                <span
                  style={{
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    backgroundImage: "linear-gradient(135deg, #7c6fed 0%, #e8836e 100%)",
                  }}
                >
                  tu bienestar
                </span>
              </h2>
            </div>

            {/* Alternating image + text layout */}
            <div className="space-y-24">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className={`flex flex-col gap-12 items-center lg:flex-row ${
                    i % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative w-full lg:w-1/2 overflow-hidden rounded-3xl" style={{ aspectRatio: "16/9" }}>
                    <Image
                      src={u(step.photo, 800, 500)}
                      alt={step.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7c6fed]/20 to-transparent" />
                  </div>

                  {/* Text */}
                  <div className="lg:w-1/2">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef0ff] mb-6">
                      <span className="text-2xl font-extrabold text-[#7c6fed]">{step.number}</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-[#1a1a1a] mb-4">{step.title}</h3>
                    <p className="text-lg text-zinc-500 leading-relaxed mb-6">{step.description}</p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f0fdf4] px-4 py-2 text-sm font-semibold text-[#16a34a]">
                      <Zap className="w-4 h-4" />
                      {step.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ TESTIMONIALS ══════════════════════════════ */}
        <section className="py-28 bg-[#0f172a]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#e8836e] mb-3">
                Testimonios
              </p>
              <h2 className="text-4xl font-extrabold text-white leading-tight md:text-5xl">
                Lo que dicen nuestros{" "}
                <span
                  style={{
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    backgroundImage: "linear-gradient(135deg, #9b8ff5 0%, #e8836e 100%)",
                  }}
                >
                  pacientes
                </span>
              </h2>
            </div>

            <p className="text-center text-xs text-white/30 mb-8">
              Testimonios reales de pacientes. Los resultados individuales pueden variar. Basado en {new Date().getFullYear() === 2026 ? "2,400+" : "2,000+"} evaluaciones verificadas.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-colors"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-white/75 leading-relaxed text-[15px] mb-8">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Patient */}
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={u(t.photo, 80, 80)}
                        alt={t.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-white/40 text-xs">{t.specialty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ STATS ══════════════════════════════ */}
        <section className="py-24 bg-[#16a34a]">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-5xl font-extrabold text-white mb-2 md:text-6xl">{s.value}</p>
                  <p className="text-green-100 text-sm font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ FINAL CTA ══════════════════════════════ */}
        <section className="relative py-40 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={u("1576091160550-2173dba999ef", 1800, 900)}
              alt="Consulta online"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#0f172a]/82" />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#e8836e] mb-5">
              ¿Listo para empezar?
            </p>
            <h2 className="text-4xl font-extrabold text-white leading-tight md:text-6xl mb-6">
              Tu primera consulta a un click de distancia
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Sin filas, sin esperas. Agenda hoy y recibe atención en menos de 48 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/registro"
                className="group inline-flex items-center gap-2 justify-center rounded-full bg-[#16a34a] px-10 py-4 text-base font-semibold text-white hover:bg-[#15803d] transition-all shadow-2xl shadow-green-900/50"
              >
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/51952476574"
                className="inline-flex items-center gap-2 justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-10 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all"
              >
                <Phone className="w-4 h-4" />
                Hablar con un asesor
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════ FOOTER ══════════════════════════════ */}
      <footer className="bg-[#030712] px-6 py-16 text-zinc-500">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4 mb-14">
            {/* Brand */}
            <div className="md:col-span-1">
              <span
                className="text-xl font-extrabold text-white"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                organnical
              </span>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Clínica virtual de medicina integrativa en el Perú.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 text-sm">
                <a
                  href="https://wa.me/51952476574"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" /> 952 476 574
                </a>
                <a
                  href="mailto:reservas@organnical.com"
                  className="hover:text-white transition-colors"
                >
                  reservas@organnical.com
                </a>
              </div>
            </div>

            {/* Especialidades */}
            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">Especialidades</h4>
              <ul className="space-y-2.5 text-sm">
                {["Sueño", "Dolor Crónico", "Ansiedad", "Salud Femenina"].map((e) => (
                  <li key={e}>
                    <a href="#especialidades" className="hover:text-white transition-colors">{e}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navegación */}
            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">Navegación</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a></li>
                <li><a href="#medicos" className="hover:text-white transition-colors">Médicos</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><Link href="/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>

            {/* Legal + Pagos */}
            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">Legal</h4>
              <ul className="space-y-2.5 text-sm mb-8">
                <li>
                  <Link href="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link>
                </li>
                <li>
                  <Link href="/terminos" className="hover:text-white transition-colors">Términos y condiciones</Link>
                </li>
                <li>
                  <a href="https://www.indecopi.gob.pe/libro-de-reclamaciones" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Libro de reclamaciones</a>
                </li>
              </ul>
              <h4 className="mb-3 text-sm font-semibold text-white">Medios de pago</h4>
              <div className="flex flex-wrap gap-2">
                {["Yape", "Visa", "Mastercard", "Amex"].map((p) => (
                  <span
                    key={p}
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 space-y-3 text-center text-xs text-zinc-600">
            <p>
              <span className="text-zinc-500">Organical Ventures S.A.C.</span>
              {" · "}RUC 20607170615
              {" · "}Av. La Mar 750, Of. 510, Miraflores, Lima, Perú
            </p>
            <p>
              *Índice de satisfacción basado en encuesta interna a pacientes atendidos (n=2,400). Los resultados individuales pueden variar.
            </p>
            <p>
              Organnical es una plataforma tecnológica que facilita la conexión entre pacientes y profesionales médicos colegiados. No reemplaza la consulta médica presencial de emergencia.
            </p>
            <p>© 2019 – {new Date().getFullYear()} Organical Ventures S.A.C. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
