import type { SupabaseClient } from "@supabase/supabase-js"

export interface StockRow {
  sku: string
  quantity: number
}

export const LOW_STOCK_THRESHOLD = 5

export async function getStockBySkus(
  supabase: SupabaseClient,
  skus: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>()
  if (skus.length === 0) return result

  const { data, error } = await supabase
    .from("productos_stock")
    .select("sku, quantity")
    .in("sku", skus)

  if (error) {
    console.error("inventory: query error:", error.message)
    return result
  }

  for (const row of (data as StockRow[]) ?? []) {
    result.set(row.sku, Number(row.quantity ?? 0))
  }
  return result
}

export interface StockValidationError {
  sku: string
  pedido: number
  disponible: number
  descripcion?: string
}

export function validateStock(
  pedidos: Array<{ sku: string; cantidad: number; descripcion?: string }>,
  stockMap: Map<string, number>
): StockValidationError[] {
  const errores: StockValidationError[] = []
  for (const p of pedidos) {
    const disponible = stockMap.get(p.sku)
    if (disponible === undefined) continue
    if (disponible < p.cantidad) {
      errores.push({
        sku: p.sku,
        pedido: p.cantidad,
        disponible,
        descripcion: p.descripcion,
      })
    }
  }
  return errores
}
