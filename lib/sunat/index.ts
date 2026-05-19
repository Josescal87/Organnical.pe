// Entrypoint para emisión de boletas electrónicas.
//
// Switch por SUNAT_PROVIDER. Por defecto = "nubefact". Si la env var no está
// seteada o el adapter devuelve `not_configured`, el caller debe loguear y
// marcar la orden con boleta_emitida_at=null para retry posterior.
//
// API recomendada (post-S0.11): `registrarYEmitirBoleta(ordenId)` y
// `anularBoleta(boletaId, motivo)` — viven en `./lifecycle`. Estas
// orquestan persistencia en `boletas` (tabla S0.11) + idempotency real
// (codigo_unico = boletas.id) + backoff de retries.
//
// API legacy (S0.1): `emitirBoleta({ ordenId, items, cliente })` — sigue
// exportada para retrocompatibilidad de tests/scripts puntuales pero
// NO persiste nada. Preferí `registrarYEmitirBoleta` en código nuevo.

import type { CartItem, DireccionEntrega } from "@/lib/types"
import { calcularItem } from "./types"
import type { BoletaPayload, BoletaResponse } from "./types"
import { emitirBoletaNubefact } from "./nubefact"

export type {
  BoletaPayload,
  BoletaResponse,
  BoletaResultado,
  BoletaError,
  NotaCreditoPayload,
  NotaCreditoTipo,
} from "./types"

// Re-exports del lifecycle (S0.11)
export { registrarYEmitirBoleta, anularBoleta } from "./lifecycle"
export type { BoletaRow, LifecycleResult } from "./lifecycle"
// S1.10: helper para batch retry (lo usan retry-pending y el cron).
export { retryPendingBoletas } from "./lifecycle"
export type { RetryBatchResult } from "./lifecycle"

// Construye un BoletaPayload a partir de los datos canónicos de la orden.
// Si el cliente no tiene DNI o RUC, se emite a "consumidor final" (numero="-").
export function buildBoletaPayload(args: {
  ordenId: string
  items: CartItem[]
  cliente: DireccionEntrega
  fechaEmision?: string
}): BoletaPayload {
  const serie = process.env.SUNAT_SERIE_BOLETA?.trim() || "BB01"
  const fecha_emision = args.fechaEmision ?? new Date().toISOString()

  const items = args.items.map((it) => {
    const unitPrice = it.producto.precio_oferta ?? it.producto.precio_publico
    return calcularItem({
      codigo: it.producto.sku,
      descripcion: it.producto.descripcion,
      cantidad: it.cantidad,
      precio_con_igv: unitPrice,
    })
  })

  const total_gravada = round2(items.reduce((acc, it) => acc + it.base_imponible, 0))
  const total_igv = round2(items.reduce((acc, it) => acc + it.igv, 0))
  const total = round2(items.reduce((acc, it) => acc + it.total, 0))

  // Documento: si el cliente dio DNI lo usamos, si no es "consumidor final"
  const dni = (args.cliente.dni ?? "").trim()
  const tipo_documento = dni.length === 8 ? "DNI" : "SIN_DOC"
  const numero_documento = dni.length === 8 ? dni : null

  const nombre = `${args.cliente.nombre ?? ""} ${args.cliente.apellido ?? ""}`.trim() || "Consumidor Final"
  const direccion = [args.cliente.direccion, args.cliente.referencia, args.cliente.distrito]
    .filter(Boolean)
    .join(" — ") || null

  return {
    orden_id: args.ordenId,
    serie,
    fecha_emision,
    cliente: {
      tipo_documento,
      numero_documento,
      nombre,
      email: args.cliente.email || null,
      direccion,
      distrito: args.cliente.distrito || null,
    },
    items,
    total_gravada,
    total_igv,
    total,
    moneda: "PEN",
    observaciones: `Orden tienda web ${args.ordenId.slice(0, 8)}`,
  }
}

export async function emitirBoleta(args: {
  ordenId: string
  items: CartItem[]
  cliente: DireccionEntrega
  fechaEmision?: string
}): Promise<BoletaResponse> {
  const payload = buildBoletaPayload(args)
  const provider = (process.env.SUNAT_PROVIDER?.trim() || "nubefact").toLowerCase()

  switch (provider) {
    case "nubefact":
      return emitirBoletaNubefact(payload)
    default:
      return {
        ok: false,
        proveedor: provider,
        motivo: `provider_unsupported: ${provider}`,
      }
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
