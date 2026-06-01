import { describe, it, expect, vi, beforeEach } from "vitest"

const sendMock = vi.fn().mockResolvedValue({ error: null })
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

import { sendStoreSaleNotification } from "@/lib/emails"

describe("sendStoreSaleNotification", () => {
  beforeEach(() => sendMock.mockClear())

  it("no manda nada si la lista de destinatarios está vacía", async () => {
    await sendStoreSaleNotification({
      to: [], numOrden: 1, clienteNombre: "x", celular: "9", distrito: "y",
      direccion: "z", items: [], total: 0, boletaLink: null,
    })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it("incluye dirección, distrito, celular y num_orden en el HTML", async () => {
    await sendStoreSaleNotification({
      to: ["a@x.com"], numOrden: 42, clienteNombre: "Ana Pérez",
      celular: "987654321", distrito: "Miraflores", direccion: "Av. Lima 123",
      items: [{ descripcion: "Spirusol", qty: 2, precio: 50 }],
      total: 110, boletaLink: "https://b.pe/1",
    })
    expect(sendMock).toHaveBeenCalledTimes(1)
    const arg = sendMock.mock.calls[0][0]
    expect(arg.to).toEqual(["a@x.com"])
    expect(arg.subject).toContain("#42")
    expect(arg.html).toContain("Av. Lima 123")
    expect(arg.html).toContain("Miraflores")
    expect(arg.html).toContain("987654321")
    expect(arg.html).toContain("Spirusol")
    expect(arg.html).toContain("https://b.pe/1")
  })
})
