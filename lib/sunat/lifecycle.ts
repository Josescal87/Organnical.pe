// S0.11 — Lifecycle de comprobantes electrónicos.
//
// Este módulo orquesta la persistencia en `boletas` (tabla post-S0.11) y la
// llamada al adapter del proveedor (Nubefact por ahora). Reemplaza el camino
// directo `lib/ruby-integration.ts → emitirBoleta()` que existía en S0.1.
//
// Flujo de `registrarYEmitirBoleta(ordenId)`:
//   1. SELECT orden + cliente_snapshot + items.
//   2. SELECT boleta existente para esa orden:
//        - Si estado='emitida' o 'aceptada_sunat' → no-op, devuelve la existente.
//        - Si estado='pendiente' o 'rechazada'   → reusa la row, intentos++.
//        - Si no existe                          → INSERT 'pendiente'.
//   3. Llamar al adapter con `codigo_unico = boleta.id` (idempotency real).
//   4. Éxito → UPDATE estado='emitida' + numero/link/hash + sync con
//      ordenes_tienda (5 columnas legacy de S0.1) + ventas.link_comprobante.
//   5. Falla → UPDATE estado='rechazada' + ultimo_error + proximo_reintento_at
//      con backoff exponencial.
//
// Flujo de `anularBoleta(boletaId, motivo)`:
//   1. SELECT boleta original con estado='emitida'/'aceptada_sunat'.
//   2. INSERT nueva row tipo='nota_credito' con anula_a_boleta_id=original.id.
//   3. Llamar adapter NC.
//   4. Éxito → UPDATE NC estado='emitida' + UPDATE original
//      estado='anulada' + motivo_anulacion.
//   5. Falla → UPDATE NC estado='rechazada' (la original sigue 'emitida').

import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/server"
import type { CartItem, DireccionEntrega } from "@/lib/types"
import { calcularItem } from "./types"
import type {
  BoletaCliente,
  BoletaItem,
  BoletaPayload,
  NotaCreditoPayload,
  NotaCreditoTipo,
} from "./types"
import { emitirBoletaNubefact, emitirNotaCreditoNubefact } from "./nubefact"

// Forma persistida en la tabla `boletas`. NO usar como input externo.
export interface BoletaRow {
  id: string
  tipo: "boleta" | "factura" | "nota_credito"
  serie: string
  numero: number | null
  orden_id: string | null
  venta_id: string | null
  anula_a_boleta_id: string | null
  motivo_anulacion: string | null
  cliente_nombre: string
  cliente_doc_tipo: string | null
  cliente_doc_numero: string | null
  cliente_email: string | null
  cliente_direccion: string | null
  subtotal: number
  igv: number
  total: number
  moneda: "PEN" | "USD"
  items: BoletaItem[]
  estado: "pendiente" | "emitida" | "aceptada_sunat" | "rechazada" | "anulada"
  proveedor: string
  proveedor_documento_id: string | null
  link_pdf: string | null
  link_xml: string | null
  link_cdr: string | null
  hash: string | null
  intentos: number
  ultimo_error: string | null
  ultimo_error_at: string | null
  proximo_reintento_at: string | null
  created_at: string
  updated_at: string
  emitida_at: string | null
  aceptada_sunat_at: string | null
}

export type LifecycleResult =
  | { ok: true; boleta: BoletaRow; created: boolean }
  | { ok: false; boleta: BoletaRow | null; motivo: string }

// Backoff exponencial. Devuelve ISO timestamp para `proximo_reintento_at` o
// null cuando ya excedió el max (5 intentos = ~32h acumulados).
function nextRetryAt(intentos: number): string | null {
  // Después del intento N, esperamos:
  //   1 → 15min, 2 → 1h, 3 → 6h, 4 → 24h, 5 → null (manual)
  const minutes = [15, 60, 6 * 60, 24 * 60][intentos - 1]
  if (minutes === undefined) return null
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Construye el snapshot de cliente que persiste en `boletas`.
function clienteFromDireccion(d: DireccionEntrega): BoletaCliente & {
  // direccion completa con referencia/distrito para el snapshot persistido
  direccion_completa: string | null
} {
  const dni = (d.dni ?? "").trim()
  const tipo_documento: BoletaCliente["tipo_documento"] = dni.length === 8 ? "DNI" : "SIN_DOC"
  const numero_documento = dni.length === 8 ? dni : null
  const nombre = `${d.nombre ?? ""} ${d.apellido ?? ""}`.trim() || "Consumidor Final"
  const direccion_completa = [d.direccion, d.referencia, d.distrito]
    .filter(Boolean)
    .join(" — ") || null
  return {
    tipo_documento,
    numero_documento,
    nombre,
    email: d.email || null,
    direccion: direccion_completa,
    distrito: d.distrito || null,
    direccion_completa,
  }
}

function itemsFromCart(items: CartItem[]): BoletaItem[] {
  return items.map((it) => {
    const unitPrice = it.producto.precio_oferta ?? it.producto.precio_publico
    return calcularItem({
      codigo: it.producto.sku,
      descripcion: it.producto.descripcion,
      cantidad: it.cantidad,
      precio_con_igv: unitPrice,
    })
  })
}

// Resuelve la serie configurada via env. Default productivo: B001.
function resolveSerieBoleta(): string {
  return process.env.SUNAT_SERIE_BOLETA?.trim() || "B001"
}
function resolveSerieNotaCredito(): string {
  return process.env.SUNAT_SERIE_NOTA_CREDITO?.trim() || "BC01"
}

// ─── registrarYEmitirBoleta ─────────────────────────────────────────────────
//
// Idempotente: llamarla con el mismo `ordenId` no crea filas duplicadas. Si
// existe una boleta para esa orden:
//   - estado in ('emitida', 'aceptada_sunat') → no-op, retorna la existente
//     con `created=false`.
//   - estado in ('pendiente', 'rechazada')   → reusa la row para reintentar.
//
// Errores nunca se lanzan: la función es non-throwing por contrato (el caller
// es ruby-integration que no quiere que un fallo SUNAT rompa la venta).
export async function registrarYEmitirBoleta(
  ordenId: string,
  supabaseOverride?: SupabaseClient
): Promise<LifecycleResult> {
  const supabase = supabaseOverride ?? createAdminClient()

  // 1. Cargar orden
  const { data: orden, error: ordenErr } = await supabase
    .from("ordenes_tienda")
    .select("id, items, cliente_snapshot, estado, total")
    .eq("id", ordenId)
    .single()

  if (ordenErr || !orden) {
    return {
      ok: false,
      boleta: null,
      motivo: `orden_no_encontrada: ${ordenErr?.message ?? "no row"}`,
    }
  }

  const items = (orden.items ?? []) as unknown as CartItem[]
  const cliente = orden.cliente_snapshot as unknown as DireccionEntrega | null
  if (!cliente || !Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      boleta: null,
      motivo: "orden_sin_items_o_cliente",
    }
  }

  // 2. Boleta existente
  const { data: existente } = await supabase
    .from("boletas")
    .select("*")
    .eq("orden_id", ordenId)
    .eq("tipo", "boleta")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // No-op si ya emitida
  if (existente && (existente.estado === "emitida" || existente.estado === "aceptada_sunat")) {
    return { ok: true, boleta: existente as BoletaRow, created: false }
  }

  // Snapshot común
  const sunatItems = itemsFromCart(items)
  const cli = clienteFromDireccion(cliente)
  const total_gravada = round2(sunatItems.reduce((a, x) => a + x.base_imponible, 0))
  const total_igv = round2(sunatItems.reduce((a, x) => a + x.igv, 0))
  const total = round2(sunatItems.reduce((a, x) => a + x.total, 0))
  const serie = resolveSerieBoleta()

  // 3. Crear o reusar
  let boleta: BoletaRow
  let created = false

  if (existente) {
    // Reusar la row existente (estado pendiente o rechazada)
    boleta = existente as BoletaRow
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("boletas")
      .insert({
        tipo: "boleta",
        serie,
        // numero queda NULL (modo Q1=delegar — Nubefact lo asigna)
        orden_id: ordenId,
        cliente_nombre: cli.nombre,
        cliente_doc_tipo: cli.tipo_documento,
        cliente_doc_numero: cli.numero_documento,
        cliente_email: cli.email,
        cliente_direccion: cli.direccion_completa,
        subtotal: total_gravada,
        igv: total_igv,
        total,
        moneda: "PEN",
        items: sunatItems,
        estado: "pendiente",
        proveedor: process.env.SUNAT_PROVIDER?.trim() || "nubefact",
      })
      .select("*")
      .single()

    if (insertErr || !inserted) {
      return {
        ok: false,
        boleta: null,
        motivo: `insert_boleta_failed: ${insertErr?.message ?? "no row"}`,
      }
    }
    boleta = inserted as BoletaRow
    created = true
  }

  // 4. Llamar al proveedor con codigo_unico = boleta.id (idempotency real)
  const payload: BoletaPayload = {
    orden_id: ordenId,
    serie: boleta.serie,
    numero: boleta.numero ?? undefined,  // undefined → adapter pasa 0 = autoincrement
    fecha_emision: new Date().toISOString(),
    cliente: {
      tipo_documento: cli.tipo_documento,
      numero_documento: cli.numero_documento,
      nombre: cli.nombre,
      email: cli.email,
      direccion: cli.direccion_completa,
      distrito: cli.distrito,
    },
    items: sunatItems,
    total_gravada,
    total_igv,
    total,
    moneda: "PEN",
    observaciones: `Orden tienda web ${ordenId.slice(0, 8)}`,
    codigo_unico: boleta.id,
  }

  const provider = (process.env.SUNAT_PROVIDER?.trim() || "nubefact").toLowerCase()
  const resultado = provider === "nubefact"
    ? await emitirBoletaNubefact(payload)
    : { ok: false as const, proveedor: provider, motivo: `provider_unsupported: ${provider}` }

  // 5a. Falla → marcar rechazada
  if (!resultado.ok) {
    const intentos = boleta.intentos + 1
    const proximo = nextRetryAt(intentos)
    const { data: upd } = await supabase
      .from("boletas")
      .update({
        estado: "rechazada",
        ultimo_error: `${resultado.proveedor}: ${resultado.motivo}`.slice(0, 500),
        ultimo_error_at: new Date().toISOString(),
        intentos,
        proximo_reintento_at: proximo,
      })
      .eq("id", boleta.id)
      .select("*")
      .single()

    // Mantener compat con S0.1: ordenes_tienda.boleta_error
    await supabase
      .from("ordenes_tienda")
      .update({
        boleta_error: `${resultado.proveedor}: ${resultado.motivo}`.slice(0, 500),
      })
      .eq("id", ordenId)

    console.info("[boletas]", boleta.id, "rechazada", resultado.motivo)
    return {
      ok: false,
      boleta: (upd as BoletaRow) ?? boleta,
      motivo: resultado.motivo,
    }
  }

  // 5b. Éxito → marcar emitida
  const intentos = boleta.intentos + 1
  const aceptadaSunat = resultado.aceptada_por_sunat
  const { data: upd, error: updErr } = await supabase
    .from("boletas")
    .update({
      estado: aceptadaSunat ? "aceptada_sunat" : "emitida",
      numero: resultado.numero,
      proveedor_documento_id: resultado.id,
      link_pdf: resultado.link,
      hash: resultado.hash,
      intentos,
      ultimo_error: null,
      ultimo_error_at: null,
      proximo_reintento_at: null,
      emitida_at: new Date().toISOString(),
      aceptada_sunat_at: aceptadaSunat ? new Date().toISOString() : null,
    })
    .eq("id", boleta.id)
    .select("*")
    .single()

  if (updErr) {
    console.error("[boletas] update tras éxito falló:", updErr.message)
  }

  // Sync con S0.1 (5 columnas en ordenes_tienda — backwards compat)
  await supabase
    .from("ordenes_tienda")
    .update({
      boleta_id: resultado.id,
      boleta_link: resultado.link,
      boleta_hash: resultado.hash,
      boleta_emitida_at: new Date().toISOString(),
      boleta_error: null,
    })
    .eq("id", ordenId)

  // Sync con tabla legacy `ventas` (best-effort)
  await supabase
    .from("ventas")
    .update({ link_comprobante: resultado.link, hash_comprobante: resultado.hash })
    .eq("num_orden", ordenId)
    .then(() => undefined, () => undefined)

  console.info("[boletas]", boleta.id, aceptadaSunat ? "aceptada_sunat" : "emitida", resultado.id)
  return { ok: true, boleta: (upd as BoletaRow) ?? boleta, created }
}

// ─── anularBoleta ───────────────────────────────────────────────────────────
//
// Emite una nota de crédito contra una boleta original. La NC vive como una
// row separada en `boletas` con tipo='nota_credito' y anula_a_boleta_id
// apuntando a la original. Si la NC se emite OK, la original pasa a 'anulada'.
//
// `tipoNotaCredito` default: "01" (anulación de la operación, anulación
// total). Para devoluciones parciales o ajustes de monto, pasar el código
// SUNAT correspondiente — ver `NotaCreditoTipo` en types.ts.
export async function anularBoleta(
  boletaOriginalId: string,
  motivo: string,
  opts?: { tipoNotaCredito?: NotaCreditoTipo; supabase?: SupabaseClient }
): Promise<LifecycleResult> {
  const supabase = opts?.supabase ?? createAdminClient()
  const tipoNc: NotaCreditoTipo = opts?.tipoNotaCredito ?? "01"

  // 1. Cargar la boleta original
  const { data: original, error: origErr } = await supabase
    .from("boletas")
    .select("*")
    .eq("id", boletaOriginalId)
    .single()

  if (origErr || !original) {
    return {
      ok: false,
      boleta: null,
      motivo: `boleta_original_no_encontrada: ${origErr?.message ?? "no row"}`,
    }
  }
  const orig = original as BoletaRow
  if (orig.estado !== "emitida" && orig.estado !== "aceptada_sunat") {
    return {
      ok: false,
      boleta: orig,
      motivo: `boleta_original_estado_invalido: ${orig.estado}`,
    }
  }
  if (orig.numero === null) {
    return {
      ok: false,
      boleta: orig,
      motivo: "boleta_original_sin_numero",
    }
  }
  if (orig.tipo === "nota_credito") {
    return {
      ok: false,
      boleta: orig,
      motivo: "no_se_anula_una_nota_de_credito",
    }
  }

  // 2. Insertar nueva row para la NC
  const { data: ncRow, error: ncInsertErr } = await supabase
    .from("boletas")
    .insert({
      tipo: "nota_credito",
      serie: resolveSerieNotaCredito(),
      orden_id: orig.orden_id,
      anula_a_boleta_id: orig.id,
      motivo_anulacion: motivo.slice(0, 500),
      cliente_nombre: orig.cliente_nombre,
      cliente_doc_tipo: orig.cliente_doc_tipo,
      cliente_doc_numero: orig.cliente_doc_numero,
      cliente_email: orig.cliente_email,
      cliente_direccion: orig.cliente_direccion,
      subtotal: orig.subtotal,
      igv: orig.igv,
      total: orig.total,
      moneda: orig.moneda,
      items: orig.items,
      estado: "pendiente",
      proveedor: orig.proveedor,
    })
    .select("*")
    .single()

  if (ncInsertErr || !ncRow) {
    return {
      ok: false,
      boleta: null,
      motivo: `insert_nota_credito_failed: ${ncInsertErr?.message ?? "no row"}`,
    }
  }
  const nc = ncRow as BoletaRow

  // 3. Llamar adapter NC
  const payload: NotaCreditoPayload = {
    nota_credito_id: nc.id,
    boleta_original: {
      serie: orig.serie,
      numero: orig.numero,
      tipo: orig.tipo as "boleta" | "factura",
    },
    serie: nc.serie,
    fecha_emision: new Date().toISOString(),
    motivo,
    tipo_nota_credito: tipoNc,
    cliente: {
      tipo_documento: (orig.cliente_doc_tipo as BoletaCliente["tipo_documento"]) ?? "SIN_DOC",
      numero_documento: orig.cliente_doc_numero,
      nombre: orig.cliente_nombre,
      email: orig.cliente_email,
      direccion: orig.cliente_direccion,
      distrito: null,
    },
    items: orig.items,
    total_gravada: orig.subtotal,
    total_igv: orig.igv,
    total: orig.total,
    moneda: "PEN",
  }

  const provider = (process.env.SUNAT_PROVIDER?.trim() || "nubefact").toLowerCase()
  const resultado = provider === "nubefact"
    ? await emitirNotaCreditoNubefact(payload)
    : { ok: false as const, proveedor: provider, motivo: `provider_unsupported: ${provider}` }

  if (!resultado.ok) {
    await supabase
      .from("boletas")
      .update({
        estado: "rechazada",
        ultimo_error: `${resultado.proveedor}: ${resultado.motivo}`.slice(0, 500),
        ultimo_error_at: new Date().toISOString(),
        intentos: nc.intentos + 1,
      })
      .eq("id", nc.id)
    console.info("[boletas]", nc.id, "NC rechazada:", resultado.motivo)
    return { ok: false, boleta: nc, motivo: resultado.motivo }
  }

  // 4. Éxito: marcar NC como emitida + original como anulada
  const aceptadaSunat = resultado.aceptada_por_sunat
  const { data: ncUpd } = await supabase
    .from("boletas")
    .update({
      estado: aceptadaSunat ? "aceptada_sunat" : "emitida",
      numero: resultado.numero,
      proveedor_documento_id: resultado.id,
      link_pdf: resultado.link,
      hash: resultado.hash,
      intentos: nc.intentos + 1,
      emitida_at: new Date().toISOString(),
      aceptada_sunat_at: aceptadaSunat ? new Date().toISOString() : null,
    })
    .eq("id", nc.id)
    .select("*")
    .single()

  await supabase
    .from("boletas")
    .update({
      estado: "anulada",
      motivo_anulacion: motivo.slice(0, 500),
    })
    .eq("id", orig.id)

  console.info("[boletas]", nc.id, "NC emitida", resultado.id, "→ original", orig.id, "anulada")
  return { ok: true, boleta: (ncUpd as BoletaRow) ?? nc, created: true }
}


// ─── Batch retry helper ─────────────────────────────────────────────────────
// S1.10: Antes esta lógica vivía duplicada en /api/admin/boletas/retry-pending.
// Ahora se factoriza acá para que el cron (/api/admin/cron/retry-boletas) y
// el endpoint admin pueda reutilizarla sin copy-paste.
//
// Procesa hasta `maxBatch` boletas tipo='boleta' con estado IN
// ('pendiente', 'rechazada') y proximo_reintento_at <= now() (o NULL).
// Llama registrarYEmitirBoleta(orden_id) para cada una. Non-throwing.

export interface RetryBatchResult {
  procesadas: Array<{ boletaId: string; ordenId: string; estado: string }>
  errores: Array<{ boletaId: string; ordenId: string; motivo: string }>
}

export async function retryPendingBoletas(
  supabase?: SupabaseClient,
  maxBatch: number = 10
): Promise<RetryBatchResult> {
  const sb = supabase ?? createAdminClient()
  const nowIso = new Date().toISOString()

  const { data: candidatas, error: queryErr } = await sb
    .from("boletas")
    .select("id, orden_id, estado, intentos")
    .eq("tipo", "boleta")
    .in("estado", ["pendiente", "rechazada"])
    .not("orden_id", "is", null)
    .or(`proximo_reintento_at.is.null,proximo_reintento_at.lte.${nowIso}`)
    .order("created_at", { ascending: true })
    .limit(maxBatch)

  if (queryErr) {
    console.error("retryPendingBoletas: query error:", queryErr.message)
    return { procesadas: [], errores: [] }
  }
  if (!candidatas || candidatas.length === 0) {
    return { procesadas: [], errores: [] }
  }

  const procesadas: RetryBatchResult["procesadas"] = []
  const errores: RetryBatchResult["errores"] = []

  for (const c of candidatas) {
    const result = await registrarYEmitirBoleta(c.orden_id as string, sb)
    if (result.ok) {
      procesadas.push({
        boletaId: result.boleta.id,
        ordenId: c.orden_id as string,
        estado: result.boleta.estado,
      })
    } else {
      errores.push({
        boletaId: c.id as string,
        ordenId: c.orden_id as string,
        motivo: result.motivo,
      })
    }
  }
  return { procesadas, errores }
}
