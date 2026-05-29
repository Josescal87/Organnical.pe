import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Phone, Zap } from "lucide-react";
import { getPublishedPosts } from "@/lib/blog";
import ScrollReveal from "./_components/ScrollReveal";
import AuthRedirect from "./_components/AuthRedirect";
import ProductTeaserSection from "./_components/ProductTeaserSection";
import HeroAnimated from "./_components/HeroAnimated";

export const metadata: Metadata = {
  title: "Organnical — Suplementos naturales y telemedicina · Perú",
  description: "Suplementos de bienestar respaldados por médicos especializados. Tienda online con envío gratis desde S/300 y consultas médicas online en menos de 48h.",
  alternates: { canonical: "https://organnical.pe" },
};

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";
const NAVY2 = "#0E2545";

const specialties = [
  { icon: "🌙", label: "Sueño", slug: "sueno" },
  { icon: "🦴", label: "Dolor crónico", slug: "dolor-cronico" },
  { icon: "🧠", label: "Ansiedad", slug: "ansiedad" },
  { icon: "🌸", label: "Salud femenina", slug: "salud-femenina" },
];

const testimonials = [
  {
    name: "Raúl I.", type: "Paciente · Sueño", rating: 5,
    text: "En Organnical me explicaron cómo el tratamiento funcionaba en mi caso. Por fin apago el ruido y duermo profundo.",
  },
  {
    name: "Patricia C.", type: "Paciente · Sueño", rating: 5,
    text: "Dormía 2 o 3 horas cortadas cada noche. La doctora revisó mi caso completo y ahora descanso más de 8 horas seguidas.",
  },
  {
    name: "Carlos M.", type: "Comprador · Gummies", rating: 5,
    text: "Los gummies llegaron rápido y la calidad es increíble. El empaque es hermoso y el efecto se nota desde la primera semana.",
  },
];

export default async function HomePage() {
  const recentPosts = getPublishedPosts().slice(0, 3);

  return (
    <>
      <AuthRedirect />
      <ScrollReveal />
      <main>

        {/* ══════════ HERO ══════════ */}
        <HeroAnimated />

        {/* ══════════ TRUST BAR ══════════ */}
        <div className="bg-white border-b border-zinc-100 py-3 px-6">
          <div className="mx-auto max-w-5xl flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-medium text-zinc-500">
            <span>✅ Envío gratis desde S/300</span>
            <span>🩺 Avalado por médicos</span>
            <span>🔒 Pago seguro</span>
            <span>💬 Soporte WhatsApp</span>
          </div>
        </div>

        {/* ══════════ PRODUCTOS DESTACADOS ══════════ */}
        <ProductTeaserSection />

        {/* ══════════ BRIDGE TELEMEDICINA ══════════ */}
        <section style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a6e)` }} className="py-20 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-3xl font-black text-white mb-4 md:text-4xl">
              El catálogo completo de botica se abre al iniciar sesión
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">
              Acceso para pacientes con receta médica vigente. ¿Aún no tienes receta? Empieza por una Consulta Express.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consulta-express"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F472B6] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-lg"
              >
                <Zap className="w-4 h-4" /> Express S/30 — hoy mismo
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Iniciar sesión <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════ BLOG PREVIEW ══════════ */}
        <section className="py-20 px-6 bg-[#F8FAFC]">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Blog</p>
                <h2 className="font-display text-3xl font-black text-[#0B1D35] md:text-4xl">
                  Aprende sobre bienestar
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#A78BFA] hover:gap-3 transition-all"
              >
                Ver todo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="reveal grid gap-5 sm:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-violet-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative h-40 overflow-hidden bg-zinc-50">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA] mb-2">
                      {post.category} · {post.readTime} min
                    </p>
                    <h3 className="font-bold text-sm text-[#0B1D35] leading-snug line-clamp-3 group-hover:text-[#A78BFA] transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIOS ══════════ */}
        <section className="py-20 px-6" style={{ background: NAVY2 }}>
          <div className="mx-auto max-w-5xl">
            <div className="reveal mb-12 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#F472B6] mb-3">Testimonios</p>
              <h2 className="font-display text-3xl font-black text-white md:text-4xl">
                Lo que dicen nuestros{" "}
                <span style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundImage: G }}>
                  pacientes y clientes
                </span>
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className="reveal flex flex-col rounded-2xl border border-white/8 bg-white/5 p-6 hover:bg-white/[0.08] transition-colors"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/70 leading-relaxed text-sm mb-6 flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: G }}
                    >
                      {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-white/35 text-xs">{t.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section
          className="py-24 px-6 text-center"
          style={{ background: G }}
        >
          <div className="mx-auto max-w-xl">
            <h2 className="font-display text-3xl font-black text-white mb-4 md:text-4xl">
              Empieza tu bienestar hoy
            </h2>
            <p className="text-white/85 text-base mb-8">
              Crea tu cuenta gratis y accede a la tienda, consultas médicas y tu historial en un solo lugar.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {specialties.map((s) => (
                <Link
                  key={s.slug}
                  href={`/especialidades/${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-80"
                  style={{ background: "rgba(167,139,250,0.25)", border: "1px solid rgba(167,139,250,0.5)" }}
                >
                  <span>{s.icon}</span> {s.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-sm font-bold text-[#A78BFA] shadow-xl transition-all hover:scale-[1.02]"
              >
                Crear cuenta gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/51952476574?text=Hola%2C%20quisiera%20saber%20m%C3%A1s%20sobre%20sus%20servicios%20de%20bienestar%20y%20consultas%20m%C3%A9dicas.%20%C2%BFPueden%20orientarme%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/15 px-10 py-4 text-sm font-semibold text-white transition-all hover:bg-white/25"
              >
                <Phone className="w-4 h-4" />
                Hablar con un asesor
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
