// Validadores de campos de cliente peruano para checkout.
// MP Perú y SUNAT son estrictos con estos formatos.

export function isValidDni(s: string): boolean {
  return /^\d{8}$/.test(s)
}

export function isValidCelular(s: string): boolean {
  return /^9\d{8}$/.test(s)
}

export function sanitizeDigits(s: string): string {
  return s.replace(/\D/g, "")
}
