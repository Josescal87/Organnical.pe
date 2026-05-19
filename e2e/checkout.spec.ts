import { test, expect } from "@playwright/test"

const FAKE_PREFERENCE = {
  preference_id: "TEST-PREF-ID-E2E",
  orden_id: "00000000-0000-0000-0000-000000000002",
  total: 50,
}

const DELIVERY_STUB = {
  rates: [{ distrito: "Miraflores", costo: 10, min_dias: 1, max_dias: 2 }],
  freeThreshold: 150,
  pickupDistrito: "Recojo en tienda",
  fallback: 15,
}

const CART_ITEM = {
  producto: {
    id: "00000000-0000-0000-0000-000000000099",
    sku: "TEST-E2E-ERR",
    descripcion: "Producto E2E Test",
    descripcion_corta: null,
    descripcion_larga: null,
    ingredientes: null,
    modo_uso: null,
    advertencias: null,
    presentacion: null,
    categoria: "test",
    precio_publico: 50,
    precio_oferta: null,
    slug_publico: "test-e2e-err",
    imagen_url: null,
    imagenes_galeria: null,
    tags: null,
    peso_g: null,
  },
  cantidad: 1,
}

test.describe("Checkout E2E — happy path con MP stubbed", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/mp/create-preference", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_PREFERENCE),
      })
    })
    await page.route("**/api/delivery-rates", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(DELIVERY_STUB),
      })
    })
  })

  test("visitor completa checkout hasta el paso de pago (MP stubbed)", async ({ page }) => {
    await page.goto("/tienda")
    await expect(page.locator("h1").filter({ hasText: /tienda/i })).toBeVisible()
    const primerProducto = page.locator("a[href^='/productos/']").first()
    await expect(primerProducto).toBeVisible()
    await primerProducto.click()
    await expect(page).toHaveURL(/\/productos\//)

    await page.locator("button").filter({ hasText: /agregar|añadir al carrito/i }).first().click()

    await page.goto("/checkout")
    await expect(
      page.locator("aside").filter({ hasText: "Tu pedido" })
    ).toContainText(/×/)

    await page.locator('input[name="nombre"]').fill("Test")
    await page.locator('input[name="apellido"]').fill("E2E")
    await page.locator('input[name="email"]').fill("e2e@test.invalid")
    await page.locator('input[name="celular"]').fill("999000002")
    await page.locator("#distrito").fill("Miraflores")
    await page.locator('textarea[name="direccion"]').fill("Av. Larco 1234")

    await page.locator("button[type='submit']").click()

    await expect(
      page.getByRole("button", { name: /volver y editar/i })
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe("Checkout E2E — error de create-preference", () => {
  test("muestra error inline cuando create-preference falla", async ({ page }) => {
    await page.route("**/api/mp/create-preference", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Error de test E2E — no es un error real" }),
      })
    })
    await page.route("**/api/delivery-rates", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(DELIVERY_STUB),
      })
    })

    await page.goto("/")
    await page.evaluate((item) => {
      localStorage.setItem("organnical_cart", JSON.stringify([item]))
    }, CART_ITEM)

    await page.goto("/checkout")
    await expect(
      page.locator("aside").filter({ hasText: "Tu pedido" })
    ).toContainText("Producto E2E Test", { timeout: 5_000 })

    await page.locator('input[name="nombre"]').fill("Test")
    await page.locator('input[name="apellido"]').fill("Rechazo")
    await page.locator('input[name="email"]').fill("e2e@test.invalid")
    await page.locator('input[name="celular"]').fill("999000003")
    await page.locator("#distrito").fill("Miraflores")
    await page.locator('textarea[name="direccion"]').fill("Av. Test 999")

    await page.locator("button[type='submit']").click()

    await expect(
      page.locator(".bg-red-50").filter({ hasText: /error|problema/i })
    ).toBeVisible({ timeout: 8_000 })

    await expect(page.locator("button[type='submit']")).toBeVisible()
  })
})
