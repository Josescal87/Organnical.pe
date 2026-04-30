// lib/wa/tools.ts
import { createClient } from '@supabase/supabase-js'
import type { PatientContext } from './types'

// Use the untyped client here because wa_conversations and some query
// shapes (status on prescriptions, posologia on prescription_items) are
// not yet reflected in database.types.ts.
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

export async function getPatientContext(phoneNumber: string): Promise<PatientContext> {
  const supabase = admin()

  const { data: profile } = await supabase
    .schema('medical')
    .from('profiles')
    .select('id, full_name')
    .eq('phone', phoneNumber)
    .maybeSingle()

  if (!profile) {
    return {
      patient_id: null,
      full_name: null,
      chronic_conditions: [],
      current_medications: [],
      active_prescription: null,
      upcoming_appointment: null,
    }
  }

  const [backgroundRes, prescriptionRes, appointmentRes] = await Promise.all([
    supabase
      .schema('medical')
      .from('patient_background')
      .select('chronic_conditions, current_medications')
      .eq('patient_id', profile.id)
      .maybeSingle(),

    supabase
      .schema('medical')
      .from('prescriptions')
      .select('id, valid_until, prescription_items(producto_sku)')
      .eq('patient_id', profile.id)
      .eq('status', 'active')
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .schema('medical')
      .from('appointments')
      .select('slot_start, specialty, doctor:profiles!appointments_doctor_id_fkey(full_name)')
      .eq('patient_id', profile.id)
      .eq('status', 'confirmed')
      .gte('slot_start', new Date().toISOString())
      .order('slot_start', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const prescription = prescriptionRes.data as {
    id: string
    valid_until: string | null
    prescription_items: Array<{ producto_sku: string }> | null
  } | null

  const appointment = appointmentRes.data as {
    slot_start: string
    specialty: string
    doctor: Array<{ full_name: string }> | null
  } | null

  const background = backgroundRes.data as {
    chronic_conditions: string[] | null
    current_medications: Array<{ name: string; dose: string }> | null
  } | null

  const validUntil = prescription?.valid_until ?? null

  return {
    patient_id: profile.id as string,
    full_name: profile.full_name as string | null,
    chronic_conditions: background?.chronic_conditions ?? [],
    current_medications: background?.current_medications ?? [],
    active_prescription: prescription
      ? {
          id: prescription.id,
          product_name: prescription.prescription_items?.[0]?.producto_sku ?? 'Producto',
          valid_until: validUntil,
          is_expired: validUntil ? new Date(validUntil) < new Date() : true,
        }
      : null,
    upcoming_appointment: appointment
      ? {
          slot_start: appointment.slot_start,
          specialty: appointment.specialty,
          doctor_name: appointment.doctor?.[0]?.full_name ?? 'Médico',
        }
      : null,
  }
}

export async function toolGetCatalog(): Promise<unknown> {
  return [
    { sku: 'CBD-5',  name: 'CBD 5%',        price_pen: 120, description: 'Aceite CBD espectro completo 5%' },
    { sku: 'CBD-10', name: 'CBD 10%',       price_pen: 180, description: 'Aceite CBD espectro completo 10%' },
    { sku: 'CBD-20', name: 'CBD 20%',       price_pen: 280, description: 'Aceite CBD espectro completo 20%' },
    { sku: 'CBN-SL', name: 'CBN Sleep',     price_pen: 150, description: 'Cápsulas CBN para insomnio' },
    { sku: 'BALM-P', name: 'Bálsamo 250mg', price_pen: 90,  description: 'Bálsamo tópico CBD 250mg' },
  ]
}

export async function toolGetPrescription(patientId: string): Promise<unknown> {
  const { data, error } = await admin()
    .schema('medical')
    .from('prescriptions')
    .select('id, issued_at, valid_until, diagnosis_label, status, prescription_items(producto_sku, quantity, posologia)')
    .eq('patient_id', patientId)
    .order('issued_at', { ascending: false })
    .limit(3)

  if (error) return { error: error.message }
  return data
}

export async function toolBookAppointment(patientId: string): Promise<unknown> {
  // Phase 0 stub — Phase 1 will integrate with the appointments API
  return {
    message: 'Para agendar tu teleconsulta, ingresa a organnical.pe y selecciona un horario disponible.',
    link: 'https://organnical.pe/dashboard/paciente',
    price_pen: 60,
    patient_id: patientId,
  }
}

export async function toolEscalateToHuman(
  conversationId: string,
  reason: string
): Promise<unknown> {
  const { error } = await admin()
    .from('wa_conversations')
    .update({
      mode: 'human',
      state: 'escalated',
      escalation_reason: reason,
    })
    .eq('id', conversationId)

  if (error) return { success: false, error: error.message }
  return { success: true, reason }
}
