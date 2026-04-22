import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Clock, Shield, Star, Video, ArrowRight, Phone } from "lucide-react";

/* ─── Brand ───────────────────────────────────────────────────── */
const NAVY = "#0B1D35";
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const u = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;

/* ─── Per-specialty data ──────────────────────────────────────── */
const SPECIALTIES: Record<string, {
  title: string;
  subtitle: string;
  icon: string;
  heroPhoto: string;
  painHeadline: string;
  painSubheadline: string;
  conditions: string[];
  benefits: { icon: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  doctors: { name: string; cmp: string; photo: string; rating: number; reviews: number; tags: string[] }[];
  metaTitle: string;
  metaDescription: string;
}> = {
  sueno: {
    title: "Trastornos del Sueño",
    subtitle: "Recupera el descanso que mereces",
    icon: "🌙",
    heroPhoto: "1541480601022-2308c0f02487",
    painHeadline: "¿Llevas semanas sin dormir bien?",
    painSubheadline: "No estás solo. El 30% de los peruanos sufre insomnio crónico. Con el protocolo correcto, dormir bien vuelve a ser posible.",
    conditions: [
      "Insomnio crónico o de inicio",
      "Apnea del sueño leve a moderada",
      "Síndrome de piernas inquietas",
      "Alteraciones del ritmo circadiano",
      "Insomnio por estrés o ansiedad",
      "Sueño no reparador",
    ],
    benefits: [
      { icon: "🧪", title: "Evaluación integral", desc: "Higiene del sueño, factores emocionales y biológicos. Sin pastillas si no son necesarias." },
      { icon: "📋", title: "Protocolo personalizado", desc: "TCC-I, melatonina, fitoterápicos y ajustes de estilo de vida documentados en tu HC." },
      { icon: "🔁", title: "Seguimiento real", desc: "Revisamos resultados a las 2 y 4 semanas. Ajustamos hasta que duermas bien." },
      { icon: "📄", title: "Documentación oficial", desc: "Historia clínica firmada digitalmente. Recetas válidas en cualquier farmacia del Perú." },
    ],
    faqs: [
      { q: "¿Cuántas consultas necesito?", a: "La mayoría de pacientes nota mejora significativa en 3-4 semanas. El protocolo típico incluye 1 consulta inicial + 2 seguimientos." },
      { q: "¿Me van a recetar somníferos?", a: "No necesariamente. Evaluamos primero higiene del sueño y TCC-I. Los medicamentos son último recurso y siempre documentados." },
      { q: "¿Funciona la telemedicina para el sueño?", a: "Sí. El 90% del protocolo es educación, ajuste de hábitos y seguimiento — perfectamente manejable en videoconsulta." },
      { q: "¿Puedo recetar cannabis medicinal para el insomnio?", a: "Si tienes insomnio crónico asociado a condición médica, el cannabis medicinal (CBD) puede ser parte del protocolo bajo Ley 30681. Tu médico lo evaluará." },
    ],
    doctors: [
      { name: "Dra. Estefanía Poma", cmp: "CMP 059636", photo: "/dra-poma-300x300.png", rating: 4.9, reviews: 142, tags: ["Sueño", "Salud Femenina"] },
    ],
    metaTitle: "Consulta Médica Online para Insomnio y Trastornos del Sueño | Organnical",
    metaDescription: "Recupera tu descanso con médicos certificados. Primera consulta gratis. Trastornos del sueño, insomnio crónico, apnea. Atención por videoconsulta desde Lima, Perú.",
  },
  "dolor-cronico": {
    title: "Dolor Crónico",
    subtitle: "Manejo especializado, sin resignarte",
    icon: "🦴",
    heroPhoto: "1571019613454-1cb2f99b2d8b",
    painHeadline: "El dolor crónico no es \"solo estrés\"",
    painSubheadline: "Es real, tiene diagnóstico y tiene tratamiento. Médicos que te escuchan, te explican y te acompañan.",
    conditions: [
      "Fibromialgia",
      "Dolor neuropático",
      "Dolor musculoesquelético crónico",
      "Lumbalgia crónica",
      "Artritis y artralgias",
      "Dolor oncológico (cuidados de soporte)",
    ],
    benefits: [
      { icon: "🔬", title: "Diagnóstico claro", desc: "Identificamos el origen del dolor — central, periférico o mixto — y lo documentamos con CIE-10." },
      { icon: "🌿", title: "Medicina integrativa", desc: "Combinamos farmacoterapia, fitoterápicos, cannabis medicinal (si aplica) y estrategias no farmacológicas." },
      { icon: "📈", title: "Plan por etapas", desc: "Protocolo progresivo documentado: evaluación, alivio agudo, mantenimiento y prevención de recaídas." },
      { icon: "💬", title: "Sin frases vacías", desc: "\"Aprende a convivir con el dolor\" no es una respuesta. Aquí se trabaja para reducirlo." },
    ],
    faqs: [
      { q: "¿El médico puede recetar cannabis medicinal?", a: "Sí. Si tienes dolor crónico oncológico o no oncológico con criterios clínicos, bajo la Ley 30681 puede prescribirse CBD o THC:CBD. Tu médico evaluará si aplica." },
      { q: "¿Puedo recibir atención si ya tengo un reumatólogo?", a: "Por supuesto. La consulta integrativa complementa tu tratamiento existente. Tu médico coordinará con tu especialista si es necesario." },
      { q: "¿Se puede manejar la fibromialgia por telemedicina?", a: "Sí. El manejo de fibromialgia es principalmente educación, ajuste de medicación y seguimiento — ideal para videoconsulta." },
      { q: "¿Cuánto demora en verse un resultado?", a: "Varía según la condición. En dolor agudo-crónico, muchos pacientes notan alivio en 2-3 semanas. En fibromialgia, el protocolo completo toma 6-8 semanas." },
    ],
    doctors: [
      { name: "Dr. Robert Goodman", cmp: "CMP 095719", photo: "/drgodman-300x300.png", rating: 4.8, reviews: 118, tags: ["Dolor Crónico", "Ansiedad"] },
    ],
    metaTitle: "Consulta Médica Online para Dolor Crónico y Fibromialgia | Organnical",
    metaDescription: "Manejo especializado del dolor crónico, fibromialgia y dolor neuropático. Primera consulta gratis. Médicos certificados. Cannabis medicinal cuando aplica. Lima, Perú.",
  },
  ansiedad: {
    title: "Ansiedad y Bienestar Mental",
    subtitle: "Apoyo médico real, no solo tips",
    icon: "🧠",
    heroPhoto: "1506126613408-eca07ce68773",
    painHeadline: "La ansiedad crónica sí tiene solución médica",
    painSubheadline: "No tienes que medicarte si no quieres. Y si necesitas apoyo farmacológico, lo manejaremos con evidencia y seguimiento.",
    conditions: [
      "Trastorno de ansiedad generalizada (TAG)",
      "Ansiedad situacional o por estrés",
      "Insomnio secundario a ansiedad",
      "Síntomas físicos sin causa orgánica",
      "Burnout y agotamiento emocional",
      "Taquicardia, tensión muscular crónica",
    ],
    benefits: [
      { icon: "🤝", title: "Escucha médica real", desc: "Consulta de 30-45 minutos. Tu médico escucha, evalúa y propone — sin apuros ni respuestas genéricas." },
      { icon: "🌱", title: "Enfoque integrativo", desc: "Técnicas conductuales, suplementación, adaptógenos y cannabis medicinal (CBD) cuando aplica bajo Ley 30681." },
      { icon: "🔗", title: "Derivación coordinada", desc: "Si necesitas psicólogo o psiquiatra, tu médico coordina la derivación y hace seguimiento." },
      { icon: "📱", title: "Disponibilidad real", desc: "Sin lista de espera de meses. Primera cita disponible en menos de 48 horas." },
    ],
    faqs: [
      { q: "¿Un médico general puede tratar la ansiedad?", a: "Sí. El médico general es el primer nivel para ansiedad leve a moderada. Si requieres psiquiatría o psicología, tu médico coordina la derivación." },
      { q: "¿Me van a recetar ansiolíticos?", a: "No necesariamente. Evaluamos primero estrategias no farmacológicas. Si decides medicación, es con seguimiento cercano y documentado." },
      { q: "¿El CBD sirve para la ansiedad?", a: "Bajo la Ley 30681, el CBD puede prescribirse para trastorno de ansiedad generalizada. Tu médico evaluará si aplica en tu caso y si tienes criterios para prescripción legal." },
      { q: "¿Qué pasa si mi ansiedad es severa?", a: "Si en la consulta se detecta ansiedad severa o riesgo, tu médico activará el protocolo de derivación urgente a salud mental o emergencias según corresponda." },
    ],
    doctors: [
      { name: "Dr. Robert Goodman", cmp: "CMP 095719", photo: "/drgodman-300x300.png", rating: 4.8, reviews: 118, tags: ["Ansiedad", "Dolor Crónico"] },
    ],
    metaTitle: "Consulta Médica Online para Ansiedad y Estrés Crónico | Organnical",
    metaDescription: "Manejo médico de la ansiedad sin largas esperas. Primera consulta gratis. Enfoque integrativo, CBD medicinal cuando aplica. Médicos certificados MINSA. Lima, Perú.",
  },
  "salud-femenina": {
    title: "Salud Femenina",
    subtitle: "Tu cuerpo merece atención especializada",
    icon: "🌸",
    heroPhoto: "1552058544-f2b08422138a",
    painHeadline: "\"Normal para tu edad\" no es suficiente respuesta",
    painSubheadline: "Los síntomas hormonales tienen diagnóstico y tratamiento. Médicos que escuchan, explican y acompañan cada etapa.",
    conditions: [
      "Síndrome premenstrual (SPM/PMDD)",
      "Menopausia y perimenopausia",
      "Dismenorrea (dolor menstrual)",
      "Desequilibrio hormonal",
      "Fatiga crónica en mujeres",
      "Salud hormonal integrativa",
    ],
    benefits: [
      { icon: "🧬", title: "Evaluación hormonal integral", desc: "Anamnesis completa, revisión de síntomas y laboratorios. No asumimos, evaluamos." },
      { icon: "🌿", title: "Opciones integrativas", desc: "Fitoterapia, suplementación, cannabis medicinal para dolor (si aplica) y terapia hormonal cuando corresponde." },
      { icon: "📅", title: "Seguimiento en cada etapa", desc: "Protocolo adaptado: SPM, perimenopauisa, menopausia establecida. Tu plan evoluciona contigo." },
      { icon: "🔒", title: "Confidencialidad total", desc: "Historia clínica cifrada, sin acceso de terceros. Solo tú y tu médico." },
    ],
    faqs: [
      { q: "¿Puedo consultar si ya tengo ginecóloga?", a: "Sí. La consulta integrativa complementa tu atención ginecológica. Tu médico coordina con tu especialista si es necesario." },
      { q: "¿Atienden síntomas de menopausia?", a: "Sí. Evaluamos opciones farmacológicas, fitoterapéuticas e integrativas según tu perfil de riesgo y preferencias." },
      { q: "¿Qué es el enfoque integrativo en salud femenina?", a: "Combina medicina convencional con fitoterápicos basados en evidencia, nutrición funcional y manejo del estrés — todo documentado en tu HC." },
      { q: "¿La telemedicina sirve para estos temas?", a: "Sí. La evaluación hormonal y el ajuste de tratamiento son perfectamente manejables por videoconsulta. Si se necesita examen físico, te derivamos." },
    ],
    doctors: [
      { name: "Dra. Estefanía Poma", cmp: "CMP 059636", photo: "/dra-poma-300x300.png", rating: 4.9, reviews: 142, tags: ["Salud Femenina", "Sueño"] },
    ],
    metaTitle: "Consulta Médica Online para Salud Femenina y Menopausia | Organnical",
    metaDescription: "Atención médica integrativa para SPM, menopausia y desequilibrio hormonal. Primera consulta gratis. Médicos certificadas MINSA. Sin listas de espera. Lima, Perú.",
  },
};

/* ─── Metadata ───────────────────────────────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sp = SPECIALTIES[slug];
  if (!sp) return {};
  return {
    title: sp.metaTitle,
    description: sp.metaDescription,
    openGraph: {
      title: sp.metaTitle,
      description: sp.metaDescription,
      images: [{ url: u(sp.heroPhoto, 1200, 630) }],
    },
  };
}

export function generateStaticParams() {
  return Object.keys(SPECIALTIES).map((slug) => ({ slug }));
}

/* ─── Page ───────────────────────────────────────────────────── */
export default async function EspecialidadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sp = SPECIALTIES[slug];
  if (!sp) notFound();

  return (
    <main style={{ background: NAVY, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>

      {/* ── Hero ── */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <Image
          src={u(sp.heroPhoto, 1600, 900)}
          alt={sp.title}
          fill
          priority
          style={{ objectFit: "cover", opacity: 0.18 }}
        />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${NAVY} 50%, transparent)` }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9999, padding: "6px 16px", fontSize: 14, marginBottom: 24 }}>
            <span>{sp.icon}</span>
            <span>{sp.title}</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, maxWidth: 700 }}>
            {sp.painHeadline}
          </h1>
          <p style={{ fontSize: "clamp(1.05rem, 2vw, 1.3rem)", color: "rgba(255,255,255,0.75)", maxWidth: 580, lineHeight: 1.6, marginBottom: 40 }}>
            {sp.painSubheadline}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <Link
              href="/agendar"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: G, color: "#fff", fontWeight: 700, fontSize: "1.05rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none" }}
            >
              Agenda tu primera consulta gratis <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/51952476574"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontWeight: 600, fontSize: "1rem", padding: "16px 28px", borderRadius: 12, textDecoration: "none" }}
            >
              <Phone size={18} /> Consultar por WhatsApp
            </a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 40 }}>
            {[{ icon: "✅", text: "Primera consulta gratis" }, { icon: "🏥", text: "Médicos certificados MINSA" }, { icon: "⚡", text: "Cita disponible hoy" }].map((t) => (
              <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                <span>{t.icon}</span><span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conditions ── */}
      <section style={{ background: "rgba(255,255,255,0.03)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            ¿Qué condiciones atendemos?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 40 }}>
            Consulta médica integrativa para:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {sp.conditions.map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 20px" }}>
                <CheckCircle size={18} style={{ color: "#A78BFA", flexShrink: 0 }} />
                <span style={{ fontSize: 15 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            Cómo funciona la consulta
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 48 }}>
            Un proceso médico completo, desde tu casa.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
            {sp.benefits.map((b) => (
              <div key={b.title} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px 24px" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{b.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>{b.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: "rgba(255,255,255,0.03)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 48 }}>
            Tu primera consulta, paso a paso
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { n: "01", t: "Agenda online", d: "Selecciona fecha y hora. Recibe confirmación inmediata con el link de videoconsulta." },
              { n: "02", t: "Videoconsulta 30-45 min", d: "Tu médico escucha tu historial, síntomas y objetivos. Sin apuros." },
              { n: "03", t: "Recibes tu protocolo", d: "Historia clínica firmada digitalmente, receta (si aplica) y plan de tratamiento en tu email." },
              { n: "04", t: "Seguimiento incluido", d: "Consultas de seguimiento para ajustar el protocolo hasta que logres tus objetivos." },
            ].map((step, i) => (
              <div key={step.n} style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "24px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none", textAlign: "left" }}>
                <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 9999, background: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{step.t}</h3>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.5 }}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            Tu médico para {sp.title}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 48 }}>
            Médicos certificados MINSA con formación en medicina integrativa.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {sp.doctors.map((doc) => (
              <div key={doc.name} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 32, maxWidth: 380, width: "100%" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
                  <Image src={doc.photo} alt={doc.name} width={80} height={80} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>{doc.name}</h3>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>Médico General · Medicina Integrativa</p>
                    <p style={{ fontSize: 13, color: "#A78BFA" }}>{doc.cmp}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  <Star size={16} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                  <span style={{ fontWeight: 700 }}>{doc.rating}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>· {doc.reviews} reseñas</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {doc.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 12, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 9999, padding: "4px 12px" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#34D399", marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399" }} />
                  Disponible hoy
                </div>
                <Link href="/agendar" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: G, color: "#fff", fontWeight: 700, padding: "14px 24px", borderRadius: 10, textDecoration: "none", fontSize: 15 }}>
                  <Video size={16} /> Agendar consulta gratis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section style={{ background: "rgba(255,255,255,0.04)", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
          {[
            { icon: <Shield size={18} />, text: "Médicos certificados MINSA" },
            { icon: <Clock size={18} />, text: "Cita en menos de 48h" },
            { icon: <Video size={18} />, text: "Videoconsulta HIPAA" },
            { icon: <CheckCircle size={18} />, text: "Historia clínica oficial" },
          ].map((t) => (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
              <span style={{ color: "#A78BFA" }}>{t.icon}</span>{t.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 48, textAlign: "center" }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sp.faqs.map((faq) => (
              <details key={faq.q} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "20px 24px" }}>
                <summary style={{ fontWeight: 600, fontSize: "1rem", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {faq.q}
                  <ArrowRight size={16} style={{ flexShrink: 0, color: "#A78BFA", transform: "rotate(90deg)" }} />
                </summary>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, marginTop: 12 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/preguntas-frecuentes" style={{ color: "#A78BFA", textDecoration: "underline", fontSize: 15 }}>
              Ver todas las preguntas frecuentes →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: "60px 40px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{sp.icon}</div>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 16 }}>
            {sp.subtitle}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", marginBottom: 36, lineHeight: 1.6 }}>
            Primera consulta 100% gratis. Sin tarjeta de crédito. Sin compromiso.
          </p>
          <Link
            href="/agendar"
            style={{ display: "inline-flex", alignItems: "center", gap: 12, background: G, color: "#fff", fontWeight: 700, fontSize: "1.1rem", padding: "18px 40px", borderRadius: 12, textDecoration: "none" }}
          >
            Agenda tu consulta gratis <ArrowRight size={20} />
          </Link>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 20 }}>
            ¿Tienes dudas? Escríbenos a{" "}
            <a href="mailto:reservas@organnical.com" style={{ color: "#A78BFA" }}>reservas@organnical.com</a>
          </p>
        </div>
      </section>

    </main>
  );
}
