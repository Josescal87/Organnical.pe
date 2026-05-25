import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Clock, Shield, ArrowRight, MessageCircle, Zap, BadgeCheck } from "lucide-react";

const NAVY = "#0B1D35";
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const TEAL = "#0B5C5E";

const u = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;

const HERO_PHOTO = "1559757148-5c350d0d3c56"; // back/neck pain stock
const EXPRESS_MOTIVO = "Tengo dolor muscular (espalda, cuello o contractura) y quiero orientación médica.";
const EXPRESS_HREF = `/consulta-express?motivo=${encodeURIComponent(EXPRESS_MOTIVO)}`;

export const metadata = {
  title: "Consulta Express S/30 para Dolor de Espalda, Cuello y Contracturas | Organnical",
  description:
    "Dolor muscular agudo, lumbar, cervical o tortícolis. Te atiende un médico certificado MINSA por WhatsApp en menos de 2 horas. Consulta Express por S/30 desde tu casa.",
  openGraph: {
    title: "Consulta Express S/30 para Dolor Muscular Agudo | Organnical",
    description:
      "Médico te escribe por WhatsApp en menos de 2 h. Dolor lumbar, cervical, contractura, tortícolis. S/30 desde tu casa.",
    images: [{ url: u(HERO_PHOTO, 1200, 630) }],
  },
};

const CONDITIONS = [
  "Dolor de espalda baja (lumbar)",
  "Dolor cervical y de hombros",
  "Contracturas musculares",
  "Tortícolis aguda",
  "Dolor de espalda alta",
  "Tensión muscular por estrés",
];

const BENEFITS = [
  {
    icon: "⚡",
    title: "Te escriben en menos de 2 h",
    desc: "Pides la consulta y la Dra te contacta por WhatsApp ese mismo día. No agendas — atiendes cuando puedas.",
  },
  {
    icon: "👩‍⚕️",
    title: "Médico real, no un bot",
    desc: "Dra. Mariana Prialé Miranda, certificada MINSA (CMP 63694). Evalúa tu dolor, propone manejo y deriva si hace falta.",
  },
  {
    icon: "📄",
    title: "Plan de manejo documentado",
    desc: "Recibes orientación clínica clara, registrada por médica certificada. Si necesitas examen físico, te derivamos al especialista correcto.",
  },
  {
    icon: "💸",
    title: "S/30 — pagas solo si confirmas",
    desc: "Sin suscripción. Sin fila. Sin sala de espera. Una sola vez, y solo si decides proceder.",
  },
];

const STEPS = [
  {
    n: "01",
    t: "Llenas tus datos en 1 minuto",
    d: "Nombre, DNI, WhatsApp y cuándo te conviene atenderte. Sin formularios largos.",
  },
  {
    n: "02",
    t: "Pagas S/30 por MercadoPago",
    d: "Tarjeta, Yape o transferencia. Confirmación inmediata.",
  },
  {
    n: "03",
    t: "Te escribe la Dra por WhatsApp",
    d: "En menos de 2 h te escribe al número que registraste. Le cuentas qué te pasa.",
  },
  {
    n: "04",
    t: "Recibes orientación y plan de manejo",
    d: "Plan claro y documentado por la médica, o derivación a especialidad si tu caso lo necesita.",
  },
];

const FAQS = [
  {
    q: "¿Qué tipo de dolor pueden atender por Express?",
    a: "Dolor muscular agudo: lumbar, cervical, contractura, tortícolis, dolor de espalda por mala postura o estrés. Si el dolor viene de un golpe fuerte, accidente, o tienes fiebre/pérdida de fuerza, la Dra te derivará a emergencia presencial.",
  },
  {
    q: "¿Cuándo me atienden?",
    a: "Si pides 'Lo antes posible' y pagas antes de las 7 pm, la Dra te escribe ese mismo día en menos de 2 horas (horario 9 am–9 pm). También puedes pedir hoy o mañana.",
  },
  {
    q: "¿La consulta es por video o por mensaje?",
    a: "Por WhatsApp. La Dra te escribe, conversan tu caso, ella puede pedirte fotos o audios si lo necesita, y luego te envía un plan de manejo documentado. Si requiere video, lo coordinan en el momento.",
  },
  {
    q: "¿Qué incluye la consulta?",
    a: "Evaluación de tus síntomas, orientación sobre medidas inmediatas (postura, calor local, ejercicios suaves), un plan de manejo documentado por la Dra, y derivación a un especialista si tu caso lo amerita.",
  },
  {
    q: "¿Qué pasa si necesito un especialista (traumatólogo, fisiatra)?",
    a: "La Dra te indica claramente cuándo necesitas un especialista y te orienta sobre dónde acudir. La Consulta Express es triage médico real, no reemplazo del especialista cuando hace falta.",
  },
];

export default function DolorMuscularPage() {
  return (
    <main style={{ background: NAVY, color: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>
      {/* ── Hero ── */}
      <section style={{ position: "relative", minHeight: "85vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <Image
          src={u(HERO_PHOTO, 1600, 900)}
          alt="Dolor muscular"
          fill
          priority
          style={{ objectFit: "cover", opacity: 0.16 }}
        />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${NAVY} 50%, transparent)` }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "80px 24px 60px", width: "100%" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(11,92,94,0.20)",
              border: "1px solid rgba(11,92,94,0.4)",
              borderRadius: 9999,
              padding: "6px 16px",
              fontSize: 14,
              marginBottom: 24,
              color: "#A7F3D0",
            }}
          >
            <Zap size={14} /> Consulta Express · S/30
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, maxWidth: 720 }}>
            ¿Dolor de espalda, cuello o contractura?
          </h1>
          <p style={{ fontSize: "clamp(1.05rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.78)", maxWidth: 600, lineHeight: 1.5, marginBottom: 36 }}>
            Un médico real te escribe por <strong>WhatsApp en menos de 2 horas</strong>. Sin filas, sin agendar, sin viajar.
            Pagas <strong>S/30</strong> solo si decides hacer la consulta.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <Link
              href={EXPRESS_HREF}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: G,
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.05rem",
                padding: "16px 28px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Iniciar consulta — S/30 <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/51952476574?text=Hola%2C%20me%20duele%20la%20espalda%20y%20quisiera%20una%20consulta%20express."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "16px 24px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              <MessageCircle size={18} /> Pregunto primero
            </a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 32 }}>
            {[
              { icon: "✅", text: "Médico certificado MINSA" },
              { icon: "⚡", text: "Atención en menos de 2 h" },
              { icon: "📱", text: "Por WhatsApp desde tu casa" },
            ].map((t) => (
              <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                <span>{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conditions ── */}
      <section style={{ background: "rgba(255,255,255,0.03)", padding: "70px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            ¿Qué tipos de dolor podemos orientar?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 40 }}>
            Dolor muscular agudo o subagudo, de cualquier zona:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {CONDITIONS.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <CheckCircle size={18} style={{ color: "#A78BFA", flexShrink: 0 }} />
                <span style={{ fontSize: 15 }}>{c}</span>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 24, textAlign: "center", maxWidth: 700, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            <strong>No es para emergencias:</strong> si tu dolor vino de un golpe fuerte, accidente, hay pérdida de fuerza, fiebre o no puedes moverte, acude a emergencia presencial.
          </p>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section style={{ padding: "70px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            Por qué Consulta Express
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 48 }}>
            Para dolor agudo que no necesita videoconsulta agendada.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: "28px 24px",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{b.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>{b.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: "rgba(255,255,255,0.03)", padding: "70px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 48 }}>
            Cómo funciona
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                style={{
                  display: "flex",
                  gap: 24,
                  alignItems: "flex-start",
                  padding: "24px 0",
                  borderBottom: i < STEPS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    borderRadius: 9999,
                    background: G,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
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

      {/* ── Doctor ── */}
      <section style={{ padding: "70px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            Tu médico
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 40 }}>
            Médica certificada MINSA con experiencia en medicina integrativa.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: 32,
                maxWidth: 420,
                width: "100%",
              }}
            >
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
                <Image
                  src="https://jeomfjulczuimrmonmom.supabase.co/storage/v1/object/public/fotos/dra-priale-300x300.jpg"
                  alt="Dra. Mariana Prialé Miranda"
                  width={80}
                  height={80}
                  style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  unoptimized
                />
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>Dra. Mariana Prialé Miranda</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>Médico General · Medicina Integrativa</p>
                  <p style={{ fontSize: 13, color: "#A78BFA" }}>CMP 63694</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "#A7F3D0" }}>
                <BadgeCheck size={16} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>Médica certificada MINSA</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Atiende todas las consultas Express. Experiencia en dolor agudo, manejo integrativo de síntomas musculoesqueléticos y orientación clínica inicial.
              </p>
              <Link
                href={EXPRESS_HREF}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: G,
                  color: "#fff",
                  fontWeight: 700,
                  padding: "14px 24px",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontSize: 15,
                }}
              >
                <MessageCircle size={16} /> Iniciar consulta — S/30
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section
        style={{
          background: "rgba(255,255,255,0.04)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "28px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 36 }}>
          {[
            { icon: <Shield size={18} />, text: "Médico certificado MINSA" },
            { icon: <Clock size={18} />, text: "Atención en menos de 2 h" },
            { icon: <MessageCircle size={18} />, text: "WhatsApp directo con la Dra" },
            { icon: <CheckCircle size={18} />, text: "Plan de manejo documentado" },
          ].map((t) => (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
              <span style={{ color: "#A78BFA" }}>{t.icon}</span>
              {t.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "70px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: 40, textAlign: "center" }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "20px 24px",
                }}
              >
                <summary
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {faq.q}
                  <ArrowRight size={16} style={{ flexShrink: 0, color: "#A78BFA", transform: "rotate(90deg)" }} />
                </summary>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, marginTop: 12 }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: "70px 24px 90px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 24,
            padding: "50px 36px",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 16 }}>
            Tu dolor no tiene por qué esperar
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", marginBottom: 12, lineHeight: 1.6 }}>
            Médico real, certificado MINSA, te escribe por WhatsApp en menos de 2 h.
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", marginBottom: 28 }}>
            <strong style={{ color: "#fff" }}>S/30</strong> · Sin suscripción · Sin filas
          </p>
          <Link
            href={EXPRESS_HREF}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: G,
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.1rem",
              padding: "18px 36px",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            Iniciar consulta express <ArrowRight size={20} />
          </Link>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 20 }}>
            ¿Dudas? Escríbenos a{" "}
            <a href="mailto:reservas@organnical.com" style={{ color: "#A78BFA" }}>
              reservas@organnical.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
