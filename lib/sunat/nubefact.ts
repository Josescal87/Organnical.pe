// Adapter Nubefact (https://www.nubefact.com) para emisión de boleta electrónica.
//
// Nubefact expone un endpoint REST por tenant. La URL completa (con el path
// único asignado a tu RUC) va en SUNAT_API_URL y el token Authorization en
// SUNAT_API_TOKEN.
//
// Docs: https://www.nubefact.com/api
//
// Comportamiento en modo "no configurado":
//   - Si SUNAT_API_URL o SUNAT_API_TOKEN están vacíos -> devolvemos BoletaError
//     con motivo='not_configured'. El caller (ruby-integration) loguea y sigue.
//     La orden queda con boleta_emitida_at=null para retry posterior.

import type {
  BoletaPayload,
  BoletaResponse,
  NotaCreditoPayload,
} from "./types"

// Códigos de tipo de documento según catálogo SUNAT
const DOC_TYPE_MAP: Record<string, number> = {
  DNI: 1,
  CE: 4,           // Carnet de extranjería
  RUC: 6,
  PASAPORTE: 7,
  SIN_DOC: 0,      // "Otros" — Nubefact acepta 0 para consumidor final genérico
}

// Tipo de comprobante: 1=factura, 2=boleta, 3=nota de crédito
const TIPO_BOLETA = 2
// (NC usa literal 3 inline, ver emitirNotaCreditoNubefact)

// Mapping del tipo de documento referenciado por la NC (para
// `documento_que_se_modifica_tipo` de Nubefact).
const TIPO_DOC_REFERENCIADO: Record<"boleta" | "factura", number> = {
  factura: 1,
  boleta: 2,
}

// Catálogo SUNAT 9 → código numérico que Nubefact espera en
// `tipo_de_nota_de_credito`. (Nubefact acepta el código sin el cero a la
// izquierda, ej. "01" → 1.)
const TIPO_NC_MAP: Record<string, number> = {
  "01": 1, "02": 2, "03": 3, "04": 4, "05": 5,
  "06": 6, "07": 7, "08": 8, "09": 9, "10": 10, "11": 11,
}

// SUNAT transaction type: 1=Venta interna
const SUNAT_TX_VENTA_INTERNA = 1

// Moneda: 1=PEN, 2=USD
const MONEDA_PEN = 1

// Tipo de IGV item: 1=Gravado-Operación Onerosa
const TIPO_IGV_GRAVADO = 1

// Unidad de medida estándar para productos físicos
const UNIDAD_DEFAULT = "NIU"

interface NubefactRequest {
  operacion: "generar_comprobante"
  tipo_de_comprobante: number
  serie: string
  // numero: 0 indica a Nubefact que asigne el siguiente correlativo
  // automáticamente para la `serie` dada. Cualquier entero positivo fuerza
  // ese número específico (útil si la BD ya gestiona correlativos).
  numero: number
  sunat_transaction: number
  cliente_tipo_de_documento: number
  cliente_numero_de_documento: string
  cliente_denominacion: string
  cliente_direccion: string
  cliente_email: string
  cliente_email_1?: string
  fecha_de_emision: string       // DD-MM-YYYY
  moneda: number
  porcentaje_de_igv: number
  total_gravada: number
  total_igv: number
  total: number
  observaciones?: string
  // codigo_unico: identificador único de operación. Lo provee el cliente
  // (NUESTRO sistema) para idempotency. Si reintentas con el mismo, Nubefact
  // devuelve el comprobante ya emitido en vez de emitir uno nuevo.
  // Convención: usamos el orden_id (UUID) — único por orden.
  codigo_unico: string
  enviar_automaticamente_a_la_sunat: boolean
  enviar_automaticamente_al_cliente: boolean
  formato_de_pdf: "A4" | "TICKET"
  items: NubefactItem[]
}

interface NubefactItem {
  unidad_de_medida: string
  codigo: string
  descripcion: string
  cantidad: number
  valor_unitario: number
  precio_unitario: number
  subtotal: number
  tipo_de_igv: number
  igv: number
  total: number
  anticipo_regularizacion: boolean
  descuento: number
}

interface NubefactResponse {
  tipo_de_comprobante?: number
  serie?: string
  numero?: number
  enlace?: string
  aceptada_por_sunat?: boolean
  sunat_description?: string
  sunat_note?: string
  sunat_responsecode?: string
  sunat_soap_error?: string
  cadena_para_codigo_qr?: string
  codigo_hash?: string
  enlace_del_pdf?: string
  enlace_del_xml?: string
  enlace_del_cdr?: string
  errors?: string | string[]
}

// Formatea fecha ISO a DD-MM-YYYY (Lima time = UTC-5, fijo).
function fechaPeruana(iso: string): string {
  const d = new Date(iso)
  // Ajuste a UTC-5 sin DST (Perú no tiene horario de verano)
  const limaTs = d.getTime() - 5 * 60 * 60 * 1000
  const lima = new Date(limaTs)
  const day = String(lima.getUTCDate()).padStart(2, "0")
  const month = String(lima.getUTCMonth() + 1).padStart(2, "0")
  const year = lima.getUTCFullYear()
  return `${day}-${month}-${year}`
}

export async function emitirBoletaNubefact(
  payload: BoletaPayload
): Promise<BoletaResponse> {
  const url = process.env.SUNAT_API_URL?.trim()
  const token = process.env.SUNAT_API_TOKEN?.trim()

  if (!url || !token) {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: "not_configured",
    }
  }

  const docType = DOC_TYPE_MAP[payload.cliente.tipo_documento] ?? 0

  const body: NubefactRequest = {
    operacion: "generar_comprobante",
    tipo_de_comprobante: TIPO_BOLETA,
    serie: payload.serie,
    numero: payload.numero ?? 0,
    sunat_transaction: SUNAT_TX_VENTA_INTERNA,
    cliente_tipo_de_documento: docType,
    cliente_numero_de_documento: payload.cliente.numero_documento ?? "-",
    cliente_denominacion: payload.cliente.nombre.slice(0, 100),
    cliente_direccion: (payload.cliente.direccion ?? "-").slice(0, 100),
    cliente_email: payload.cliente.email ?? "",
    fecha_de_emision: fechaPeruana(payload.fecha_emision),
    moneda: MONEDA_PEN,
    porcentaje_de_igv: 18.0,
    total_gravada: payload.total_gravada,
    total_igv: payload.total_igv,
    total: payload.total,
    observaciones: payload.observaciones,
    // codigo_unico: usar el provisto explícitamente (boletas.id, post-S0.11)
    // o caer a orden_id (legacy S0.1, una boleta por orden).
    codigo_unico: payload.codigo_unico ?? payload.orden_id,
    enviar_automaticamente_a_la_sunat: true,
    enviar_automaticamente_al_cliente: Boolean(payload.cliente.email),
    formato_de_pdf: "A4",
    items: payload.items.map<NubefactItem>((it) => ({
      unidad_de_medida: UNIDAD_DEFAULT,
      codigo: it.codigo,
      descripcion: it.descripcion.slice(0, 250),
      cantidad: it.cantidad,
      valor_unitario: it.valor_unitario,
      precio_unitario: it.precio_unitario,
      subtotal: it.base_imponible,
      tipo_de_igv: TIPO_IGV_GRAVADO,
      igv: it.igv,
      total: it.total,
      anticipo_regularizacion: false,
      descuento: 0,
    })),
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token token="${token}"`,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: `network_error: ${err instanceof Error ? err.message : String(err)}`,
    }
  }

  let parsed: NubefactResponse
  try {
    parsed = (await response.json()) as NubefactResponse
  } catch {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: `invalid_response: status=${response.status}`,
      status: response.status,
    }
  }

  // Nubefact devuelve `errors` como string o array si el payload está mal o
  // SUNAT rechazó. También status >= 400.
  if (!response.ok || parsed.errors) {
    const errStr = Array.isArray(parsed.errors)
      ? parsed.errors.join("; ")
      : parsed.errors ?? `http_${response.status}`
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: errStr,
      status: response.status,
      raw: parsed,
    }
  }

  // Validación defensiva: el response debe traer enlace + numero + hash
  if (
    !parsed.enlace_del_pdf ||
    typeof parsed.numero !== "number" ||
    !parsed.serie ||
    !parsed.codigo_hash
  ) {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: "response_missing_required_fields",
      status: response.status,
      raw: parsed,
    }
  }

  return {
    ok: true,
    id: `${parsed.serie}-${parsed.numero}`,
    serie: parsed.serie,
    numero: parsed.numero,
    link: parsed.enlace_del_pdf,
    hash: parsed.codigo_hash,
    aceptada_por_sunat: Boolean(parsed.aceptada_por_sunat),
    proveedor: "nubefact",
    raw: parsed,
  }
}

// ─── Nota de crédito ─────────────────────────────────────────────────────────
// Misma URL/auth que la boleta. Cambia el `tipo_de_comprobante=3` y agrega
// los campos `documento_que_se_modifica_*` + `tipo_de_nota_de_credito`.
//
// Para anulación total (tipo_nota_credito="01"), los items se replican tal
// cual de la boleta original. Nubefact/SUNAT entienden que es una NC sobre
// los mismos montos.

interface NubefactNCRequest extends Omit<NubefactRequest, "tipo_de_comprobante"> {
  tipo_de_comprobante: 3
  documento_que_se_modifica_tipo: number    // 1=factura, 2=boleta
  documento_que_se_modifica_serie: string
  documento_que_se_modifica_numero: number
  tipo_de_nota_de_credito: number           // 1..11 según catálogo SUNAT
}

export async function emitirNotaCreditoNubefact(
  payload: NotaCreditoPayload
): Promise<BoletaResponse> {
  const url = process.env.SUNAT_API_URL?.trim()
  const token = process.env.SUNAT_API_TOKEN?.trim()

  if (!url || !token) {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: "not_configured",
    }
  }

  const docType = DOC_TYPE_MAP[payload.cliente.tipo_documento] ?? 0
  const tipoNcCodigo = TIPO_NC_MAP[payload.tipo_nota_credito]
  if (!tipoNcCodigo) {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: `tipo_nota_credito inválido: ${payload.tipo_nota_credito}`,
    }
  }

  const body: NubefactNCRequest = {
    operacion: "generar_comprobante",
    tipo_de_comprobante: 3,
    serie: payload.serie,
    numero: payload.numero ?? 0,
    sunat_transaction: SUNAT_TX_VENTA_INTERNA,
    cliente_tipo_de_documento: docType,
    cliente_numero_de_documento: payload.cliente.numero_documento ?? "-",
    cliente_denominacion: payload.cliente.nombre.slice(0, 100),
    cliente_direccion: (payload.cliente.direccion ?? "-").slice(0, 100),
    cliente_email: payload.cliente.email ?? "",
    fecha_de_emision: fechaPeruana(payload.fecha_emision),
    moneda: MONEDA_PEN,
    porcentaje_de_igv: 18.0,
    total_gravada: payload.total_gravada,
    total_igv: payload.total_igv,
    total: payload.total,
    observaciones: payload.motivo.slice(0, 250),
    codigo_unico: payload.nota_credito_id,
    enviar_automaticamente_a_la_sunat: true,
    enviar_automaticamente_al_cliente: Boolean(payload.cliente.email),
    formato_de_pdf: "A4",
    documento_que_se_modifica_tipo: TIPO_DOC_REFERENCIADO[payload.boleta_original.tipo],
    documento_que_se_modifica_serie: payload.boleta_original.serie,
    documento_que_se_modifica_numero: payload.boleta_original.numero,
    tipo_de_nota_de_credito: tipoNcCodigo,
    items: payload.items.map<NubefactItem>((it) => ({
      unidad_de_medida: UNIDAD_DEFAULT,
      codigo: it.codigo,
      descripcion: it.descripcion.slice(0, 250),
      cantidad: it.cantidad,
      valor_unitario: it.valor_unitario,
      precio_unitario: it.precio_unitario,
      subtotal: it.base_imponible,
      tipo_de_igv: TIPO_IGV_GRAVADO,
      igv: it.igv,
      total: it.total,
      anticipo_regularizacion: false,
      descuento: 0,
    })),
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token token="${token}"`,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: `network_error: ${err instanceof Error ? err.message : String(err)}`,
    }
  }

  let parsed: NubefactResponse
  try {
    parsed = (await response.json()) as NubefactResponse
  } catch {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: `invalid_response: status=${response.status}`,
      status: response.status,
    }
  }

  if (!response.ok || parsed.errors) {
    const errStr = Array.isArray(parsed.errors)
      ? parsed.errors.join("; ")
      : parsed.errors ?? `http_${response.status}`
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: errStr,
      status: response.status,
      raw: parsed,
    }
  }

  if (
    !parsed.enlace_del_pdf ||
    typeof parsed.numero !== "number" ||
    !parsed.serie ||
    !parsed.codigo_hash
  ) {
    return {
      ok: false,
      proveedor: "nubefact",
      motivo: "response_missing_required_fields",
      status: response.status,
      raw: parsed,
    }
  }

  return {
    ok: true,
    id: `${parsed.serie}-${parsed.numero}`,
    serie: parsed.serie,
    numero: parsed.numero,
    link: parsed.enlace_del_pdf,
    hash: parsed.codigo_hash,
    aceptada_por_sunat: Boolean(parsed.aceptada_por_sunat),
    proveedor: "nubefact",
    raw: parsed,
  }
}
