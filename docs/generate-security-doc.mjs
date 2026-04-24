// Script: genera docs/seguridad-ehr-susalud.pdf
// Uso: node docs/generate-security-doc.mjs
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

Font.registerHyphenationCallback((w) => [w]);

const VIOLET = "#7C3AED";
const DARK   = "#0B1D35";
const GRAY   = "#6B7280";
const LIGHT  = "#F3F4F6";
const BORDER = "#E5E7EB";
const GREEN  = "#065F46";
const AMBER  = "#92400E";
const AMBER_BG = "#FEF3C7";
const AMBER_BR = "#FDE68A";

const s = StyleSheet.create({
  page:       { fontFamily: "Helvetica", fontSize: 9, color: DARK, padding: "36pt 44pt 44pt 44pt", lineHeight: 1.5 },
  // Header
  header:     { borderBottomWidth: 2, borderBottomColor: VIOLET, paddingBottom: 10, marginBottom: 16 },
  title:      { fontSize: 16, fontFamily: "Helvetica-Bold", color: VIOLET },
  subtitle:   { fontSize: 10, color: DARK, marginTop: 3 },
  meta:       { fontSize: 8, color: GRAY, marginTop: 6 },
  // Sections
  h2:         { fontSize: 12, fontFamily: "Helvetica-Bold", color: VIOLET, marginTop: 14, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 3 },
  h3:         { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK, marginTop: 8, marginBottom: 3 },
  p:          { fontSize: 9, marginBottom: 4 },
  bullet:     { fontSize: 9, marginBottom: 2, paddingLeft: 10 },
  code:       { fontFamily: "Courier", fontSize: 8, backgroundColor: LIGHT, paddingHorizontal: 3 },
  bold:       { fontFamily: "Helvetica-Bold" },
  // Table
  table:      { marginTop: 5, marginBottom: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 3, overflow: "hidden" },
  tableHead:  { flexDirection: "row", backgroundColor: VIOLET },
  tableHeadCell: { flex: 1, padding: "4pt 6pt", fontSize: 8, fontFamily: "Helvetica-Bold", color: "white" },
  tableRow:   { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER },
  tableRowAlt:{ flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: LIGHT },
  tableCell:  { flex: 1, padding: "4pt 6pt", fontSize: 8 },
  // Codeblock
  codeBlock:  { backgroundColor: "#1E293B", borderRadius: 4, padding: "8pt 10pt", marginVertical: 6 },
  codeLine:   { fontFamily: "Courier", fontSize: 7.5, color: "#E2E8F0", lineHeight: 1.6 },
  // Callout
  callout:    { backgroundColor: AMBER_BG, borderWidth: 1, borderColor: AMBER_BR, borderRadius: 4, padding: "6pt 10pt", marginVertical: 5 },
  calloutText:{ fontSize: 8.5, color: AMBER },
  // Footer
  footer:     { position: "absolute", bottom: 18, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 4 },
  footerText: { fontSize: 7, color: GRAY },
});

function B({ children }) {
  return React.createElement(Text, { style: s.bold }, children);
}
function C({ children }) {
  return React.createElement(Text, { style: s.code }, children);
}
function Bullet({ children }) {
  return React.createElement(Text, { style: s.bullet }, `• ${children}`);
}
function Num({ n, children }) {
  return React.createElement(Text, { style: s.bullet }, `${n}. ${children}`);
}

const tableRoles = [
  ["patient",  "Solo sus propios datos (perfil, citas, HCs firmadas, recetas propias)"],
  ["doctor",   "Sus citas asignadas, HCs de sus pacientes, recetas emitidas por él"],
  ["admin",    "Acceso completo de lectura + configuración IPRESS"],
];
const tableAudit = [
  ["Guardar borrador HC",           "clinical_encounter_draft",  "ehr-actions.ts:saveEncounterDraft"],
  ["Firmar HC",                     "clinical_encounter",        "ehr-actions.ts:signEncounter"],
  ["Notas clínicas legacy",         "clinical_notes",            "actions.ts:updateClinicalNotes"],
  ["Cambiar estado cita",           "appointment_status",        "actions.ts:updateAppointmentStatus"],
  ["Crear receta",                  "prescription",              "actions.ts:createPrescription"],
  ["Actualizar antecedentes",       "patient_background",        "antecedentes/actions.ts"],
  ["Generar PDF HC",                "encounter_pdf",             "api/ehr/generate-pdf"],
  ["Generar PDF receta",            "prescription_pdf",          "api/ehr/generate-pdf"],
  ["Descargar documento",           "encounter/prescription_pdf","api/ehr/document/[id]"],
];
const tableConsents = [
  ["general_treatment", "Consentimiento general para tratamiento médico"],
  ["telemedicine",      "Consentimiento informado para atención por telemedicina"],
  ["cannabis_use",      "Consentimiento específico Ley 30681 — cannabis medicinal"],
  ["data_processing",   "Autorización tratamiento datos personales (Ley 29733)"],
];
const tableMigs = [
  ["01_init_schema.sql",          "Schema público, productos, usuarios"],
  ["02_medical_schema.sql",       "Schema medical, perfiles, citas, prescripciones, RLS base"],
  ["03_ehr_foundations.sql",      "HC numbers, audit_log, system_config, campos adicionales perfiles"],
  ["04_patient_background.sql",   "Antecedentes patológicos estructurados"],
  ["05_cie10_consent.sql",        "Caché CIE-10 + consentimientos informados"],
  ["06_clinical_encounters.sql",  "Historia clínica estructurada SOAP, firma electrónica, RLS avanzada"],
  ["07_pdf_urls.sql",             "Campo pdf_url en encounters y prescriptions"],
];

function Table({ headers, rows }) {
  return React.createElement(View, { style: s.table },
    React.createElement(View, { style: s.tableHead },
      ...headers.map((h, i) =>
        React.createElement(Text, { key: i, style: s.tableHeadCell }, h)
      )
    ),
    ...rows.map((row, ri) =>
      React.createElement(View, { key: ri, style: ri % 2 === 0 ? s.tableRow : s.tableRowAlt },
        ...row.map((cell, ci) =>
          React.createElement(Text, { key: ci, style: s.tableCell }, cell)
        )
      )
    )
  );
}

const flowLines = [
  "1. Admin carga datos IPRESS → /dashboard/admin/ipress",
  "2. Paciente se registra → HC number asignado automáticamente",
  "3. Paciente acepta 4 consentimientos → /dashboard/paciente/consentimiento",
  "4. Paciente agenda cita → notificación email + Google Calendar",
  "5. Médico carga antecedentes → /dashboard/medico/pacientes/[id]/antecedentes",
  "6. Médico completa HC estructurada (SOAP + signos vitales + CIE-10) → borrador",
  "7. Médico firma HC → SHA-256 generado, status='signed', PDF en Storage",
  "8. Médico emite receta (solo tras HC firmada) → PDF receta generado",
  "9. Paciente descarga HC y receta → /dashboard/paciente/historial",
  "10. Todos los eventos registrados en audit_log",
  "11. Admin verifica audit trail → /dashboard/admin/auditoria",
];

function DocPDF() {
  return React.createElement(Document, { title: "Documentación Técnica de Seguridad EHR — Organnical.pe" },
    React.createElement(Page, { size: "A4", style: s.page },

      // Header
      React.createElement(View, { style: s.header },
        React.createElement(Text, { style: s.title }, "Documentación Técnica de Seguridad EHR"),
        React.createElement(Text, { style: s.subtitle }, "Organnical.pe — Para auditoría SUSALUD IPRESS I-1/I-2"),
        React.createElement(Text, { style: s.meta },
          "Fecha: 21 de abril de 2026   |   Plataforma: Organnical.pe — Telemedicina cannabis medicinal\n" +
          "Base legal: NTS 139-MINSA/2018 · RM 447-2024/MINSA · RM 164-2025/MINSA · Ley 29733 · Ley 30681"
        ),
      ),

      // 1. Arquitectura
      React.createElement(Text, { style: s.h2 }, "1. Arquitectura de Seguridad"),
      React.createElement(Text, { style: s.h3 }, "Stack tecnológico"),
      React.createElement(Bullet, null, React.createElement(React.Fragment, null, React.createElement(B, null, "Backend: "), "Supabase (PostgreSQL 15 + Auth + Storage) — región São Paulo")),
      React.createElement(Bullet, null, React.createElement(React.Fragment, null, React.createElement(B, null, "Frontend/API: "), "Next.js 16 en Vercel — HTTPS forzado")),
      React.createElement(Bullet, null, React.createElement(React.Fragment, null, React.createElement(B, null, "Autenticación: "), "Supabase Auth (JWT, refresh tokens, expiración 1h)")),
      React.createElement(Bullet, null, React.createElement(React.Fragment, null, React.createElement(B, null, "Comunicaciones: "), "TLS 1.3 en tránsito, AES-256 en reposo")),
      React.createElement(Text, { style: s.h3 }, "Schemas de base de datos"),
      React.createElement(Bullet, null, React.createElement(React.Fragment, null, React.createElement(C, null, "public"), ": catálogo de productos, datos de ventas (no sensibles)")),
      React.createElement(Bullet, null, React.createElement(React.Fragment, null, React.createElement(C, null, "medical"), ": HC, perfiles, citas, recetas, auditoría — ", React.createElement(B, null, "Row Level Security activo en TODAS las tablas"))),

      // 2. Control de Acceso
      React.createElement(Text, { style: s.h2 }, "2. Control de Acceso (RLS)"),
      React.createElement(Text, { style: s.h3 }, "Roles"),
      React.createElement(Table, { headers: ["Rol", "Acceso"], rows: tableRoles }),
      React.createElement(Text, { style: s.h3 }, "Políticas clave"),
      React.createElement(Text, { style: [s.p, { fontFamily: "Helvetica-Bold" }] }, "medical.clinical_encounters"),
      React.createElement(Bullet, null, "Paciente: SELECT solo si status = 'signed'"),
      React.createElement(Bullet, null, "Doctor: INSERT/UPDATE solo sus citas, UPDATE solo si status = 'draft'"),
      React.createElement(Bullet, null, "Nadie: DELETE — denegado por defecto + trigger de protección"),
      React.createElement(Text, { style: [s.p, { fontFamily: "Helvetica-Bold", marginTop: 4 }] }, "medical.audit_log"),
      React.createElement(Bullet, null, "INSERT solo vía función log_event() con SECURITY DEFINER"),
      React.createElement(Bullet, null, "UPDATE/DELETE: prohibido para todos los roles — tabla inmutable"),
      React.createElement(Text, { style: [s.p, { fontFamily: "Helvetica-Bold", marginTop: 4 }] }, "medical.consent_records"),
      React.createElement(Bullet, null, "INSERT: paciente solo para sí mismo — UPDATE/DELETE prohibido"),

      // Footer page 1
      React.createElement(View, { style: s.footer, fixed: true },
        React.createElement(Text, { style: s.footerText }, "Organnical.pe — Documentación de Seguridad EHR — Confidencial"),
        React.createElement(Text, { style: s.footerText, render: ({ pageNumber, totalPages }) => `Pág. ${pageNumber} / ${totalPages}` }),
      ),
    ),

    React.createElement(Page, { size: "A4", style: s.page },

      // 3. Audit Trail
      React.createElement(Text, { style: s.h2 }, "3. Audit Trail Inmutable"),
      React.createElement(Text, { style: s.p }, "Todos los eventos clínicos críticos quedan registrados en ", React.createElement(C, null, "medical.audit_log"), ". La tabla es INSERT-only por política RLS — ningún rol tiene permiso UPDATE ni DELETE."),
      React.createElement(Text, { style: s.h3 }, "Eventos auditados"),
      React.createElement(Table, { headers: ["Acción", "Resource type", "Archivo"], rows: tableAudit }),
      React.createElement(View, { style: s.callout },
        React.createElement(Text, { style: s.calloutText },
          "Retención: los registros son inmutables y permanentes. Cumple los 5 años mínimos requeridos por el MINSA para historias clínicas."
        ),
      ),

      // 4. Integridad / Firma
      React.createElement(Text, { style: s.h2 }, "4. Integridad de Documentos (Firma Electrónica Simple)"),
      React.createElement(Text, { style: s.h3 }, "Historia Clínica"),
      React.createElement(Num, { n: 1 }, "Se serializa el contenido clínico completo (SOAP + diagnósticos + signos vitales)"),
      React.createElement(Num, { n: 2 }, "Se calcula SHA-256 del contenido + doctor_id + timestamp + IP"),
      React.createElement(Num, { n: 3 }, "El hash se almacena en clinical_encounters.doctor_signature_hash"),
      React.createElement(Num, { n: 4 }, "El estado cambia a 'signed' — trigger bloquea modificación posterior"),
      React.createElement(Num, { n: 5 }, "El hash aparece en el PDF imprimible para verificación manual"),
      React.createElement(Text, { style: s.h3 }, "Receta médica"),
      React.createElement(Bullet, null, "Hash SHA-256 de la HC se propaga a prescriptions.signed_hash"),
      React.createElement(Bullet, null, "PDF de receta incluye hash en bloque de firma"),
      React.createElement(Bullet, null, "Número correlativo único (prescription_number) por receta"),
      React.createElement(Text, { style: s.h3 }, "Consentimientos"),
      React.createElement(Bullet, null, "Texto hasheado con SHA-256 antes de guardar"),
      React.createElement(Bullet, null, "IP y user-agent del paciente registrados al aceptar"),
      React.createElement(Bullet, null, "INSERT-only — inmutables por diseño"),

      // 5. HC Numbers
      React.createElement(Text, { style: s.h2 }, "5. Numeración de Historias Clínicas"),
      React.createElement(Bullet, null, "Secuencia medical.hc_seq en PostgreSQL — autoincremental sin gaps"),
      React.createElement(Bullet, null, "Formato: HC-{YYYY}-{000001} (año + 6 dígitos con padding)"),
      React.createElement(Bullet, null, "Asignación automática vía trigger al crear perfil patient"),
      React.createElement(Bullet, null, "UNIQUE constraint en medical.patient_records"),

      // Footer page 2
      React.createElement(View, { style: s.footer, fixed: true },
        React.createElement(Text, { style: s.footerText }, "Organnical.pe — Documentación de Seguridad EHR — Confidencial"),
        React.createElement(Text, { style: s.footerText, render: ({ pageNumber, totalPages }) => `Pág. ${pageNumber} / ${totalPages}` }),
      ),
    ),

    React.createElement(Page, { size: "A4", style: s.page },

      // 6. Ley 29733
      React.createElement(Text, { style: s.h2 }, "6. Protección de Datos (Ley 29733)"),
      React.createElement(Text, { style: s.h3 }, "Datos sensibles protegidos"),
      React.createElement(Bullet, null, "Historia clínica estructurada (SOAP, signos vitales, diagnósticos CIE-10)"),
      React.createElement(Bullet, null, "Antecedentes patológicos, alergias, medicamentos actuales"),
      React.createElement(Bullet, null, "Grupo sanguíneo, género, fecha de nacimiento"),
      React.createElement(Bullet, null, "PDFs médicos (Storage privado)"),
      React.createElement(Text, { style: s.h3 }, "Medidas técnicas"),
      React.createElement(Bullet, null, "Bucket medical-documents en Supabase Storage: privado (sin acceso público)"),
      React.createElement(Bullet, null, "Descarga de PDFs solo vía signed URLs temporales (TTL 300 segundos)"),
      React.createElement(Bullet, null, "Toda descarga registrada en audit_log"),
      React.createElement(Bullet, null, "Comunicaciones cifradas en tránsito (TLS 1.3)"),
      React.createElement(Bullet, null, "Datos en reposo cifrados (AES-256, gestionado por Supabase/AWS)"),

      // 7. CIE-10
      React.createElement(Text, { style: s.h2 }, "7. Diagnósticos CIE-10 (RM 447-2024/MINSA)"),
      React.createElement(Bullet, null, "Tabla medical.cie10_cache con códigos validados por especialidad"),
      React.createElement(Bullet, null, "Búsqueda fulltext vía índice GIN en campo keywords"),
      React.createElement(Bullet, null, "Diagnóstico principal marcado como type='principal' en JSONB diagnoses"),
      React.createElement(Bullet, null, "Certeza: definitive | presumptive"),
      React.createElement(Bullet, null, "Estructura compatible con HL7 FHIR R4 Condition (preparación RENHICE)"),
      React.createElement(Bullet, null, "Diagnóstico CIE-10 principal se copia automáticamente a la receta"),

      // 8. Consentimientos
      React.createElement(Text, { style: s.h2 }, "8. Consentimientos Informados"),
      React.createElement(Table, { headers: ["Tipo", "Descripción"], rows: tableConsents }),
      React.createElement(Text, { style: [s.p, { marginTop: 3 }] }, "Todos los consentimientos deben ser aceptados antes de poder agendar citas."),

      // 9. Flujo end-to-end
      React.createElement(Text, { style: s.h2 }, "9. Flujo End-to-End Verificado"),
      React.createElement(View, { style: s.codeBlock },
        ...flowLines.map((line, i) =>
          React.createElement(Text, { key: i, style: s.codeLine }, line)
        )
      ),

      // 10. Migraciones
      React.createElement(Text, { style: s.h2 }, "10. Migraciones de Base de Datos"),
      React.createElement(Table, { headers: ["Migración", "Contenido"], rows: tableMigs }),

      // Footer page 3
      React.createElement(View, { style: s.footer, fixed: true },
        React.createElement(Text, { style: s.footerText }, "Organnical.pe — Documentación de Seguridad EHR — Confidencial"),
        React.createElement(Text, { style: s.footerText, render: ({ pageNumber, totalPages }) => `Pág. ${pageNumber} / ${totalPages}` }),
      ),
    ),
  );
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "seguridad-ehr-susalud.pdf");

const buffer = await renderToBuffer(React.createElement(DocPDF));
fs.writeFileSync(outPath, buffer);
console.log(`PDF generado: ${outPath}`);
