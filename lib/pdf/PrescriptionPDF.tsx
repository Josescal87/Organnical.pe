import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

const VIOLET = "#7C3AED";
const DARK   = "#0B1D35";
const GRAY   = "#6B7280";
const LIGHT  = "#F3F4F6";
const BORDER = "#E5E7EB";

const s = StyleSheet.create({
  page:        { fontFamily: "Helvetica", fontSize: 9, color: DARK, padding: "30pt 36pt 40pt 36pt", lineHeight: 1.4 },
  headerRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, borderBottomWidth: 2, borderBottomColor: VIOLET, paddingBottom: 8 },
  ipressName:  { fontSize: 13, fontFamily: "Helvetica-Bold", color: VIOLET },
  ipressSub:   { fontSize: 7.5, color: GRAY, marginTop: 2 },
  rxBox:       { alignItems: "flex-end" },
  rxLabel:     { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 },
  rxNumber:    { fontSize: 14, fontFamily: "Helvetica-Bold", color: VIOLET },
  docTitle:    { textAlign: "center", fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: DARK, marginBottom: 10, textTransform: "uppercase" },
  section:     { marginBottom: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden" },
  sectionHead: { backgroundColor: VIOLET, paddingHorizontal: 8, paddingVertical: 4 },
  sectionTitle:{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "white" },
  sectionBody: { padding: "6pt 8pt" },
  row2:        { flexDirection: "row", gap: 8, marginBottom: 4 },
  field:       { flex: 1 },
  fieldLabel:  { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 1 },
  fieldValue:  { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  // Items table
  tableHeader: { flexDirection: "row", backgroundColor: LIGHT, paddingHorizontal: 6, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableHeaderText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase" },
  tableRow:    { flexDirection: "row", paddingHorizontal: 6, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: LIGHT },
  col1:        { width: "40%" },
  col2:        { width: "35%" },
  col3:        { width: "15%", textAlign: "center" },
  col4:        { width: "10%", textAlign: "right" },
  // Diagnosis banner
  diagBanner:  { flexDirection: "row", gap: 8, backgroundColor: "#EDE9FE", padding: "5pt 8pt", borderRadius: 4, marginBottom: 8, alignItems: "center" },
  diagCode:    { fontSize: 9, fontFamily: "Helvetica-Bold", color: VIOLET },
  diagDesc:    { fontSize: 8.5, flex: 1 },
  // Validity
  validBox:    { backgroundColor: LIGHT, borderRadius: 4, padding: "5pt 8pt", flexDirection: "row", gap: 12, marginBottom: 8 },
  // Signature
  sigBox:      { marginTop: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: "8pt 10pt", backgroundColor: "#FAFAFA" },
  sigTitle:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: VIOLET, marginBottom: 4 },
  sigHash:     { fontSize: 6.5, color: GRAY, wordBreak: "break-all" },
  // Legal notice
  legalBox:    { marginTop: 6, padding: "5pt 8pt", backgroundColor: "#FEF3C7", borderRadius: 4, borderWidth: 1, borderColor: "#FDE68A" },
  legalText:   { fontSize: 7.5, color: "#92400E" },
  // Footer
  footer:      { position: "absolute", bottom: 16, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 4 },
  footerText:  { fontSize: 7, color: GRAY },
});

export type PrescriptionItem = {
  nombre:              string;
  producto_sku:        string;
  quantity:            number;
  dosage_instructions: string | null;
};

export type PrescriptionPDFData = {
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
  hc_number:       string;
  // Receta
  prescription_number: string;
  issued_at:           string;
  valid_until:         string;
  diagnosis_cie10?:    string;
  diagnosis_label?:    string;
  items:               PrescriptionItem[];
};

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  );
}

export function PrescriptionPDF({ data }: { data: PrescriptionPDFData }) {
  const issuedDate = new Date(data.issued_at).toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "America/Lima",
  });
  const validDate = new Date(data.valid_until).toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "America/Lima",
  });

  return (
    <Document title={`Receta ${data.prescription_number} — ${data.patient_name}`} author="Organnical Salud S.A.C.">
      <Page size="A4" style={s.page}>

        {/* ── Encabezado ── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.ipressName}>{data.ipress_name}</Text>
            <Text style={s.ipressSub}>{data.ipress_address}</Text>
            <Text style={s.ipressSub}>RUC: {data.ipress_ruc}  ·  Código: {data.ipress_code}  ·  Categoría {data.ipress_category}</Text>
          </View>
          <View style={s.rxBox}>
            <Text style={s.rxLabel}>N° Receta</Text>
            <Text style={s.rxNumber}>{data.prescription_number}</Text>
            <Text style={[s.ipressSub, { marginTop: 4 }]}>Emitida: {issuedDate}</Text>
          </View>
        </View>

        <Text style={s.docTitle}>Receta Médica Electrónica — Ley N° 30681</Text>

        {/* ── Paciente + Médico ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Datos del Paciente y Médico</Text>
          </View>
          <View style={s.sectionBody}>
            <View style={s.row2}>
              <Field label="Paciente"          value={data.patient_name} />
              <Field label="DNI / Documento"   value={data.patient_dni} />
              <Field label="N° Historia Clínica" value={data.hc_number} />
            </View>
            <View style={[s.row2, { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 4, marginTop: 2 }]}>
              <Field label="Médico"            value={`Dr(a). ${data.doctor_name}`} />
              <Field label="CMP"               value={data.doctor_cmp} />
              <Field label="Especialidad"      value={data.doctor_specialty} />
            </View>
          </View>
        </View>

        {/* ── Diagnóstico ── */}
        {(data.diagnosis_cie10 || data.diagnosis_label) && (
          <View style={s.diagBanner}>
            <Text style={s.diagCode}>{data.diagnosis_cie10}</Text>
            <Text style={s.diagDesc}>{data.diagnosis_label}</Text>
            <Text style={{ fontSize: 7, color: GRAY }}>RM 447-2024/MINSA</Text>
          </View>
        )}

        {/* ── Validez ── */}
        <View style={s.validBox}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Fecha de emisión</Text>
            <Text style={s.fieldValue}>{issuedDate}</Text>
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Válida hasta</Text>
            <Text style={[s.fieldValue, { color: VIOLET }]}>{validDate}</Text>
          </View>
        </View>

        {/* ── Medicamentos ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Medicamentos y Productos Terapéuticos</Text>
          </View>
          <View>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.col1]}>Producto</Text>
              <Text style={[s.tableHeaderText, s.col2]}>Instrucciones de dosificación</Text>
              <Text style={[s.tableHeaderText, s.col3]}>Cantidad</Text>
              <Text style={[s.tableHeaderText, s.col4]}>SKU</Text>
            </View>
            {data.items.map((item, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={[{ fontSize: 8.5, fontFamily: "Helvetica-Bold" }, s.col1]}>{item.nombre}</Text>
                <Text style={[{ fontSize: 8 }, s.col2]}>{item.dosage_instructions ?? "—"}</Text>
                <Text style={[{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: VIOLET }, s.col3]}>×{item.quantity}</Text>
                <Text style={[{ fontSize: 7, color: GRAY }, s.col4]}>{item.producto_sku}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Aviso legal Ley 30681 ── */}
        <View style={s.legalBox}>
          <Text style={s.legalText}>
            Conforme a la Ley N° 30681 y su Reglamento (DS 005-2019-SA), los productos recetados son de uso terapéutico exclusivo bajo supervisión médica.
            El paciente se compromete a no ceder, vender ni transferir los productos prescritos.
            Receta válida únicamente para el paciente indicado.
          </Text>
        </View>

        {/* ── Firma ── */}
        <View style={s.sigBox}>
          <Text style={s.sigTitle}>Firma del Médico</Text>
          <View style={[s.row2, { marginBottom: 3 }]}>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Médico prescriptor</Text>
              <Text style={s.fieldValue}>Dr(a). {data.doctor_name}  ·  CMP {data.doctor_cmp}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Fecha de emisión (hora Lima)</Text>
              <Text style={s.fieldValue}>{issuedDate}</Text>
            </View>
          </View>
          <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 6 }}>
            <Text style={{ fontSize: 7, color: GRAY, textAlign: "center" }}>
              _______________________________________________
            </Text>
            <Text style={{ fontSize: 7, color: GRAY, textAlign: "center", marginTop: 2 }}>
              Firma y sello del médico
            </Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {data.ipress_name}  ·  {data.ipress_code}  ·  Ley 30681 — Cannabis Medicinal Perú
          </Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
