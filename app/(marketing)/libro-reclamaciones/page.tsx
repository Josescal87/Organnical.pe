"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";

const NAVY = "#0B1D35";
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

export default function LibroReclamacionesPage() {
  const [tipo, setTipo] = useState<"reclamo" | "queja">("reclamo");
  const [form, setForm] = useState({ nombre: "", dni: "", email: "", telefono: "", descripcion: "", pedido: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; numero?: string; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reclamaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, numero: data.numero });
      } else {
        setResult({ success: false, error: data.error || "Error al enviar. Intenta nuevamente." });
      }
    } catch {
      setResult({ success: false, error: "Error de conexión. Intenta nuevamente." });
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, key: keyof typeof form, type = "text", required = true, placeholder = "") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
        {label}{required && <span style={{ color: "#F472B6" }}> *</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required={required}
        placeholder={placeholder}
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none" }}
      />
    </div>
  );

  return (
    <main style={{ background: NAVY, color: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ padding: "100px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9999, padding: "6px 16px", fontSize: 13, marginBottom: 20 }}>
            <FileText size={14} style={{ color: "#A78BFA" }} />
            <span>Obligatorio por Ley 29571 — INDECOPI</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, marginBottom: 16 }}>
            Libro de Reclamaciones
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", lineHeight: 1.6 }}>
            Organnical Ventures S.A.C. pone a tu disposición este registro de reclamaciones y quejas, en cumplimiento del Artículo 150° del Código de Protección y Defensa del Consumidor (Ley 29571) y el D.S. 011-2011-PCM.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Difference reclamo vs queja */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
          {[
            { t: "Reclamo", d: "Disconformidad con el servicio o producto adquirido. No implica denuncia.", color: "#F472B6" },
            { t: "Queja", d: "Malestar sobre la atención recibida o el proceso. No implica incumplimiento.", color: "#A78BFA" },
          ].map((item) => (
            <div key={item.t} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${item.color}33`, borderRadius: 12, padding: "18px 20px" }}>
              <p style={{ fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.t}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{item.d}</p>
            </div>
          ))}
        </div>

        {result?.success ? (
          <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 16, padding: "40px 32px", textAlign: "center" }}>
            <CheckCircle size={48} style={{ color: "#34D399", margin: "0 auto 16px" }} />
            <h2 style={{ fontWeight: 700, fontSize: "1.3rem", marginBottom: 8 }}>Reclamación registrada</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
              Tu número de seguimiento es:
            </p>
            <p style={{ fontWeight: 800, fontSize: "1.4rem", color: "#34D399", marginBottom: 16 }}>{result.numero}</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6 }}>
              Recibirás una confirmación en tu email. Respondemos en máximo <strong>15 días hábiles</strong> según la Ley 29571.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "32px" }}>

            {/* Tipo */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Tipo de registro <span style={{ color: "#F472B6" }}>*</span></p>
              <div style={{ display: "flex", gap: 12 }}>
                {(["reclamo", "queja"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: tipo === t ? "2px solid #A78BFA" : "1px solid rgba(255,255,255,0.15)", background: tipo === t ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)", color: "#fff", fontWeight: tipo === t ? 700 : 400, cursor: "pointer", fontSize: 15, textTransform: "capitalize" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {field("Nombre completo", "nombre", "text", true, "Como aparece en tu DNI")}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {field("DNI / CE", "dni", "text", true, "8 dígitos")}
              {field("Teléfono", "telefono", "tel", false, "+51 999 999 999")}
            </div>

            {field("Correo electrónico", "email", "email", true, "tu@email.com")}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                Descripción del hecho <span style={{ color: "#F472B6" }}>*</span>
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                required
                rows={4}
                placeholder="Describe con detalle el hecho que motiva tu reclamo o queja..."
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                Pedido del consumidor <span style={{ color: "#F472B6" }}>*</span>
              </label>
              <textarea
                value={form.pedido}
                onChange={(e) => setForm((f) => ({ ...f, pedido: e.target.value }))}
                required
                rows={3}
                placeholder="¿Qué solución o acción esperas de Organnical?"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", resize: "vertical" }}
              />
            </div>

            {result?.error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#FCA5A5" }}>
                <AlertCircle size={16} />{result.error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: G, color: "#fff", fontWeight: 700, fontSize: "1rem", padding: "16px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Enviando..." : "Registrar reclamación"}
            </button>

            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", lineHeight: 1.5 }}>
              Al enviar, aceptas que Organnical Ventures S.A.C. procese tus datos para gestionar tu reclamación según la Ley 29733. Plazo de respuesta: 15 días hábiles (Ley 29571).
            </p>
          </form>
        )}

        <div style={{ marginTop: 40, padding: "20px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          <p style={{ marginBottom: 4 }}><strong style={{ color: "rgba(255,255,255,0.7)" }}>Organnical Ventures S.A.C.</strong></p>
          <p>RUC 20607170615 · Av. La Mar 750, Of. 510, Miraflores, Lima</p>
          <p>reservas@organnical.com · +51 952 476 574</p>
          <p style={{ marginTop: 8 }}>Si la respuesta no es satisfactoria, puedes acudir al <a href="https://www.indecopi.gob.pe" target="_blank" rel="noopener noreferrer" style={{ color: "#A78BFA" }}>INDECOPI</a> (Línea gratuita: 224-7777).</p>
        </div>
      </section>
    </main>
  );
}
