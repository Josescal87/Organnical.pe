"""
Genera PDF brandeado con análisis de campaña Google Ads 29 abr - 9 may 2026.
"""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Image,
    Table, TableStyle, PageBreak, KeepTogether,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
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
LOGO_RATIO = 954 / 340  # ancho/alto del PNG real, para no deformarlo
OUT = Path(r"C:\Users\ruben\Organnical.pe\docs\google-ads-2026-05-09\Organnical_GoogleAds_Report_2026-05-09.pdf")

# ── Page template with header/footer ───────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN_L = 1.8 * cm
MARGIN_R = 1.8 * cm
MARGIN_T = 2.6 * cm
MARGIN_B = 2.0 * cm

def header_footer(canvas, doc):
    canvas.saveState()
    # Header logo
    if LOGO.exists():
        header_w = 3.2 * cm
        header_h = header_w / LOGO_RATIO
        canvas.drawImage(str(LOGO), MARGIN_L, PAGE_H - 1.7 * cm - header_h / 2,
                         width=header_w, height=header_h,
                         preserveAspectRatio=True, mask='auto')
    # Header right
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY_500)
    canvas.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 1.4 * cm,
                           "Reporte Google Ads · 29 abr – 9 may 2026")
    # Header underline
    canvas.setStrokeColor(GRAY_300)
    canvas.setLineWidth(0.4)
    canvas.line(MARGIN_L, PAGE_H - 2.0 * cm, PAGE_W - MARGIN_R, PAGE_H - 2.0 * cm)
    # Footer
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
story.append(Paragraph("Reporte de Campaña<br/>Google Ads", H1))
story.append(Paragraph(
    "<font color='#7C3AED'><b>Período analizado:</b></font> 29 abril – 9 mayo 2026 (11 días)",
    ParagraphStyle("CoverMeta", fontSize=11, textColor=GRAY_700, leading=16)))
story.append(Paragraph(
    "<font color='#7C3AED'><b>Vertical:</b></font> Lead generation para citas médicas",
    ParagraphStyle("CoverMeta2", fontSize=11, textColor=GRAY_700, leading=16)))
story.append(Paragraph(
    f"<font color='#7C3AED'><b>Fecha del reporte:</b></font> {date.today().strftime('%d %b %Y')}",
    ParagraphStyle("CoverMeta3", fontSize=11, textColor=GRAY_700, leading=16)))

# === EXECUTIVE SUMMARY ===
story.append(Spacer(1, 0.8 * cm))
story.append(Paragraph("Resumen ejecutivo", H2))

story.append(Paragraph(
    "La campaña <b>genera tráfico de alta calidad a un costo muy bajo</b> "
    "(CTR 4.29% vs 1.9% del benchmark, CPC S/ 0.33). Sin embargo, "
    "<b><font color='#EF4444'>la falta de configuración de seguimiento de conversiones</font></b> "
    "impide que Google optimice el gasto y nos impide medir el ROI real. "
    "Una cita confirmada en este período (CPA manual S/ 229) es invisible "
    "para Google Ads — la AI no puede aprender de ella.",
    BODY))

# KPI cards
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
    kpi_card("Inversión", "S/ 229", "11 días · ~S/21/día"),
    kpi_card("Impresiones", "15,952", "Lima Metrop."),
    kpi_card("Clics", "684", "tráfico al sitio"),
    kpi_card("CTR", "4.29%", "vs 1.9% benchmark", GREEN),
]], colWidths=[3.85 * cm] * 4)
kpi_row.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 2),
    ('RIGHTPADDING', (0, 0), (-1, -1), 2),
]))
story.append(Spacer(1, 0.3 * cm))
story.append(kpi_row)

kpi_row2 = Table([[
    kpi_card("CPC promedio", "S/ 0.33", "muy bajo", GREEN),
    kpi_card("Conversiones", "0 / 1", "tracked / reales", RED),
    kpi_card("CPA real", "S/ 229", "1 cita generada", AMBER),
    kpi_card("Mobile", "95%", "del gasto"),
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
         "<b>El tráfico es de calidad pero estamos disparando a ciegas.</b> "
         "CTR de 4.29% confirma que copy y keywords resuenan con la audiencia, "
         "pero <b>no hay seguimiento de conversiones</b> en Google Ads — la AI no aprende, "
         "no podemos usar Smart Bidding ni hacer remarketing inteligente.",
         BODY)],
    [Paragraph("<b>2.</b>", BODY),
     Paragraph(
         "<b>Insomnio es la campaña ganadora; Dolor Crónico está estrangulada.</b> "
         "Insomnio rinde 35% mejor (5.31% CTR vs 3.7-3.9%) con menor CPC. "
         "Dolor Crónico está limitada por presupuesto y con CPC más alto. "
         "Re-balancear presupuestos puede mejorar resultados sin gastar más.",
         BODY)],
    [Paragraph("<b>3.</b>", BODY),
     Paragraph(
         "<b>Audiencia: 95% mobile, 25-54 años, peak a medianoche.</b> "
         "El landing móvil es crítico. La hora más activa es 12 AM — coincide "
         "con vertical de insomnio/ansiedad: gente despierta cuando no debería.",
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
    ["Insomnio", "4,949", "263", "5.31%", "S/ 0.28", "S/ 73.58", "Ganadora"],
    ["Ansiedad", "6,908", "269", "3.89%", "S/ 0.29", "S/ 76.96", "OK"],
    ["Dolor Crónico", "4,095", "152", "3.71%", "S/ 0.52", "S/ 78.58", "Limitada budget"],
    ["Pmax (#1)", "0", "0", "—", "—", "S/ 0.00", "Detenida"],
    ["Total", "15,952", "684", "4.29%", "S/ 0.33", "S/ 229.12", ""],
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
    "<b>Insomnio</b> es la campaña ganadora silenciosa — mismo presupuesto que las otras pero entrega 35% más eficiencia.",
    "<b>Dolor Crónico</b> está estrangulada por su presupuesto diario (S/ 7.15) Y compite en keywords más caras (CPC S/ 0.52). Doble pena.",
    "<b>Presupuesto plano</b> de S/ 7.15/día por campaña ignora estas diferencias. Cada sol que va a Dolor Crónico llega a la mitad de personas que el mismo sol en Insomnio.",
    "<b>Pmax bloqueada por política</b> — Google rechazó algún creativo (probablemente lenguaje médico o referencias a cannabis sin contexto adecuado).",
]
for f in findings:
    story.append(Paragraph(f"• {f}", BULLET))

# ── Audiencia ──────────────────────────────────────────────────────────────
story.append(Paragraph("2. Audiencia: quién está buscando", H2))

# Devices
story.append(Paragraph("Distribución por dispositivo", H3))
dev_data = [
    ["Dispositivo", "% del gasto", "Impresiones", "Clics"],
    ["Móvil", "95.3%", "15,536", "669"],
    ["Desktop", "4.5%", "338", "13"],
    ["Tablet", "0.1%", "16", "1"],
]
dev_tbl = Table(dev_data, colWidths=[5.0*cm, 3.5*cm, 4.0*cm, 3.0*cm])
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
    "<b>Implicancia:</b> el landing móvil es crítico. Promedio Lima e-commerce es ~75% mobile; "
    "nosotros tenemos 95%. Cualquier fricción mobile (form lento, tap targets pequeños, modal mal escalado) "
    "mata el funnel directamente.",
    BODY))

# Demo
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Demografía", H3))

demo_data = [
    ["Edad", "% impr.", "", "Género", "% impr."],
    ["18-24", "6.36%", "", "Mujer", "56.05%"],
    ["25-34", "23.15%", "", "Hombre", "44.11%"],
    ["35-44", "23.19% (top)", "", "", ""],
    ["45-54", "20.25%", "", "", ""],
    ["55-64", "15.42%", "", "", ""],
    ["65+", "11.75%", "", "", ""],
]
demo_tbl = Table(demo_data, colWidths=[2.5*cm, 2.5*cm, 0.8*cm, 3.0*cm, 2.5*cm])
demo_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (1, 0), PURPLE_LIGHT),
    ('BACKGROUND', (3, 0), (4, 0), PURPLE_LIGHT),
    ('TEXTCOLOR', (0, 0), (1, 0), PURPLE),
    ('TEXTCOLOR', (3, 0), (4, 0), PURPLE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
    ('ALIGN', (4, 1), (4, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (1, -1), 0.3, GRAY_300),
    ('GRID', (3, 0), (4, 2), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(demo_tbl)
story.append(Paragraph(
    "Sweet spot 25-54 años = <b>66.6%</b> de las impresiones. Adultos con poder adquisitivo "
    "que pagan por consulta médica + suplementos. Audiencia correcta.",
    BODY))

# Hour of day
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Hora de mayor actividad", H3))
story.append(Paragraph(
    "<b>Medianoche (12 a.m.) es el peak — 885 impresiones</b>, seguido de mañana temprana (6-9 a.m.). "
    "Coincide perfecto con la vertical: gente con insomnio o ansiedad busca soluciones cuando no puede dormir. "
    "Oportunidad: copy específico nocturno (<i>\"¿No puedes dormir ahora? Agenda tu consulta para mañana\"</i>).",
    BODY))

# ── Page 3: Keywords ────────────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("3. Keywords pagadas — qué funcionó", H2))

kw_data = [
    ["Keyword", "Clics", "CTR", "Costo", "Lectura"],
    ["remedios para la ansiedad", "56", "6.46%", "S/ 21.72", "★ Estrella — intent compra"],
    ["cómo tratar el insomnio", "29", "10.70%", "S/ 8.96", "★ CTR excepcional"],
    ["qué tomar para dormir mejor", "29", "8.95%", "S/ 6.38", "Eficiente"],
    ["remedios para el insomnio", "37", "8.28%", "S/ 12.45", "Eficiente"],
    ["no puedo dormir", "63", "5.46%", "S/ 20.40", "Volumen + buen CTR"],
    ["cómo controlar la ansiedad", "127", "4.99%", "S/ 35.49", "Volumen alto, OK"],
    ["cómo tranquilizar la mente", "42", "1.68%", "S/ 10.80", "[!] Copy no encaja"],
    ["me duele la espalda qué hago", "45", "2.90%", "S/ 22.82", "Intent ambiguo"],
]
kw_tbl = Table(kw_data, colWidths=[5.5*cm, 1.4*cm, 2.0*cm, 1.8*cm, 4.5*cm])
kw_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 8.5),
    ('ALIGN', (1, 1), (3, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRAY_100]),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(kw_tbl)

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Keywords zombi (configuradas, sin tráfico)", H3))
story.append(Paragraph(
    "11 keywords no recibieron impresiones: <i>pastillas para dormir Peru, especialista en sueño Peru, "
    "dolor que no se quita con nada, mi cabeza no para de pensar, siento que algo malo va a pasar, "
    "duermo pero me levanto cansado, me desvelo todas las noches</i> (entre otras). Algunas son joyas "
    "potenciales con bid bajo o phrase match restrictivo.",
    BODY))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Tráfico mal dirigido (a podar)", H3))
story.append(Paragraph(
    "Términos que dispararon nuestros anuncios pero NO buscan lo que ofrecemos:",
    BODY))
waste = [
    "\"como meditar\", \"meditación y relajación\" — busca app de meditación, no consulta médica",
    "\"descubre los 20 secretos espirituales para una mente tranquila\" — clickbait espiritual",
    "\"como hacer para que mi mente no me controle\" — baja intención",
]
for w in waste:
    story.append(Paragraph(f"• {w}", BULLET))
story.append(Paragraph(
    "Recomendación: agregar palabras negativas <b>meditar, meditación, espiritual, gratis, app, audio</b>. "
    "Estimado: 5-10% de gasto recuperable.",
    BODY))

# ── Page 4: Recommendations ────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("4. Recomendaciones priorizadas", H2))

# Urgent
story.append(Paragraph("<font color='#EF4444'>● URGENTE</font> — bloqueante para escalar", H3))
urgent = [
    "<b>Configurar conversion tracking en Google Ads.</b> Acción mínima: evento <i>cita_solicitada</i> "
    "que se dispare cuando un usuario completa el formulario en /agendar. Sin esto no podemos usar "
    "Smart Bidding, ni remarketing, ni medir ROI real. Esfuerzo: ~1.5 h de implementación.",
    "<b>Resolver Pmax bloqueada</b> o desactivarla definitivamente. Hoy ocupa estructura sin entregar.",
]
for u in urgent:
    story.append(Paragraph(f"• {u}", BULLET))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("<font color='#F59E0B'>● ESTA SEMANA</font> — optimización rápida", H3))
quick = [
    "<b>Re-balancear presupuestos:</b> Insomnio S/ 7→12, Dolor Crónico S/ 7→5, Ansiedad S/ 7 (mantener).",
    "<b>Agregar negativas:</b> meditar, meditación, espiritual, gratis, app, audio.",
    "<b>Pausar \"cómo tranquilizar la mente\"</b> — CTR 1.68% confirma audiencia equivocada.",
    "<b>Subir bid en \"cómo tratar el insomnio\"</b> — CTR 10.70%, está infrautilizada.",
]
for q in quick:
    story.append(Paragraph(f"• {q}", BULLET))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("<font color='#10B981'>● PRÓXIMAS 2 SEMANAS</font> — escalar lo que funciona", H3))
scale = [
    "<b>Copy nocturno específico</b> para slot 11 p.m. - 2 a.m. (peak de búsquedas insomnio/ansiedad).",
    "<b>Audit de landing móvil</b> — abrir organnical.pe/agendar en celular y cronometrar tap-to-form-submit.",
    "<b>Migrar a \"Maximize Conversions\"</b> una vez tengamos 7 días de tracking activo.",
]
for s in scale:
    story.append(Paragraph(f"• {s}", BULLET))

# ── Proyección ─────────────────────────────────────────────────────────────
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("5. Proyección con S/ 700/mes", H2))

proy_data = [
    ["Escenario", "CPA", "Citas/mes esperadas"],
    ["Como va hoy (sin tracking)", "S/ 229", "~3"],
    ["Con quick wins (negativas + budgets)", "S/ 80–120", "6–9"],
    ["Con tracking + Smart Bidding (mes 2)", "S/ 50–80", "9–14"],
]
proy_tbl = Table(proy_data, colWidths=[7.5*cm, 3.0*cm, 5.5*cm])
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
story.append(Paragraph(
    "<i>Nota: el CPA real depende del LTV del paciente captado. Una cita médica con suplementos "
    "asociados y consultas de seguimiento puede tener LTV 3-5x el ticket inicial.</i>",
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
