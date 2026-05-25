/**
 * Captura screenshots mobile-viewport de las 3 landings clave para el reporte.
 * Uso: npx playwright test capture_screenshots.js (NO) — corre con: node capture_screenshots.js
 */
const { chromium, devices } = require('playwright');

const OUT = 'docs/google-ads-2026-05-25/screenshots';
const PAGES = [
  { name: '01-home',            url: 'https://www.organnical.pe/' },
  { name: '02-consulta-express',url: 'https://www.organnical.pe/consulta-express' },
  { name: '03-spirusol',        url: 'https://spirusol.organnical.pe/' },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    locale: 'es-PE',
  });
  for (const p of PAGES) {
    const page = await context.newPage();
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: false });
      console.log(`✓ ${p.name}`);
    } catch (e) {
      console.error(`✗ ${p.name}: ${e.message}`);
    } finally {
      await page.close();
    }
  }
  await browser.close();
})();
