import { describe, it, expect, afterEach } from "vitest"
import { getStoreSaleNotifyEmails } from "@/lib/store-notify"

describe("getStoreSaleNotifyEmails", () => {
  const original = process.env.STORE_SALE_NOTIFY_EMAILS
  afterEach(() => { process.env.STORE_SALE_NOTIFY_EMAILS = original })

  it("usa el default de 3 socios cuando no hay env var", () => {
    delete process.env.STORE_SALE_NOTIFY_EMAILS
    expect(getStoreSaleNotifyEmails()).toEqual([
      "jose@futura-farms.com",
      "raul@futura-farms.com",
      "michel@futura-farms.com",
    ])
  })

  it("parsea la env var separada por comas y limpia espacios/vacíos", () => {
    process.env.STORE_SALE_NOTIFY_EMAILS = " a@x.com , b@x.com ,, "
    expect(getStoreSaleNotifyEmails()).toEqual(["a@x.com", "b@x.com"])
  })
})
