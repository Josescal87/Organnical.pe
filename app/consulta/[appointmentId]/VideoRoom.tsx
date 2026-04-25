"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PhoneOff, Clock, User, Camera, Mic, AlertTriangle, Video, RefreshCw } from "lucide-react"

const NAVY = "#0B1D35"
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"

type Stage = "preflight" | "requesting" | "granted" | "denied"

export default function VideoRoom({
  embedUrl,
  isDoctor,
  otherPartyName,
  specialty,
  slotStart,
  appointmentId,
}: {
  embedUrl: string
  isDoctor: boolean
  otherPartyName: string
  specialty: string
  slotStart: string
  appointmentId: string
}) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>("preflight")

  const time = new Date(slotStart).toLocaleTimeString("es-PE", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
  })

  const backHref = isDoctor
    ? `/dashboard/medico/consultas/${appointmentId}`
    : "/dashboard/paciente/citas"

  const requestPermissions = useCallback(async () => {
    setStage("requesting")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setStage("granted")
    } catch {
      setStage("denied")
    }
  }, [])

  if (stage !== "granted") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: NAVY,
          padding: 24,
        }}
      >
        <Image
          src="/logo-white.png"
          alt="Organnical"
          width={140}
          height={32}
          style={{ objectFit: "contain", marginBottom: 48 }}
        />

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "40px 36px",
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
          }}
        >
          {stage === "denied" ? (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <AlertTriangle size={24} color="#f87171" />
              </div>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>
                Cámara o micrófono bloqueados
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
                Tu navegador bloqueó el acceso. Haz clic en el ícono de cámara{" "}
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>🔒</span> en la barra de dirección
                y selecciona <strong style={{ color: "rgba(255,255,255,0.8)" }}>"Permitir"</strong> para
                cámara y micrófono. Luego intenta de nuevo.
              </p>
              <button
                onClick={requestPermissions}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: G,
                  border: "none",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "12px 28px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <RefreshCw size={15} /> Intentar de nuevo
              </button>
            </>
          ) : (
            <>
              {/* Icon row */}
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 28 }}>
                {[Camera, Mic].map((Icon, i) => (
                  <div
                    key={i}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(167,139,250,0.12)",
                      border: "1px solid rgba(167,139,250,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={22} color="#A78BFA" />
                  </div>
                ))}
              </div>

              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>
                Prepara tu videoconsulta
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.65, margin: "0 0 8px" }}>
                {isDoctor ? "Paciente" : "Médico"}:{" "}
                <strong style={{ color: "rgba(255,255,255,0.85)" }}>{otherPartyName}</strong>
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 28px" }}>
                {specialty} · {time}
              </p>

              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6, margin: "0 0 24px" }}>
                Necesitamos acceso a tu <strong style={{ color: "rgba(255,255,255,0.8)" }}>cámara y micrófono</strong>{" "}
                para iniciar la consulta. Tu navegador te pedirá permiso.
              </p>

              <button
                onClick={requestPermissions}
                disabled={stage === "requesting"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: stage === "requesting" ? "rgba(255,255,255,0.1)" : G,
                  border: "none",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: stage === "requesting" ? "default" : "pointer",
                  width: "100%",
                  justifyContent: "center",
                  transition: "opacity 0.2s",
                  marginBottom: 12,
                }}
              >
                <Video size={16} />
                {stage === "requesting" ? "Solicitando acceso..." : "Activar cámara y micrófono"}
              </button>
            </>
          )}

          <button
            onClick={() => router.push(backHref)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              cursor: "pointer",
              padding: "8px 0",
              width: "100%",
            }}
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  // Stage === "granted" — show the embedded room
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: NAVY,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 52,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <Image
            src="/logo-white.png"
            alt="Organnical"
            width={110}
            height={26}
            style={{ objectFit: "contain", flexShrink: 0 }}
          />
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
            <User size={12} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            <span
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {otherPartyName}
            </span>
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <Clock size={12} style={{ color: "rgba(255,255,255,0.35)" }} />
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              {specialty} · {time}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push(backHref)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <PhoneOff size={12} />
          Terminar
        </button>
      </header>

      {/* Whereby embed */}
      <iframe
        src={embedUrl}
        allow="camera; microphone; fullscreen; speaker; display-capture; compute-pressure"
        allowFullScreen
        style={{ flex: 1, border: "none", width: "100%" }}
      />
    </div>
  )
}
