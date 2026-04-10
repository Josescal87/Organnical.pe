/**
 * Tipos TypeScript derivados del esquema de base de datos.
 *
 * Para regenerar automáticamente desde Supabase:
 *   npx supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/database.types.ts
 */

export type UserRole = "patient" | "doctor" | "admin"
export type ProductCategory = "CBD" | "THC" | "Balanced" | "Accessory"
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled"
export type AppointmentVertical = "sleep" | "pain" | "anxiety" | "womens_health"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          document_id: string | null
          phone: string | null
          cmp: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          document_id?: string | null
          phone?: string | null
          cmp?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: UserRole
          full_name?: string | null
          document_id?: string | null
          phone?: string | null
          cmp?: string | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category: ProductCategory
          price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: ProductCategory
          price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          category?: ProductCategory
          price?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          scheduled_at: string
          status: AppointmentStatus
          vertical: AppointmentVertical
          meeting_link: string | null
          clinical_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          scheduled_at: string
          status?: AppointmentStatus
          vertical: AppointmentVertical
          meeting_link?: string | null
          clinical_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          scheduled_at?: string
          status?: AppointmentStatus
          vertical?: AppointmentVertical
          meeting_link?: string | null
          clinical_notes?: string | null
          updated_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          appointment_id: string
          doctor_id: string
          patient_id: string
          issued_at: string
          valid_until: string
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          doctor_id: string
          patient_id: string
          issued_at?: string
          valid_until: string
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          valid_until?: string
          pdf_url?: string | null
          updated_at?: string
        }
      }
      prescription_items: {
        Row: {
          id: string
          prescription_id: string
          product_id: string
          dosage_instructions: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          prescription_id: string
          product_id: string
          dosage_instructions?: string | null
          quantity: number
          created_at?: string
        }
        Update: {
          dosage_instructions?: string | null
          quantity?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
      product_category: ProductCategory
      appointment_status: AppointmentStatus
      appointment_vertical: AppointmentVertical
    }
  }
}
