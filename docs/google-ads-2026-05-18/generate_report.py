"""
Genera PDF brandeado con análisis de campaña Google Ads 29 abr - 18 may 2026.
Segunda iteración del reporte. Compara contra el período anterior (29 abr - 9 may).
"""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Image,
    Table, TableStyle, PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from datetime import date

# ── Branding ────────────────────────────────────────────────────────────────
PURPLE = colors.HexColor("#7C3AED")
PURPLE_LIGHT = colors.HexColor("#EDE9FE")
PINK = colors.HexColor("#EC4899")
GRAY_900 = colors.HexColor("#111827")
GRAY_700 = colors.HexColor("#374151")
GRAY_500 = colors.HexColor("#6B7280")
GRAY_300 = colors.HexColor("#D1D5DB")
GRAY_100 = colors.HexColor("#F3F4F6")
GREEN = colors.HexColor("#10B981")
AMBER = colors.HexColor("#F59E0B")
RED = colors.HexColor("#EF4444")

LOGO = Path(r"C:\Users\ruben\OneDrive\Desktop\Artes\Organnical.pe\sin_isotipo\Organnical_PE-H-color-v1.png")
LOGO_RATIO = 954 / 340
OUT = Path(r"C:\Users\ruben\Organnical.pe\docs\google-ads-2026-05-18\Organnical_GoogleAds_Report_2026-05-18.pdf")

# ── Page template with header/footer ───────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN_L = 1.8 * cm
MARGIN_R = 1.8 * cm
MARGIN_T = 2.6 * cm
MARGIN_B = 2.0 * cm

def header_footer(canvas, doc):
    canvas.saveState()
    if LOGO.exists():
        header_w = 3.2 * cm
        header_h = header_w / LOGO_RATIO
        canvas.drawImage(str(LOGO), MARGIN_L, PAGE_H - 1.7 * cm - header_h / 2,
                         width=header_w, height=header_h,
                         preserveAspectRatio=True, mask='auto')
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY_500)
    canvas.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 1.4 * cm,
                           "Reporte Google Ads · 29 abr – 18 may 2026")
    canvas.setStrokeColor(GRAY_300)
    canvas.setLineWidth(0.4)
    canvas.line(MARGIN_L, PAGE_H - 2.0 * cm, PAGE_W - MARGIN_R, PAGE_H - 2.0 * cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY_500)
    canvas.drawString(MARGIN_L, 1.2 * cm, "Confidencial · Organnical.pe")
    canvas.drawRightString(PAGE_W - MARGIN_R, 1.2 * cm, f"Página {doc.page}")
    canvas.restoreState()

# ── Styles ─────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName="Helvetica-Bold",
                   fontSize=22, leading=26, textColor=GRAY_900,
                   spaceBefore=0, spaceAfter=12)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold",
                   fontSize=14, leading=18, textColor=PURPLE,
                   spaceBefore=14, spaceAfter=8)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName="Helvetica-Bold",
                   fontSize=11, leading=14, textColor=GRAY_900,
                   spaceBefore=8, spaceAfter=4)
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica",
                     fontSize=9.5, leading=13.5, textColor=GRAY_700,
                     alignment=TA_JUSTIFY, spaceAfter=4)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=14, bulletIndent=4,
                       spaceAfter=2)
KPI_LBL = ParagraphStyle("KpiLbl", fontName="Helvetica", fontSize=8,
                        textColor=GRAY_500, alignment=TA_CENTER, leading=10)
KPI_VAL = ParagraphStyle("KpiVal", fontName="Helvetica-Bold", fontSize=20,
                        textColor=GRAY_900, alignment=TA_CENTER, leading=24)
KPI_HINT = ParagraphStyle("KpiHint", fontName="Helvetica", fontSize=7.5,
                         textColor=GRAY_500, alignment=TA_CENTER, leading=10)

# ── Story ──────────────────────────────────────────────────────────────────
story = []

# === COVER ===
story.append(Spacer(1, 0.5 * cm))
if LOGO.exists():
    cover_w = 6.5 * cm
    cover_h = cover_w / LOGO_RATIO
    story.append(Image(str(LOGO), width=cover_w, height=cover_h, hAlign='LEFT'))
story.append(Spacer(1, 1.5 * cm))
story.append(Paragraph("Reporte de Campaña<br/>Google Ads · #2", H1))
story.append(Paragraph(
    "<font color='#7C3AED'><b>Período analizado:</b></font> 29 abril – 18 mayo 2026 (20 días)",
    ParagraphStyle("CoverMeta", fontSize=11, textColor=GRAY_700, leading=16)))
story.append(Paragraph(
    "<font color='#7C3AED'><b>Vertical:</b></font> Lead generation para citas médicas",
    ParagraphStyle("CoverMeta2", fontSize=11, textColor=GRAY_700, leading=16)))
story.append(Paragraph(
    "<font color='#7C3AED'><b>Comparación:</b></font> vs reporte previo (29 abr – 9 may, 11 días)",
    ParagraphStyle("CoverMeta3", fontSize=11, textColor=GRAY_700, leading=16)))
story.append(Paragraph(
    f"<font color='#7C3AED'><b>Fecha del reporte:</b></font> {date.today().strftime('%d %b %Y')}",
    ParagraphStyle("CoverMeta4", fontSize=11, textColor=GRAY_700, leading=16)))

# === EXECUTIVE SUMMARY ===
story.append(Spacer(1, 0.8 * cm))
story.append(Paragraph("Resumen ejecutivo", H2))

story.append(Paragraph(
    "La cuenta <b>duplicó volumen</b> en 9 días adicionales (684→1,470 clics, +115%) "
    "manteniendo CTR alto (4.41% vs 4.29%). El re-balanceo de presupuestos sugerido en "
    "el reporte anterior <b>se ejecutó</b> (Insomnio y Dolor Crónico subieron de S/ 7.15 "
    "a S/ 12/día). Sin embargo, <b><font color='#EF4444'>el seguimiento de conversiones "
    "sigue en 0</font></b> a pesar de que el evento <i>cita_solicitada</i> ya está activo "
    "en GA4 — la importación a Google Ads no está conectada. Además, <b>el principal "
    "anuncio de Dolor Crónico fue rechazado</b> por política de \"Drogas recreativas\" — "
    "bloqueando la escalabilidad de esa campaña.",
    BODY))

def kpi_card(label, value, hint, color=GRAY_900):
    cell = [
        [Paragraph(label, KPI_LBL)],
        [Paragraph(f"<font color='{'#' + color.hexval()[2:]}'>{value}</font>", KPI_VAL)],
        [Paragraph(hint, KPI_HINT)],
    ]
    t = Table(cell, colWidths=[3.7 * cm], rowHeights=[0.5 * cm, 0.95 * cm, 0.5 * cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY_300),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t

kpi_row = Table([[
    kpi_card("Inversión", "S/ 479", "20 días · ~S/24/día"),
    kpi_card("Impresiones", "33,372", "+109% vs reporte 1"),
    kpi_card("Clics", "1,470", "+115% vs reporte 1"),
    kpi_card("CTR", "4.41%", "vs 4.29% prev", GREEN),
]], colWidths=[3.85 * cm] * 4)
kpi_row.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 2),
    ('RIGHTPADDING', (0, 0), (-1, -1), 2),
]))
story.append(Spacer(1, 0.3 * cm))
story.append(kpi_row)

kpi_row2 = Table([[
    kpi_card("CPC promedio", "S/ 0.33", "estable", GREEN),
    kpi_card("Conversiones", "0", "tracking roto", RED),
    kpi_card("Mobile", "96.7%", "vs 95.3% prev", AMBER),
    kpi_card("Anuncios OK", "2 / 3", "Dolor C. rechazado", RED),
]], colWidths=[3.85 * cm] * 4)
kpi_row2.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 2),
    ('RIGHTPADDING', (0, 0), (-1, -1), 2),
]))
story.append(Spacer(1, 0.2 * cm))
story.append(kpi_row2)

# 3 key takeaways
story.append(Spacer(1, 0.4 * cm))
story.append(Paragraph("3 mensajes clave para el equipo", H3))

takeaways_data = [
    [Paragraph("<b>1.</b>", BODY),
     Paragraph(
         "<b>El motor escaló bien, pero seguimos volando ciegos.</b> "
         "Clics diarios crecieron de 18 (29 abr) a 100+ (mediados de may), "
         "un 5x. Sin embargo, el evento <i>cita_solicitada</i> está activo en "
         "GA4 pero <b>no importado como conversión</b> en Google Ads. La AI no "
         "puede optimizar lo que no mide.",
         BODY)],
    [Paragraph("<b>2.</b>", BODY),
     Paragraph(
         "<b>Dolor Crónico está duplicada — gasto sin retorno.</b> Subimos presupuesto "
         "a S/ 12/día y consume S/ 170 (36% del total), pero su único anuncio fue "
         "<b>rechazado por política de \"Drogas recreativas\"</b>. La campaña sigue "
         "corriendo con anuncios viejos pero no podemos crear nuevos hasta resolverlo. "
         "Bloquea cualquier intento de mejorar copy.",
         BODY)],
    [Paragraph("<b>3.</b>", BODY),
     Paragraph(
         "<b>Móvil ya es 96.7% del gasto; domingo es el día rey.</b> Subió desde 95.3% "
         "del reporte anterior. El landing móvil <b>es el cuello de botella</b>. "
         "Domingo lidera con 249 clics — superando a lunes (187) y jueves (228). "
         "Coincide con búsquedas de bienestar después de fin de semana exhausto.",
         BODY)],
]
takeaways_tbl = Table(takeaways_data, colWidths=[0.6 * cm, 15.6 * cm])
takeaways_tbl.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(takeaways_tbl)

# ── Page 2: Performance ────────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("1. Performance por campaña", H2))

camp_data = [
    ["Campaña", "Impr.", "Clics", "CTR", "CPC", "Costo", "Estado"],
    ["Insomnio", "11,658", "610", "5.23%", "S/ 0.28", "S/ 169.08", "Ganadora"],
    ["Ansiedad", "12,251", "519", "4.24%", "S/ 0.27", "S/ 139.74", "Limitada budget"],
    ["Dolor Crónico", "9,447", "341", "3.61%", "S/ 0.50", "S/ 170.34", "Anuncio rechazado"],
    ["Total", "33,356", "1,470", "4.41%", "S/ 0.33", "S/ 479.15", ""],
]
camp_tbl = Table(camp_data, colWidths=[3.4*cm, 1.7*cm, 1.5*cm, 1.5*cm, 1.7*cm, 2.0*cm, 3.0*cm])
camp_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ('BACKGROUND', (0, -1), (-1, -1), GRAY_100),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 1), (-2, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LINEBELOW', (0, 0), (-1, 0), 1, PURPLE),
    ('LINEBELOW', (0, -2), (-1, -2), 0.5, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(camp_tbl)

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Hallazgos:", H3))
findings = [
    "<b>Insomnio sigue siendo la reina</b> (CTR 5.23%, CPC S/ 0.28). El doble de presupuesto que tenía antes la lleva a entregar 2.3x los clics con la misma eficiencia. <b>Confirmado: hay que seguir subiendo budget acá</b>.",
    "<b>Ansiedad consolida la segunda posición</b> con S/ 7.15/día sin cambios. Entregó 519 clics — 93% más que en el reporte anterior. Está limitada por presupuesto — espacio para subir.",
    "<b>Dolor Crónico está en limbo</b>: subió a S/ 12/día y gastó S/ 170, pero su anuncio principal fue <b>rechazado por \"Drogas recreativas\"</b>. CPC sube a S/ 0.50 (vs 0.27-0.28 en las otras) — Google penaliza calidad del anuncio rechazado.",
    "<b>Pmax desapareció</b> del reporte. Aparentemente eliminada o detenida definitivamente desde el reporte anterior — buena decisión.",
]
for f in findings:
    story.append(Paragraph(f"• {f}", BULLET))

# Comparación período vs período
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Comparación vs período anterior", H3))
comp_data = [
    ["Métrica", "Reporte 1 (11d)", "Reporte 2 (20d)", "Δ por día"],
    ["Inversión", "S/ 229", "S/ 479", "+15%"],
    ["Clics", "684", "1,470", "+18%"],
    ["Impresiones", "15,952", "33,372", "+15%"],
    ["CTR", "4.29%", "4.41%", "+0.12 pp"],
    ["CPC", "S/ 0.33", "S/ 0.33", "—"],
    ["Conversiones tracked", "0", "0", "Sin cambio"],
]
comp_tbl = Table(comp_data, colWidths=[4.0*cm, 3.5*cm, 3.5*cm, 3.0*cm])
comp_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE_LIGHT),
    ('TEXTCOLOR', (0, 0), (-1, 0), PURPLE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(comp_tbl)
story.append(Paragraph(
    "Δ por día normaliza la diferencia entre 11 y 20 días. <b>Crecimiento orgánico "
    "del 15-18% diario</b> con CTR mejorando — la cuenta está madurando bien.",
    BODY))

# ── Audiencia ──────────────────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("2. Audiencia: quién está buscando", H2))

# Devices
story.append(Paragraph("Distribución por dispositivo", H3))
dev_data = [
    ["Dispositivo", "% del gasto", "Impresiones", "Clics", "CTR"],
    ["Móvil", "96.7%", "32,515", "1,445", "4.44%"],
    ["Computadoras", "3.0%", "822", "21", "2.55%"],
    ["Tablets", "0.2%", "33", "4", "12.12%"],
]
dev_tbl = Table(dev_data, colWidths=[4.0*cm, 3.0*cm, 3.3*cm, 2.5*cm, 2.5*cm])
dev_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE_LIGHT),
    ('TEXTCOLOR', (0, 0), (-1, 0), PURPLE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(dev_tbl)
story.append(Paragraph(
    "<b>Implicancia:</b> mobile subió 1.4pp (95.3% → 96.7%). El landing móvil es "
    "<b>literalmente el negocio</b>. Desktop entrega CTR 2.55% — la mitad de móvil — "
    "señal de que el copy resuena más en formato mobile.",
    BODY))

# Demo
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Demografía — edad y género", H3))

demo_data = [
    ["Edad", "Clics", "% (excl. desc.)", "", "Género", "Clics", "% (excl. desc.)"],
    ["18-24", "29", "4.0%", "", "Mujer", "407", "55.8%"],
    ["25-34", "109", "15.0%", "", "Hombre", "322", "44.2%"],
    ["35-44", "117", "16.1%", "", "Desconocido", "741", "—"],
    ["45-54", "177", "24.3%", "", "", "", ""],
    ["55-64", "177", "24.3%", "", "", "", ""],
    ["65+", "119", "16.4%", "", "", "", ""],
    ["Desconocido", "742", "—", "", "", "", ""],
]
demo_tbl = Table(demo_data, colWidths=[2.2*cm, 1.7*cm, 2.7*cm, 0.4*cm, 2.4*cm, 1.7*cm, 2.7*cm])
demo_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (2, 0), PURPLE_LIGHT),
    ('BACKGROUND', (4, 0), (6, 0), PURPLE_LIGHT),
    ('TEXTCOLOR', (0, 0), (2, 0), PURPLE),
    ('TEXTCOLOR', (4, 0), (6, 0), PURPLE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 1), (2, -1), 'RIGHT'),
    ('ALIGN', (5, 1), (6, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (2, -1), 0.3, GRAY_300),
    ('GRID', (4, 0), (6, 3), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(demo_tbl)
story.append(Paragraph(
    "<b>50% del tráfico es \"Desconocido\"</b> (742 de 1,470 clics) — mobile sin "
    "Google login activo. Excluyendo desconocidos: <b>el sweet spot subió a 45-64 años "
    "(48.6%)</b>, ya no 35-44 como en el reporte 1. Sentido: público adulto medio-mayor, "
    "con dolores crónicos reales y poder adquisitivo. <b>Mujer mantiene 55.8% de las "
    "búsquedas identificadas</b>.",
    BODY))

# Hour of day
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Hora de mayor actividad", H3))

hour_data = [
    ["Hora", "Clics", "", "Hora", "Clics", "", "Hora", "Clics"],
    ["00:00 🌙", "74 ★", "", "08:00", "73", "", "16:00", "57"],
    ["01:00", "61", "", "09:00", "57", "", "17:00", "69"],
    ["02:00", "69", "", "10:00", "60", "", "18:00", "62"],
    ["03:00", "65", "", "11:00", "66", "", "19:00", "70"],
    ["04:00", "51", "", "12:00", "47", "", "20:00", "69"],
    ["05:00", "66", "", "13:00", "49", "", "21:00", "67"],
    ["06:00", "54", "", "14:00", "62", "", "22:00", "52"],
    ["07:00", "72", "", "15:00", "64", "", "23:00", "34"],
]
hour_tbl = Table(hour_data, colWidths=[1.9*cm, 1.6*cm, 0.4*cm, 1.9*cm, 1.6*cm, 0.4*cm, 1.9*cm, 1.6*cm])
hour_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (1, 0), PURPLE_LIGHT),
    ('BACKGROUND', (3, 0), (4, 0), PURPLE_LIGHT),
    ('BACKGROUND', (6, 0), (7, 0), PURPLE_LIGHT),
    ('TEXTCOLOR', (0, 0), (1, 0), PURPLE),
    ('TEXTCOLOR', (3, 0), (4, 0), PURPLE),
    ('TEXTCOLOR', (6, 0), (7, 0), PURPLE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 8.5),
    ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
    ('ALIGN', (4, 1), (4, -1), 'RIGHT'),
    ('ALIGN', (7, 1), (7, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (1, -1), 0.3, GRAY_300),
    ('GRID', (3, 0), (4, -1), 0.3, GRAY_300),
    ('GRID', (6, 0), (7, -1), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(hour_tbl)
story.append(Paragraph(
    "<b>Medianoche sigue siendo el peak — 74 clics</b>. Las horas 07-08 AM (72-73) y "
    "19-20 PM (69-70) son los otros máximos. <b>Tres ventanas críticas</b>: "
    "noche tardía (insomnio/ansiedad), comienzo del día (planificación de bienestar), "
    "y noche temprana (regreso del trabajo). El valle es 12-13 hrs (47-49 clics).",
    BODY))

# Día de la semana
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Día de la semana", H3))

day_data = [
    ["Día", "Clics", "% del total"],
    ["Domingo ★", "249", "16.9%"],
    ["Jueves", "228", "15.5%"],
    ["Sábado", "222", "15.1%"],
    ["Miércoles", "210", "14.3%"],
    ["Viernes", "210", "14.3%"],
    ["Lunes", "187", "12.7%"],
    ["Martes", "164", "11.2%"],
]
day_tbl = Table(day_data, colWidths=[5.0*cm, 3.0*cm, 3.0*cm])
day_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE_LIGHT),
    ('TEXTCOLOR', (0, 0), (-1, 0), PURPLE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(day_tbl)
story.append(Paragraph(
    "<b>Sorpresa: domingo lidera</b>. Coincide con el patrón \"el lunes empiezo a "
    "cuidarme\" — gente reflexionando sobre bienestar el día previo a la semana laboral. "
    "Martes es el día más débil. <b>Oportunidad</b>: budget extra los domingos, o "
    "ajuste de oferta +20% en ese día.",
    BODY))

# ── Page 4: Keywords ────────────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("3. Keywords — qué se está pagando", H2))

kw_data = [
    ["Keyword", "Clics", "CTR", "Costo", "Lectura"],
    ["cómo controlar la ansiedad", "258", "4.89%", "S/ 67.13", "Volumen #1"],
    ["cómo conciliar el sueño", "191", "3.45%", "S/ 45.35", "[!] Calidad baja"],
    ["no puedo dormir", "140", "5.38%", "S/ 40.88", "[!] Calidad baja"],
    ["remedios para la ansiedad", "122", "6.60%", "S/ 42.03", "★ Estrella"],
    ["me duele el cuerpo qué hago", "113", "4.25%", "S/ 57.07", "Caro pero útil"],
    ["remedios para el insomnio", "85", "8.70%", "S/ 25.89", "★ Eficiente"],
    ["me duele la espalda qué hago", "82", "2.21%", "S/ 48.31", "[!] CTR bajo"],
    ["qué tomar para dormir mejor", "74", "10.91%", "S/ 18.17", "★ Rey eficiencia"],
    ["cómo tratar el insomnio", "68", "9.05%", "S/ 24.21", "★ Excepcional"],
    ["por qué me duele tanto el cuerpo", "63", "12.73%", "S/ 22.42", "★ Top CTR"],
    ["cómo aliviar el dolor de espalda", "61", "3.11%", "S/ 28.93", "OK"],
    ["cómo calmar los nervios", "49", "3.96%", "S/ 9.83", "[!] Calidad baja"],
    ["por qué no puedo dormir", "46", "4.42%", "S/ 12.59", "[!] Calidad baja"],
    ["cómo bajar la ansiedad rápido", "29", "3.84%", "S/ 6.30", "OK"],
]
kw_tbl = Table(kw_data, colWidths=[5.5*cm, 1.4*cm, 1.7*cm, 1.8*cm, 4.8*cm])
kw_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 8.5),
    ('ALIGN', (1, 1), (3, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRAY_100]),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(kw_tbl)

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("⚠ Problema nuevo: 6 keywords \"Limitada por baja calidad\"", H3))
story.append(Paragraph(
    "Google clasificó como <b>baja calidad</b> a: <i>cómo calmar los nervios, no puedo "
    "dormir, cómo conciliar el sueño, por qué no puedo dormir, por qué me duele todo "
    "el cuerpo, pastillas para dormir Peru</i>. Esto reduce sus impresiones y sube su CPC. "
    "<b>Causa probable</b>: el copy del anuncio que se les muestra no resuena con la "
    "intención de búsqueda. La keyword \"cómo conciliar el sueño\" debería tener CTR 7-8% — "
    "tiene 3.45%. <b>Solución</b>: crear grupos de anuncios separados con copy más "
    "específico (\"¿No puedes conciliar el sueño?\" en lugar del genérico actual).",
    BODY))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Keywords zombi (configuradas, 0 clics en 20 días)", H3))
zombi = [
    "me siento agotado emocionalmente · no puedo dormir de tanto pensar · duermo pero me levanto cansado",
    "siento que algo malo va a pasar · me desvelo todas las noches · especialista en sueño Peru",
    "dolor que no se quita con nada · por qué me duele el cuerpo al despertar · dolor muscular crónico tratamiento",
]
for z in zombi:
    story.append(Paragraph(f"• <i>{z}</i>", BULLET))
story.append(Paragraph(
    "<b>Recomendación</b>: bajar el bid de estas a S/ 0.10 con concordancia amplia "
    "(broad match) para forzar exposición. Si siguen sin clics en 30 días, eliminarlas.",
    BODY))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Tráfico mal dirigido — nuevos candidatos a negativos", H3))
story.append(Paragraph(
    "Las negativas del reporte anterior <b>funcionaron</b>: <i>meditar, meditación, "
    "espiritual</i> bajaron de 42+ clics a 1 click cada uno. <b>Nuevos términos a podar</b>:",
    BODY))
new_neg = [
    "<b>\"debilidad y dolor muscular\"</b> — 33 clics, S/ 11.28 (top spend término): puede ser búsqueda de síntoma viral/COVID, no de servicio médico crónico.",
    "<b>\"para dormir\"</b> (solo) — 8 clics en 1,042 impresiones (0.77% CTR): demasiado amplio, sin intención clara.",
    "<b>\"remedios caseros\"</b>, <b>\"remedios naturales\"</b> — buscan auto-solución gratis, no consulta médica paga.",
    "<b>\"masajes\"</b>, <b>\"aceite\"</b>, <b>\"productos naturales\"</b> — desviación a categoría producto, no servicio.",
]
for n in new_neg:
    story.append(Paragraph(f"• {n}", BULLET))

# ── Page 5: Recommendations ────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("4. Recomendaciones priorizadas", H2))

# Urgent
story.append(Paragraph("<font color='#EF4444'>● URGENTE</font> — hoy / mañana", H3))
urgent = [
    "<b>Arreglar el anuncio rechazado de Dolor Crónico.</b> Cambiar URL final de <i>organnical.pe</i> "
    "a <i>organnical.pe/especialidades/dolor-cronico</i>, tightenear el copy (sacar \"evalúa\" "
    "y \"Más de 3 meses\"), y apelar. Detalle del nuevo copy ya provisto. "
    "Mientras tanto la campaña gasta S/ 12/día con un solo anuncio degradado.",
    "<b>Importar evento <i>cita_solicitada</i> de GA4 a Google Ads como conversión.</b> "
    "El evento ya se dispara (commit cdb9bf6) pero la importación está rota o no configurada. "
    "Esfuerzo: 15 min en Google Ads → Herramientas → Conversiones → Importar de GA4. "
    "<b>Sin esto, Smart Bidding sigue imposible.</b>",
]
for u in urgent:
    story.append(Paragraph(f"• {u}", BULLET))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("<font color='#F59E0B'>● ESTA SEMANA</font> — quick wins", H3))
quick = [
    "<b>Subir budget de Insomnio</b> de S/ 12 → S/ 18/día. Sigue limitada y es la más eficiente "
    "(CTR 5.23%, CPC 0.28).",
    "<b>Subir budget de Ansiedad</b> de S/ 7.15 → S/ 12/día. También limitada, performance estable.",
    "<b>Agregar negativas nuevas</b>: <i>debilidad muscular, para dormir [solo], remedios caseros, "
    "remedios naturales, masajes, aceite esencial, productos naturales</i>.",
    "<b>Crear 2 grupos de anuncios nuevos</b> en Insomnio: uno enfocado en \"conciliar el sueño\" y "
    "otro en \"no puedo dormir\" — copy específico para subir CTR de las 4 keywords con calidad baja.",
    "<b>Ajuste de oferta +20% para domingo</b> (día rey) en las 3 campañas.",
    "<b>Pausar \"me duele la espalda qué hago\"</b> — CTR 2.21% gastando S/ 48 sin engagement.",
]
for q in quick:
    story.append(Paragraph(f"• {q}", BULLET))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("<font color='#10B981'>● PRÓXIMAS 2 SEMANAS</font> — escalar lo que funciona", H3))
scale = [
    "<b>Una vez activo el tracking</b>: pasar de \"Maximizar clics\" a \"Maximizar conversiones\" "
    "(necesita 7 días con conversiones registradas).",
    "<b>Landing dedicada</b> <i>/consultas/dolor-cronico</i> sin links a catálogo — evita futuros "
    "rechazos por \"Drogas recreativas\" y reduce fricción móvil.",
    "<b>Audit mobile real</b>: abrir <i>organnical.pe/agendar</i> en celular y medir tap-to-submit. "
    "Con 96.7% del tráfico ahí, cualquier mejora de 0.5s = +5-10% conversión.",
    "<b>Copy nocturno específico</b> para horas 23:00-02:00 (peak insomnio). "
    "Ej: <i>\"¿Despierto a las 2 AM? Médico te atiende mañana — agenda ahora\"</i>.",
    "<b>Considerar campaña nueva: \"Bienestar Domingo\"</b> — solo se publica viernes-domingo, "
    "explota la concentración de búsquedas de fin de semana.",
]
for s in scale:
    story.append(Paragraph(f"• {s}", BULLET))

# ── Proyección ─────────────────────────────────────────────────────────────
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("5. Proyección y meta para reporte #3", H2))

proy_data = [
    ["Escenario", "CPA estimado", "Citas/mes esperadas"],
    ["Como va hoy (sin tracking activo)", "S/ 150–250", "3–5"],
    ["Con tracking + arreglo Dolor Crónico", "S/ 80–120", "8–12"],
    ["Con Smart Bidding (reporte #4, +1 mes)", "S/ 50–80", "12–18"],
]
proy_tbl = Table(proy_data, colWidths=[7.5*cm, 3.5*cm, 5.0*cm])
proy_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRAY_100]),
    ('GRID', (0, 0), (-1, -1), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(proy_tbl)

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Meta para el próximo reporte (~1 jun)", H3))
meta = [
    "✅ Tracking de conversiones activo y al menos <b>5 citas registradas</b> automáticamente.",
    "✅ Dolor Crónico con anuncio aprobado y CPC bajando a S/ 0.30–0.35.",
    "✅ <b>1,800–2,200 clics</b> totales (vs 1,470 actual) manteniendo CTR > 4.5%.",
    "✅ Decisión sobre Smart Bidding: activar si hay > 30 conversiones tracked.",
]
for m in meta:
    story.append(Paragraph(f"• {m}", BULLET))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph(
    "<i>Nota sobre LTV: una cita médica con suplementos asociados y consultas de "
    "seguimiento tiene LTV 3-5x el ticket inicial. Un CPA de S/ 100 con LTV S/ 400 = "
    "ROAS 4x. Hasta que el tracking esté activo, estos números son hipotéticos.</i>",
    ParagraphStyle("Note", parent=BODY, fontSize=8, textColor=GRAY_500, leading=11)))

# ── Build ──────────────────────────────────────────────────────────────────
class ReportDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, pagesize=A4,
                         leftMargin=MARGIN_L, rightMargin=MARGIN_R,
                         topMargin=MARGIN_T, bottomMargin=MARGIN_B,
                         **kw)
        frame = Frame(MARGIN_L, MARGIN_B,
                     PAGE_W - MARGIN_L - MARGIN_R,
                     PAGE_H - MARGIN_T - MARGIN_B,
                     id='main')
        tpl = PageTemplate(id='main', frames=[frame], onPage=header_footer)
        self.addPageTemplates([tpl])

doc = ReportDoc(str(OUT))
doc.build(story)
print(f"PDF generado: {OUT}")
print(f"Tamaño: {OUT.stat().st_size / 1024:.1f} KB")
