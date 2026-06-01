const DEFAULT_NOTIFY = [
  "jose@futura-farms.com",
  "raul@futura-farms.com",
  "michel@futura-farms.com", // Michel Llontop (socio)
]

/**
 * Destinatarios del aviso de venta de producto (coordinación de despacho).
 * Lista explícita de negocio — NO usar getAdminEmails(): "coordinador de
 * despacho" es un concepto distinto de "admin del sistema".
 * Override por env var STORE_SALE_NOTIFY_EMAILS (CSV).
 */
export function getStoreSaleNotifyEmails(): string[] {
  const raw = process.env.STORE_SALE_NOTIFY_EMAILS
  if (!raw?.trim()) return DEFAULT_NOTIFY
  return raw.split(",").map((e) => e.trim()).filter(Boolean)
}
