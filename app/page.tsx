"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star, Shield, Clock, Video, CheckCircle, ArrowRight,
  Heart, Phone, Lock, FileText, Zap, Menu, X, ChevronRight,
  Calendar, Award, Users, MessageSquare,
} from "lucide-react";
import { posts } from "@/lib/blog";

/* ─── Brand tokens ─────────────────────────────────────────── */
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";
const NAVY2 = "#0E2545";

const u = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;

/* ─── Data ──────────────────────────────────────────────────── */

const specialties = [
  { icon: "🌙", title: "Sueño", desc: "Insomnio, apnea y ritmo circadiano", photo: "1541480601022-2308c0f02487", count: "180+ atendidos" },
  { icon: "🦴", title: "Dolor Crónico", desc: "Fibromialgia, neuropático y musculoesquelético", photo: "1571019613454-1cb2f99b2d8b", count: "210+ atendidos" },
  { icon: "🧠", title: "Ansiedad", desc: "Estrés crónico y bienestar emocional", photo: "1506126613408-eca07ce68773", count: "390+ atendidos" },
  { icon: "🌸", title: "Salud Femenina", desc: "SPM, menopausia y equilibrio hormonal", photo: "1552058544-f2b08422138a", count: "320+ atendidos" },
];

const doctors = [
  {
    name: "Dra. Estefanía Poma",
    specialty: "Médico General · Medicina Integrativa",
    cmp: "CMP 059636",
    photo: "/dra-poma-300x300.png",
    rating: 4.9,
    reviews: 142,
    nextAvail: "Hoy disponible",
    tags: ["Sueño", "Salud Femenina"],
  },
  {
    name: "Dr. Robert Goodman",
    specialty: "Médico General · Medicina Integrativa",
    cmp: "CMP 095719",
    photo: "/drgodman-300x300.png",
    rating: 4.8,
    reviews: 118,
    nextAvail: "Hoy disponible",
    tags: ["Dolor Crónico", "Ansiedad"],
  },
];

const testimonials = [
  {
    name: "María C.",
    location: "Lima, San Borja",
    photo: "1531746020-1b38a7c9a1fd",
    rating: 5,
    text: "Llevaba años sin poder dormir bien. La Dra. Poma me entendió desde la primera consulta y diseñó un protocolo que por fin funcionó. El seguimiento es excepcional.",
    specialty: "Paciente · Sueño",
  },
  {
    name: "Carlos R.",
    location: "Miraflores, Lima",
    photo: "1507003211169-0a1dd7228f2d",
    rating: 5,
    text: "Tengo fibromialgia hace 6 años. Nunca había encontrado un médico que me explicara el protocolo completo con tanta claridad. El seguimiento es de otro nivel.",
    specialty: "Paciente · Dolor Crónico",
  },
  {
    name: "Ana P.",
    location: "San Isidro, Lima",
    photo: "1438761681033-6461ffad8d80",
    rating: 5,
    text: "Por fin encontré atención que combina ciencia y escucha real. Me trató el desequilibrio hormonal que otros médicos ignoraban. Completamente recomendada.",
    specialty: "Paciente · Salud Femenina",
  },
];


const trustItems = [
  { icon: Shield, text: "Médicos certificados MINSA" },
  { icon: FileText, text: "Documentación médica oficial" },
  { icon: Clock, text: "Primera cita en < 48h" },
  { icon: Heart, text: "+2,400 pacientes" },
  { icon: Lock, text: "100% confidencial" },
];

const steps = [
  {
    number: "01",
    icon: Calendar,
    title: "Elige tu especialidad",
    description: "Selecciona el área de salud que necesitas atender. Filtra por síntomas o especialidad médica.",
    detail: "Búsqueda inteligente",
    photo: "1486312338219-ce68d2c6f44d",
  },
  {
    number: "02",
    icon: Users,
    title: "Agenda con tu médico",
    description: "Elige el horario que más te convenga. Consulta disponibilidad en tiempo real y recibe confirmación inmediata.",
    detail: "Agenda en tiempo real",
    photo: "1556742049-0cfed4f6a45d",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Recibe tu tratamiento",
    description: "Tu médico elabora un plan personalizado documentado. Acompañamiento continuo hasta tu recuperación.",
    detail: "Plan de tratamiento documentado",
    photo: "1631217868264-e5b90bb7e133",
  },
];

/* ─── Component ─────────────────────────────────────────────── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = () => setMenuOpen(false);
    window.addEventListener("scroll", fn, { once: true, passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [menuOpen]);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 60);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const navLinks = [
    { href: "#especialidades", label: "Especialidades" },
    { href: "#medicos", label: "Médicos" },
    { href: "#como-funciona", label: "Cómo funciona" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      {/* ══════════ NAVBAR ══════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-zinc-100"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-[70px]">
          <Link href="/">
            <Image
              src={scrolled ? "/logo-color.png" : "/logo-white.png"}
              alt="organnical.pe"
              width={170}
              height={40}
              priority
            />
          </Link>

          <nav className={`hidden gap-8 text-sm font-medium md:flex transition-colors ${scrolled ? "text-zinc-500" : "text-white/75"}`}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-[#A78BFA] transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium hidden sm:block transition-colors ${scrolled ? "text-zinc-500 hover:text-zinc-900" : "text-white/75 hover:text-white"}`}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90"
              style={{ background: G }}
            >
              Agendar consulta
            </Link>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={`md:hidden p-2 rounded-lg ${scrolled ? "text-zinc-600" : "text-white"}`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"} bg-white border-b border-zinc-100`}>
          <div className="px-6 py-3 flex flex-col">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-medium text-zinc-700 border-b border-zinc-50 last:border-0 hover:text-[#A78BFA] transition-colors">
                {l.label}
              </a>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="py-3 text-sm font-medium text-zinc-700 hover:text-[#A78BFA] transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ══════════ HERO ══════════ */}
        <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: NAVY }}>
          {/* Background texture */}
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

                {/* Quick specialty selector */}
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

                {/* Trust row */}
                <div className="hero-trust mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
                  {["Médicos con CMP activo", "Documentación oficial", "Sin tarjeta de crédito"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#A78BFA]" /> {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — image */}
              <div className="hero-card relative hidden lg:flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  {/* Main doctor image */}
                  <div
                    className="relative rounded-3xl overflow-hidden shadow-2xl"
                    style={{ aspectRatio: "4/5", background: "linear-gradient(135deg, #1a3a6e 0%, #0B1D35 100%)" }}
                  >
                    <Image
                      src={u("1594824476967-48c8b964273f", 700, 875)}
                      alt="Médica integrativa"
                      fill
                      priority
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D35]/60 via-transparent to-transparent" />
                  </div>

                  {/* Floating card — disponibilidad */}
                  <div className="absolute -bottom-6 -left-10 rounded-2xl bg-white p-4 shadow-2xl min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: G }}>
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Próxima consulta</p>
                        <p className="text-sm font-bold text-zinc-900">Disponible hoy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      2 médicos disponibles
                    </div>
                  </div>

                  {/* Floating card — rating */}
                  <div className="absolute -top-4 -right-8 rounded-2xl bg-white p-4 shadow-2xl">
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-xs font-bold text-zinc-900">4.9 / 5.0</p>
                    <p className="text-[10px] text-zinc-400">+260 reseñas verificadas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ TRUST BAR ══════════ */}
        <section className="bg-white border-b border-zinc-100 px-6 py-5">
          <div className="reveal mx-auto max-w-5xl flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {trustItems.map(({ icon: Icon, text }) => (
              <div key={text} className="group flex items-center gap-2.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors cursor-default">
                <div className="w-7 h-7 rounded-full bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                  <Icon className="w-3.5 h-3.5 text-[#A78BFA]" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ ESPECIALIDADES ══════════ */}
        <section id="especialidades" className="px-6 py-28 bg-[#F8FAFC]">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Especialidades</p>
                <h2 className="font-display text-4xl font-black text-[#0B1D35] md:text-5xl">
                  Tratamos lo que más{" "}
                  <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>importa</span>
                </h2>
              </div>
              <Link href="/registro" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-[#A78BFA] hover:gap-3 transition-all">
                Todos los servicios <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {specialties.map((s, i) => (
                <div
                  key={s.title}
                  className="reveal group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <Image
                      src={u(s.photo, 500, 280)}
                      alt={s.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-2xl">{s.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display font-bold text-[#0B1D35] text-lg mb-1">{s.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-4">{s.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#A78BFA]">{s.count}</span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-violet-50 group-hover:bg-violet-100 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-[#A78BFA]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ BLOG PREVIEW ══════════ */}
        <section className="relative py-24 overflow-hidden" style={{ background: NAVY }}>
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, #1e3d72 0%, transparent 70%)" }} />

          <div className="reveal relative z-10 mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Nuestro blog</p>
                <h2 className="font-display text-4xl font-black text-white md:text-5xl">
                  Medicina con{" "}
                  <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>evidencia</span>
                </h2>
              </div>
              <Link href="/blog" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-[#A78BFA] hover:gap-3 transition-all flex-shrink-0">
                Ver todos los artículos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white/[0.05] border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.09] hover:border-white/20 transition-all duration-300"
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] text-white/35 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {post.readTime} min · {post.dateFormatted}
                    </p>
                    <h3 className="font-display font-bold text-white text-sm leading-snug line-clamp-3 group-hover:text-[#A78BFA] transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#A78BFA]">
                Ver todos los artículos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════ MÉDICOS ══════════ */}
        <section id="medicos" className="py-28 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="reveal mb-14 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Nuestro equipo</p>
              <h2 className="font-display text-4xl font-black text-[#0B1D35] md:text-5xl mb-4">
                Conoce a tus médicos
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto">
                Profesionales certificados por el Colegio Médico del Perú, especializados en medicina integrativa y funcional.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
              {doctors.map((d, i) => (
                <div
                  key={d.name}
                  className="reveal group bg-white rounded-3xl overflow-hidden border border-zinc-100 hover:border-violet-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="h-1" style={{ background: G }} />

                  <div className="relative h-64 overflow-hidden bg-zinc-50">
                    <Image
                      src={d.photo}
                      alt={d.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-zinc-700">Disponible</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-[#0B1D35] text-lg">{d.name}</h3>
                        <p className="text-xs text-[#A78BFA] font-medium mt-0.5">{d.specialty}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-zinc-800">{d.rating}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">{d.reviews} reseñas</p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 mb-4">{d.cmp}</p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {d.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-[#7c6fed]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      {d.nextAvail}
                    </div>

                    <Link
                      href="/registro"
                      className="block w-full text-center rounded-full text-sm font-semibold py-2.5 text-white transition-all hover:opacity-90"
                      style={{ background: G }}
                    >
                      Agendar consulta
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Credencial bar */}
            <div className="reveal mt-14 rounded-2xl border border-zinc-100 bg-[#F8FAFC] p-6 max-w-2xl mx-auto">
              <div className="flex flex-wrap gap-6 justify-center text-center">
                {[
                  { icon: Award, label: "CMP Activo", sub: "Verificado MINSA" },
                  { icon: Shield, label: "RENEC Registrado", sub: "Especialista certificado" },
                  { icon: CheckCircle, label: "Telemedicina", sub: "Habilitado MINSA" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#A78BFA]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-zinc-800">{label}</p>
                      <p className="text-xs text-zinc-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ CÓMO FUNCIONA ══════════ */}
        <section id="como-funciona" className="py-28 bg-[#F8FAFC]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="reveal mb-20 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Proceso</p>
              <h2 className="font-display text-4xl font-black text-[#0B1D35] md:text-5xl">
                Tres pasos hacia{" "}
                <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>tu bienestar</span>
              </h2>
            </div>

            <div className="space-y-20">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className={`reveal flex flex-col gap-10 items-center lg:flex-row ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  <div className="relative w-full lg:w-1/2 overflow-hidden rounded-3xl shadow-lg" style={{ aspectRatio: "16/9" }}>
                    <Image src={u(step.photo, 800, 450)} alt={step.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0B1D35]/30 to-transparent" />
                    <div
                      className="absolute top-5 left-5 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: G }}
                    >
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="lg:w-1/2">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 mb-5">
                      <span className="font-display text-xl font-black text-[#A78BFA]">{step.number}</span>
                    </div>
                    <h3 className="font-display text-3xl font-black text-[#0B1D35] mb-4">{step.title}</h3>
                    <p className="text-zinc-500 leading-relaxed mb-6 text-lg">{step.description}</p>
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: G }}>
                      <Zap className="w-4 h-4" />
                      {step.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIOS ══════════ */}
        <section className="py-28" style={{ background: NAVY2 }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="reveal mb-14 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Testimonios</p>
              <h2 className="font-display text-4xl font-black text-white md:text-5xl">
                Lo que dicen nuestros{" "}
                <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>pacientes</span>
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className="reveal rounded-2xl border border-white/8 bg-white/5 p-7 hover:bg-white/[0.08] transition-colors"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-white/70 leading-relaxed text-sm mb-8">&ldquo;{t.text}&rdquo;</p>

                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                      <Image src={u(t.photo, 80, 80)} alt={t.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-white/35 text-xs">{t.specialty} · {t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-white/20 mt-10">
              Testimonios de pacientes reales. Los resultados individuales pueden variar. Basado en 2,400+ consultas verificadas.
            </p>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="relative py-36 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={u("1576091160550-2173dba999ef", 1800, 900)}
              alt="Consulta online"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: `${NAVY}DD` }} />
          </div>

          <div className="reveal relative z-10 mx-auto max-w-2xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 mb-8">
              <Heart className="w-3.5 h-3.5 text-[#F472B6]" />
              <span className="text-sm text-white/70">Sin filas · Sin esperas · 100% online</span>
            </div>

            <h2 className="font-display text-4xl font-black text-white md:text-5xl mb-5">
              Tu primera consulta a un click de distancia
            </h2>
            <p className="text-white/50 text-lg mb-10">
              Agenda hoy y recibe atención en menos de 48 horas. Primera consulta sin compromiso.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/registro"
                className="group inline-flex items-center gap-2 justify-center rounded-full px-10 py-4 text-base font-semibold text-white shadow-2xl transition-all hover:opacity-90"
                style={{ background: G, boxShadow: "0 20px 40px rgba(167,139,250,0.4)" }}
              >
                Crear cuenta
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/51952476574"
                className="inline-flex items-center gap-2 justify-center rounded-full border border-white/20 bg-white/[0.08] px-10 py-4 text-base font-semibold text-white hover:bg-white/15 transition-all"
              >
                <Phone className="w-4 h-4" />
                Hablar con un asesor
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#060E1A] px-6 pt-2 pb-16 text-zinc-500">
        <div className="h-px w-full mb-14 opacity-25" style={{ background: G }} />

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4 mb-14">
            <div className="md:col-span-1">
              <Image src="/logo-white.png" alt="organnical.pe" width={150} height={36} />
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Clínica virtual de medicina integrativa en el Perú.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 text-sm">
                <a href="https://wa.me/51952476574" className="hover:text-white transition-colors flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> 952 476 574
                </a>
                <a href="mailto:reservas@organnical.com" className="hover:text-white transition-colors">
                  reservas@organnical.com
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">Especialidades</h4>
              <ul className="space-y-2.5 text-sm">
                {["Sueño", "Dolor Crónico", "Ansiedad", "Salud Femenina"].map((e) => (
                  <li key={e}><a href="#especialidades" className="hover:text-white transition-colors">{e}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">Navegación</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a></li>
                <li><a href="#medicos" className="hover:text-white transition-colors">Médicos</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><Link href="/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">Legal</h4>
              <ul className="space-y-2.5 text-sm mb-8">
                <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
                <li>
                  <a href="https://www.indecopi.gob.pe/libro-de-reclamaciones" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Libro de reclamaciones
                  </a>
                </li>
              </ul>
              <h4 className="mb-3 text-sm font-semibold text-white">Medios de pago</h4>
              <div className="flex flex-wrap gap-2">
                {["Yape", "Visa", "Mastercard", "Amex"].map((p) => (
                  <span key={p} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400">{p}</span>
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
            <p>*Índice de satisfacción basado en encuesta interna a pacientes atendidos (n=2,400). Los resultados individuales pueden variar.</p>
            <p>Organnical es una plataforma tecnológica que facilita la conexión entre pacientes y profesionales médicos colegiados. No reemplaza la consulta médica presencial de emergencia.</p>
            <p>© 2019 – {new Date().getFullYear()} Organical Ventures S.A.C. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
