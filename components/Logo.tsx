/**
 * Logo de Organnical.pe
 *
 * variant="color"  → texto negro + burbuja gradiente  (sobre fondos claros)
 * variant="white"  → texto blanco + burbuja gradiente (sobre fondos oscuros)
 */

interface LogoProps {
  variant?: "color" | "white";
  height?: number;
  className?: string;
}

export default function Logo({ variant = "color", height = 36, className = "" }: LogoProps) {
  const textColor = variant === "white" ? "#ffffff" : "#0F0F0F";

  /* El font-size base se escala proporcional al height deseado.
     La fuente original mide aprox. 80 px de cap-height en el diseño fuente.
     Ajustamos para que "organnical" + burbuja quepan en el height dado. */
  const fontSize = Math.round(height * 1.05);
  const circleR  = Math.round(height * 0.52);

  return (
    <span
      className={`inline-flex items-center select-none ${className}`}
      style={{ height, lineHeight: 1 }}
    >
      {/* ── "organnical" ─────────────────────────────────── */}
      <span
        style={{
          fontFamily: "var(--font-nunito), 'Nunito', sans-serif",
          fontWeight: 800,
          fontSize,
          color: textColor,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        organnical
      </span>

      {/* ── ".pe" bubble ─────────────────────────────────── */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width:  circleR * 2,
          height: circleR * 2,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)",
          marginLeft: Math.round(height * 0.04),
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-nunito), 'Nunito', sans-serif",
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: Math.round(circleR * 0.72),
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            /* desplazamiento visual mínimo para centrar la cursiva */
            paddingLeft: Math.round(circleR * 0.04),
          }}
        >
          .pe
        </span>
      </span>
    </span>
  );
}
