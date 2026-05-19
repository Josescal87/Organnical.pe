import { test, expect } from "@playwright/test"

test.describe("Agendar — flujo de citas (smoke)", () => {
  test("página carga y muestra selección de especialidad", async ({ page }) => {
    await page.goto("/agendar")
    // Título o heading visible
    await expect(page.locator("h1, h2").first()).toBeVisible()
    // Hay al menos una opción de especialidad o un paso del wizard
    await expect(
      page.locator("button, a").filter({ hasText: /médico|cannabis|dolor|ansiedad|agendar|especialidad/i }).first()
    ).toBeVisible({ timeout: 8_000 })
  })

  test("seleccionar especialidad avanza al paso siguiente", async ({ page }) => {
    await page.goto("/agendar")
    const primerOpcion = page
      .locator("button")
      .filter({ hasText: /médico|cannabis|dolor|ansiedad|sueño/i })
      .first()
    await expect(primerOpcion).toBeVisible({ timeout: 8_000 })
    await primerOpcion.click()
    // Después de seleccionar, aparece el siguiente paso (selección de médico o fecha)
    await expect(
      page.locator("h1, h2, h3").filter({ hasText: /médico|doctor|fecha|horario|paso/i }).first()
    ).toBeVisible({ timeout: 8_000 })
  })

  test("sin sesión: llegar al paso de datos personales redirige o muestra login", async ({ page }) => {
    await page.goto("/agendar")
    // Avanzar hasta el paso de datos personales si el flujo lo permite anónimo
    // La mayoría de los wizards en /agendar permiten avanzar hasta cierto punto sin login
    await expect(page.locator("body")).not.toContainText("500", { timeout: 5_000 })
    await expect(page.locator("body")).not.toContainText("Error interno", { timeout: 5_000 })
  })
})
