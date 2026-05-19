import { test, expect } from "@playwright/test"

test.describe("Auth guards — rutas protegidas redirigen a login", () => {
  test("/cuenta sin sesión → redirige a /login", async ({ page }) => {
    await page.goto("/cuenta")
    await expect(page).toHaveURL(/\/login/)
  })

  test("/dashboard/admin sin sesión → redirige a /login", async ({ page }) => {
    await page.goto("/dashboard/admin")
    await expect(page).toHaveURL(/\/login/)
  })

  test("/dashboard/admin/reviews sin sesión → redirige a /login", async ({ page }) => {
    await page.goto("/dashboard/admin/reviews")
    await expect(page).toHaveURL(/\/login/)
  })

  test("/dashboard/admin/boletas sin sesión → redirige a /login", async ({ page }) => {
    await page.goto("/dashboard/admin/boletas")
    await expect(page).toHaveURL(/\/login/)
  })

  test("/catalogo → redirige a /tienda (308)", async ({ page }) => {
    await page.goto("/catalogo")
    await expect(page).toHaveURL(/\/tienda/)
  })
})

test.describe("Redirects 301", () => {
  test("/dashboard → /cuenta", async ({ page }) => {
    await page.goto("/dashboard")
    // Puede redirigir a /login (si no hay sesión) pasando por /cuenta, o directamente a /cuenta
    await expect(page).toHaveURL(/\/cuenta|\/login/)
  })

  test("/dashboard/paciente → /cuenta", async ({ page }) => {
    await page.goto("/dashboard/paciente")
    await expect(page).toHaveURL(/\/cuenta|\/login/)
  })
})

test.describe("Páginas públicas — accesibles sin sesión", () => {
  test("/ carga sin error", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Organnical/)
  })

  test("/tienda carga sin error", async ({ page }) => {
    await page.goto("/tienda")
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("/agendar carga sin error", async ({ page }) => {
    await page.goto("/agendar")
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("/login carga sin error", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("form, input[type='email']").first()).toBeVisible()
  })

  test("/blog carga sin error", async ({ page }) => {
    await page.goto("/blog")
    await expect(page.locator("h1, article").first()).toBeVisible()
  })
})
