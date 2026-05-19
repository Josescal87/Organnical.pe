import { test, expect } from "@playwright/test"

test.describe("Storefront — happy path", () => {
  test("Home: carga y muestra sección de productos", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Organnical/)
    await expect(page.locator("section").first()).toBeVisible()
    // Sección de productos destacados en el homepage nuevo
    await expect(page.locator("h2").filter({ hasText: /destacados|buscados/i })).toBeVisible()
  })

  test("Tienda: lista productos", async ({ page }) => {
    await page.goto("/tienda")
    await expect(page.locator("h1").filter({ hasText: /tienda/i })).toBeVisible()
    const primerProducto = page.locator("a[href^='/productos/']").first()
    await expect(primerProducto).toBeVisible()
  })

  test("Producto: página de detalle carga correctamente", async ({ page }) => {
    await page.goto("/tienda")
    const primerLink = page.locator("a[href^='/productos/']").first()
    const href = await primerLink.getAttribute("href")
    if (!href) throw new Error("No se encontró ningún producto en /tienda")

    await page.goto(href)
    await expect(page.locator("h1").first()).toBeVisible()
    await expect(
      page.locator("button").filter({ hasText: /carrito|agregar/i }).first()
    ).toBeVisible()
  })

  test("Carrito: agregar producto actualiza el contador", async ({ page }) => {
    await page.goto("/tienda")
    const primerLink = page.locator("a[href^='/productos/']").first()
    const href = await primerLink.getAttribute("href")
    if (!href) throw new Error("No se encontró ningún producto en /tienda")

    await page.goto(href)
    const addBtn = page.locator("button").filter({ hasText: /agregar/i }).first()
    await expect(addBtn).toBeVisible()
    await addBtn.click()
    await expect(page.locator("header")).toContainText(/1/)
  })

  test("Navegación: link Tienda en navbar funciona", async ({ page }) => {
    await page.goto("/")
    await page.locator("a[href='/tienda']").first().click()
    await expect(page).toHaveURL(/\/tienda/)
  })

  test("Navegación: link Agendar en navbar funciona", async ({ page }) => {
    await page.goto("/")
    const agendarLink = page.locator("a[href='/agendar']").first()
    if (await agendarLink.isVisible()) {
      await agendarLink.click()
      await expect(page).toHaveURL(/\/agendar/)
    }
  })
})
