import { describe, it, expect } from "vitest"
import { calcularItem, aplicarDescuentoProrrateado } from "@/lib/sunat/types"
import type { BoletaItem } from "@/lib/sunat/types"

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
