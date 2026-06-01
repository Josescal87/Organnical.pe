import { describe, it, expect, vi, beforeEach } from "vitest"

const insertMock = vi.fn().mockResolvedValue({ data: [{ id: "venta-uuid-1" }], error: null })
const rpcMock = vi.fn().mockResolvedValue({ data: "100", error: null })

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    rpc: (fn: string) => rpcMock(fn),
    from: (table: string) => {
      if (table === "ventas") {
        return { insert: (rows: unknown) => ({ select: () => insertMock(rows) }) }
      }
      throw new Error("tabla inesperada: " + table)
    },
  }),
}))

import { createVentaEnRuby } from "@/lib/ruby-integration"
import type { CartItem, DireccionEntrega } from "@/lib/types"

const direccion: DireccionEntrega = {
  email: "ana@x.com", nombre: "Ana", apellido: "Pérez", celular: "987654321",
  dni: "12345678", distrito: "Miraflores", direccion: "Av. Lima 123",
} as DireccionEntrega
const items: CartItem[] = [
  { producto: { sku: "SP1", descripcion: "Spirusol", precio_publico: 50, precio_oferta: null } as never, cantidad: 2 },
]

describe("createVentaEnRuby", () => {
  beforeEach(() => { insertMock.mockClear(); rpcMock.mockClear() })

  it("pide num_orden a la RPC, inserta una fila por item y devuelve {ventaId, numOrden}", async () => {
    const res = await createVentaEnRuby({
      items, direccion, deliveryCost: 10, boletaLink: "https://b.pe/1",
    })
    expect(rpcMock).toHaveBeenCalledWith("siguiente_num_orden_ruby")
    expect(res).toEqual({ ventaId: "venta-uuid-1", numOrden: "100" })
    const rows = insertMock.mock.calls[0][0] as Record<string, unknown>[]
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      num_orden: "100", item: "Spirusol", sku: "SP1", unidades: 2, precio_item: 50,
      precio_delivery: 10, nombre: "Ana", celular: "987654321",
      distrito: "Miraflores", direccion: "Av. Lima 123",
      vendedor: "Tienda Web", metodo_pago: "MercadoPago (web)",
      link_comprobante: "https://b.pe/1",
    })
  })
})
