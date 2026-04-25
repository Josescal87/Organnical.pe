"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { PhoneOff, Clock, User } from "lucide-react"

const NAVY = "#0B1D35"

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

  const time = new Date(slotStart).toLocaleTimeString("es-PE", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
  })

  const backHref = isDoctor
    ? `/dashboard/medico/consultas/${appointmentId}`
    : "/dashboard/paciente/citas"

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
