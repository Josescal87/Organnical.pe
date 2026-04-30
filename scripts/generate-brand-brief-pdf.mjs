/**
 * Genera el PDF del Brand Brief de Sami by Organnical.
 * Uso: node scripts/generate-brand-brief-pdf.mjs
 * Output: docs/sami-brand-brief.pdf
 */
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

const logoPath = path.join(projectRoot, 'public', 'logo-horizontal.png')
const logoBase64 = fs.readFileSync(logoPath).toString('base64')
const logoDataUrl = `data:image/png;base64,${logoBase64}`

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sami by Organnical — Brand Brief</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green-500: #22c55e;
    --green-600: #16a34a;
    --green-700: #15803d;
    --sami-bg:   #0f0a1e;
    --sami-nav:  #1a1040;
    --sami-violet: #a78bfa;
    --sami-text: #f3f0ff;
    --gray-100:  #f3f4f6;
    --gray-200:  #e5e7eb;
    --gray-500:  #6b7280;
    --gray-700:  #374151;
    --gray-900:  #111827;
  }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 10pt;
    line-height: 1.6;
    color: var(--gray-900);
    background: white;
  }

  /* ── PORTADA ─────────────────────────────────────────────────── */
  .cover {
    width: 210mm;
    height: 297mm;
    background: var(--sami-bg);
    display: flex;
    flex-direction: column;
    padding: 48px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }

  .cover::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .cover::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .cover-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .cover-logo img {
    height: 28px;
    filter: brightness(0) invert(1);
    opacity: 0.9;
  }

  .cover-tag {
    font-size: 8pt;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--green-500);
    border: 1px solid rgba(34,197,94,0.3);
    padding: 4px 10px;
    border-radius: 20px;
  }

  .cover-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
  }

  .cover-category {
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--green-500);
  }

  .cover-title {
    font-size: 72pt;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--sami-violet);
    line-height: 1;
  }

  .cover-subtitle {
    font-size: 14pt;
    font-weight: 300;
    color: rgba(243,240,255,0.5);
    letter-spacing: 0.02em;
  }

  .cover-divider {
    width: 48px;
    height: 2px;
    background: var(--sami-violet);
    opacity: 0.4;
    margin: 8px 0;
  }

  .cover-tagline {
    font-size: 13pt;
    font-weight: 400;
    font-style: italic;
    color: rgba(243,240,255,0.8);
    line-height: 1.5;
    max-width: 320px;
  }

  .cover-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 1px solid rgba(167,139,250,0.15);
    padding-top: 20px;
  }

  .cover-footer-text {
    font-size: 8pt;
    color: rgba(243,240,255,0.35);
    line-height: 1.6;
  }

  .cover-version {
    font-size: 8pt;
    color: rgba(243,240,255,0.25);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ── PÁGINAS DE CONTENIDO ──────────────────────────────────────── */
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 0;
    page-break-after: always;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 40px;
    border-bottom: 3px solid var(--green-600);
    background: white;
  }

  .page-header-brand {
    font-size: 7.5pt;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--green-600);
  }

  .page-header img {
    height: 18px;
    opacity: 0.85;
  }

  .page-content {
    flex: 1;
    padding: 36px 40px 60px;
  }

  .page-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 40px;
    border-top: 1px solid var(--gray-200);
  }

  .page-footer-text {
    font-size: 7pt;
    color: var(--gray-500);
  }

  .page-number {
    font-size: 7.5pt;
    font-weight: 600;
    color: var(--green-600);
  }

  /* ── SECCIONES ──────────────────────────────────────────────────── */
  .section {
    margin-bottom: 28px;
  }

  .section-number {
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--green-600);
    margin-bottom: 4px;
  }

  .section-title {
    font-size: 16pt;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--green-500);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-title .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--sami-violet);
    flex-shrink: 0;
  }

  h3 {
    font-size: 10.5pt;
    font-weight: 700;
    color: var(--gray-900);
    margin: 16px 0 6px;
  }

  h4 {
    font-size: 9.5pt;
    font-weight: 600;
    color: var(--gray-700);
    margin: 12px 0 4px;
  }

  p {
    margin-bottom: 8px;
    color: var(--gray-700);
    font-size: 9.5pt;
  }

  /* ── PROMESA / QUOTE ──────────────────────────────────────────── */
  .quote {
    background: var(--sami-bg);
    border-left: 4px solid var(--sami-violet);
    border-radius: 0 8px 8px 0;
    padding: 16px 20px;
    margin: 14px 0;
  }

  .quote p {
    color: var(--sami-text);
    font-size: 10.5pt;
    font-style: italic;
    font-weight: 400;
    margin: 0;
  }

  /* ── VALORES ─────────────────────────────────────────────────── */
  .values-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 12px 0;
  }

  .value-card {
    background: var(--gray-100);
    border-radius: 8px;
    padding: 12px 14px;
    border-left: 3px solid var(--green-500);
  }

  .value-card strong {
    font-size: 9pt;
    font-weight: 700;
    color: var(--green-700);
    display: block;
    margin-bottom: 3px;
  }

  .value-card span {
    font-size: 8.5pt;
    color: var(--gray-700);
  }

  /* ── TABLA ────────────────────────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 8.5pt;
  }

  thead tr {
    background: var(--green-600);
    color: white;
  }

  thead th {
    padding: 7px 10px;
    text-align: left;
    font-weight: 600;
    font-size: 8pt;
    letter-spacing: 0.04em;
  }

  tbody tr:nth-child(even) {
    background: var(--gray-100);
  }

  tbody td {
    padding: 7px 10px;
    color: var(--gray-700);
    border-bottom: 1px solid var(--gray-200);
    vertical-align: top;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    background: rgba(167,139,250,0.12);
    color: #7c3aed;
    padding: 1px 5px;
    border-radius: 3px;
  }

  /* ── PALETA ─────────────────────────────────────────────────── */
  .palette {
    display: flex;
    gap: 8px;
    margin: 12px 0;
    flex-wrap: wrap;
  }

  .swatch {
    width: 72px;
    text-align: center;
  }

  .swatch-color {
    width: 72px;
    height: 40px;
    border-radius: 6px;
    margin-bottom: 5px;
    border: 1px solid rgba(0,0,0,0.08);
  }

  .swatch-name {
    font-size: 7pt;
    font-weight: 600;
    color: var(--gray-700);
    display: block;
  }

  .swatch-hex {
    font-family: 'Courier New', monospace;
    font-size: 6.5pt;
    color: var(--gray-500);
    display: block;
  }

  /* ── ARCHITECTURE ──────────────────────────────────────────── */
  .arch-box {
    background: var(--gray-100);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 16px 20px;
    margin: 12px 0;
    font-size: 9pt;
    color: var(--gray-700);
  }

  .arch-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
  }

  .arch-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .arch-arrow {
    font-size: 14pt;
    color: var(--gray-500);
    margin: 0 4px;
  }

  /* ── DO/DONT ────────────────────────────────────────────────── */
  .do-dont {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 12px 0;
  }

  .do-box, .dont-box {
    border-radius: 8px;
    padding: 12px 14px;
  }

  .do-box {
    background: #f0fdf4;
    border: 1px solid #86efac;
  }

  .dont-box {
    background: #fef2f2;
    border: 1px solid #fca5a5;
  }

  .do-box h4 { color: var(--green-700); }
  .dont-box h4 { color: #dc2626; }

  .do-box ul, .dont-box ul {
    list-style: none;
    padding: 0;
    margin: 6px 0 0;
  }

  .do-box li, .dont-box li {
    font-size: 8.5pt;
    color: var(--gray-700);
    padding: 2px 0;
    padding-left: 14px;
    position: relative;
  }

  .do-box li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--green-600);
    font-weight: 700;
    font-size: 8pt;
  }

  .dont-box li::before {
    content: '✗';
    position: absolute;
    left: 0;
    color: #dc2626;
    font-weight: 700;
    font-size: 8pt;
  }

  /* ── COMPETIDORES ───────────────────────────────────────────── */
  .competitor-row td:first-child {
    font-weight: 600;
    color: var(--gray-900);
  }

  /* ── COVER PAGE BACK ────────────────────────────────────────── */
  .page-last {
    width: 210mm;
    min-height: 297mm;
    background: var(--sami-bg);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    page-break-after: avoid;
  }

  .page-last img {
    height: 24px;
    filter: brightness(0) invert(1);
    opacity: 0.5;
  }

  .page-last p {
    font-size: 8.5pt;
    color: rgba(243,240,255,0.3);
    text-align: center;
  }

  .page-last .sami-watermark {
    font-size: 48pt;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(167,139,250,0.08);
  }
</style>
</head>
<body>

<!-- ══════════════════════ PORTADA ══════════════════════ -->
<div class="cover">
  <div class="cover-header">
    <div class="cover-logo">
      <img src="${logoDataUrl}" alt="Organnical.pe">
    </div>
    <div class="cover-tag">Brand Brief</div>
  </div>

  <div class="cover-body">
    <div class="cover-category">Documento interno · Confidencial</div>
    <div class="cover-title">sami</div>
    <div class="cover-subtitle">by Organnical</div>
    <div class="cover-divider"></div>
    <div class="cover-tagline">"Tu momento de sami, todos los días."</div>
  </div>

  <div class="cover-footer">
    <div class="cover-footer-text">
      Espacio de bienestar mental<br>
      con raíces andinas — para el Perú
    </div>
    <div class="cover-version">Versión 1.0 · Abril 2026</div>
  </div>
</div>

<!-- ══════════════════════ PÁGINA 1: ESENCIA + STORY ══════════════════════ -->
<div class="page">
  <div class="page-header">
    <span class="page-header-brand">Sami by Organnical — Brand Brief</span>
    <img src="${logoDataUrl}" alt="Organnical.pe">
  </div>

  <div class="page-content">
    <div class="section">
      <div class="section-number">01</div>
      <div class="section-title"><span class="dot"></span>Esencia de marca</div>

      <h3>Propósito</h3>
      <p>Devolverle al peruano su energía <em>sami</em> — esa fuerza ligera, luminosa y armónica que equilibra cuerpo y espíritu — en medio de la vida cotidiana.</p>

      <h3>Visión</h3>
      <p>Ser el espacio de bienestar mental de referencia para el público latinoamericano, con una identidad profundamente peruana.</p>

      <h3>Misión</h3>
      <p>Ofrecer un refugio diario de 5 a 15 minutos — meditación guiada, cuentos para dormir, ruido blanco y respiración consciente — que cualquier persona pueda sostener como hábito, no solo como recurso de emergencia.</p>

      <h3>Valores</h3>
      <div class="values-grid">
        <div class="value-card">
          <strong>Autenticidad peruana</strong>
          <span>Raíces andinas reales, no estética prestada</span>
        </div>
        <div class="value-card">
          <strong>Calma accesible</strong>
          <span>Sin tecnicismos ni requisitos previos, para cualquiera</span>
        </div>
        <div class="value-card">
          <strong>Hábito sobre episodio</strong>
          <span>Cultivar bienestar cada día, no solo en crisis</span>
        </div>
        <div class="value-card">
          <strong>Ciencia y tradición</strong>
          <span>Respaldo clínico de Organnical + sabiduría quechua</span>
        </div>
      </div>

      <h3>Promesa de marca</h3>
      <div class="quote"><p>"Tu momento de sami, todos los días."</p></div>
    </div>

    <div class="section">
      <div class="section-number">02</div>
      <div class="section-title"><span class="dot"></span>El nombre</div>
      <p><strong>Sami</strong> (del quechua): <em>dicha, felicidad, fortuna</em>. Energía vital, ligera y luminosa que armoniza el cuerpo y el espíritu. En la cosmovisión andina se contrapone a la <em>hucha</em> — la energía densa que se acumula con el estrés y el agotamiento. Recuperar tu sami es recuperar tu equilibrio.</p>
    </div>
  </div>

  <div class="page-footer">
    <span class="page-footer-text">Documento confidencial · Organnical.pe · 2026</span>
    <span class="page-number">1</span>
  </div>
</div>

<!-- ══════════════════════ PÁGINA 2: MANIFIESTO + ARQUITECTURA ══════════════════════ -->
<div class="page">
  <div class="page-header">
    <span class="page-header-brand">Sami by Organnical — Brand Brief</span>
    <img src="${logoDataUrl}" alt="Organnical.pe">
  </div>

  <div class="page-content">
    <div class="section">
      <div class="section-number">03</div>
      <div class="section-title"><span class="dot"></span>Brand Story / Manifiesto</div>

      <p>En la cosmovisión andina existe una energía que los quechuas llamaban <em>sami</em>: ligera, luminosa, vital. No es abstracta — es lo que sientes cuando respiras profundo antes de dormir, cuando una voz calmada te acompaña en la oscuridad, cuando un momento de silencio rompe el ruido del día.</p>
      <p>Esa energía no desapareció. Solo nos hemos olvidado de buscarla.</p>
      <p>Sami by Organnical nació de una pregunta simple: ¿qué pasaría si el cuidado de la salud no terminara en la consulta médica? Los pacientes llegaban con diagnósticos, con recetas, con citas programadas. Pero entre cita y cita, el estrés seguía. El insomnio también.</p>
      <p>Necesitaban un lugar al que volver cada noche.</p>
      <p>Sami es ese lugar. No una app de meditación más — sino un espacio diseñado desde el Perú, para el peruano, con voces que suenan como las nuestras, con historias que conocemos, con una tradición que nos pertenece.</p>
      <p>Cinco minutos. Todos los días. Eso es sami.</p>

      <h4>Manifiesto (versión corta)</h4>
      <div class="quote"><p>"El mundo moderno pesa. Nosotros te ayudamos a soltar ese peso. No necesitas experiencia, ni tiempo, ni silencio perfecto. Solo necesitas cinco minutos y las ganas de cuidarte. Eso es Sami: tu energía ligera, de vuelta."</p></div>
    </div>

    <div class="section">
      <div class="section-number">04</div>
      <div class="section-title"><span class="dot"></span>Arquitectura de marca</div>

      <p>Sami opera como una <strong>submarca con identidad propia</strong> — tiene nombre, visual y voz distintos a Organnical, pero está respaldada por su credibilidad médica. La relación es de autoridad, no de dependencia.</p>

      <div class="arch-box">
        <div class="arch-row">
          <span class="arch-dot" style="background:#22c55e"></span>
          <strong>Organnical.pe</strong>
          <span style="color:#9ca3af; font-size:8pt; margin-left:4px">Plataforma de telemedicina</span>
        </div>
        <div class="arch-row" style="padding-left:22px">
          <span style="color:#6b7280; font-size:10pt">└</span>
          <span class="arch-dot" style="background:#a78bfa"></span>
          <strong>Sami by Organnical</strong>
          <span style="color:#9ca3af; font-size:8pt; margin-left:4px">Espacio de bienestar complementario</span>
        </div>
      </div>

      <table>
        <thead>
          <tr><th>Elemento</th><th>Sami</th><th>Organnical</th></tr>
        </thead>
        <tbody>
          <tr><td>Color dominante</td><td>Violeta oscuro</td><td>Verde Organnical</td></tr>
          <tr><td>Tono de voz</td><td>Sereno, poético, guía</td><td>Profesional, médico, confiable</td></tr>
          <tr><td>Audiencia primaria</td><td>Público general peruano</td><td>Pacientes en consulta</td></tr>
          <tr><td>Mención cruzada</td><td>"by Organnical" en nav y footer</td><td>Widget "Tu espacio de bienestar"</td></tr>
        </tbody>
      </table>

      <h4>Jerarquía del nombre</h4>
      <p>El nombre <strong>sami</strong> en minúsculas siempre en primer plano. "by Organnical" en tamaño secundario y color apagado, nunca compite visualmente. En comunicaciones externas: <em>"Sami by Organnical"</em> completo en la primera mención, luego solo <em>"Sami"</em>.</p>
    </div>
  </div>

  <div class="page-footer">
    <span class="page-footer-text">Documento confidencial · Organnical.pe · 2026</span>
    <span class="page-number">2</span>
  </div>
</div>

<!-- ══════════════════════ PÁGINA 3: AUDIENCIA ══════════════════════ -->
<div class="page">
  <div class="page-header">
    <span class="page-header-brand">Sami by Organnical — Brand Brief</span>
    <img src="${logoDataUrl}" alt="Organnical.pe">
  </div>

  <div class="page-content">
    <div class="section">
      <div class="section-number">05</div>
      <div class="section-title"><span class="dot"></span>Audiencia</div>

      <h3>Perfil primario — El usuario núcleo</h3>
      <table>
        <tbody>
          <tr><td><strong>Quién es</strong></td><td>Adulto peruano, 25–45 años, urbano (Lima, Arequipa, Trujillo)</td></tr>
          <tr><td><strong>Contexto</strong></td><td>Vida agitada: trabajo, familia, pantallas. Duerme mal o con dificultad para desconectarse.</td></tr>
          <tr><td><strong>Relación con bienestar</strong></td><td>Quiere cuidarse pero no tiene tiempo ni dinero para clases de yoga o terapia frecuente.</td></tr>
          <tr><td><strong>Relación con tecnología</strong></td><td>Usa el celular de noche — ya está en la cama con el teléfono cuando debería dormir.</td></tr>
          <tr><td><strong>Motivación principal</strong></td><td>Construir un ritual nocturno que le ayude a soltar el día.</td></tr>
          <tr><td><strong>Barrera principal</strong></td><td>"No sé meditar" / "No tengo disciplina" / "Las apps en inglés no me convencen"</td></tr>
        </tbody>
      </table>

      <h3>Perfil secundario — El paciente de Organnical</h3>
      <table>
        <tbody>
          <tr><td><strong>Quién es</strong></td><td>Ya usa Organnical.pe para consultas médicas (cannabis medicinal, dolor crónico, ansiedad).</td></tr>
          <tr><td><strong>Por qué llega a Sami</strong></td><td>El médico o el dashboard le sugiere Sami como complemento al tratamiento.</td></tr>
          <tr><td><strong>Valor diferencial</strong></td><td>El respaldo clínico implícito distingue a Sami de cualquier app random.</td></tr>
        </tbody>
      </table>

      <h3>Insights clave</h3>
      <div class="values-grid">
        <div class="value-card">
          <strong>Sin conexión cultural</strong>
          <span>El peruano no se identifica con Calm o Headspace — suenan extranjeros, las voces no se parecen a las nuestras.</span>
        </div>
        <div class="value-card">
          <strong>Del episodio al hábito</strong>
          <span>El insomnio es el punto de entrada, pero el hábito se construye desde el autocuidado consciente.</span>
        </div>
        <div class="value-card" style="grid-column: 1 / -1;">
          <strong>La noche como contexto de uso</strong>
          <span>El diseño oscuro y el timer de sueño no son decisiones estéticas — son decisiones de UX para el momento real de uso.</span>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span class="page-footer-text">Documento confidencial · Organnical.pe · 2026</span>
    <span class="page-number">3</span>
  </div>
</div>

<!-- ══════════════════════ PÁGINA 4: IDENTIDAD VERBAL ══════════════════════ -->
<div class="page">
  <div class="page-header">
    <span class="page-header-brand">Sami by Organnical — Brand Brief</span>
    <img src="${logoDataUrl}" alt="Organnical.pe">
  </div>

  <div class="page-content">
    <div class="section">
      <div class="section-number">06</div>
      <div class="section-title"><span class="dot"></span>Identidad verbal</div>

      <h3>Voz de marca</h3>
      <p>Sami habla como un guía sereno y experimentado — alguien que ya ha recorrido el camino y te acompaña sin imponerse. No es un amigo informal ni un médico distante. Es la voz que quisieras escuchar cuando apagas la luz.</p>
      <p><strong>Tres adjetivos:</strong> <em>Serena · Luminosa · Peruana</em></p>

      <h3>Tono según contexto</h3>
      <table>
        <thead>
          <tr><th>Contexto</th><th>Tono</th><th>Ejemplo</th></tr>
        </thead>
        <tbody>
          <tr><td>Saludo / home</td><td>Cálido, personal</td><td><em>"Buenas noches, José. ¿Cómo llega tu día?"</em></td></tr>
          <tr><td>Instrucción de meditación</td><td>Pausado, preciso</td><td><em>"Inhala profundo. Retén. Suelta despacio."</em></td></tr>
          <tr><td>Descripción de contenido</td><td>Evocador, breve</td><td><em>"Un cuento para soltar el peso del día antes de dormir."</em></td></tr>
          <tr><td>Error / sin contenido</td><td>Honesto, sin drama</td><td><em>"Aún no hay contenido aquí. Vuelve pronto."</em></td></tr>
          <tr><td>Onboarding / instalar PWA</td><td>Ligero, invitador</td><td><em>"Ponlo en tu inicio. Está ahí cuando lo necesites."</em></td></tr>
        </tbody>
      </table>

      <div class="do-dont">
        <div class="do-box">
          <h4>✓ Sami sí dice</h4>
          <ul>
            <li>Frases cortas, respirables</li>
            <li>Segunda persona: "tú", "tu"</li>
            <li>Sensaciones: siente, suelta, respira</li>
            <li>Tiempo presente: estás, puedes, tienes</li>
            <li>Palabras andinas cuando encajan: sami, pacha, sumaq</li>
          </ul>
        </div>
        <div class="dont-box">
          <h4>✗ Sami nunca dice</h4>
          <ul>
            <li>Anglicismos: wellness, mindfulness, self-care</li>
            <li>Lenguaje clínico: paciente, síntoma, diagnóstico</li>
            <li>Urgencia: "¡No te lo pierdas!", "Solo por hoy"</li>
            <li>Superlativos vacíos: increíble, revolucionario</li>
            <li>Tuteo excesivo: "¡Ey!", "¡Qué tal!"</li>
          </ul>
        </div>
      </div>

      <h3>Naming de contenido</h3>
      <p>Títulos evocadores, no descriptivos: <em>"La lluvia sobre los Andes"</em>, no <em>"Meditación relajante #3"</em>. Máximo 5–6 palabras. Sin exclamaciones ni mayúsculas innecesarias. Referencias peruanas sutiles bienvenidas.</p>
    </div>
  </div>

  <div class="page-footer">
    <span class="page-footer-text">Documento confidencial · Organnical.pe · 2026</span>
    <span class="page-number">4</span>
  </div>
</div>

<!-- ══════════════════════ PÁGINA 5: IDENTIDAD VISUAL ══════════════════════ -->
<div class="page">
  <div class="page-header">
    <span class="page-header-brand">Sami by Organnical — Brand Brief</span>
    <img src="${logoDataUrl}" alt="Organnical.pe">
  </div>

  <div class="page-content">
    <div class="section">
      <div class="section-number">07</div>
      <div class="section-title"><span class="dot"></span>Identidad visual</div>

      <h3>Paleta de color</h3>
      <p style="font-size:8pt; color:#6b7280; margin-bottom:10px"><em>Principio: el cielo andino de madrugada — oscuro pero no opaco, con destellos violetas que recuerdan la luz antes del amanecer.</em></p>

      <div class="palette">
        <div class="swatch">
          <div class="swatch-color" style="background:#0f0a1e"></div>
          <span class="swatch-name">Noche profunda</span>
          <span class="swatch-hex">#0f0a1e</span>
        </div>
        <div class="swatch">
          <div class="swatch-color" style="background:#1a1040"></div>
          <span class="swatch-name">Noche media</span>
          <span class="swatch-hex">#1a1040</span>
        </div>
        <div class="swatch">
          <div class="swatch-color" style="background:#a78bfa"></div>
          <span class="swatch-name">Violeta sami</span>
          <span class="swatch-hex">#a78bfa</span>
        </div>
        <div class="swatch">
          <div class="swatch-color" style="background:#f3f0ff; border:1px solid #e5e7eb"></div>
          <span class="swatch-name">Blanco lavanda</span>
          <span class="swatch-hex">#f3f0ff</span>
        </div>
        <div class="swatch">
          <div class="swatch-color" style="background:#9ca3af"></div>
          <span class="swatch-name">Gris medio</span>
          <span class="swatch-hex">#9ca3af</span>
        </div>
        <div class="swatch">
          <div class="swatch-color" style="background:#6b7280"></div>
          <span class="swatch-name">Gris apagado</span>
          <span class="swatch-hex">#6b7280</span>
        </div>
      </div>

      <h3>Tipografía</h3>
      <table>
        <thead><tr><th>Rol</th><th>Tipografía</th><th>Especificación</th></tr></thead>
        <tbody>
          <tr><td>Logo / wordmark</td><td>Inter / Geist</td><td>Minúsculas, letter-spacing 0.1em, weight 600</td></tr>
          <tr><td>Títulos</td><td>Inter o Geist</td><td>font-weight 600–700</td></tr>
          <tr><td>Cuerpo</td><td>Inter o Geist</td><td>font-weight 400, line-height generoso</td></tr>
          <tr><td>Voz TTS (audio)</td><td>Google Neural2 es-PE</td><td>Voz A o B — femenina, peruana</td></tr>
        </tbody>
      </table>

      <h3>Logo</h3>
      <p>Wordmark <strong>sami</strong> en minúsculas como forma primaria. Sin símbolo adicional en el MVP. Variantes: sobre fondo oscuro en <code>#a78bfa</code> · con "by organnical" en gris 60% · ícono PWA en círculo <code>#1a1040</code>.</p>

      <h3>Iconografía de categorías</h3>
      <table>
        <thead><tr><th>Categoría</th><th>Ícono</th><th>Criterio semántico</th></tr></thead>
        <tbody>
          <tr><td>Meditación</td><td>🧘</td><td>Postura, introspección</td></tr>
          <tr><td>Cuentos</td><td>🌙</td><td>Noche, sueño</td></tr>
          <tr><td>Ruido blanco</td><td>🌊</td><td>Naturaleza, flujo</td></tr>
          <tr><td>Respiración</td><td>💨</td><td>Aire, movimiento</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="page-footer">
    <span class="page-footer-text">Documento confidencial · Organnical.pe · 2026</span>
    <span class="page-number">5</span>
  </div>
</div>

<!-- ══════════════════════ PÁGINA 6: COMPETIDORES ══════════════════════ -->
<div class="page">
  <div class="page-header">
    <span class="page-header-brand">Sami by Organnical — Brand Brief</span>
    <img src="${logoDataUrl}" alt="Organnical.pe">
  </div>

  <div class="page-content">
    <div class="section">
      <div class="section-number">08</div>
      <div class="section-title"><span class="dot"></span>Referentes y competidores</div>

      <h3>Competidores directos</h3>
      <table>
        <thead><tr><th>App</th><th>Fortaleza</th><th>Por qué Sami los supera</th></tr></thead>
        <tbody class="competitor-row">
          <tr><td>Calm</td><td>Producción premium, celebrities</td><td>En inglés, sin identidad peruana, costoso ($70/año)</td></tr>
          <tr><td>Headspace</td><td>UX pulida, contenido científico</td><td>Inglés, estética occidental, sin conexión cultural local</td></tr>
          <tr><td>Insight Timer</td><td>Gratuito, enorme biblioteca</td><td>Abrumador, sin curaduría, sin voz peruana</td></tr>
          <tr><td>Meditopia</td><td>En español</td><td>Genérico latinoamericano, sin raíz cultural específica</td></tr>
        </tbody>
      </table>

      <h3>Ventaja competitiva</h3>
      <p>La combinación de tres elementos que ningún competidor tiene simultáneamente:</p>
      <div class="values-grid">
        <div class="value-card">
          <strong>1. Español peruano auténtico</strong>
          <span>Voz TTS Neural2 es-PE y referencias locales reales en el contenido.</span>
        </div>
        <div class="value-card">
          <strong>2. Raíz cultural andina</strong>
          <span>El concepto de sami como filosofía de marca, no solo como nombre.</span>
        </div>
        <div class="value-card" style="grid-column: 1 / -1;">
          <strong>3. Respaldo médico implícito</strong>
          <span>"by Organnical" implica una plataforma clínica detrás — no solo una startup de wellness.</span>
        </div>
      </div>

      <h3>Referentes de inspiración</h3>
      <table>
        <thead><tr><th>Referente</th><th>Qué tomar</th></tr></thead>
        <tbody>
          <tr><td><strong>Calm</strong></td><td>Seriedad en la producción de audio, diseño oscuro e inmersivo</td></tr>
          <tr><td><strong>Duolingo</strong></td><td>Hábito diario como mecánica central, accesibilidad total</td></tr>
          <tr><td><strong>Tono Perú</strong></td><td>Identidad peruana con orgullo, sin caer en folklorismo</td></tr>
          <tr><td><strong>Apple Health</strong></td><td>Integración natural con el estilo de vida, sin fricción</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="page-footer">
    <span class="page-footer-text">Documento confidencial · Organnical.pe · 2026</span>
    <span class="page-number">6</span>
  </div>
</div>

<!-- ══════════════════════ BACK COVER ══════════════════════ -->
<div class="page-last">
  <div class="sami-watermark">sami</div>
  <img src="${logoDataUrl}" alt="Organnical.pe">
  <p>organnical.pe · sami.organnical.pe<br>Documento confidencial · Versión 1.0 · Abril 2026</p>
</div>

</body>
</html>`

const outputDir = path.join(projectRoot, 'docs')
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

const outputPath = path.join(outputDir, 'sami-brand-brief.pdf')

console.log('Iniciando Chromium...')
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const page = await browser.newPage()

console.log('Cargando HTML...')
await page.setContent(html, { waitUntil: 'networkidle0' })

console.log('Generando PDF...')
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
})

await browser.close()
console.log(`✓ PDF generado en: ${outputPath}`)
