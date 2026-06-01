export interface BoletaCliente {
  tipo_documento: "DNI" | "RUC" | "CE" | "PASAPORTE" | "SIN_DOC"
  numero_documento: string | null
  nombre: string
  email: string | null
  direccion: string | null
  distrito: string | null
}

export interface BoletaItem {
  codigo: string
  descripcion: string
  cantidad: number
  valor_unitario: number
  precio_unitario: number
  base_imponible: number
  igv: number
  total: number
}

export interface BoletaPayload {
  orden_id: string
  serie: string
  numero?: number
  fecha_emision: string
  cliente: BoletaCliente
  items: BoletaItem[]
  total_gravada: number
  total_igv: number
  total: number
  moneda: "PEN"
  observaciones?: string
  codigo_unico?: string
}

export type NotaCreditoTipo =
  | "01" | "02" | "03" | "04" | "05"
  | "06" | "07" | "08" | "09" | "10" | "11"

export interface NotaCreditoPayload {
  nota_credito_id: string
  boleta_original: { serie: string; numero: number; tipo: "boleta" | "factura" }
  serie: string
  numero?: number
  fecha_emision: string
  motivo: string
  tipo_nota_credito: NotaCreditoTipo
  cliente: BoletaCliente
  items: BoletaItem[]
  total_gravada: number
  total_igv: number
  total: number
  moneda: "PEN"
}

export interface BoletaResultado {
  ok: true
  id: string
  serie: string
  numero: number
  link: string
  hash: string
  aceptada_por_sunat: boolean
  proveedor: string
  raw?: unknown
}

export interface BoletaError {
  ok: false
  proveedor: string
  motivo: string
  status?: number
  raw?: unknown
}

export type BoletaResponse = BoletaResultado | BoletaError

export function calcularItem(args: {
  codigo: string
  descripcion: string
  cantidad: number
  precio_con_igv: number
}): BoletaItem {
  const { codigo, descripcion, cantidad, precio_con_igv } = args
  const igvRate = 0.18
  const valor_unitario = round2(precio_con_igv / (1 + igvRate))
  const base_imponible = round2(valor_unitario * cantidad)
  const total = round2(precio_con_igv * cantidad)
  const igv = round2(total - base_imponible)
  return { codigo, descripcion, cantidad, valor_unitario, precio_unitario: precio_con_igv, base_imponible, igv, total }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Prorratea un descuento global (cupón) sobre las líneas de una boleta,
 * devolviendo cada ítem a su precio NETO efectivo. El total resultante es
 * `Σ(item.total) == round2(listTotal − descuento)`.
 *
 * - `descuento <= 0` → no-op (ventas sin cupón = comportamiento de hoy).
 * - `descuento >= listTotal` → válvula de escape: devuelve los ítems sin tocar
 *   (un cupón ~100% daría una boleta de total 0, inválida en SUNAT; no existe
 *   en el catálogo actual). NUNCA cae a precio de lista como caso normal.
 * - El residual de redondeo se absorbe en la última línea para cuadre exacto
 *   (exacto en líneas de cantidad=1; dentro de ~1 céntimo en multi-unidad).
 */
export function aplicarDescuentoProrrateado(
  items: BoletaItem[],
  descuento: number
): BoletaItem[] {
  if (!Array.isArray(items) || items.length === 0) return items
  if (descuento <= 0) return items

  const listTotal = round2(items.reduce((a, x) => a + x.total, 0))
  if (descuento >= listTotal) return items // válvula de escape (neto <= 0)

  const netTarget = round2(listTotal - descuento)
  const ratio = descuento / listTotal

  const result: BoletaItem[] = []
  let acumulado = 0
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    const esUltimo = i === items.length - 1
    const netLineTotal = esUltimo
      ? round2(netTarget - acumulado)
      : round2(it.total * (1 - ratio))
    if (!esUltimo) acumulado = round2(acumulado + netLineTotal)

    result.push(
      calcularItem({
        codigo: it.codigo,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        precio_con_igv: round2(netLineTotal / it.cantidad),
      })
    )
  }
  return result
}

/**
 * Agrega una línea gravada de envío a la boleta cuando hay costo de delivery.
 * El delivery NO lleva descuento (el cupón se calcula solo sobre el subtotal de
 * productos), así que se factura a precio completo.
 *
 * - `delivery <= 0` → no-op (recojo en tienda / envío gratis = sin línea).
 */
export function agregarLineaDelivery(
  items: BoletaItem[],
  delivery: number
): BoletaItem[] {
  if (delivery <= 0) return items
  return [
    ...items,
    calcularItem({
      codigo: "ENVIO",
      descripcion: "Envío a domicilio",
      cantidad: 1,
      precio_con_igv: delivery,
    }),
  ]
}
