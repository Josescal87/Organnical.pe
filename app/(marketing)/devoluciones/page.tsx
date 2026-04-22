import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Devoluciones y Cancelaciones | Organnical",
  description: "Política clara de cancelaciones y reembolsos para consultas médicas en Organnical. Conoce tus derechos como paciente.",
};

const NAVY = "#0B1D35";
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

export default function DevolucionesPage() {
  return (
    <main style={{ background: NAVY, color: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ padding: "100px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, marginBottom: 16 }}>
            Política de Cancelaciones y Devoluciones
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem" }}>
            Versión vigente — Abril 2026 · Organnical Ventures S.A.C.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Quick summary table */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "32px", marginBottom: 48, overflowX: "auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 24 }}>Resumen rápido</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Situación</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>¿Reembolso?</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Plazo</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sit: "Cancelación con más de 24h de anticipación", rem: "Sí, reembolso completo", ok: true, plazo: "5-7 días hábiles" },
                { sit: "Cancelación entre 2-24h antes de la cita", rem: "Crédito a cuenta", ok: true, plazo: "Inmediato en plataforma" },
                { sit: "Cancelación con menos de 2h o no presentación", rem: "No aplica reembolso", ok: false, plazo: "—" },
                { sit: "Error técnico (fallo de la plataforma)", rem: "Sí, reembolso completo o reprogramación", ok: true, plazo: "5-7 días hábiles" },
                { sit: "El médico cancela la cita", rem: "Sí, reembolso completo o reprogramación", ok: true, plazo: "5-7 días hábiles" },
                { sit: "Primera consulta (siempre gratuita)", rem: "N/A — sin costo", ok: true, plazo: "N/A" },
              ].map((row) => (
                <tr key={row.sit} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <td style={{ padding: "12px", fontSize: 14, lineHeight: 1.4 }}>{row.sit}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                      {row.ok
                        ? <CheckCircle size={14} style={{ color: "#34D399", flexShrink: 0 }} />
                        : <XCircle size={14} style={{ color: "#F87171", flexShrink: 0 }} />}
                      {row.rem}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{row.plazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 16 }}>1. Cancelaciones por parte del paciente</h2>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7 }}>
              <p style={{ marginBottom: 12 }}>
                Puedes cancelar o reprogramar tu cita desde tu dashboard en <strong>organnical.pe/dashboard/paciente/citas</strong> o escribiendo a reservas@organnical.com.
              </p>
              <ul style={{ paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}><strong>Más de 24 horas antes:</strong> Reembolso completo al método de pago original. Procesamiento en 5-7 días hábiles.</li>
                <li style={{ marginBottom: 8 }}><strong>Entre 2 y 24 horas antes:</strong> Crédito equivalente al valor de la consulta, disponible en tu cuenta para una futura cita.</li>
                <li style={{ marginBottom: 8 }}><strong>Menos de 2 horas o no presentación:</strong> No aplica reembolso ni crédito, salvo fuerza mayor debidamente acreditada.</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 16 }}>2. Cancelaciones por parte del médico o la plataforma</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7 }}>
              Si el médico cancela la cita o si se produce un fallo técnico imputable a Organnical, tienes derecho a:
            </p>
            <ul style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7, paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 8 }}>Reprogramación gratuita en el horario de tu preferencia, o</li>
              <li>Reembolso completo al método de pago original en 5-7 días hábiles.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 16 }}>3. Primera consulta gratuita</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7 }}>
              La primera consulta médica es siempre gratuita. No se requiere tarjeta de crédito. Si no te presentas a la primera consulta gratuita sin aviso, futuras consultas gratuitas podrán no aplicar.
            </p>
          </div>

          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 16 }}>4. Cómo solicitar un reembolso</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { n: "01", t: "Escribe a reservas@organnical.com", d: "Incluye: nombre completo, DNI, número de cita, fecha y motivo de la solicitud." },
                { n: "02", t: "Recibe confirmación", d: "Te confirmaremos la solicitud en máximo 24 horas hábiles." },
                { n: "03", t: "Procesamiento", d: "El reembolso se procesa en 5-7 días hábiles al método de pago original (MercadoPago, tarjeta)." },
              ].map((s) => (
                <div key={s.n} style={{ display: "flex", gap: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>{s.n}</div>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{s.t}</p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 16 }}>5. Excepciones</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7 }}>
              No aplican reembolsos por discrepancia con el diagnóstico o tratamiento recomendado por el médico, salvo negligencia médica debidamente documentada. Los casos de presunta negligencia se derivan al proceso de reclamaciones formal.
            </p>
          </div>

          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 16 }}>6. Derechos del consumidor</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
              Esta política se rige por la Ley 29571 — Código de Protección y Defensa del Consumidor (INDECOPI). Si no estás satisfecho con la resolución, puedes:
            </p>
            <ul style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7, paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}>Presentar un reclamo en nuestro <Link href="/libro-reclamaciones" style={{ color: "#A78BFA" }}>Libro de Reclamaciones</Link>.</li>
              <li>Acudir al <a href="https://www.indecopi.gob.pe" target="_blank" rel="noopener noreferrer" style={{ color: "#A78BFA" }}>INDECOPI</a> para resolución de disputas.</li>
            </ul>
          </div>

        </div>

        {/* Contact */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "32px", marginTop: 56, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(167,139,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Mail size={20} style={{ color: "#A78BFA" }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>¿Necesitas ayuda?</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                Escríbenos a{" "}
                <a href="mailto:reservas@organnical.com" style={{ color: "#A78BFA" }}>reservas@organnical.com</a>
                {" "}o al{" "}
                <a href="https://wa.me/51952476574" style={{ color: "#A78BFA" }}>+51 952 476 574</a>
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(167,139,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Clock size={20} style={{ color: "#A78BFA" }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>Horario de atención</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Lun–Vie 9:00–18:00 (Lima, GMT-5)</p>
            </div>
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 40, textAlign: "center" }}>
          Organnical Ventures S.A.C. · RUC 20607170615 · Av. La Mar 750, Of. 510, Miraflores, Lima
        </p>
      </section>
    </main>
  );
}
