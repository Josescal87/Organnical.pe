/**
 * Tipos TypeScript del schema de base de datos Organnical.
 *
 * ARQUITECTURA DE SCHEMAS:
 *   - `public`  → Tablas de OrgannicalRuby (ventas, productos, etc.) + tablas legacy de telemedicina
 *   - `medical` → Tablas de telemedicina reorganizadas (fuente de verdad)
 *
 * USO en queries:
 *   - public schema (default): supabase.from("productos").select(...)
 *   - medical schema:          supabase.schema("medical").from("profiles").select(...)
 *
 * REQUISITO: "medical" debe estar en Supabase Dashboard → Settings → API → Exposed schemas
 *
 * Para regenerar desde Supabase CLI:
 *   npx supabase gen types typescript --project-id jeomfjulczuimrmonmom > lib/supabase/database.types.ts
 */

// ─── Tipos de enum compartidos ────────────────────────────────────────────────

export type UserRole           = "patient" | "doctor" | "admin"
export type ProductCategory    = "CBD" | "THC" | "Balanced" | "Accessory"
export type AppointmentStatus  = "pending" | "confirmed" | "completed" | "cancelled"

/** @deprecated Usar AppointmentSpecialty. Mantenido para compatibilidad con public.appointments */
export type AppointmentVertical  = "sleep" | "pain" | "anxiety" | "womens_health"

/** Reemplaza AppointmentVertical en el schema medical */
export type AppointmentSpecialty = "sleep" | "pain" | "anxiety" | "womens_health"


// ─── Interfaz principal de base de datos ─────────────────────────────────────

export interface Database {

  // ════════════════════════════════════════════════════════════════════════════
  // PUBLIC SCHEMA — OrgannicalRuby (ventas/CRM) + tablas legacy de telemedicina
  // ════════════════════════════════════════════════════════════════════════════
  public: {
    Tables: {

      // ── public.productos (catálogo maestro de OrgannicalRuby) ─────────────
      // Referenciado por medical.prescription_items.producto_sku
      productos: {
        Row: {
          sku:         string
          descripcion: string
          precio:      number
          categoria:   string
          recipe_sku:  string | null
          farmacia:    string | null
        }
        Insert: never   // Esta app no inserta en el catálogo de OrgannicalRuby
        Update: never
      }

      // ── public.profiles (LEGACY — usar medical.profiles) ─────────────────
      profiles: {
        Row: {
          id:          string
          role:        UserRole
          full_name:   string | null
          document_id: string | null
          phone:       string | null
          cmp:         string | null
          created_at:  string
          updated_at:  string
        }
        Insert: {
          id:           string
          role?:        UserRole
          full_name?:   string | null
          document_id?: string | null
          phone?:       string | null
          cmp?:         string | null
          created_at?:  string
          updated_at?:  string
        }
        Update: {
          role?:        UserRole
          full_name?:   string | null
          document_id?: string | null
          phone?:       string | null
          cmp?:         string | null
          updated_at?:  string
        }
      }

      // ── public.products (LEGACY — usar public.productos) ─────────────────
      products: {
        Row: {
          id:          string
          name:        string
          description: string | null
          category:    ProductCategory
          price:       number
          is_active:   boolean
          created_at:  string
          updated_at:  string
        }
        Insert: never
        Update: never
      }

      // ── public.appointments (LEGACY — usar medical.appointments) ─────────
      appointments: {
        Row: {
          id:             string
          patient_id:     string
          doctor_id:      string
          scheduled_at:   string
          status:         AppointmentStatus
          vertical:       AppointmentVertical
          meeting_link:   string | null
          clinical_notes: string | null
          created_at:     string
          updated_at:     string
        }
        Insert: never
        Update: never
      }

      // ── public.prescriptions (LEGACY — usar medical.prescriptions) ───────
      prescriptions: {
        Row: {
          id:             string
          appointment_id: string
          doctor_id:      string
          patient_id:     string
          issued_at:      string
          valid_until:    string
          pdf_url:        string | null
          created_at:     string
          updated_at:     string
        }
        Insert: never
        Update: never
      }

      // ── public.prescription_items (LEGACY — usar medical.prescription_items)
      prescription_items: {
        Row: {
          id:                  string
          prescription_id:     string
          product_id:          string
          dosage_instructions: string | null
          quantity:            number
          created_at:          string
        }
        Insert: never
        Update: never
      }
    }

    Views: Record<never, never>

    Functions: {
      get_my_role: {
        Args:    Record<string, never>
        Returns: UserRole
      }
    }

    Enums: {
      user_role:             UserRole
      product_category:      ProductCategory
      appointment_status:    AppointmentStatus
      appointment_vertical:  AppointmentVertical
    }
  }


  // ════════════════════════════════════════════════════════════════════════════
  // MEDICAL SCHEMA — Fuente de verdad para telemedicina
  // Usar: supabase.schema("medical").from("tabla")
  // ════════════════════════════════════════════════════════════════════════════
  medical: {
    Tables: {

      // ── medical.profiles ──────────────────────────────────────────────────
      profiles: {
        Row: {
          id:          string        // UUID, FK → auth.users
          role:        UserRole
          full_name:   string | null
          document_id: string | null
          phone:       string | null
          cmp:         string | null  // Código Médico Peruano (obligatorio para doctors)
          created_at:  string
          updated_at:  string
        }
        Insert: {
          id:           string
          role?:        UserRole
          full_name?:   string | null
          document_id?: string | null
          phone?:       string | null
          cmp?:         string | null
          created_at?:  string
          updated_at?:  string
        }
        Update: {
          role?:        UserRole
          full_name?:   string | null
          document_id?: string | null
          phone?:       string | null
          cmp?:         string | null
          updated_at?:  string
        }
      }

      // ── medical.appointments ──────────────────────────────────────────────
      // CAMBIOS vs public.appointments:
      //   vertical     → specialty            (renombre de campo y tipo)
      //   scheduled_at → slot_start + slot_end (duración explícita)
      appointments: {
        Row: {
          id:             string
          patient_id:     string
          doctor_id:      string
          slot_start:     string               // ISO datetime (era scheduled_at)
          slot_end:       string               // ISO datetime (slot_start + 1h)
          status:         AppointmentStatus
          specialty:      AppointmentSpecialty // era vertical
          meeting_link:   string | null
          clinical_notes: string | null
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:             string
          patient_id:      string
          doctor_id:       string
          slot_start:      string
          slot_end:        string
          status?:         AppointmentStatus
          specialty:       AppointmentSpecialty
          meeting_link?:   string | null
          clinical_notes?: string | null
          created_at?:     string
          updated_at?:     string
        }
        Update: {
          slot_start?:     string
          slot_end?:       string
          status?:         AppointmentStatus
          specialty?:      AppointmentSpecialty
          meeting_link?:   string | null
          clinical_notes?: string | null
          updated_at?:     string
        }
      }

      // ── medical.prescriptions ─────────────────────────────────────────────
      prescriptions: {
        Row: {
          id:             string
          appointment_id: string
          doctor_id:      string
          patient_id:     string
          issued_at:      string
          valid_until:    string
          pdf_url:        string | null
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:            string
          appointment_id: string
          doctor_id:      string
          patient_id:     string
          issued_at?:     string
          valid_until:    string
          pdf_url?:       string | null
          created_at?:    string
          updated_at?:    string
        }
        Update: {
          valid_until?: string
          pdf_url?:     string | null
          updated_at?:  string
        }
      }

      // ── medical.prescription_items ────────────────────────────────────────
      // CAMBIO CLAVE: product_id (UUID→public.products) → producto_sku (TEXT→public.productos.sku)
      prescription_items: {
        Row: {
          id:                   string
          prescription_id:      string
          producto_sku:         string        // FK → public.productos.sku
          dosage_instructions:  string | null
          quantity:             number
          created_at:           string
        }
        Insert: {
          id?:                  string
          prescription_id:      string
          producto_sku:         string
          dosage_instructions?: string | null
          quantity:             number
          created_at?:          string
        }
        Update: {
          dosage_instructions?: string | null
          quantity?:            number
        }
      }
    }

    Views: Record<never, never>

    Functions: {
      get_my_role: {
        Args:    Record<string, never>
        Returns: UserRole
      }
    }

    Enums: {
      user_role:             UserRole
      appointment_status:    AppointmentStatus
      appointment_specialty: AppointmentSpecialty
    }
  }
}


// ─── Type aliases de conveniencia ─────────────────────────────────────────────

export type MedicalProfile              = Database["medical"]["Tables"]["profiles"]["Row"]
export type MedicalAppointment          = Database["medical"]["Tables"]["appointments"]["Row"]
export type MedicalPrescription         = Database["medical"]["Tables"]["prescriptions"]["Row"]
export type MedicalPrescriptionItem     = Database["medical"]["Tables"]["prescription_items"]["Row"]
export type MedicalAppointmentInsert    = Database["medical"]["Tables"]["appointments"]["Insert"]
export type MedicalPrescriptionInsert   = Database["medical"]["Tables"]["prescriptions"]["Insert"]
export type MedicalPrescriptionItemInsert = Database["medical"]["Tables"]["prescription_items"]["Insert"]
export type Producto                    = Database["public"]["Tables"]["productos"]["Row"]
