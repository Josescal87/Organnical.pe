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

export function buildBoticaMessage(_input: BoticaMessageInput): string {
  // Implementación pendiente — completada en tasks 2-5 vía TDD.
  return ""
}
