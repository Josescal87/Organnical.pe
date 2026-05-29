import { describe, it, expect } from "vitest"
import { buildBoticaMessage, type CartItem } from "../whatsapp-templates"

const PRODUCT_GOMITAS = {
  sku: "GOM-THC10-15U",
  descripcion: "Gomitas THC 10mg — 15 und",
  precio: 105,
  precio_oferta: null,
}

const PRODUCT_SUBLINGUAL = {
  sku: "SUB-T2.5-C2.5-10ML",
  descripcion: "Sublingual THC 2.5% : CBD 2.5% — 10 mL",
  precio: 165,
  precio_oferta: null,
}

describe("buildBoticaMessage — Plantilla A (todos con receta)", () => {
  it("genera el mensaje con sección receta activa + total + cierre", () => {
    const cartItems: CartItem[] = [
      { sku: PRODUCT_GOMITAS.sku,    qty: 2, product: PRODUCT_GOMITAS },
      { sku: PRODUCT_SUBLINGUAL.sku, qty: 1, product: PRODUCT_SUBLINGUAL },
    ]
    const prescribedSet = new Set([PRODUCT_GOMITAS.sku, PRODUCT_SUBLINGUAL.sku])

    const result = buildBoticaMessage({ cartItems, prescribedSet })

    expect(result).toContain("Hola, soy paciente de Organnical y quiero hacer un pedido de mi botica:")
    expect(result).toContain("✅ *Mi pedido con receta activa:*")
    expect(result).toContain("• Gomitas THC 10mg — 15 und x2 — S/ 210.00")
    expect(result).toContain("• Sublingual THC 2.5% : CBD 2.5% — 10 mL x1 — S/ 165.00")
    expect(result).toContain("*Total: S/ 375.00*")
    expect(result).toContain("Tengo mi receta vigente en mi cuenta.")
    expect(result).toContain("coordinemos el envío.")
  })
})

describe("buildBoticaMessage — Plantilla B (ninguno con receta)", () => {
  it("genera mensaje de interés sin precios + CTA Consulta Express", () => {
    const cartItems: CartItem[] = [
      { sku: PRODUCT_GOMITAS.sku,    qty: 3, product: PRODUCT_GOMITAS },
      { sku: PRODUCT_SUBLINGUAL.sku, qty: 1, product: PRODUCT_SUBLINGUAL },
    ]
    const prescribedSet = new Set<string>()

    const result = buildBoticaMessage({ cartItems, prescribedSet })

    expect(result).toContain("Hola, soy paciente de Organnical. Estoy interesado en estos productos pero aún no tengo receta médica vigente:")
    expect(result).toContain("🔵 *Mi pedido de interés:*")
    expect(result).toContain("• Gomitas THC 10mg — 15 und x3")
    expect(result).toContain("• Sublingual THC 2.5% : CBD 2.5% — 10 mL x1")
    expect(result).not.toContain("S/")
    expect(result).not.toContain("Total")
    expect(result).toContain("¿Cómo puedo agendar mi Consulta Express para obtener la receta?")
  })
})

describe("buildBoticaMessage — Plantilla C (mixto)", () => {
  it("genera mensaje con 2 secciones + total solo de items con rx", () => {
    const cartItems: CartItem[] = [
      { sku: PRODUCT_GOMITAS.sku,    qty: 2, product: PRODUCT_GOMITAS },
      { sku: PRODUCT_SUBLINGUAL.sku, qty: 1, product: PRODUCT_SUBLINGUAL },
    ]
    const prescribedSet = new Set([PRODUCT_GOMITAS.sku])

    const result = buildBoticaMessage({ cartItems, prescribedSet })

    expect(result).toContain("Hola, soy paciente de Organnical y quiero gestionar este pedido:")
    expect(result).toContain("✅ *Con mi receta activa:*")
    expect(result).toContain("• Gomitas THC 10mg — 15 und x2 — S/ 210.00")
    expect(result).toContain("🔵 *Sin receta aún (necesito orientación):*")
    expect(result).toContain("• Sublingual THC 2.5% : CBD 2.5% — 10 mL x1")
    expect(result).toContain("*Total con receta: S/ 210.00*")
    expect(result).not.toContain("S/ 375.00")
    expect(result).not.toContain("S/ 165.00")
    expect(result).toContain("Para los productos sin receta, ¿cómo agendo mi Consulta Express?")
  })
})

describe("buildBoticaMessage — edge cases", () => {
  it("retorna string vacío cuando el carrito está vacío", () => {
    const result = buildBoticaMessage({
      cartItems: [],
      prescribedSet: new Set([PRODUCT_GOMITAS.sku]),
    })
    expect(result).toBe("")
  })

  it("usa fraseo neutral con 1 ítem (sin pluralizar)", () => {
    const cartItems: CartItem[] = [
      { sku: PRODUCT_GOMITAS.sku, qty: 1, product: PRODUCT_GOMITAS },
    ]
    const prescribedSet = new Set([PRODUCT_GOMITAS.sku])

    const result = buildBoticaMessage({ cartItems, prescribedSet })

    expect(result).toContain("Mi pedido con receta activa:")
    expect(result).not.toContain("Productos")
  })

  it("usa precio_oferta cuando está definido (no el precio base)", () => {
    const productConOferta = {
      sku: "PROMO-1",
      descripcion: "Producto en oferta",
      precio: 200,
      precio_oferta: 150,
    }
    const cartItems: CartItem[] = [
      { sku: productConOferta.sku, qty: 2, product: productConOferta },
    ]
    const prescribedSet = new Set([productConOferta.sku])

    const result = buildBoticaMessage({ cartItems, prescribedSet })

    expect(result).toContain("• Producto en oferta x2 — S/ 300.00")
    expect(result).toContain("*Total: S/ 300.00*")
    expect(result).not.toContain("S/ 400.00")
    expect(result).not.toContain("S/ 200.00")
  })
})
