export const WA_NUMBER = "51952476574"

export const WA_MESSAGES: Record<string, string> = {
  default:   "Hola, quiero consultar",
  tienda:    "Hola, tengo una pregunta sobre un producto",
  productos: "Hola, tengo una pregunta sobre un producto",
  agendar:   "Hola, quiero agendar una consulta",
  express:   "Hola, quiero una consulta express",
  botica:    "Hola, necesito ayuda con mi receta",
  dashboard: "Hola, necesito ayuda con mi cuenta",
  medicos:   "Hola, necesito soporte técnico del portal médico",
  login:     "Hola, necesito ayuda para ingresar a mi cuenta",
  registro:  "Hola, quiero registrarme en Organnical",
}

export function getWaMessage(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0] ?? ""
  return WA_MESSAGES[seg] ?? WA_MESSAGES.default
}

export function buildWaUrl(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}
