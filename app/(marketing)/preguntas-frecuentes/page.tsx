import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Organnical",
  description: "Resolvemos tus dudas sobre telemedicina, consultas médicas online, recetas, pagos y privacidad. Organnical — atención médica integrativa en Perú.",
};

const NAVY = "#0B1D35";
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const sections = [
  {
    title: "Consultas y Telemedicina",
    faqs: [
      {
        q: "¿Qué es una teleconsulta médica?",
        a: "Es una consulta médica realizada por videollamada. Tiene la misma validez legal que una consulta presencial en Perú, según el Decreto Supremo 029-2020-SA. Tu médico puede evaluar, diagnosticar, prescribir y firmar tu historia clínica.",
      },
      {
        q: "¿Las consultas son con médicos reales y certificados?",
        a: "Sí. Todos nuestros médicos tienen CMP (Colegio Médico del Perú) activo, verificable en SISERMED del MINSA. Sus credenciales aparecen en cada consulta.",
      },
      {
        q: "¿Cuánto dura una consulta?",
        a: "La primera consulta dura entre 30 y 45 minutos. Las consultas de seguimiento duran 20-30 minutos.",
      },
      {
        q: "¿Qué necesito para una videoconsulta?",
        a: "Un dispositivo con cámara y micrófono (celular, laptop o tablet), conexión a internet estable, y haber completado tu perfil de paciente en la plataforma.",
      },
      {
        q: "¿Puedo hacer una consulta de urgencia?",
        a: "Ofrecemos citas con disponibilidad en menos de 48 horas. Para emergencias médicas reales (dolor torácico, dificultad respiratoria severa, pérdida de conciencia), llama al 106 (SAMU) o acude a urgencias. La telemedicina no reemplaza la atención de emergencias.",
      },
    ],
  },
  {
    title: "Recetas y Documentos",
    faqs: [
      {
        q: "¿Las recetas son válidas en farmacias peruanas?",
        a: "Sí. Las recetas emitidas en Organnical tienen firma digital del médico, número correlativo oficial, CMP y RNE del médico, y sello de la IPRESS. Son válidas en cualquier farmacia del Perú.",
      },
      {
        q: "¿Puedo acceder a mi historia clínica?",
        a: "Sí. Desde tu dashboard en organnical.pe puedes ver todas tus historias clínicas, recetas y documentos. También puedes descargarlos en PDF.",
      },
      {
        q: "¿Por cuánto tiempo se guardan mis datos médicos?",
        a: "Tu historia clínica se conserva por 15 años, según la NTS 139-MINSA/2018. Los datos de pago se conservan por 5 años (SUNAT). Después se eliminan de forma segura.",
      },
      {
        q: "¿Puedo verificar que una receta es auténtica?",
        a: "Sí. En organnical.pe/verificar-receta puedes ingresar el número de receta y verificar su autenticidad, fecha y médico emisor.",
      },
    ],
  },
  {
    title: "Pagos y Cancelaciones",
    faqs: [
      {
        q: "¿Cuánto cuesta una consulta?",
        a: "El precio de cada consulta se muestra al momento de agendar. Aceptamos tarjetas Visa/Mastercard y billeteras digitales a través de MercadoPago.",
      },
      {
        q: "¿Cuánto cuestan las consultas de seguimiento?",
        a: "Las consultas de seguimiento tienen un costo accesible. El precio exacto se muestra al momento de agendar. Aceptamos tarjetas Visa/Mastercard y billeteras digitales a través de MercadoPago.",
      },
      {
        q: "¿Puedo cancelar o reprogramar mi cita?",
        a: "Sí. Puedes cancelar o reprogramar hasta 24 horas antes de la cita sin costo. Cancelaciones con menos de 24 horas no son reembolsables. Ver política completa en organnical.pe/devoluciones.",
      },
      {
        q: "¿Cómo solicito un reembolso?",
        a: "Escribe a reservas@organnical.com con tu nombre, número de cita y motivo. Procesamos reembolsos en 5-7 días hábiles, sujeto a nuestra política de devoluciones.",
      },
    ],
  },
  {
    title: "Privacidad y Seguridad",
    faqs: [
      {
        q: "¿Están seguros mis datos médicos?",
        a: "Sí. Usamos cifrado AES-256 en reposo y TLS 1.3 en tránsito. Tu historia clínica solo es accesible para ti y tu médico (Row Level Security). Cumplimos la Ley 29733 de Protección de Datos Personales.",
      },
      {
        q: "¿Las videoconsultas son confidenciales?",
        a: "Sí. Las videoconsultas se realizan por Whereby, plataforma con certificación HIPAA y cifrado de extremo a extremo. No se graban.",
      },
      {
        q: "¿Comparten mis datos con terceros?",
        a: "No vendemos ni compartimos tus datos con fines comerciales. Los únicos proveedores con acceso a datos son los necesarios para operar el servicio (Supabase, Resend, MercadoPago) bajo contratos de encargado de tratamiento. Ver política completa en organnical.pe/privacidad.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main style={{ background: NAVY, color: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ padding: "100px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, marginBottom: 16 }}>
            Preguntas frecuentes
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Resolvemos tus dudas sobre telemedicina, recetas, pagos y privacidad.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              {section.title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {section.faqs.map((faq) => (
                <details key={faq.q} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "18px 22px" }}>
                  <summary style={{ fontWeight: 600, fontSize: "0.97rem", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <span>{faq.q}</span>
                    <ArrowRight size={15} style={{ flexShrink: 0, marginTop: 2, color: "#A78BFA", transform: "rotate(90deg)" }} />
                  </summary>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.65, marginTop: 12 }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions? */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 12 }}>¿No encontraste tu respuesta?</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 28 }}>
            Escríbenos directamente. Respondemos en menos de 24 horas.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <a
              href="mailto:reservas@organnical.com"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: G, color: "#fff", fontWeight: 700, padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontSize: 15 }}
            >
              Enviar email <ArrowRight size={16} />
            </a>
            <a
              href="https://wa.me/51952476574"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600, padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontSize: 15 }}
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
          ¿Tienes un reclamo?{" "}
          <Link href="/libro-reclamaciones" style={{ color: "#A78BFA" }}>
            Accede al Libro de Reclamaciones →
          </Link>
        </div>
      </section>
    </main>
  );
}
