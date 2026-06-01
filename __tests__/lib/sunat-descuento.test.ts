import { describe, it, expect, vi, beforeEach } from "vitest"
import { calcularItem, aplicarDescuentoProrrateado, agregarLineaDelivery } from "@/lib/sunat/types"
import type { BoletaItem } from "@/lib/sunat/types"

const emitirMock = vi.fn()
vi.mock("@/lib/sunat/nubefact", () => ({
  emitirBoletaNubefact: (...a: unknown[]) => emitirMock(...a),
  emitirNotaCreditoNubefact: vi.fn(),
}))

// Helper: arma un ítem a precio de lista vía el mismo motor de producción.
function item(codigo: string, precio: number, cantidad = 1): BoletaItem {
  return calcularItem({ codigo, descripcion: codigo, cantidad, precio_con_igv: precio })
}

const sum2 = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 100) / 100

describe("aplicarDescuentoProrrateado", () => {
  it("descuento=0 es no-op (mismas líneas)", () => {
    const items = [item("A", 50)]
    const out = aplicarDescuentoProrrateado(items, 0)
    expect(out).toEqual(items)
  })

  it("descuento negativo es no-op", () => {
    const items = [item("A", 50)]
    expect(aplicarDescuentoProrrateado(items, -5)).toEqual(items)
  })

  it("1 ítem: S/50 con descuento S/45 → total 5.00 (gravada 4.24, igv 0.76)", () => {
    const out = aplicarDescuentoProrrateado([item("SPIRCRU0001", 50)], 45)
    expect(out).toHaveLength(1)
    expect(out[0].total).toBe(5)
    expect(out[0].base_imponible).toBe(4.24)
    expect(out[0].igv).toBe(0.76)
    // invariante de calcularItem
    expect(out[0].total).toBe(Math.round((out[0].base_imponible + out[0].igv) * 100) / 100)
  })

  it("multi-ítem proporcional: 50 + 30 (=80) con descuento 8 (10%) → 45 + 27 = 72", () => {
    const out = aplicarDescuentoProrrateado([item("A", 50), item("B", 30)], 8)
    expect(out[0].total).toBe(45)
    expect(out[1].total).toBe(27)
    expect(sum2(out.map((x) => x.total))).toBe(72)
  })

  it("reconcilia el residual de redondeo en la última línea (3×10, desc 10 → suma 20 exacta)", () => {
    const out = aplicarDescuentoProrrateado([item("A", 10), item("B", 10), item("C", 10)], 10)
    // netTarget = 30 - 10 = 20. ratio = 1/3. Líneas no-últimas: round2(10*2/3)=6.67.
    expect(out[0].total).toBe(6.67)
    expect(out[1].total).toBe(6.67)
    expect(out[2].total).toBe(6.66) // última absorbe el residual
    expect(sum2(out.map((x) => x.total))).toBe(20)
  })

  it("descuento >= subtotal: válvula de escape, devuelve ítems sin tocar (no boleta de 0)", () => {
    const items = [item("A", 50)]
    expect(aplicarDescuentoProrrateado(items, 50)).toEqual(items)
    expect(aplicarDescuentoProrrateado(items, 99)).toEqual(items)
  })

  it("ítems vacíos → devuelve igual", () => {
    expect(aplicarDescuentoProrrateado([], 10)).toEqual([])
  })
})

describe("agregarLineaDelivery", () => {
  it("delivery=0 es no-op", () => {
    const items = [item("A", 50)]
    expect(agregarLineaDelivery(items, 0)).toEqual(items)
  })

  it("delivery negativo es no-op", () => {
    const items = [item("A", 50)]
    expect(agregarLineaDelivery(items, -5)).toEqual(items)
  })

  it("delivery=15 → agrega línea ENVIO gravada (total 15, base 12.71, igv 2.29)", () => {
    const out = agregarLineaDelivery([item("A", 50)], 15)
    expect(out).toHaveLength(2)
    const envio = out[1]
    expect(envio.codigo).toBe("ENVIO")
    expect(envio.descripcion).toBe("Envío a domicilio")
    expect(envio.cantidad).toBe(1)
    expect(envio.total).toBe(15)
    expect(envio.base_imponible).toBe(12.71)
    expect(envio.igv).toBe(2.29)
  })

  it("composición: productos con descuento (5) + delivery (15) → suma 20, delivery sin descuento", () => {
    const conDescuento = aplicarDescuentoProrrateado([item("SPIRCRU0001", 50)], 45)
    const out = agregarLineaDelivery(conDescuento, 15)
    expect(out).toHaveLength(2)
    expect(out[0].total).toBe(5)   // producto prorrateado
    expect(out[1].total).toBe(15)  // delivery a precio completo
    expect(sum2(out.map((x) => x.total))).toBe(20)
  })
})

// Stub mínimo y encadenable de Supabase para el camino feliz de emisión.
function makeSupabase(orden: Record<string, unknown>) {
  const captured: { boletaInsert?: Record<string, unknown> } = {}
  return {
    captured,
    from(table: string) {
      if (table === "ordenes_tienda") {
        return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: orden, error: null }) }) }),
          update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        }
      }
      if (table === "boletas") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) }) }) }),
          insert: (vals: Record<string, unknown>) => {
            captured.boletaInsert = vals
            return { select: () => ({ single: () => Promise.resolve({ data: { id: "bol-1", intentos: 0, serie: vals.serie, numero: null, ...vals }, error: null }) }) }
          },
          update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "bol-1", estado: "emitida" }, error: null }) }) }) }),
        }
      }
      if (table === "ventas") {
        return { update: () => ({ eq: () => ({ then: (res: (v: unknown) => unknown) => Promise.resolve().then(res) }) }) }
      }
      throw new Error("tabla inesperada: " + table)
    },
  }
}

describe("registrarYEmitirBoleta — descuento integrado", () => {
  beforeEach(() => {
    emitirMock.mockReset()
    emitirMock.mockResolvedValue({
      ok: true, id: "BBB1-9", serie: "BBB1", numero: 9,
      link: "http://x/pdf", hash: "h", aceptada_por_sunat: false, proveedor: "nubefact",
    })
  })

  it("orden con descuento → boleta prorrateada (total 5, no 50)", async () => {
    const { registrarYEmitirBoleta } = await import("@/lib/sunat/lifecycle")
    const orden = {
      id: "ord-1",
      estado: "pagado",
      total: 5,
      descuento: 45,
      items: [{ producto: { sku: "SPIRCRU0001", descripcion: "Spirusol crunchie", precio_publico: 55, precio_oferta: 50 }, cantidad: 1 }],
      cliente_snapshot: { nombre: "Jose", apellido: "Escalante", dni: "", email: "j@x.com", distrito: "Recojo en tienda", direccion: "Av. La Mar 750" },
    }
    const sb = makeSupabase(orden)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await registrarYEmitirBoleta("ord-1", sb as any)

    expect(res.ok).toBe(true)
    expect(emitirMock).toHaveBeenCalledTimes(1)
    const payload = emitirMock.mock.calls[0][0]
    expect(payload.total).toBe(5)
    expect(payload.total_gravada).toBe(4.24)
    expect(payload.total_igv).toBe(0.76)
    expect(payload.items[0].total).toBe(5)
    // la fila persistida también lleva el total prorrateado
    expect(sb.captured.boletaInsert?.total).toBe(5)
  })

  it("orden con descuento + delivery → boleta = (subtotal−desc) + delivery", async () => {
    const { registrarYEmitirBoleta } = await import("@/lib/sunat/lifecycle")
    const orden = {
      id: "ord-2",
      estado: "pagado",
      total: 20,
      descuento: 45,
      delivery: 15,
      items: [{ producto: { sku: "SPIRCRU0001", descripcion: "Spirusol crunchie", precio_publico: 55, precio_oferta: 50 }, cantidad: 1 }],
      cliente_snapshot: { nombre: "Jose", apellido: "Escalante", dni: "", email: "j@x.com", distrito: "Miraflores", direccion: "Av. Lima 123" },
    }
    const sb = makeSupabase(orden)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await registrarYEmitirBoleta("ord-2", sb as any)

    expect(res.ok).toBe(true)
    const payload = emitirMock.mock.calls[0][0]
    expect(payload.total).toBe(20)
    expect(payload.items).toHaveLength(2)
    expect(payload.items[0].total).toBe(5)   // producto con descuento
    expect(payload.items[1].codigo).toBe("ENVIO")
    expect(payload.items[1].total).toBe(15)  // delivery completo
  })
})
