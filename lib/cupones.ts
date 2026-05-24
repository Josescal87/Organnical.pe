import type { SupabaseClient } from "@supabase/supabase-js"

export type CuponValidResult = {
  valid: true
  cupon_id: string
  descuento: number
  descripcion: string
  tipo: "porcentaje" | "monto_fijo"
  valor: number
}

export type CuponInvalidResult = {
  valid: false
  error: string
}

export type CuponResult = CuponValidResult | CuponInvalidResult

/**
 * Valida un cupón. Si `email` se provee y el cupón tiene
 * `uso_maximo_por_usuario`, cuenta pedidos pagados previos del mismo email
 * con el mismo `cupon_codigo` y bloquea cuando alcanza el límite.
 *
 * Sin email no se ejecuta el check per-user (el front lo valida primero sin
 * email para feedback visual; el create-preference siempre revalida con email
 * antes de crear la orden, así que la verdadera autoridad está allí).
 */
export async function validarCupon(
  supabase: SupabaseClient,
  rawCode: string,
  subtotal: number,
  email?: string | null
): Promise<CuponResult> {
  const code = rawCode.trim()
  if (!code) return { valid: false, error: "Código vacío" }

  const { data: cupon, error } = await supabase
    .from("cupones")
    .select("id, code, descripcion, tipo, valor, monto_minimo, activo, fecha_inicio, fecha_fin, uso_maximo, usos_actuales, uso_maximo_por_usuario")
    .ilike("code", code)
    .maybeSingle()

  if (error) {
    console.error("validarCupon: db error:", error)
    return { valid: false, error: "Error al validar el cupón" }
  }

  if (!cupon) return { valid: false, error: "Código no válido" }
  if (!cupon.activo) return { valid: false, error: "Este cupón ya no está activo" }

  const now = new Date()
  if (cupon.fecha_inicio && new Date(cupon.fecha_inicio as string) > now)
    return { valid: false, error: "Este cupón aún no está disponible" }
  if (cupon.fecha_fin && new Date(cupon.fecha_fin as string) < now)
    return { valid: false, error: "Este cupón ha vencido" }
  if (cupon.uso_maximo !== null && (cupon.usos_actuales as number) >= (cupon.uso_maximo as number))
    return { valid: false, error: "Este cupón ha alcanzado su límite de uso" }
  if (subtotal < Number(cupon.monto_minimo))
    return { valid: false, error: `Monto mínimo para este cupón: S/ ${Number(cupon.monto_minimo).toFixed(2)}` }

  // Check per-usuario: si el cupón tiene tope por email y el email se proveyó,
  // contar pedidos previos pagados (no cancelados/pendientes) del mismo email.
  const maxPerUser = cupon.uso_maximo_por_usuario as number | null
  if (maxPerUser !== null && email && email.trim()) {
    const emailNorm = email.trim().toLowerCase()
    const { count, error: countErr } = await supabase
      .from("ordenes_tienda")
      .select("id", { count: "exact", head: true })
      .ilike("cupon_codigo", cupon.code as string)
      .ilike("cliente_snapshot->>email", emailNorm)
      .in("estado", ["pagado", "confirmado"])
    if (countErr) {
      console.error("validarCupon: count error:", countErr)
      // Falla abierta: si no podemos contar, mejor permitir que bloquear erróneamente
    } else if ((count ?? 0) >= maxPerUser) {
      return {
        valid: false,
        error: maxPerUser === 1
          ? "Ya usaste este cupón en una compra anterior"
          : `Ya alcanzaste el límite de usos de este cupón (${maxPerUser})`,
      }
    }
  }

  const tipo = cupon.tipo as "porcentaje" | "monto_fijo"
  const valor = Number(cupon.valor)

  let descuento: number
  if (tipo === "porcentaje") {
    descuento = Math.round(subtotal * valor / 100 * 100) / 100
  } else {
    descuento = Math.min(valor, subtotal)
  }

  const descripcion = (cupon.descripcion as string | null)
    ?? (tipo === "porcentaje" ? `${valor}% de descuento` : `S/ ${valor.toFixed(2)} de descuento`)

  return {
    valid: true,
    cupon_id: cupon.id as string,
    descuento,
    descripcion,
    tipo,
    valor,
  }
}
