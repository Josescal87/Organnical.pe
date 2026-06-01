import { describe, it, expect, vi, beforeEach } from "vitest"

// --- mocks de dependencias ---
const boletaMock = vi.fn().mockResolvedValue(undefined) // el link se lee de la orden, no del retorno
vi.mock("@/lib/sunat", () => ({ registrarYEmitirBoleta: (...a: unknown[]) => boletaMock(...a) }))

const createVentaMock = vi.fn().mockResolvedValue({ ventaId: "venta-1", numOrden: "100" })
vi.mock("@/lib/ruby-integration", () => ({ createVentaEnRuby: (...a: unknown[]) => createVentaMock(...a) }))

const emailMock = vi.fn().mockResolvedValue(undefined)
vi.mock("@/lib/emails", () => ({ sendStoreSaleNotification: (...a: unknown[]) => emailMock(...a) }))
vi.mock("@/lib/store-notify", () => ({ getStoreSaleNotifyEmails: () => ["a@x.com"] }))

// --- mock supabase: claim + lectura de orden + update id_venta_ruby ---
const claimResult = { rowsClaimed: 1 }
const ordenRow = {
  id: "ord-1", items: [{ producto: { descripcion: "Spirusol", sku: "SP1", precio_publico: 50, precio_oferta: null }, cantidad: 2 }],
  cliente_snapshot: { nombre: "Ana", apellido: "Pérez", celular: "987654321", distrito: "Miraflores", direccion: "Av. Lima 123", dni: "12345678" },
  total: 110, delivery: 10, boleta_link: "https://b.pe/1",
}
const updateIdVentaMock = vi.fn().mockResolvedValue({ error: null })
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from: () => ({
      update: (vals: Record<string, unknown>) => {
        if ("fulfillment_claimed_at" in vals) {
          return { eq: () => ({ is: () => ({ select: () => Promise.resolve({ data: claimResult.rowsClaimed ? [{ id: "ord-1" }] : [], error: null }) }) }) }
        }
        return { eq: () => updateIdVentaMock() } // update id_venta_ruby
      },
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: ordenRow, error: null }) }) }),
    }),
  }),
}))

import { fulfillPaidOrder } from "@/lib/store-fulfillment"

beforeEach(() => {
  boletaMock.mockClear(); createVentaMock.mockClear(); emailMock.mockClear(); updateIdVentaMock.mockClear()
  claimResult.rowsClaimed = 1
})

describe("fulfillPaidOrder", () => {
  it("emite boleta, crea venta y envía correo cuando gana el claim", async () => {
    await fulfillPaidOrder("ord-1")
    expect(boletaMock).toHaveBeenCalledTimes(1)
    expect(createVentaMock).toHaveBeenCalledTimes(1)
    expect(emailMock).toHaveBeenCalledTimes(1)
    const emailArg = emailMock.mock.calls[0][0]
    expect(emailArg.numOrden).toBe("100")
    expect(emailArg.direccion).toBe("Av. Lima 123")
    expect(emailArg.boletaLink).toBe("https://b.pe/1")
  })

  it("si NO gana el claim, igual emite boleta pero NO crea venta ni correo", async () => {
    claimResult.rowsClaimed = 0
    await fulfillPaidOrder("ord-1")
    expect(boletaMock).toHaveBeenCalledTimes(1)
    expect(createVentaMock).not.toHaveBeenCalled()
    expect(emailMock).not.toHaveBeenCalled()
  })

  it("un fallo en la boleta no impide venta+correo", async () => {
    boletaMock.mockRejectedValueOnce(new Error("sunat caído"))
    await fulfillPaidOrder("ord-1")
    expect(createVentaMock).toHaveBeenCalledTimes(1)
    expect(emailMock).toHaveBeenCalledTimes(1)
  })
})
