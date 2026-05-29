/**
 * Genera el body del mensaje WhatsApp para el flow de `/cuenta/botica`.
 *
 * 3 plantillas según composición del carrito:
 *   A — todos los items tienen rx vigente para sus SKUs.
 *   B — ningún item tiene rx vigente.
 *   C — mixto (algunos con, algunos sin).
 *
 * Plantilla A: pedido con receta + total.
 * Plantilla B: interés + orientación a Consulta Express (sin precios).
 * Plantilla C: pedido + interés en secciones separadas + total solo de items con rx.
 *
 * Función pura, sin dependencias React. Testeable en isolation con vitest.
 */

export type ProductForMessage = {
  sku: string
  descripcion: string
  precio: number
  precio_oferta: number | null
}

export type CartItem = {
  sku: string
  qty: number
  product: ProductForMessage
}

export type BoticaMessageInput = {
  cartItems: CartItem[]
  prescribedSet: Set<string>
}

/**
 * Calcula el precio efectivo por unidad (precio_oferta si existe, sino precio normal).
 */
function effectivePrice(product: ProductForMessage): number {
  return product.precio_oferta ?? product.precio
}

/**
 * Formatea un número como string de moneda en soles peruanos.
 * Ej. 165 → "165.00", 1234.5 → "1234.50".
 */
function formatPrice(amount: number): string {
  return amount.toFixed(2)
}

export function buildBoticaMessage(input: BoticaMessageInput): string {
  const { cartItems, prescribedSet } = input
  if (cartItems.length === 0) return ""

  const itemsWithRx    = cartItems.filter((i) => prescribedSet.has(i.sku))
  const itemsWithoutRx = cartItems.filter((i) => !prescribedSet.has(i.sku))

  // Plantilla A: todos con receta
  if (itemsWithRx.length > 0 && itemsWithoutRx.length === 0) {
    const lines = itemsWithRx.map((item) => {
      const lineTotal = effectivePrice(item.product) * item.qty
      return `• ${item.product.descripcion} x${item.qty} — S/ ${formatPrice(lineTotal)}`
    }).join("\n")

    const total = itemsWithRx.reduce(
      (sum, item) => sum + effectivePrice(item.product) * item.qty,
      0
    )

    return [
      "Hola, soy paciente de Organnical y quiero hacer un pedido de mi botica:",
      "",
      "✅ *Mi pedido con receta activa:*",
      lines,
      "",
      `*Total: S/ ${formatPrice(total)}*`,
      "",
      "Tengo mi receta vigente en mi cuenta. Por favor confirmen disponibilidad y coordinemos el envío. ¡Gracias!",
    ].join("\n")
  }

  // Plantilla B: ninguno con receta
  if (itemsWithRx.length === 0 && itemsWithoutRx.length > 0) {
    const lines = itemsWithoutRx.map((item) =>
      `• ${item.product.descripcion} x${item.qty}`
    ).join("\n")

    return [
      "Hola, soy paciente de Organnical. Estoy interesado en estos productos pero aún no tengo receta médica vigente:",
      "",
      "🔵 *Mi pedido de interés:*",
      lines,
      "",
      "¿Cómo puedo agendar mi Consulta Express para obtener la receta? ¡Gracias!",
    ].join("\n")
  }

  // Plantilla C: mixto
  if (itemsWithRx.length > 0 && itemsWithoutRx.length > 0) {
    const linesWithRx = itemsWithRx.map((item) => {
      const lineTotal = effectivePrice(item.product) * item.qty
      return `• ${item.product.descripcion} x${item.qty} — S/ ${formatPrice(lineTotal)}`
    }).join("\n")

    const linesWithoutRx = itemsWithoutRx.map((item) =>
      `• ${item.product.descripcion} x${item.qty}`
    ).join("\n")

    const totalWithRx = itemsWithRx.reduce(
      (sum, item) => sum + effectivePrice(item.product) * item.qty,
      0
    )

    return [
      "Hola, soy paciente de Organnical y quiero gestionar este pedido:",
      "",
      "✅ *Con mi receta activa:*",
      linesWithRx,
      "",
      "🔵 *Sin receta aún (necesito orientación):*",
      linesWithoutRx,
      "",
      `*Total con receta: S/ ${formatPrice(totalWithRx)}*`,
      "",
      "Para los productos sin receta, ¿cómo agendo mi Consulta Express? ¡Gracias!",
    ].join("\n")
  }

  // Fallback defensivo (no debería alcanzarse si los branches anteriores son exhaustivos)
  return ""
}
