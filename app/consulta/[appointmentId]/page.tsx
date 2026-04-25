import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import VideoRoom from "./VideoRoom"
import type { AppointmentSpecialty } from "@/lib/supabase/database.types"

const SPECIALTY_LABELS: Record<AppointmentSpecialty, string> = {
  sleep:         "Sueño",
  pain:          "Dolor Crónico",
  anxiety:       "Ansiedad",
  womens_health: "Salud Femenina",
}

export default async function ConsultaPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: apt } = await supabase
    .schema("medical")
    .from("appointments")
    .select("id, slot_start, specialty, status, meeting_link, meeting_host_link, patient_id, doctor_id")
    .eq("id", appointmentId)
    .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
    .single()

  if (!apt || !apt.meeting_link) redirect("/dashboard")

  const isDoctor = apt.doctor_id === user.id
  const rawUrl = isDoctor ? (apt.meeting_host_link ?? apt.meeting_link) : apt.meeting_link

  const embedUrl = rawUrl.includes("?") ? `${rawUrl}&embed` : `${rawUrl}?embed`

  const otherPartyId = isDoctor ? apt.patient_id : apt.doctor_id
  const { data: profile } = await supabase
    .schema("medical")
    .from("profiles")
    .select("full_name")
    .eq("id", otherPartyId)
    .single()

  return (
    <VideoRoom
      embedUrl={embedUrl}
      isDoctor={isDoctor}
      otherPartyName={profile?.full_name ?? (isDoctor ? "Paciente" : "Médico")}
      specialty={SPECIALTY_LABELS[apt.specialty as AppointmentSpecialty] ?? apt.specialty}
      slotStart={apt.slot_start}
      appointmentId={apt.id}
    />
  )
}
