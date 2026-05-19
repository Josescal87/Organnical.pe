export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import type { OrdenTienda } from "@/lib/types"
import type { AppointmentStatus, AppointmentSpecialty } from "@/lib/supabase/database.types"
import CuentaDashboard from "./_components/CuentaDashboard"

export const metadata: Metadata = {
  title: "Mi cuenta — Organnical",
  robots: { index: false },
}

export type AppointmentRow = {
  id: string
  slot_start: string
  status: AppointmentStatus
  specialty: AppointmentSpecialty
  meeting_link: string | null
}
export type PrescriptionRow = {
  id: string
  issued_at: string
  valid_until: string
  pdf_url: string | null
}
export type DireccionData = {
  distrito: string
  direccion: string
  referencia: string
}

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/cuenta")

  const email = user.email ?? ""
  const admin  = createAdminClient()

  // Fetch all data in parallel
  const [ordeneRes, aptsRes, rxRes, addressRes, profileRes] = await Promise.all([
    // Órdenes de tienda (filtradas por email_lower)
    admin
      .from("ordenes_tienda")
      .select("id, mp_payment_id, mp_status, items, subtotal, delivery, total, estado, direccion, created_at, boleta_id, boleta_link")
      .eq("email_lower", email.toLowerCase())
      .neq("estado", "pendiente")
      .order("created_at", { ascending: false })
      .limit(20),

    // Citas médicas
    supabase
      .schema("medical")
      .from("appointments")
      .select("id, slot_start, status, specialty, meeting_link")
      .eq("patient_id", user.id)
      .in("status", ["pending", "confirmed"])
      .order("slot_start", { ascending: true })
      .limit(5),

    // Recetas
    supabase
      .schema("medical")
      .from("prescriptions")
      .select("id, issued_at, valid_until, pdf_url")
      .eq("patient_id", user.id)
      .order("issued_at", { ascending: false })
      .limit(5),

    // Dirección por defecto
    supabase
      .from("addresses")
      .select("id, distrito, direccion, referencia")
      .eq("user_id", user.id)
      .eq("es_default", true)
      .maybeSingle(),

    // Perfil médico (nombre)
    supabase
      .schema("medical")
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),
  ])

  const ordenes = (ordeneRes.data as unknown as OrdenTienda[]) ?? []
  const citas   = (aptsRes.data  ?? []) as AppointmentRow[]
  const recetas = (rxRes.data    ?? []) as PrescriptionRow[]

  const direccionGuardada: DireccionData | null = addressRes.data
    ? { distrito: addressRes.data.distrito, direccion: addressRes.data.direccion, referencia: addressRes.data.referencia ?? "" }
    : (user.user_metadata?.direccion as DireccionData | undefined) ?? null

  const nombre = (profileRes.data?.full_name as string | null)
    ?? (user.user_metadata?.nombre_completo as string | undefined)
    ?? email

  return (
    <CuentaDashboard
      nombre={nombre}
      email={email}
      ordenes={ordenes}
      citas={citas}
      recetas={recetas}
      direccionGuardada={direccionGuardada}
    />
  )
}
