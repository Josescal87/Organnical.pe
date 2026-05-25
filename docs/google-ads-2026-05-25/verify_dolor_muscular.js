/**
 * Verifica visualmente la nueva landing /especialidades/dolor-muscular en localhost
 * y que el motivo se pre-rellena en /consulta-express cuando llega vía query string.
 */
const { chromium, devices } = require('playwright');

const OUT = 'docs/google-ads-2026-05-25/screenshots';
const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    locale: 'es-PE',
  });
  const page = await context.newPage();

  // 1. Capture the new landing
  await page.goto(`${BASE}/especialidades/dolor-muscular`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/04-dolor-muscular-hero.png`, fullPage: false });
  console.log('✓ Hero captured');

  // Full page version too
  await page.screenshot({ path: `${OUT}/04-dolor-muscular-fullpage.png`, fullPage: true });
  console.log('✓ Full page captured');

  // 2. Click the CTA and verify motivo is pre-filled in Express
  await page.click('a:has-text("Iniciar consulta")');
  await page.waitForURL(/consulta-express/, { timeout: 10000 });
  await page.waitForTimeout(1500);

  const motivoTextarea = page.locator('textarea[placeholder*="síntoma"]');
  const motivoValue = await motivoTextarea.inputValue();
  console.log(`Motivo pre-filled: "${motivoValue}"`);

  await page.screenshot({ path: `${OUT}/05-express-pre-filled.png`, fullPage: false });
  console.log('✓ Express with pre-filled motivo captured');

  if (motivoValue.includes('dolor muscular')) {
    console.log('✓ PASS: motivo correctly pre-filled');
  } else {
    console.log('✗ FAIL: motivo not pre-filled correctly');
  }

  await browser.close();
})();
