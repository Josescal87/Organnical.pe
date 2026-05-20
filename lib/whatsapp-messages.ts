export const WA_NUMBER = "51952476574"

// Sub-path matches — checked first (most specific wins). Order matters.
const PATH_MESSAGES: [string, string][] = [
  ["/dashboard/paciente/recetas",    "Hola, soy paciente de Organnical y tengo una pregunta sobre mi receta médica"],
  ["/dashboard/paciente/citas",      "Hola, soy paciente de Organnical y tengo una consulta sobre mi cita agendada"],
  ["/dashboard/paciente/catalogo",   "Hola, soy paciente de Organnical y quiero comprar los productos de mi receta, ¿me pueden guiar?"],
  ["/dashboard/paciente/historial",  "Hola, soy paciente de Organnical y quiero revisar mi historial médico"],
  ["/dashboard/paciente/perfil",     "Hola, necesito ayuda con mi perfil de paciente en Organnical"],
  ["/dashboard/paciente/consentimiento", "Hola, tengo una duda sobre los consentimientos médicos de Organnical"],
  ["/dashboard/paciente",            "Hola, soy paciente de Organnical y necesito ayuda con mi cuenta o consulta"],
  ["/dashboard/medico",              "Hola, necesito soporte técnico del portal médico de Organnical"],
  ["/cuenta",                        "Hola, tengo una pregunta sobre mi pedido o cuenta en Organnical"],
  ["/consulta-express",              "Hola, me interesa la consulta express de Organnical por S/30, ¿cómo funciona?"],
  ["/agendar",                       "Hola, estoy queriendo agendar una consulta médica en Organnical, ¿me pueden ayudar?"],
  ["/checkout",                      "Hola, tengo un problema al finalizar mi compra en Organnical"],
  ["/login-medicos",                 "Hola, no puedo ingresar al portal médico de Organnical"],
  ["/login",                         "Hola, no puedo ingresar a mi cuenta de Organnical, ¿me pueden ayudar?"],
  ["/registro",                      "Hola, quiero registrarme como paciente en Organnical, ¿qué necesito?"],
  ["/tienda",                        "Hola, estoy viendo la tienda de Organnical y quiero consultar sobre un producto"],
  ["/productos",                     "Hola, tengo una pregunta sobre uno de los productos de Organnical"],
  ["/blog",                          "Hola, leí un artículo en el blog de Organnical y quiero saber más"],
  ["/medicos",                       "Hola, necesito soporte técnico del portal médico de Organnical"],
]

// Home / fallback
const DEFAULT_MESSAGE = "Hola, vi la web de Organnical y me gustaría saber más sobre sus tratamientos con cannabis medicinal"

export function getWaMessage(pathname: string): string {
  for (const [prefix, msg] of PATH_MESSAGES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return msg
  }
  return DEFAULT_MESSAGE
}

export function buildWaUrl(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}
