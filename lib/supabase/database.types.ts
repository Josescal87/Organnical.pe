/**
 * Tipos TypeScript del schema de base de datos Organnical.
 *
 * ARQUITECTURA DE SCHEMAS:
 *   - `public`  → Tablas de OrgannicalRuby (ventas, productos, etc.) + tablas legacy de telemedicina
 *   - `medical` → Tablas de telemedicina reorganizadas (fuente de verdad)
 *   - `sami`    → App de bienestar Sami by Organnical (contenido de audio + sesiones)
 *
 * USO en queries:
 *   - public schema (default): supabase.from("productos").select(...)
 *   - medical schema:          supabase.schema("medical").from("profiles").select(...)
 *   - sami schema:             supabase.schema("sami").from("content").select(...)
 *
 * REQUISITO: "medical", "sami" y "hercu" deben estar en Supabase Dashboard → Settings → API → Exposed schemas
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

/** Hercu fitness levels */
export type HercuFitnessLevel = 'principiante' | 'intermedio' | 'avanzado'

/** Hercu chat message roles */
export type HercuMessageRole  = 'user' | 'assistant'


// ─── Interfaz principal de base de datos ─────────────────────────────────────

export interface Database {

  // ════════════════════════════════════════════════════════════════════════════
  // PUBLIC SCHEMA — OrgannicalRuby (ventas/CRM) + tablas legacy de telemedicina
  // ════════════════════════════════════════════════════════════════════════════
  public: {
    Tables: {

      // ── public.productos (catálogo maestro de OrgannicalRuby) ─────────────
      // Referenciado por medical.prescription_items.producto_sku y tienda
      productos: {
        Row: {
          id:                 string
          sku:                string
          descripcion:        string
          descripcion_corta:  string | null
          descripcion_larga:  string | null
          ingredientes:       string | null
          modo_uso:           string | null
          advertencias:       string | null
          presentacion:       string | null
          categoria:          string
          precio_publico:     number
          precio_oferta:      number | null
          slug_publico:       string
          imagen_url:         string | null
          imagenes_galeria:   string[] | null
          tags:               string[] | null
          peso_g:             number | null
          visible_publico:    boolean
          activo:             boolean
          // Store extras
          requiere_receta:    boolean
          ficha_url:          string | null
          coa_url:            string | null
          // Legacy OrgannicalRuby fields
          precio:             number
          recipe_sku:         string | null
          farmacia:           string | null
          created_at:         string
          updated_at:         string
        }
        Insert: never   // Esta app no inserta en el catálogo de OrgannicalRuby
        Update: never
        Relationships: []
      }

      // ── public.clientes_tienda ────────────────────────────────────────────
      clientes_tienda: {
        Row: {
          id:         string
          email:      string
          nombre:     string
          apellido:   string
          celular:    string | null
          dni:        string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:        string
          email:      string
          nombre:     string
          apellido:   string
          celular?:   string | null
          dni?:       string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?:    string
          apellido?:  string
          celular?:   string | null
          dni?:       string | null
          updated_at?: string
        }
        Relationships: []
      }

      // ── public.ordenes_tienda ─────────────────────────────────────────────
      ordenes_tienda: {
        Row: {
          id:                 string
          cliente_id:         string | null
          cliente_snapshot:   Record<string, unknown> | null
          items:              Record<string, unknown>[]
          subtotal:           number
          delivery:           number
          descuento:          number
          total:              number
          cupon_codigo:       string | null
          estado:             string
          email_lower:        string | null
          mp_preference_id:   string | null
          mp_payment_id:      string | null
          mp_status:          string | null
          direccion:          Record<string, unknown> | null
          id_venta_ruby:      string | null
          boleta_id:          string | null
          boleta_link:        string | null
          boleta_hash:        string | null
          boleta_emitida_at:  string | null
          boleta_error:       string | null
          created_at:         string
          updated_at:         string
        }
        Insert: {
          id?:                string
          cliente_id?:        string | null
          cliente_snapshot?:  Record<string, unknown> | null
          items?:             Record<string, unknown>[]
          subtotal:           number
          delivery:           number
          descuento?:         number
          total:              number
          cupon_codigo?:      string | null
          estado?:            string
          mp_preference_id?:  string | null
          mp_payment_id?:     string | null
          mp_status?:         string | null
          direccion?:         Record<string, unknown> | null
          id_venta_ruby?:     string | null
          boleta_id?:         string | null
          boleta_link?:       string | null
          boleta_hash?:       string | null
          boleta_emitida_at?: string | null
          boleta_error?:      string | null
          created_at?:        string
          updated_at?:        string
        }
        Update: {
          cliente_id?:        string | null
          cliente_snapshot?:  Record<string, unknown> | null
          items?:             Record<string, unknown>[]
          subtotal?:          number
          delivery?:          number
          descuento?:         number
          total?:             number
          cupon_codigo?:      string | null
          estado?:            string
          mp_preference_id?:  string | null
          mp_payment_id?:     string | null
          mp_status?:         string | null
          direccion?:         Record<string, unknown> | null
          id_venta_ruby?:     string | null
          boleta_id?:         string | null
          boleta_link?:       string | null
          boleta_hash?:       string | null
          boleta_emitida_at?: string | null
          boleta_error?:      string | null
          updated_at?:        string
        }
        Relationships: []
      }

      // ── public.boletas ────────────────────────────────────────────────────
      boletas: {
        Row: {
          id:                    string
          tipo:                  string
          serie:                 string
          numero:                number | null
          orden_id:              string | null
          venta_id:              string | null
          anula_a_boleta_id:     string | null
          motivo_anulacion:      string | null
          cliente_nombre:        string
          cliente_doc_tipo:      string | null
          cliente_doc_numero:    string | null
          cliente_email:         string | null
          cliente_direccion:     string | null
          subtotal:              number
          igv:                   number
          total:                 number
          moneda:                string
          items:                 unknown[]
          estado:                string
          proveedor:             string
          proveedor_documento_id: string | null
          link_pdf:              string | null
          link_xml:              string | null
          link_cdr:              string | null
          hash:                  string | null
          intentos:              number
          ultimo_error:          string | null
          ultimo_error_at:       string | null
          proximo_reintento_at:  string | null
          created_at:            string
          updated_at:            string
          emitida_at:            string | null
          aceptada_sunat_at:     string | null
        }
        Insert: {
          id?:                    string
          tipo:                   string
          serie:                  string
          numero?:                number | null
          orden_id?:              string | null
          venta_id?:              string | null
          anula_a_boleta_id?:     string | null
          motivo_anulacion?:      string | null
          cliente_nombre:         string
          cliente_doc_tipo?:      string | null
          cliente_doc_numero?:    string | null
          cliente_email?:         string | null
          cliente_direccion?:     string | null
          subtotal:               number
          igv:                    number
          total:                  number
          moneda?:                string
          items:                  unknown[]
          estado?:                string
          proveedor:              string
          proveedor_documento_id?: string | null
          link_pdf?:              string | null
          link_xml?:              string | null
          link_cdr?:              string | null
          hash?:                  string | null
          intentos?:              number
          ultimo_error?:          string | null
          ultimo_error_at?:       string | null
          proximo_reintento_at?:  string | null
          created_at?:            string
          updated_at?:            string
          emitida_at?:            string | null
          aceptada_sunat_at?:     string | null
        }
        Update: {
          numero?:                number | null
          estado?:                string
          proveedor_documento_id?: string | null
          link_pdf?:              string | null
          link_xml?:              string | null
          link_cdr?:              string | null
          hash?:                  string | null
          intentos?:              number
          ultimo_error?:          string | null
          ultimo_error_at?:       string | null
          proximo_reintento_at?:  string | null
          motivo_anulacion?:      string | null
          updated_at?:            string
          emitida_at?:            string | null
          aceptada_sunat_at?:     string | null
        }
        Relationships: []
      }

      // ── public.delivery_precios ───────────────────────────────────────────
      delivery_precios: {
        Row: {
          id:         string
          distrito:   string
          tarifa:     number
          activo:     boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:        string
          distrito:   string
          tarifa:     number
          activo?:    boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          distrito?:  string
          tarifa?:    number
          activo?:    boolean
          updated_at?: string
        }
        Relationships: []
      }

      // ── public.addresses ──────────────────────────────────────────────────
      addresses: {
        Row: {
          id:         string
          user_id:    string
          distrito:   string
          direccion:  string
          referencia: string | null
          es_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:        string
          user_id:    string
          distrito:   string
          direccion:  string
          referencia?: string | null
          es_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          distrito?:  string
          direccion?: string
          referencia?: string | null
          es_default?: boolean
          updated_at?: string
        }
        Relationships: []
      }

      // ── public.ventas (legacy OrgannicalRuby — best-effort sync) ─────────
      ventas: {
        Row: {
          id:                 string
          num_orden:          string | null
          link_comprobante:   string | null
          hash_comprobante:   string | null
          created_at:         string
          [key: string]:      unknown
        }
        Insert: {
          id?:                string
          num_orden?:         string | null
          link_comprobante?:  string | null
          hash_comprobante?:  string | null
          [key: string]:      unknown
        }
        Update: {
          link_comprobante?:  string | null
          hash_comprobante?:  string | null
          [key: string]:      unknown
        }
        Relationships: []
      }

      // ── public.productos_stock ────────────────────────────────────────────
      productos_stock: {
        Row: {
          id:         string
          sku:        string
          quantity:   number
          updated_at: string
        }
        Insert: {
          id?:        string
          sku:        string
          quantity?:  number
          updated_at?: string
        }
        Update: {
          quantity?:  number
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }

      // ── public.v_boletas (read-only view) ────────────────────────────────────
      v_boletas: {
        Row: {
          id:                      string
          tipo:                    string
          estado:                  string
          serie:                   string
          numero:                  number | null
          numero_documento:        string | null
          orden_id:                string | null
          venta_id:                string | null
          anula_a_boleta_id:       string | null
          motivo_anulacion:        string | null
          cliente_nombre:          string | null
          cliente_doc_tipo:        string | null
          cliente_doc_numero:      string | null
          cliente_email:           string | null
          proveedor:               string | null
          proveedor_documento_id:  string | null
          link_pdf:                string | null
          total:                   number | null
          intentos:                number
          created_at:              string
          updated_at:              string | null
          [key: string]:           unknown
        }
        Insert: never
        Update: never
        Relationships: []
      }

      // ── public.reviews ────────────────────────────────────────────────────────
      reviews: {
        Row: {
          id:                   string
          producto_id:          string
          user_id:              string
          rating:               number
          estado:               string
          is_verified_purchase: boolean
          approved_at:          string | null
          approved_by:          string | null
          rejected_reason:      string | null
          created_at:           string
          updated_at:           string
        }
        Insert: {
          id?:                  string
          producto_id:          string
          user_id:              string
          rating:               number
          estado?:              string
          is_verified_purchase?: boolean
          approved_at?:         string | null
          approved_by?:         string | null
          rejected_reason?:     string | null
          created_at?:          string
          updated_at?:          string
        }
        Update: {
          estado?:              string
          approved_at?:         string | null
          approved_by?:         string | null
          rejected_reason?:     string | null
          updated_at?:          string
        }
        Relationships: []
      }

      // ── public.cupones ────────────────────────────────────────────────────
      cupones: {
        Row: {
          id:             string
          code:           string
          descripcion:    string | null
          tipo:           "porcentaje" | "monto_fijo"
          valor:          number
          monto_minimo:   number
          activo:         boolean
          fecha_inicio:   string | null
          fecha_fin:      string | null
          uso_maximo:     number | null
          usos_actuales:  number
          created_at:     string
        }
        Insert: {
          id?:            string
          code:           string
          descripcion?:   string | null
          tipo:           "porcentaje" | "monto_fijo"
          valor:          number
          monto_minimo?:  number
          activo?:        boolean
          fecha_inicio?:  string | null
          fecha_fin?:     string | null
          uso_maximo?:    number | null
          usos_actuales?: number
          created_at?:    string
        }
        Update: {
          code?:          string
          descripcion?:   string | null
          tipo?:          "porcentaje" | "monto_fijo"
          valor?:         number
          monto_minimo?:  number
          activo?:        boolean
          fecha_inicio?:  string | null
          fecha_fin?:     string | null
          uso_maximo?:    number | null
          usos_actuales?: number
        }
        Relationships: []
      }
    }

    Views: { [k: string]: never }

    Functions: {
      get_my_role: {
        Args:    Record<string, never>
        Returns: UserRole
      }
      crear_venta_y_despacho: {
        Args: {
          p_orden_id:     string
          p_items:        Record<string, unknown>[]
          p_direccion:    Record<string, unknown>
          p_payment_id:   string
          p_total:        number
          p_delivery:     number
        }
        Returns: string
      }
      increment_cupon_uso: {
        Args:    { p_code: string }
        Returns: void
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
          id:              string        // UUID, FK → auth.users
          role:            UserRole
          full_name:       string | null
          document_id:     string | null
          phone:           string | null
          cmp:             string | null  // Código Médico Peruano (obligatorio para doctors)
          photo_url:       string | null
          specialty_label: string | null
          verticals:       string[]
          rating:          number
          reviews_count:   number
          available_hours: number[]      // DEPRECATED — usar weekly_schedule
          available_days:  number[]      // DEPRECATED — usar weekly_schedule
          weekly_schedule: Record<string, number[]> | null
          // Campos demográficos EHR (migración 03)
          birth_date:      string | null // ISO date YYYY-MM-DD
          gender:          string | null // M | F | otro
          document_type:   string | null // DNI | CE | pasaporte
          blood_type:      string | null // A+ A- B+ B- AB+ AB- O+ O-
          rne:             string | null // Registro Nacional de Especialistas (doctores)
          whatsapp_opt_in: boolean | null // Consentimiento para mensajes WhatsApp (opcional)
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id:                string
          role?:             UserRole
          full_name?:        string | null
          document_id?:      string | null
          phone?:            string | null
          cmp?:              string | null
          photo_url?:        string | null
          specialty_label?:  string | null
          verticals?:        string[]
          rating?:           number
          reviews_count?:    number
          available_hours?:  number[]
          whatsapp_opt_in?:  boolean | null
          available_days?:  number[]
          weekly_schedule?: Record<string, number[]> | null
          birth_date?:      string | null
          gender?:          string | null
          document_type?:   string | null
          blood_type?:      string | null
          rne?:             string | null
          created_at?:      string
          updated_at?:      string
        }
        Update: {
          role?:            UserRole
          full_name?:       string | null
          document_id?:     string | null
          phone?:           string | null
          cmp?:             string | null
          photo_url?:       string | null
          specialty_label?: string | null
          verticals?:       string[]
          rating?:          number
          reviews_count?:   number
          available_hours?: number[]
          available_days?:  number[]
          weekly_schedule?: Record<string, number[]> | null
          birth_date?:      string | null
          gender?:          string | null
          document_type?:   string | null
          blood_type?:      string | null
          rne?:             string | null
          updated_at?:      string
        }
      }

      // ── medical.patient_records (migración 03) ────────────────────────────
      patient_records: {
        Row: {
          id:          string
          patient_id:  string
          hc_number:   string  // Formato: HC-{AÑO}-{seq_6_dígitos}
          ipress_code: string
          created_at:  string
        }
        Insert: {
          id?:         string
          patient_id:  string
          hc_number:   string
          ipress_code: string
          created_at?: string
        }
        Update: never  // inmutable
      }

      // ── medical.audit_log (migración 03) ──────────────────────────────────
      audit_log: {
        Row: {
          id:            number    // bigserial
          event_time:    string
          actor_id:      string | null
          actor_role:    string | null
          actor_ip:      string | null
          action:        string    // view|create|update|sign|download|delete
          resource_type: string    // encounter|prescription|patient_record|background|consent
          resource_id:   string
          patient_id:    string | null
          metadata:      Record<string, unknown> | null
          session_id:    string | null
        }
        Insert: {
          event_time?:    string
          actor_id?:      string | null
          actor_role?:    string | null
          actor_ip?:      string | null
          action:         string
          resource_type:  string
          resource_id:    string
          patient_id?:    string | null
          metadata?:      Record<string, unknown> | null
          session_id?:    string | null
        }
        Update: never  // inmutable
      }

      // ── medical.system_config (migración 03) ──────────────────────────────
      system_config: {
        Row: {
          key:        string
          value:      string
          updated_at: string
        }
        Insert: {
          key:         string
          value:       string
          updated_at?: string
        }
        Update: {
          value?:      string
          updated_at?: string
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
          id?:               string
          patient_id:        string
          doctor_id:         string
          slot_start:        string
          slot_end:          string
          status?:           AppointmentStatus
          specialty:         AppointmentSpecialty
          meeting_link?:     string | null
          meeting_provider?: "google_meet" | "whereby"
          meeting_host_link?: string | null
          clinical_notes?:   string | null
          created_at?:       string
          updated_at?:       string
        }
        Update: {
          slot_start?:        string
          slot_end?:          string
          status?:            AppointmentStatus
          specialty?:         AppointmentSpecialty
          meeting_link?:      string | null
          meeting_provider?:  "google_meet" | "whereby"
          meeting_host_link?: string | null
          clinical_notes?:    string | null
          updated_at?:        string
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
          pdf_url:             string | null
          prescription_number: string | null
          hc_number:           string | null
          diagnosis_cie10:     string | null
          diagnosis_label:     string | null
          signed_at:           string | null
          signed_hash:         string | null
          created_at:          string
          updated_at:          string
        }
        Insert: {
          id?:                  string
          appointment_id:       string
          doctor_id:            string
          patient_id:           string
          issued_at?:           string
          valid_until:          string
          pdf_url?:             string | null
          prescription_number?: string | null
          hc_number?:           string | null
          diagnosis_cie10?:     string | null
          diagnosis_label?:     string | null
          signed_at?:           string | null
          signed_hash?:         string | null
          created_at?:          string
          updated_at?:          string
        }
        Update: {
          valid_until?:         string
          pdf_url?:             string | null
          prescription_number?: string | null
          hc_number?:           string | null
          diagnosis_cie10?:     string | null
          diagnosis_label?:     string | null
          signed_at?:           string | null
          signed_hash?:         string | null
          updated_at?:          string
        }
      }

      // ── medical.clinical_encounters (migración 06) ───────────────────────
      clinical_encounters: {
        Row: {
          id:                     string
          appointment_id:         string
          patient_id:             string
          doctor_id:              string
          // S — Subjetivo
          chief_complaint:        string
          illness_history:        string
          relevant_history:       string | null
          // O — Objetivo
          vital_weight_kg:        number | null
          vital_height_cm:        number | null
          vital_bmi:              number | null
          vital_bp_systolic:      number | null
          vital_bp_diastolic:     number | null
          vital_heart_rate:       number | null
          vital_respiratory_rate: number | null
          vital_temperature_c:    number | null
          vital_spo2_pct:         number | null
          physical_exam_notes:    string | null
          // A — Análisis
          diagnoses: {
            cie10_code:        string
            cie10_description: string
            type:              "principal" | "secondary"
            certainty:         "definitivo" | "presuntivo"
          }[]
          // P — Plan
          treatment_plan:         string
          indications:            string | null
          follow_up_days:         number | null
          lab_orders:             string | null
          // Ley 30681
          cannabis_indication:    string | null
          expected_outcomes:      string | null
          // Firma
          status:                 string   // draft | signed | amended
          signed_at:              string | null
          signed_by:              string | null
          doctor_signature_hash:  string | null
          doctor_ip:              string | null
          // Versionado
          version:                number
          parent_encounter_id:    string | null
          created_at:             string
          updated_at:             string
        }
        Insert: {
          id?:                     string
          appointment_id:          string
          patient_id:              string
          doctor_id:               string
          chief_complaint?:        string
          illness_history?:        string
          relevant_history?:       string | null
          vital_weight_kg?:        number | null
          vital_height_cm?:        number | null
          vital_bmi?:              number | null
          vital_bp_systolic?:      number | null
          vital_bp_diastolic?:     number | null
          vital_heart_rate?:       number | null
          vital_respiratory_rate?: number | null
          vital_temperature_c?:    number | null
          vital_spo2_pct?:         number | null
          physical_exam_notes?:    string | null
          diagnoses?:              Record<string, unknown>[]
          treatment_plan?:         string
          indications?:            string | null
          follow_up_days?:         number | null
          lab_orders?:             string | null
          cannabis_indication?:    string | null
          expected_outcomes?:      string | null
          status?:                 string
          signed_at?:              string | null
          signed_by?:              string | null
          doctor_signature_hash?:  string | null
          doctor_ip?:              string | null
          version?:                number
          parent_encounter_id?:    string | null
          created_at?:             string
          updated_at?:             string
        }
        Update: {
          chief_complaint?:        string
          illness_history?:        string
          relevant_history?:       string | null
          vital_weight_kg?:        number | null
          vital_height_cm?:        number | null
          vital_bmi?:              number | null
          vital_bp_systolic?:      number | null
          vital_bp_diastolic?:     number | null
          vital_heart_rate?:       number | null
          vital_respiratory_rate?: number | null
          vital_temperature_c?:    number | null
          vital_spo2_pct?:         number | null
          physical_exam_notes?:    string | null
          diagnoses?:              Record<string, unknown>[]
          treatment_plan?:         string
          indications?:            string | null
          follow_up_days?:         number | null
          lab_orders?:             string | null
          cannabis_indication?:    string | null
          expected_outcomes?:      string | null
          status?:                 string
          signed_at?:              string | null
          signed_by?:              string | null
          doctor_signature_hash?:  string | null
          doctor_ip?:              string | null
          updated_at?:             string
        }
      }

      // ── medical.patient_background (migración 04) ────────────────────────
      patient_background: {
        Row: {
          id:                         string
          patient_id:                 string
          chronic_conditions:         string[] | null
          previous_surgeries:         string[] | null
          previous_hospitalizations:  string[] | null
          current_medications:        { name: string; dose: string; frequency: string }[] | null
          allergies:                  { substance: string; reaction: string; severity: "leve" | "moderada" | "grave" }[] | null
          family_history:             string[] | null
          smoking_status:             string | null  // never|former|current
          alcohol_use:                string | null  // none|occasional|regular
          obstetric_history:          Record<string, unknown> | null
          last_updated_by:            string | null
          created_at:                 string
          updated_at:                 string
        }
        Insert: {
          id?:                         string
          patient_id:                  string
          chronic_conditions?:         string[] | null
          previous_surgeries?:         string[] | null
          previous_hospitalizations?:  string[] | null
          current_medications?:        { name: string; dose: string; frequency: string }[] | null
          allergies?:                  { substance: string; reaction: string; severity: "leve" | "moderada" | "grave" }[] | null
          family_history?:             string[] | null
          smoking_status?:             string | null
          alcohol_use?:                string | null
          obstetric_history?:          Record<string, unknown> | null
          last_updated_by?:            string | null
          created_at?:                 string
          updated_at?:                 string
        }
        Update: {
          chronic_conditions?:         string[] | null
          previous_surgeries?:         string[] | null
          previous_hospitalizations?:  string[] | null
          current_medications?:        { name: string; dose: string; frequency: string }[] | null
          allergies?:                  { substance: string; reaction: string; severity: "leve" | "moderada" | "grave" }[] | null
          family_history?:             string[] | null
          smoking_status?:             string | null
          alcohol_use?:                string | null
          obstetric_history?:          Record<string, unknown> | null
          last_updated_by?:            string | null
          updated_at?:                 string
        }
      }

      // ── medical.cie10_cache (migración 05) ────────────────────────────────
      cie10_cache: {
        Row: {
          code:        string
          description: string
          category:    string | null
          specialty:   string | null
          keywords:    string[] | null
          is_active:   boolean
        }
        Insert: {
          code:         string
          description:  string
          category?:    string | null
          specialty?:   string | null
          keywords?:    string[] | null
          is_active?:   boolean
        }
        Update: {
          description?: string
          category?:    string | null
          specialty?:   string | null
          keywords?:    string[] | null
          is_active?:   boolean
        }
      }

      // ── medical.consent_records (migración 05) ────────────────────────────
      consent_records: {
        Row: {
          id:                 string
          patient_id:         string
          appointment_id:     string | null
          consent_type:       string  // general_treatment|telemedicine|cannabis_use|data_processing
          consent_text_hash:  string  // SHA-256 del texto firmado
          consent_version:    string
          accepted:           boolean
          accepted_at:        string | null
          patient_ip:         string | null
          patient_device:     string | null
          created_at:         string
        }
        Insert: {
          id?:                string
          patient_id:         string
          appointment_id?:    string | null
          consent_type:       string
          consent_text_hash:  string
          consent_version:    string
          accepted:           boolean
          accepted_at?:       string | null
          patient_ip?:        string | null
          patient_device?:    string | null
          created_at?:        string
        }
        Update: never  // INSERT-only (inmutable por auditoría)
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
      log_event: {
        Args: {
          p_action:        string
          p_resource_type: string
          p_resource_id:   string
          p_patient_id?:   string
          p_metadata?:     Record<string, unknown>
        }
        Returns: void
      }
    }

    Enums: {
      user_role:             UserRole
      appointment_status:    AppointmentStatus
      appointment_specialty: AppointmentSpecialty
    }
  }


  // ════════════════════════════════════════════════════════════════════════════
  // SAMI SCHEMA — Contenido de audio terapéutico (meditaciones, cuentos, ruidos, respiración)
  // Usar: supabase.schema("sami").from("tabla")
  // ════════════════════════════════════════════════════════════════════════════
  sami: {
    Tables: {

      // ── sami.content ──────────────────────────────────────────────────────
      content: {
        Row: {
          id:               string
          slug:             string
          title:            string
          description:      string | null
          category:         'meditacion' | 'cuento' | 'ruido' | 'respiracion'
          region:           'costa' | 'sierra' | 'selva' | 'universal'
          duration_seconds: number
          audio_url:        string | null
          thumbnail_url:    string | null
          tags:             string[] | null
          script_text:      string | null
          tts_voice:        string | null
          narrator:         string | null
          is_published:     boolean
          created_at:       string
          updated_at:       string
        }
        Insert: {
          id?:               string
          slug:              string
          title:             string
          description?:      string | null
          category:          'meditacion' | 'cuento' | 'ruido' | 'respiracion'
          region?:           'costa' | 'sierra' | 'selva' | 'universal'
          duration_seconds:  number
          audio_url?:        string | null
          thumbnail_url?:    string | null
          tags?:             string[] | null
          script_text?:      string | null
          tts_voice?:        string | null
          narrator?:         string | null
          is_published?:     boolean
          created_at?:       string
          updated_at?:       string
        }
        Update: {
          slug?:             string
          title?:            string
          description?:      string | null
          category?:         'meditacion' | 'cuento' | 'ruido' | 'respiracion'
          region?:           'costa' | 'sierra' | 'selva' | 'universal'
          duration_seconds?: number
          audio_url?:        string | null
          thumbnail_url?:    string | null
          tags?:             string[] | null
          script_text?:      string | null
          tts_voice?:        string | null
          narrator?:         string | null
          is_published?:     boolean
          updated_at?:       string
        }
      }

      // ── sami.listening_sessions ───────────────────────────────────────────
      listening_sessions: {
        Row: {
          id:               string
          user_id:          string    // FK → auth.users
          content_id:       string    // FK → sami.content
          started_at:       string
          completed:        boolean
          seconds_listened: number
        }
        Insert: {
          id?:               string
          user_id:           string
          content_id:        string
          started_at?:       string
          completed?:        boolean
          seconds_listened?: number
        }
        Update: {
          completed?:        boolean
          seconds_listened?: number
        }
      }
    }

    Views:          { [_ in never]: never }
    Functions:      { [_ in never]: never }
    Enums:          { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }


  // ════════════════════════════════════════════════════════════════════════════
  // HERCU SCHEMA — AI-powered fitness training plans for personalized workouts
  // Usar: supabase.schema("hercu").from("tabla")
  // ════════════════════════════════════════════════════════════════════════════
  hercu: {
    Tables: {

      // ── hercu.hercu_profiles ──────────────────────────────────────────────
      hercu_profiles: {
        Row: {
          user_id: string
          fitness_level: HercuFitnessLevel
          goals: string[]
          equipment: string[]
          days_per_week: number
          available_days: string[]
          session_minutes: number
          onboarding_done: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          fitness_level?: HercuFitnessLevel
          goals?: string[]
          equipment?: string[]
          days_per_week?: number
          available_days?: string[]
          session_minutes?: number
          onboarding_done?: boolean
          created_at?: string
        }
        Update: {
          fitness_level?: HercuFitnessLevel
          goals?: string[]
          equipment?: string[]
          days_per_week?: number
          available_days?: string[]
          session_minutes?: number
          onboarding_done?: boolean
        }
      }

      // ── hercu.hercu_plans ─────────────────────────────────────────────────
      hercu_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          plan_data: Record<string, unknown>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          plan_data: Record<string, unknown>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          plan_data?: Record<string, unknown>
          is_active?: boolean
        }
      }

      // ── hercu.hercu_messages ──────────────────────────────────────────────
      hercu_messages: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          role: HercuMessageRole
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          role: HercuMessageRole
          content: string
          created_at?: string
        }
        Update: never
      }
    }

    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      fitness_level_enum: HercuFitnessLevel
      message_role_enum: HercuMessageRole
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

// Tipos EHR (migración 03)
export type PatientRecord               = Database["medical"]["Tables"]["patient_records"]["Row"]
export type AuditLog                    = Database["medical"]["Tables"]["audit_log"]["Row"]
export type SystemConfig                = Database["medical"]["Tables"]["system_config"]["Row"]

// Tipos EHR (migración 04-05)
export type PatientBackground           = Database["medical"]["Tables"]["patient_background"]["Row"]
export type CIE10Item                   = Database["medical"]["Tables"]["cie10_cache"]["Row"]
export type ConsentRecord               = Database["medical"]["Tables"]["consent_records"]["Row"]

// Tipos EHR (migración 06)
export type ClinicalEncounter           = Database["medical"]["Tables"]["clinical_encounters"]["Row"]

// Sami schema helpers
export type SamiContent                 = Database['sami']['Tables']['content']['Row']
export type SamiContentInsert           = Database['sami']['Tables']['content']['Insert']
export type SamiListeningSession        = Database['sami']['Tables']['listening_sessions']['Row']
export type SamiListeningSessionInsert  = Database['sami']['Tables']['listening_sessions']['Insert']
export type SamiCategory                = SamiContent['category']
export type SamiRegion                  = SamiContent['region']
