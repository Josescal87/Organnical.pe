"""
Genera PDF brandeado con análisis de campaña Google Ads 29 abr - 25 may 2026.
Tercera iteración del reporte. Compara contra el reporte #2 (29 abr - 18 may, 20 días).

Cambios vs #2:
- Sección 4 nueva: "Estrategia ajustada post-evolución de plataforma"
- Página de screenshots de landings nuevas (home, consulta-express, spirusol)
- 3 mensajes clave reordenados: estratégico → tracking → Dolor Crónico
- Recomendaciones con tono mix (1 dura + nota alternativa)
- Voz: Mary Keting ejecutiva (más cercana en resumen/sección 4, técnica en tablas)
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

BASE = Path(r"C:\Users\ruben\Organnical.pe\docs\google-ads-2026-05-25")
LOGO = Path(r"C:\Users\ruben\OneDrive\Desktop\Artes\Organnical.pe\sin_isotipo\Organnical_PE-H-color-v1.png")
LOGO_RATIO = 954 / 340
OUT = BASE / "Organnical_GoogleAds_Report_2026-05-25.pdf"
SHOT_HOME = BASE / "screenshots" / "01-home.png"
SHOT_EXPRESS = BASE / "screenshots" / "02-consulta-express.png"
SHOT_SPIRUSOL = BASE / "screenshots" / "03-spirusol.png"

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
                           "Reporte Google Ads · 29 abr – 25 may 2026")
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
NOTE = ParagraphStyle("Note", parent=BODY, fontSize=8, textColor=GRAY_500,
                     leading=11, leftIndent=14, spaceAfter=4)
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
story.append(Paragraph("Reporte de Campaña<br/>Google Ads · #3", H1))
story.append(Paragraph(
    "<font color='#7C3AED'><b>Período analizado:</b></font> 29 abril – 25 mayo 2026 (27 días)",
    ParagraphStyle("CoverMeta", fontSize=11, textColor=GRAY_700, leading=16)))
story.append(Paragraph(
    "<font color='#7C3AED'><b>Vertical:</b></font> Lead generation para citas médicas + ticket de entrada S/30",
    ParagraphStyle("CoverMeta2", fontSize=11, textColor=GRAY_700, leading=16)))
story.append(Paragraph(
    "<font color='#7C3AED'><b>Comparación:</b></font> vs reporte #2 (29 abr – 18 may, 20 días)",
    ParagraphStyle("CoverMeta3", fontSize=11, textColor=GRAY_700, leading=16)))
story.append(Paragraph(
    f"<font color='#7C3AED'><b>Fecha del reporte:</b></font> {date.today().strftime('%d %b %Y')}",
    ParagraphStyle("CoverMeta4", fontSize=11, textColor=GRAY_700, leading=16)))

# === EXECUTIVE SUMMARY ===
story.append(Spacer(1, 0.8 * cm))
story.append(Paragraph("Resumen ejecutivo", H2))

story.append(Paragraph(
    "Este mes la plataforma Organnical.pe se duplicó: lanzamos Consulta Express S/30, "
    "Spirusol, Botica con receta, blog v2 y eventos GA4 nuevos. Pero los anuncios "
    "viven en abril — los 3 siguen apuntando a la homepage y prometiendo precios viejos. "
    "El volumen creció (+32% en clics, +30% en impresiones) manteniendo CTR sano "
    "(4.48% vs 4.41%), pero <b><font color='#EF4444'>seguimos sin medir lo que vendemos</font></b>: "
    "lo que cuenta como conversión son <i>page views de /agendar</i>, no citas pagadas. "
    "Y Dolor Crónico, rechazada por política, lleva una semana detenida sin movimiento.",
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
    kpi_card("Inversión", "S/ 671", "27 días · ~S/25/día"),
    kpi_card("Impresiones", "43,386", "+30% vs #2", GREEN),
    kpi_card("Clics", "1,943", "+32% vs #2", GREEN),
    kpi_card("CTR", "4.48%", "vs 4.41% prev", GREEN),
]], colWidths=[3.85 * cm] * 4)
kpi_row.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 2),
    ('RIGHTPADDING', (0, 0), (-1, -1), 2),
]))
story.append(Spacer(1, 0.3 * cm))
story.append(kpi_row)

kpi_row2 = Table([[
    kpi_card("CPC promedio", "S/ 0.35", "+S/0.02 vs prev", AMBER),
    kpi_card("Conversiones", "4*", "*page views /agendar", RED),
    kpi_card("Mobile", "97.4%", "+0.7 pp", AMBER),
    kpi_card("Anuncios OK", "2 / 3", "Dolor C. DETENIDA", RED),
]], colWidths=[3.85 * cm] * 4)
kpi_row2.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 2),
    ('RIGHTPADDING', (0, 0), (-1, -1), 2),
]))
story.append(Spacer(1, 0.2 * cm))
story.append(kpi_row2)

# 3 key takeaways — ORDEN NUEVO: estratégico → tracking → Dolor Crónico
story.append(Spacer(1, 0.4 * cm))
story.append(Paragraph("3 mensajes clave para el equipo", H3))

takeaways_data = [
    [Paragraph("<b>1.</b>", BODY),
     Paragraph(
         "<b>La plataforma se duplicó. Los anuncios no se enteraron.</b> "
         "Esta semana lanzamos Consulta Express S/30, Spirusol, Botica con receta, blog v2 "
         "con CTAs por tipo de síntoma. Pero los 3 anuncios siguen diciendo "
         "<i>\"Teleconsulta S/150\"</i> o el fantasma <i>\"Consulta Médica Online - S/60\"</i> "
         "(que nunca existió). El copy está congelado en abril mientras el producto "
         "evolucionó en mayo. <b>Oportunidad inmediata:</b> re-rutear keywords de baja "
         "gravedad a <i>/consulta-express</i> con copy de S/30 — y dejar <i>/agendar</i> "
         "solo para los términos crónicos donde el ticket de S/150 se justifica.",
         BODY)],
    [Paragraph("<b>2.</b>", BODY),
     Paragraph(
         "<b>Importamos el tracking, pero seguimos sin medir lo que vendemos.</b> "
         "Después de un mes pagando ads, lo único que cuenta como \"conversión\" son "
         "<b>4 page views de /agendar</b> — no son pacientes que reservaron, son visitas "
         "a una URL. El evento <i>cita_solicitada</i> que importamos el 18/may sigue "
         "marcando cero. El problema es doble: (a) los 3 anuncios apuntan al "
         "<b>home, no a /agendar</b>, así que el tráfico nunca toca la URL medida; "
         "(b) la conversión de Consulta Express S/30 ni siquiera está importada. "
         "Sin esto resuelto, Smart Bidding es inviable y el CPA real es desconocido.",
         BODY)],
    [Paragraph("<b>3.</b>", BODY),
     Paragraph(
         "<b>Dolor Crónico murió y no la resucitamos.</b> La campaña se detuvo "
         "automáticamente cuando el anuncio fue rechazado (la apelación no prosperó). "
         "Gastó S/170, generó 341 clics, cero conversiones, y desde hace 7 días aparece "
         "como \"Detenida\". Hay que decidir: relanzarla con anuncio limpio + landing "
         "dedicada <i>/especialidades/dolor-cronico</i> (sin links al catálogo que "
         "disparan el rechazo), o cerrarla definitivamente y reasignar los S/12/día "
         "a Consulta Express o Spirusol.",
         BODY)],
]
takeaways_tbl = Table(takeaways_data, colWidths=[0.6 * cm, 15.6 * cm])
takeaways_tbl.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(takeaways_tbl)

# ── Página NUEVA: la plataforma que evolucionó (screenshots) ────────────────
story.append(PageBreak())
story.append(Paragraph("La plataforma esta semana — contexto visual", H2))
story.append(Paragraph(
    "Antes de meternos en los números, vale ver qué cambió en Organnical.pe entre el "
    "reporte #2 y este. Tres landings nuevas que <b>los anuncios todavía no usan</b>:",
    BODY))

# Build screenshot row with captions
def shot_cell(path, title, caption):
    if path.exists():
        # Calculate scaled dims (mobile aspect ratio: iPhone 13 is 390x844)
        img_w = 4.5 * cm
        img_h = img_w * (844 / 390)
        cells = [
            [Image(str(path), width=img_w, height=img_h, kind='proportional')],
            [Paragraph(f"<b>{title}</b>", ParagraphStyle('ShotTitle', fontSize=9,
                                                          textColor=PURPLE, alignment=TA_CENTER, leading=12))],
            [Paragraph(caption, ParagraphStyle('ShotCap', fontSize=8,
                                                textColor=GRAY_700, alignment=TA_CENTER, leading=11))],
        ]
    else:
        cells = [
            [Paragraph(f"[ {title} ]", ParagraphStyle('ShotMissing', fontSize=9,
                                                     textColor=GRAY_500, alignment=TA_CENTER))],
            [Paragraph(f"<b>{title}</b>", ParagraphStyle('ShotTitle', fontSize=9,
                                                         textColor=PURPLE, alignment=TA_CENTER, leading=12))],
            [Paragraph(caption, ParagraphStyle('ShotCap', fontSize=8,
                                                textColor=GRAY_700, alignment=TA_CENTER, leading=11))],
        ]
    t = Table(cells, colWidths=[5.2 * cm])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 2),
        ('BOTTOMPADDING', (0, 2), (-1, 2), 0),
    ]))
    return t

shots_row = Table([[
    shot_cell(SHOT_HOME, "Home renovada",
              "Hero animado, carrusel productos, CTAs Express+Tienda. URL actual de los 3 anuncios."),
    shot_cell(SHOT_EXPRESS, "Consulta Express S/30",
              "Wizard 3 pasos, pago MP, asignación a Dra. Poma. 5x más barato que el ticket de S/150."),
    shot_cell(SHOT_SPIRUSOL, "Spirusol",
              "Subdominio de marca para vertical cansancio/energía. Sin campaña de ads asignada."),
]], colWidths=[5.4 * cm] * 3)
shots_row.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 2),
    ('RIGHTPADDING', (0, 0), (-1, -1), 2),
]))
story.append(Spacer(1, 0.3 * cm))
story.append(shots_row)
story.append(Spacer(1, 0.3 * cm))
story.append(Paragraph(
    "<b>El gap:</b> los anuncios actuales mandan tráfico al home, donde el usuario "
    "tiene que elegir entre 5+ destinos (tienda, blog, agendar, express, spirusol, botica). "
    "Esa fricción de decisión es exactamente lo contrario de lo que queremos para un "
    "lead pago. La sección 4 de este reporte propone el mapa keyword→landing nuevo.",
    BODY))

# ── Page 2: Performance ────────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("1. Performance por campaña", H2))

camp_data = [
    ["Campaña", "Impr.", "Clics", "CTR", "CPC", "Costo", "Conv*", "Estado"],
    ["Insomnio", "16,341", "850", "5.20%", "S/ 0.32", "S/ 275.92", "2", "Habilitada"],
    ["Ansiedad", "17,598", "752", "4.27%", "S/ 0.30", "S/ 224.40", "2", "Limitada"],
    ["Dolor Crónico", "9,447", "341", "3.61%", "S/ 0.50", "S/ 170.34", "0", "DETENIDA"],
    ["Total", "43,386", "1,943", "4.48%", "S/ 0.35", "S/ 670.65", "4", ""],
]
camp_tbl = Table(camp_data, colWidths=[3.0*cm, 1.7*cm, 1.4*cm, 1.4*cm, 1.5*cm, 1.9*cm, 1.2*cm, 2.2*cm])
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
    ('TEXTCOLOR', (-1, 3), (-1, 3), RED),
]))
story.append(camp_tbl)
story.append(Paragraph(
    "<i>* Las 4 \"conversiones\" son page views de /agendar — métrica engañosa (ver sección 4 + recomendaciones URGENTES).</i>",
    NOTE))

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Hallazgos:", H3))
findings = [
    "<b>Insomnio sigue al frente</b> pero el budget quedó en S/15/día — la recomendación del #2 era subir a S/18. Aun así entregó 850 clics (+39% vs #2), CTR 5.20% estable, 2 page views de /agendar atribuidos.",
    "<b>Ansiedad sí subió a S/12/día</b> (de S/7.15) y se consolida como #1 en impresiones (17,598). Sigue limitada por presupuesto — espacio para escalar más.",
    "<b>Dolor Crónico está congelada</b>: sus números son <b>idénticos</b> a los del reporte #2 porque se detuvo poco después y nadie reactivó. Gastó S/170 en clics que no convirtieron a nada medible.",
    "<b>CPC subió de S/0.33 → S/0.35</b>. La causa más probable: Dolor Crónico fuera de subasta → menos competencia → Google empuja a pagar más. En la semana del 19-25 may el CPC promedio fue S/0.39 (vs S/0.32 antes). Habrá que validar cuando se reactive.",
]
for f in findings:
    story.append(Paragraph(f"• {f}", BULLET))

# Comparación período vs período
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Comparación vs período anterior", H3))
comp_data = [
    ["Métrica", "Reporte 2 (20d)", "Reporte 3 (27d)", "Δ por día"],
    ["Inversión", "S/ 479", "S/ 670", "+3%"],
    ["Clics", "1,470", "1,943", "+6%"],
    ["Impresiones", "33,372", "43,386", "+4%"],
    ["CTR", "4.41%", "4.48%", "+0.07 pp"],
    ["CPC", "S/ 0.33", "S/ 0.35", "+S/0.02"],
    ["Conversiones tracked", "0", "4 (page views)", "Primer dato"],
    ["Mobile", "96.7%", "97.4%", "+0.7 pp"],
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
    "<b>Crecimiento controlado pero desacelerado.</b> Mientras el #2 vs #1 mostró +15-18% por día, "
    "este reporte muestra +3-6%. La razón: Dolor Crónico (que sumaba 36% del gasto) salió de "
    "circulación. La buena noticia: CTR sigue mejorando — el motor está aprendiendo.",
    BODY))

# ── Audiencia ──────────────────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("2. Audiencia: quién está buscando", H2))

# Devices
story.append(Paragraph("Distribución por dispositivo", H3))
dev_data = [
    ["Dispositivo", "% del tráfico", "Impresiones", "Clics", "CTR"],
    ["Móvil", "97.4%", "42,032", "1,892", "4.50%"],
    ["Computadoras", "2.3%", "1,314", "45", "3.42%"],
    ["Tablets", "0.3%", "44", "6", "13.64%"],
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
    "<b>Mobile escaló a 97.4%</b> (+0.7 pp). Desktop ya es marginal (45 clics en 27 días). "
    "Las 3 conversiones que se registraron en cuenta vinieron 100% de mobile. "
    "<b>Implicancia para el reporte #4</b>: cualquier optimización debe priorizar UX mobile — "
    "tiempos de carga, alto del fold, ancho del CTA Express en `/consulta-express`.",
    BODY))

# Demo
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Demografía — edad y género", H3))

demo_data = [
    ["Edad", "Clics", "% (excl. desc.)", "", "Género", "Clics", "% (excl. desc.)"],
    ["18-24", "47", "4.5%", "", "Mujer", "587", "55.6%"],
    ["25-34", "177", "16.8%", "", "Hombre", "469", "44.4%"],
    ["35-44", "170", "16.1%", "", "Desconocido", "888", "—"],
    ["45-54", "249", "23.6%", "", "", "", ""],
    ["55-64", "237", "22.5%", "", "", "", ""],
    ["65+", "175", "16.6%", "", "", "", ""],
    ["Desconocido", "889", "—", "", "", "", ""],
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
    "<b>El sweet spot 45-64 se achicó</b> de 48.6% a 46.1% del tráfico identificado, "
    "y entra más gente <b>25-44</b> (de 31.1% a 32.9%). Lectura: el público se está "
    "rejuveneciendo ligeramente, probablemente por el copy de Insomnio que toca temas "
    "como \"despierto a las 3 AM\" (más relevante para 30-45 estresados que para 55+ "
    "con dolor crónico). Mujer mantiene 55.6%. Las 4 conversiones se distribuyeron: "
    "25-34 (1), 45-54 (1), Desconocido Ansiedad (2), Hombre Insomnio (2).",
    BODY))

# Hour of day
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Hora de mayor actividad (3 campañas sumadas)", H3))

hour_data = [
    ["Hora", "Clics", "", "Hora", "Clics", "", "Hora", "Clics"],
    ["00:00 ★", "96 ★", "", "08:00", "96", "", "16:00", "79"],
    ["01:00", "86", "", "09:00", "75", "", "17:00", "88"],
    ["02:00", "87", "", "10:00", "86", "", "18:00", "75"],
    ["03:00", "83", "", "11:00", "81", "", "19:00", "87"],
    ["04:00", "67", "", "12:00", "64", "", "20:00", "89"],
    ["05:00", "88", "", "13:00", "67", "", "21:00", "93"],
    ["06:00", "74", "", "14:00", "81", "", "22:00", "66"],
    ["07:00", "105 ★", "", "15:00", "76", "", "23:00", "54"],
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
    "<b>Insight nuevo: las conversiones no vienen del peak nocturno.</b> Las 4 conversiones "
    "registradas se dispararon a las 5 AM (1), 12 PM (2) y 20 PM (1) — horas de volumen "
    "medio. Las 96 búsquedas de medianoche y las 105 de 7 AM generaron 0 conversiones. "
    "Lectura: la gente busca a la madrugada, pero <b>decide cuando descansa</b> (mediodía) "
    "o vuelve del trabajo (8 PM). Implica que el ad debería resonar con la búsqueda "
    "nocturna pero el CTA debe funcionar bien en mobile durante el día.",
    BODY))

# Día de la semana
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Día de la semana", H3))

day_data = [
    ["Día", "Clics", "% del total", "Δ vs reporte #2"],
    ["Domingo ★", "321", "16.5%", "= sigue #1"],
    ["Jueves", "289", "14.9%", "= estable"],
    ["Sábado", "289", "14.9%", "+ subió"],
    ["Miércoles", "286", "14.7%", "+ subió"],
    ["Viernes", "269", "13.8%", "= estable"],
    ["Lunes", "258", "13.3%", "= estable"],
    ["Martes", "231", "11.9%", "+ ya no es el peor"],
]
day_tbl = Table(day_data, colWidths=[3.5*cm, 2.0*cm, 2.5*cm, 3.5*cm])
day_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE_LIGHT),
    ('TEXTCOLOR', (0, 0), (-1, 0), PURPLE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(day_tbl)
story.append(Paragraph(
    "<b>Domingo se reafirma como el día rey</b> con 321 clics (16.5%). Sigue siendo "
    "la oportunidad obvia para ajuste de oferta +20% — recomendación pendiente del #2. "
    "<b>Lunes pasó a ser el peor día</b> en este reporte (era Martes el peor en #2). "
    "Hipótesis: el copy contiene términos vinculados a búsquedas de fin de semana "
    "(\"el lunes empiezo a cuidarme\") y eso pierde tracción cuando el lunes ya llegó.",
    BODY))

# ── Page 4: Keywords ────────────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("3. Keywords — qué se está pagando", H2))

kw_data = [
    ["Keyword", "Clics", "CTR", "Costo", "Conv", "Estado/Lectura"],
    ["cómo controlar la ansiedad", "391", "4.71%", "S/ 113.89", "2", "★ Volumen #1 + convierte"],
    ["cómo conciliar el sueño", "243", "3.49%", "S/ 62.18", "0", "✓ ya no es baja calidad"],
    ["no puedo dormir", "206", "5.07%", "S/ 68.50", "1", "✓ salió de baja calidad"],
    ["remedios para la ansiedad", "176", "6.30%", "S/ 65.52", "0", "★ Top eficiencia"],
    ["cómo tratar el insomnio", "116", "9.66%", "S/ 57.88", "1", "[!] NUEVA limitada"],
    ["me duele el cuerpo qué hago", "113", "4.25%", "S/ 57.07", "0", "Detenida"],
    ["remedios para el insomnio", "107", "8.37%", "S/ 36.02", "0", "★ Excelente CTR"],
    ["qué tomar para dormir mejor", "85", "8.37%", "S/ 21.82", "0", "★ Rey eficiencia"],
    ["por qué no puedo dormir", "86", "5.10%", "S/ 27.25", "0", "[!] sigue baja calidad"],
    ["me duele la espalda qué hago", "82", "2.21%", "S/ 48.31", "0", "Detenida"],
    ["cómo calmar los nervios", "71", "3.62%", "S/ 16.27", "0", "[!] sigue baja calidad"],
    ["por qué me duele tanto el cuerpo", "63", "12.73%", "S/ 22.42", "0", "Detenida"],
    ["cómo aliviar el dolor de espalda", "61", "3.11%", "S/ 28.93", "0", "Detenida"],
    ["cómo bajar la ansiedad rápido", "41", "3.57%", "S/ 10.05", "0", "OK"],
]
kw_tbl = Table(kw_data, colWidths=[4.5*cm, 1.2*cm, 1.3*cm, 1.6*cm, 1.0*cm, 4.6*cm])
kw_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 8.5),
    ('ALIGN', (1, 1), (4, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRAY_100]),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(kw_tbl)

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Mejora parcial: 2 de 6 keywords salieron de baja calidad", H3))
story.append(Paragraph(
    "Del reporte #2: <i>cómo conciliar el sueño</i> y <i>no puedo dormir</i> pasaron a "
    "estado Apta — la #2 incluso convirtió 1. <b>Pero entraron 2 nuevas a la lista negra</b>: "
    "<i>cómo tratar el insomnio</i> (irónicamente la que tiene CTR más alto del Insomnio: 9.66%, "
    "y 1 conversión) y siguen mal <i>cómo calmar los nervios</i>, <i>por qué no puedo dormir</i>, "
    "<i>pastillas para dormir Peru</i>. <b>Causa común</b>: el copy del anuncio sigue siendo "
    "genérico (\"¿Semanas sin dormir bien?\") mientras la búsqueda es específica.",
    BODY))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Tráfico mal dirigido — nuevos candidatos a negativos", H3))
story.append(Paragraph(
    "Las negativas del #2 funcionaron: <i>meditar, espiritual</i> ya no aparecen. "
    "<b>Nuevos términos a podar</b>:",
    BODY))
new_neg = [
    "<b>\"debilidad y dolor muscular\"</b> — 33 clics, S/ 11.28 (TOP spend de término): perfil viral/COVID, no servicio médico crónico.",
    "<b>\"cansancio y dolor muscular\"</b> — 14 clics, S/ 5.18: mismo perfil. Pero ojo, también podría apuntar a Spirusol si abrimos campaña ahí.",
    "<b>\"magnesio para dormir\", \"vitaminas para insomnio\", \"productos naturales para dormir\"</b> — 21 clics combinados: buscan PRODUCTO, no cita.",
    "<b>\"hipnosis para dormir\", \"cómo dormir rápido en 1 minuto\", \"dormir en 5 minutos\"</b> — 19 clics combinados: buscan trucos, no médico.",
    "<b>\"enrique villanueva ansiedad\"</b> — 5 clics, S/ 1.06: nombre específico, no es nuestro mercado.",
]
for n in new_neg:
    story.append(Paragraph(f"• {n}", BULLET))

# ── Page 5: SECCIÓN 4 NUEVA — ESTRATEGIA POST-EVOLUCIÓN ─────────────────────
story.append(PageBreak())
story.append(Paragraph("4. Estrategia ajustada — la plataforma ya cambió, los ads deben seguirla", H2))

story.append(Paragraph(
    "Esta sección es nueva. Hasta el reporte #2 teníamos 1 destino (/agendar) y 3 campañas. "
    "Hoy tenemos <b>5+ destinos productivos</b> en la plataforma y un ticket de entrada 5x "
    "más barato (S/30 vs S/150). El esqueleto actual de ads —3 campañas, todas apuntando "
    "al home, todas vendiendo Teleconsulta S/150— ya no calza con el producto.",
    BODY))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Mapa propuesto: intención de búsqueda → landing óptima", H3))

map_data = [
    ["Intención de búsqueda", "Landing ahora", "Landing recomendada", "Por qué"],
    ["Insomnio agudo / \"no puedo dormir hoy\"", "home", "/consulta-express (S/30)", "Ticket bajo + urgencia"],
    ["Insomnio crónico / \"especialista sueño\"", "home", "/agendar (S/150)", "Caso clínico"],
    ["Ansiedad situacional", "home", "/consulta-express (S/30)", "Misma lógica"],
    ["Ansiedad crónica / pánico", "home", "/agendar (S/150)", "Requiere evaluación"],
    ["Dolor agudo (espalda, cuello)", "home", "/consulta-express (S/30)", "Resolución rápida"],
    ["Dolor crónico (≥3 meses)", "home", "/especialidades/dolor-cronico", "Landing dedicada que no dispara rechazos"],
    ["Cansancio / fatiga / energía", "(sin campaña)", "spirusol.organnical.pe", "Vertical nueva"],
    ["Receta + medicamento", "(sin campaña)", "/dashboard/paciente/botica", "Retención post-Rx, no adquisición"],
]
map_tbl = Table(map_data, colWidths=[5.0*cm, 2.5*cm, 4.2*cm, 4.5*cm])
map_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRAY_100]),
    ('GRID', (0, 0), (-1, -1), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(map_tbl)

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Reestructuración de campañas — recomendación", H3))
story.append(Paragraph(
    "<b>Reco dura:</b> partir Insomnio en 2 ad groups (\"agudo\" → Express vs \"especialista\" "
    "→ /agendar). Re-rutear Ansiedad a /consulta-express por default. Crear campaña nueva "
    "<b>Bienestar/Energía</b> apuntando a Spirusol. Cerrar Dolor Crónico hasta tener landing "
    "dedicada limpia.",
    BODY))
story.append(Paragraph(
    "<i>Alternativa más conservadora si quieres minimizar riesgo: solo cambiar URLs finales "
    "a las 3 campañas existentes (Insomnio → /consulta-express, Ansiedad → /consulta-express, "
    "Dolor Crónico → /especialidades/dolor-cronico cuando exista) sin crear campañas nuevas. "
    "Esto resuelve 70% del problema con 20% del trabajo.</i>",
    NOTE))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Budget propuesto", H3))
budget_data = [
    ["Campaña", "Hoy", "Propuesta", "Justificación"],
    ["Insomnio (split en 2)", "S/15/día", "S/18/día", "Reco original del #2 — completar"],
    ["Ansiedad", "S/12/día", "S/15/día", "Limitada por budget hace 1 mes"],
    ["Dolor Crónico", "S/12/día (detenida)", "PAUSA / S/0", "Hasta tener landing dedicada"],
    ["🆕 Bienestar Spirusol", "—", "S/8-10/día", "MVP semanal — keywords cansancio"],
    ["Total", "S/24/día activos", "S/41-43/día", "+70% vs hoy"],
]
budget_tbl = Table(budget_data, colWidths=[4.5*cm, 2.8*cm, 2.8*cm, 6.1*cm])
budget_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PURPLE_LIGHT),
    ('TEXTCOLOR', (0, 0), (-1, 0), PURPLE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ('BACKGROUND', (0, -1), (-1, -1), GRAY_100),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, GRAY_300),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(budget_tbl)
story.append(Paragraph(
    "<i>El salto a S/40+/día solo tiene sentido <b>después</b> de arreglar el tracking. "
    "Sin medir conversiones reales, escalar budget es apostar a ciegas.</i>",
    NOTE))

# ── Page 6: Recommendations ────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("5. Recomendaciones priorizadas", H2))

# Urgent
story.append(Paragraph("<font color='#EF4444'>● URGENTE</font> — hoy / mañana", H3))
urgent = [
    "<b>Cambiar URL final de los 3 anuncios.</b> Hoy apuntan a <i>organnical.pe</i> (home). "
    "Mover Insomnio → <i>/consulta-express</i>, Ansiedad → <i>/consulta-express</i>, "
    "Dolor Crónico (cuando se reactive) → <i>/especialidades/dolor-cronico</i>. "
    "Es 15 minutos en Ads. El tracking nunca va a funcionar mientras los ads manden al home.",
    "<b>Rehacer el setup de conversiones.</b> PURCHASE (que en realidad mide page view de "
    "/agendar) hay que <i>renombrarlo a pageview_agendar y bajarlo a acción secundaria</i>. "
    "Crear conversión nueva basada en el evento <i>payment_confirmed</i> de Mercado Pago "
    "como acción principal de ventas. Importar <i>consulta_express_pagada</i> como segunda "
    "acción principal. Sin esto, el CPA real de las 4 \"conversiones\" actuales es ficción.",
    "<b>Actualizar el copy de los 3 anuncios.</b> Eliminar referencias al fantasma S/60 "
    "y al S/150 cuando estamos mandando a Express. Insomnio/Ansiedad debería decir "
    "<i>\"Primera consulta S/30 - Médico Online Hoy\"</i>. Ya pasamos calidad \"Deficiente\" "
    "en las 3 campañas — Google está pidiendo más keywords en títulos y 6 sitelinks.",
]
for u in urgent:
    story.append(Paragraph(f"• {u}", BULLET))
story.append(Paragraph(
    "<i>Alternativa para tracking si no se puede tocar GA4 hoy: importar al menos "
    "<i>consulta_express_pagada</i> como conversión secundaria — captura ventas Express "
    "aunque PURCHASE siga inflado.</i>",
    NOTE))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("<font color='#F59E0B'>● ESTA SEMANA</font> — quick wins", H3))
quick = [
    "<b>Subir budget de Insomnio</b> de S/15 → S/18/día (reco del #2 que quedó a medio camino).",
    "<b>Subir budget de Ansiedad</b> de S/12 → S/15/día — sigue limitada por presupuesto.",
    "<b>Agregar negativas nuevas</b>: <i>debilidad muscular, cansancio y dolor muscular, "
    "magnesio para dormir, productos naturales para dormir, hipnosis para dormir, "
    "vitaminas para insomnio, enrique villanueva</i>.",
    "<b>Decidir Dolor Crónico</b>: o se relanza con landing dedicada o se pausa formalmente "
    "y se reasigna el budget. Una semana muerta es aceptable, dos no.",
    "<b>Ajuste de oferta +20% para domingo</b> (sigue siendo día rey, ahora con 321 clics).",
    "<b>Crear campaña Spirusol MVP</b> con S/8/día y 3 keywords: <i>cansancio crónico, "
    "fatiga, sin energía</i>. Landing: <i>spirusol.organnical.pe</i>.",
]
for q in quick:
    story.append(Paragraph(f"• {q}", BULLET))
story.append(Paragraph(
    "<i>Alternativa al split de Insomnio: si no quieres tocar la estructura, basta con "
    "duplicar el ad group existente y cambiar la URL final de la copia a /consulta-express. "
    "Mismas keywords, dos destinos, A/B implícito.</i>",
    NOTE))

story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("<font color='#10B981'>● PRÓXIMAS 2 SEMANAS</font> — escalar lo que funcione", H3))
scale = [
    "<b>Pasar a Smart Bidding \"Maximizar conversiones\"</b> SOLO después de arreglar tracking "
    "Y acumular 30+ conversiones reales (no page views). Si arrancamos antes, Google aprende "
    "del ruido.",
    "<b>Copy nocturno específico</b> para horas 0-5 AM (peak insomnio): <i>\"¿2 AM y no "
    "puedes dormir? Médico te ve hoy mismo — Consulta S/30\"</i>. Validar si mejora la "
    "conversión nocturna que hoy es 0.",
    "<b>Validar la hipótesis del CPC</b>: cuando Dolor Crónico vuelva a subasta (o se cierre "
    "formalmente), revisar si el CPC de Insomnio/Ansiedad baja de S/0.39 a S/0.32 nuevamente.",
    "<b>Audit mobile dedicado</b> a /consulta-express: tiempo de carga, alto del fold, "
    "tamaño del CTA de pago. Con 97.4% mobile, una mejora de 0.5s = +5-10% conversión.",
    "<b>\"Bienestar Domingo\"</b> sigue pendiente desde el #2 — campaña que solo corre "
    "viernes-domingo. Si el +20% de oferta funciona, este es el paso natural.",
]
for s in scale:
    story.append(Paragraph(f"• {s}", BULLET))

# ── Proyección ─────────────────────────────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("6. Proyección y meta para reporte #4", H2))

story.append(Paragraph(
    "El gran cambio para el reporte #4 es que vamos a tener <b>dos tickets</b> midiéndose: "
    "Consulta Express S/30 y Teleconsulta S/150. Eso permite calcular CPA real, blended LTV "
    "y empezar a tomar decisiones basadas en datos. Estos escenarios asumen que las acciones "
    "URGENTES se ejecutan esta semana:",
    BODY))

proy_data = [
    ["Escenario", "CPA promedio", "Citas/mes", "Mix Express:Teleconsulta"],
    ["Hoy (tracking semi-roto)", "Desconocido", "?", "?"],
    ["URLs corregidas + tracking arreglado", "S/ 45–80", "12–18", "70:30"],
    ["+ Smart Bidding + Spirusol activa", "S/ 30–55", "20–30", "75:25"],
    ["Madurez en 60 días", "S/ 25–40", "35–50", "80:20"],
]
proy_tbl = Table(proy_data, colWidths=[5.0*cm, 3.0*cm, 2.5*cm, 5.5*cm])
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
story.append(Paragraph("Meta para el próximo reporte (~1 jun, 7 días)", H3))
meta = [
    "✅ URLs finales corregidas en las 3 campañas (hacia <i>/consulta-express</i> o "
    "<i>/especialidades/dolor-cronico</i>).",
    "✅ Setup de conversiones rehecho: PURCHASE renombrado, <i>payment_confirmed</i> y "
    "<i>consulta_express_pagada</i> importadas como acciones principales.",
    "✅ <b>Al menos 10 conversiones reales</b> registradas (no page views) — meta agresiva "
    "pero alcanzable con el ticket S/30.",
    "✅ Decisión final sobre Dolor Crónico (reactivada con landing nueva o pausada).",
    "✅ Volumen target: <b>2,300–2,600 clics</b> manteniendo CTR > 4.5%.",
    "✅ Campaña Spirusol MVP activa con primeros 100+ clics.",
]
for m in meta:
    story.append(Paragraph(f"• {m}", BULLET))

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph(
    "<i>Nota sobre unidad económica: ahora que existe Consulta Express S/30, el CPA "
    "objetivo cambia. Una Express con LTV de S/120 (Express + 1 producto + 1 follow-up "
    "promedio) tolera CPA ~S/30. Una Teleconsulta S/150 con LTV S/450 tolera CPA S/100. "
    "El reporte #4 va a poder calcular ROAS real por tipo de ticket — algo imposible hoy.</i>",
    ParagraphStyle("Note2", parent=BODY, fontSize=8, textColor=GRAY_500, leading=11)))

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
