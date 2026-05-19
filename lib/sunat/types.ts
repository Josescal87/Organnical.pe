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
