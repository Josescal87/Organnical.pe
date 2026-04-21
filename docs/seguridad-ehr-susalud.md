# Documentación Técnica de Seguridad EHR — Organnical.pe
## Para auditoría SUSALUD IPRESS I-1/I-2

**Fecha:** 2026-04-21  
**Plataforma:** Organnical.pe — Telemedicina cannabis medicinal  
**Base legal:** NTS 139-MINSA/2018, RM 447-2024/MINSA, RM 164-2025/MINSA, Ley 29733, Ley 30681

---

## 1. Arquitectura de Seguridad

### Stack tecnológico
- **Backend:** Supabase (PostgreSQL 15 + Auth + Storage) — hosted en región São Paulo (BR)
- **Frontend/API:** Next.js 16 en Vercel — deploy con HTTPS forzado
- **Autenticación:** Supabase Auth (JWT con refresh tokens, expiración 1h)
- **Comunicaciones:** TLS 1.3 en tránsito, AES-256 en reposo (Supabase)

### Schemas de base de datos
- `public`: catálogo de productos, datos de ventas (no sensibles)
- `medical`: historia clínica, perfiles, citas, recetas, auditoría — **Row Level Security activo en TODAS las tablas**

---

## 2. Control de Acceso (RLS)

### Roles
| Rol | Acceso |
|-----|--------|
| `patient` | Solo sus propios datos (perfil, citas, HCs firmadas, recetas propias) |
| `doctor` | Sus citas asignadas, HCs de sus pacientes, recetas emitidas por él |
| `admin` | Acceso completo de lectura + configuración IPRESS |

### Políticas clave por tabla

**`medical.clinical_encounters`**
- Paciente: SELECT solo si `status = 'signed'`
- Doctor: INSERT/UPDATE solo para sus citas propias, UPDATE solo si `status = 'draft'`
- Nadie: DELETE (sin política DELETE → denegado por defecto)
- Trigger: `trg_prevent_signed_encounter_edit` — bloquea modificación de HC firmada a nivel de base de datos

**`medical.audit_log`**
- INSERT: solo vía función `medical.log_event()` con `SECURITY DEFINER`
- SELECT: admin ve todo; doctor ve eventos de sus pacientes; paciente ve sus propios eventos
- UPDATE/DELETE: **prohibido para todos los roles** — tabla inmutable

**`medical.consent_records`**
- INSERT: paciente solo para sí mismo
- SELECT: paciente ve los suyos; doctor ve los de sus pacientes; admin ve todos
- UPDATE/DELETE: **prohibido** — consentimientos son inmutables

**`medical.patient_background`**
- Doctor: INSERT/UPDATE para sus pacientes
- Paciente: SELECT solo sus propios antecedentes
- UPDATE/DELETE: no permitido para pacientes

---

## 3. Audit Trail Inmutable

### Tabla `medical.audit_log`
Registro de eventos clínicos críticos. Campos:
- `event_time`: timestamp UTC inmutable
- `actor_id`: UUID del usuario que ejecutó la acción
- `actor_role`: rol JWT al momento del evento
- `actor_ip`: IP del cliente (capturada por Supabase)
- `action`: `view | create | update | sign | download | delete`
- `resource_type`: tipo de recurso afectado
- `resource_id`: ID del recurso
- `patient_id`: paciente involucrado
- `metadata`: datos adicionales (JSONB)

### Eventos auditados
| Acción | Resource type | Dónde se registra |
|--------|--------------|-------------------|
| Guardar borrador HC | `clinical_encounter_draft` | `ehr-actions.ts:saveEncounterDraft` |
| Firmar HC | `clinical_encounter` | `ehr-actions.ts:signEncounter` |
| Actualizar notas clínicas legacy | `clinical_notes` | `actions.ts:updateClinicalNotes` |
| Cambiar estado cita | `appointment_status` | `actions.ts:updateAppointmentStatus` |
| Crear receta | `prescription` | `actions.ts:createPrescription` |
| Actualizar antecedentes | `patient_background` | `antecedentes/actions.ts` |
| Generar PDF HC | `encounter_pdf` | `api/ehr/generate-pdf` |
| Generar PDF receta | `prescription_pdf` | `api/ehr/generate-pdf` |
| Descargar documento | `encounter_pdf / prescription_pdf` | `api/ehr/document/[id]` |

### Retención
Los registros de `audit_log` son **inmutables por política RLS** — no existe ningún rol con permiso UPDATE o DELETE. La retención mínima cumple los 5 años requeridos por el MINSA.

---

## 4. Integridad de Documentos (Firma Electrónica Simple)

### Historia Clínica
Al firmar una HC (`signEncounter`):
1. Se serializa el contenido clínico completo (SOAP + diagnósticos + signos vitales)
2. Se calcula **SHA-256** del contenido + doctor_id + timestamp + IP
3. El hash se almacena en `clinical_encounters.doctor_signature_hash`
4. El estado cambia a `signed` — el trigger bloquea cualquier modificación posterior
5. El hash aparece en el PDF imprimible para verificación manual

### Receta médica
- El hash SHA-256 de la HC firmada se propaga a la receta (`prescriptions.signed_hash`)
- El PDF de receta incluye el hash en el bloque de firma
- Número correlativo único (`prescription_number`) por receta

### Consentimientos informados
- Texto de cada consentimiento se hashea con **SHA-256** antes de guardar
- Se registra IP del paciente y user-agent al momento de aceptar
- Inmutables por diseño (INSERT-only en `consent_records`)

---

## 5. Numeración de Historias Clínicas

- Secuencia `medical.hc_seq` en PostgreSQL — autoincremental sin gaps
- Formato: `HC-{YYYY}-{000001}` (año + secuencia 6 dígitos con padding)
- Asignación automática vía trigger `trg_assign_hc_number` al crear perfil `patient`
- Almacenada en `medical.patient_records` con `UNIQUE` constraint
- Visible en todos los PDFs, en la cabecera del perfil médico, y en el header de la consulta

---

## 6. Protección de Datos (Ley 29733)

### Datos sensibles protegidos
- Historia clínica estructurada (SOAP, signos vitales, diagnósticos CIE-10)
- Antecedentes patológicos, alergias, medicamentos actuales
- Grupo sanguíneo, género, fecha de nacimiento
- Imágenes y PDFs médicos (Storage privado)

### Medidas técnicas
- Bucket `medical-documents` en Supabase Storage: **privado** (sin acceso público)
- Descarga de PDFs solo vía signed URLs temporales (TTL 300 segundos)
- Toda descarga queda registrada en `audit_log`
- Comunicaciones cifradas en tránsito (TLS 1.3)
- Datos en reposo cifrados (AES-256, gestionado por Supabase/AWS)

---

## 7. Diagnósticos CIE-10 (RM 447-2024/MINSA)

- Tabla `medical.cie10_cache` con códigos CIE-10 validados por especialidad
- Búsqueda fulltext vía índice GIN en campo `keywords`
- Diagnóstico principal marcado como `type: "principal"` en JSONB `diagnoses`
- Certeza del diagnóstico: `definitive | presumptive`
- Estructura compatible con **HL7 FHIR R4 Condition** para futura integración RENHICE
- Diagnóstico CIE-10 principal se copia automáticamente a la receta vinculada

---

## 8. Consentimientos Informados (4 tipos)

| Tipo | Descripción |
|------|-------------|
| `general_treatment` | Consentimiento general para tratamiento médico |
| `telemedicine` | Consentimiento informado para atención por telemedicina |
| `cannabis_use` | Consentimiento específico Ley 30681 — cannabis medicinal |
| `data_processing` | Autorización tratamiento datos personales (Ley 29733) |

Todos los consentimientos deben ser aceptados antes de poder agendar citas.

---

## 9. Flujo End-to-End Verificado

```
1. Admin carga datos IPRESS → /dashboard/admin/ipress
2. Paciente se registra → HC number asignado automáticamente
3. Paciente acepta 4 consentimientos → /dashboard/paciente/consentimiento
4. Paciente agenda cita → notificación email + Google Calendar
5. Médico carga/actualiza antecedentes → /dashboard/medico/pacientes/[id]/antecedentes
6. Médico completa HC estructurada (SOAP + signos vitales + CIE-10) → borrador
7. Médico firma HC → SHA-256 generado, status='signed', PDF generado en Storage
8. Médico emite receta (solo disponible tras HC firmada) → PDF receta generado
9. Paciente descarga HC y receta en PDF → /dashboard/paciente/historial
10. Todos los eventos registrados en audit_log
11. Admin verifica audit trail → /dashboard/admin/auditoria
```

---

## 10. Migraciones de Base de Datos

| Migración | Contenido |
|-----------|-----------|
| `01_init_schema.sql` | Schema público, productos, usuarios |
| `02_medical_schema.sql` | Schema medical, perfiles, citas, prescripciones, RLS base |
| `02b_data_migration.sql` | Migración de datos legacy |
| `02c_backfill_roles.sql` | Asignación de roles retroactiva |
| `03_ehr_foundations.sql` | HC numbers, audit_log, system_config, campos adicionales perfiles |
| `04_patient_background.sql` | Antecedentes patológicos estructurados |
| `05_cie10_consent.sql` | Caché CIE-10 + consentimientos informados |
| `06_clinical_encounters.sql` | Historia clínica estructurada SOAP, firma electrónica, RLS avanzada |
| `07_pdf_urls.sql` | Campo pdf_url en encounters y prescriptions |
