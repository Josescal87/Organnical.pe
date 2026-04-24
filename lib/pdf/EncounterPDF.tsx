import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { IpressMode } from "@/lib/ipress-config";

Font.registerHyphenationCallback((word) => [word]);

const VIOLET = "#7C3AED";
const DARK   = "#0B1D35";
const GRAY   = "#6B7280";
const LIGHT  = "#F3F4F6";
const BORDER = "#E5E7EB";

const s = StyleSheet.create({
  page:        { fontFamily: "Helvetica", fontSize: 9, color: DARK, padding: "30pt 36pt 40pt 36pt", lineHeight: 1.4 },
  // Header
  headerRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, borderBottomWidth: 2, borderBottomColor: VIOLET, paddingBottom: 8 },
  ipressName:  { fontSize: 13, fontFamily: "Helvetica-Bold", color: VIOLET },
  ipressSub:   { fontSize: 7.5, color: GRAY, marginTop: 2 },
  hcBox:       { alignItems: "flex-end" },
  hcLabel:     { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 },
  hcNumber:    { fontSize: 14, fontFamily: "Helvetica-Bold", color: VIOLET },
  docTitle:    { textAlign: "center", fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: DARK, marginBottom: 10, textTransform: "uppercase" },
  // Sections
  section:     { marginBottom: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden" },
  sectionHead: { backgroundColor: VIOLET, paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  sectionTag:  { fontSize: 8, fontFamily: "Helvetica-Bold", color: "white", backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
  sectionTitle:{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "white" },
  sectionBody: { padding: "6pt 8pt" },
  // Fields
  row2:        { flexDirection: "row", gap: 8, marginBottom: 4 },
  field:       { flex: 1 },
  fieldLabel:  { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 1 },
  fieldValue:  { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  fieldText:   { fontSize: 8.5 },
  // Vitals table
  vitalsTable: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  vitalBox:    { width: "22%", backgroundColor: LIGHT, borderRadius: 3, padding: 4, alignItems: "center" },
  vitalVal:    { fontSize: 11, fontFamily: "Helvetica-Bold", color: VIOLET },
  vitalLbl:    { fontSize: 6.5, color: GRAY, marginTop: 1, textAlign: "center" },
  // Diagnoses
  diagRow:     { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: LIGHT },
  diagCode:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: VIOLET, width: 44 },
  diagDesc:    { flex: 1, fontSize: 8 },
  diagBadge:   { fontSize: 6.5, fontFamily: "Helvetica-Bold", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
  principalBadge: { backgroundColor: "#EDE9FE", color: VIOLET },
  secondaryBadge: { backgroundColor: LIGHT, color: GRAY },
  // Signature
  sigBox:      { marginTop: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: "8pt 10pt", backgroundColor: "#FAFAFA" },
  sigTitle:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: VIOLET, marginBottom: 4 },
  sigHash:     { fontSize: 6.5, fontFamily: "Helvetica", color: GRAY, wordBreak: "break-all" },
  // Footer
  footer:      { position: "absolute", bottom: 16, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 4 },
  footerText:  { fontSize: 7, color: GRAY },
});

// ── Tipos ──────────────────────────────────────────────────────────────────────

export type DiagnosisItem = {
  cie10_code: string;
  cie10_description: string;
  type: "principal" | "secondary";
  certainty: "definitivo" | "presuntivo";
};

export type EncounterPDFData = {
  // Modo
  ipress_mode:     IpressMode;
  // IPRESS
  ipress_name:     string;
  ipress_code:     string;
  ipress_ruc:      string;
  ipress_address:  string;
  ipress_category: string;
  // Médico
  doctor_name:     string;
  doctor_cmp:      string;
  doctor_specialty: string;
  doctor_rne?:     string;
  // Paciente
  patient_name:    string;
  patient_dni:     string;
  patient_birth:   string;
  patient_gender:  string;
  hc_number:       string;
  // Encuentro
  appointment_date: string;
  chief_complaint:  string;
  illness_history:  string;
  relevant_history?: string;
  vital_weight_kg?:    number;
  vital_height_cm?:    number;
  vital_bmi?:          number;
  vital_bp_systolic?:  number;
  vital_bp_diastolic?: number;
  vital_heart_rate?:   number;
  vital_respiratory_rate?: number;
  vital_temperature_c?: number;
  vital_spo2_pct?:     number;
  physical_exam_notes?: string;
  diagnoses:           DiagnosisItem[];
  treatment_plan:      string;
  indications?:        string;
  follow_up_days?:     number;
  lab_orders?:         string;
  cannabis_indication?: string;
  expected_outcomes?:   string;
  // Firma
  signed_at:            string;
  doctor_signature_hash: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={{ marginBottom: 5 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldText}>{value}</Text>
    </View>
  );
}

function VitalBox({ label, value, unit }: { label: string; value?: number | null; unit: string }) {
  if (!value) return null;
  return (
    <View style={s.vitalBox}>
      <Text style={s.vitalVal}>{value}<Text style={{ fontSize: 7, color: GRAY }}> {unit}</Text></Text>
      <Text style={s.vitalLbl}>{label}</Text>
    </View>
  );
}

function SectionHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <View style={s.sectionHead}>
      <Text style={s.sectionTag}>{tag}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ── Documento principal ────────────────────────────────────────────────────────

export function EncounterPDF({ data }: { data: EncounterPDFData }) {
  const signedDate = new Date(data.signed_at).toLocaleString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "America/Lima",
  });

  const hasVitals = data.vital_bp_systolic || data.vital_heart_rate ||
    data.vital_temperature_c || data.vital_spo2_pct ||
    data.vital_weight_kg || data.vital_height_cm;

  return (
    <Document title={`HC ${data.hc_number} — ${data.patient_name}`} author={data.ipress_mode === "enabled" ? data.ipress_name : "Organnical Salud S.A.C."}>
      <Page size="A4" style={s.page}>

        {/* ── Encabezado ── */}
        <View style={s.headerRow}>
          {data.ipress_mode === "enabled" ? (
            <View>
              <Text style={s.ipressName}>{data.ipress_name}</Text>
              <Text style={s.ipressSub}>{data.ipress_address}</Text>
              <Text style={s.ipressSub}>RUC: {data.ipress_ruc}  ·  Código IPRESS: {data.ipress_code}  ·  Categoría {data.ipress_category}</Text>
            </View>
          ) : (
            <View>
              <Text style={s.ipressName}>Dr(a). {data.doctor_name}</Text>
              <Text style={s.ipressSub}>CMP {data.doctor_cmp}{data.doctor_rne ? `  ·  RNE ${data.doctor_rne}` : ""}</Text>
              <Text style={s.ipressSub}>{data.doctor_specialty}  ·  Lima, Perú</Text>
            </View>
          )}
          <View style={s.hcBox}>
            <Text style={s.hcLabel}>N° Historia Clínica</Text>
            <Text style={s.hcNumber}>{data.hc_number}</Text>
            <Text style={[s.ipressSub, { marginTop: 4 }]}>Atención: {data.appointment_date}</Text>
          </View>
        </View>

        <Text style={s.docTitle}>Historia Clínica Electrónica</Text>

        {/* ── Datos Paciente + Médico ── */}
        <View style={s.section}>
          <SectionHeader tag="PACIENTE" title="Datos del Paciente y Médico Tratante" />
          <View style={s.sectionBody}>
            <View style={s.row2}>
              <Field label="Nombre completo"     value={data.patient_name} />
              <Field label="DNI / Documento"     value={data.patient_dni} />
              <Field label="Fecha de nacimiento" value={data.patient_birth} />
              <Field label="Sexo"                value={data.patient_gender} />
            </View>
            <View style={[s.row2, { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 4, marginTop: 2 }]}>
              <Field label="Médico tratante"     value={`Dr(a). ${data.doctor_name}`} />
              <Field label="CMP"                 value={data.doctor_cmp} />
              <Field label="Especialidad"        value={data.doctor_specialty} />
              {data.doctor_rne && <Field label="RNE" value={data.doctor_rne} />}
            </View>
          </View>
        </View>

        {/* ── S — Subjetivo ── */}
        <View style={s.section}>
          <SectionHeader tag="S" title="Anamnesis (Subjetivo) — NTS 139-MINSA/2018" />
          <View style={s.sectionBody}>
            <TextBlock label="Motivo de consulta"          value={data.chief_complaint} />
            <TextBlock label="Historia de la enfermedad actual" value={data.illness_history} />
            <TextBlock label="Antecedentes relevantes"     value={data.relevant_history} />
          </View>
        </View>

        {/* ── O — Objetivo ── */}
        <View style={s.section}>
          <SectionHeader tag="O" title="Signos Vitales y Examen Físico (Objetivo)" />
          <View style={s.sectionBody}>
            {hasVitals && (
              <View style={s.vitalsTable}>
                {data.vital_bp_systolic && data.vital_bp_diastolic && (
                  <View style={s.vitalBox}>
                    <Text style={s.vitalVal}>{data.vital_bp_systolic}/{data.vital_bp_diastolic}</Text>
                    <Text style={s.vitalLbl}>PA (mmHg)</Text>
                  </View>
                )}
                <VitalBox label="FC (lpm)"   value={data.vital_heart_rate}       unit="lpm" />
                <VitalBox label="FR (rpm)"   value={data.vital_respiratory_rate} unit="rpm" />
                <VitalBox label="Temp."      value={data.vital_temperature_c}    unit="°C" />
                <VitalBox label="SpO2"       value={data.vital_spo2_pct}         unit="%" />
                <VitalBox label="Peso"       value={data.vital_weight_kg}        unit="kg" />
                <VitalBox label="Talla"      value={data.vital_height_cm}        unit="cm" />
                <VitalBox label="IMC"        value={data.vital_bmi}              unit="kg/m²" />
              </View>
            )}
            <TextBlock label="Examen físico por sistemas" value={data.physical_exam_notes} />
          </View>
        </View>

        {/* ── A — Análisis ── */}
        <View style={s.section}>
          <SectionHeader tag="A" title="Diagnósticos CIE-10 (Análisis) — RM 447-2024/MINSA" />
          <View style={s.sectionBody}>
            {data.diagnoses.map((d, i) => (
              <View key={i} style={s.diagRow}>
                <Text style={s.diagCode}>{d.cie10_code}</Text>
                <Text style={s.diagDesc}>{d.cie10_description}</Text>
                <Text style={[s.diagBadge, d.type === "principal" ? s.principalBadge : s.secondaryBadge]}>
                  {d.type === "principal" ? "Principal" : "Secundario"}
                </Text>
                <Text style={[s.diagBadge, { backgroundColor: LIGHT, color: GRAY, marginLeft: 2 }]}>
                  {d.certainty === "definitivo" ? "Definitivo" : "Presuntivo"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── P — Plan ── */}
        <View style={s.section}>
          <SectionHeader tag="P" title="Plan de Tratamiento (Plan)" />
          <View style={s.sectionBody}>
            <TextBlock label="Plan de tratamiento"       value={data.treatment_plan} />
            <TextBlock label="Indicaciones al paciente"  value={data.indications} />
            <TextBlock label="Pedidos de laboratorio"    value={data.lab_orders} />
            {data.follow_up_days && (
              <Text style={{ fontSize: 8, color: GRAY, marginTop: 2 }}>
                Próximo control: {data.follow_up_days} días
              </Text>
            )}
          </View>
        </View>

        {/* ── Cannabis Ley 30681 ── */}
        {(data.cannabis_indication || data.expected_outcomes) && (
          <View style={s.section}>
            <SectionHeader tag="Ley 30681" title="Justificación Cannabis Medicinal" />
            <View style={s.sectionBody}>
              <TextBlock label="Indicación terapéutica"  value={data.cannabis_indication} />
              <TextBlock label="Resultados esperados"    value={data.expected_outcomes} />
            </View>
          </View>
        )}

        {/* ── Firma electrónica ── */}
        <View style={s.sigBox}>
          <Text style={s.sigTitle}>Firma Electrónica — RM 164-2025/MINSA</Text>
          <View style={[s.row2, { marginBottom: 3 }]}>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Firmado por</Text>
              <Text style={s.fieldValue}>Dr(a). {data.doctor_name}  ·  CMP {data.doctor_cmp}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Fecha y hora (hora Lima)</Text>
              <Text style={s.fieldValue}>{signedDate}</Text>
            </View>
          </View>
          <Text style={s.fieldLabel}>Hash SHA-256 (integridad del documento)</Text>
          <Text style={s.sigHash}>{data.doctor_signature_hash}</Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {data.ipress_mode === "enabled"
              ? `${data.ipress_name}  ·  ${data.ipress_code}  ·  Conforme NTS 139-MINSA/2018`
              : `Organnical Salud S.A.C.  ·  RUC 20607170615  ·  Conforme NTS 139-MINSA/2018`}
          </Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
