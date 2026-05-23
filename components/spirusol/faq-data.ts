/**
 * Datos del FAQ Spirusol — archivo aparte (NO `"use client"`) para que tanto
 * el componente cliente `BrandFAQ.tsx` como el server component `JsonLdScripts.tsx`
 * puedan importarlo. Si esta constante vive dentro de un módulo `"use client"`,
 * Next.js la convierte en un client reference proxy y `.map()` falla en SSR
 * (TypeError: FAQ_ITEMS.map is not a function).
 *
 * Las 8 preguntas del spec §5.9 + safety markers de §8.
 */

export interface FaqItem {
  q: string
  a: string
  safety?: boolean
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "¿Qué es la espirulina y por qué se considera un superalimento?",
    a: "La espirulina (Arthrospira platensis) es una microalga acuática. Se considera superalimento por su densidad nutricional: aporta proteína vegetal completa con todos los aminoácidos esenciales, hierro biodisponible, B-complex, clorofila y antioxidantes. En el caso de Spirusol, el Informe IIN N° 000114-2025 verificó 67.33% de proteína, 9.69 mg/100g de hierro y 13,648 µmol Trolox/100g de capacidad antioxidante.",
  },
  {
    q: "¿Cuál es la diferencia entre el Polvo y el Crunchie?",
    a: "Ambos son 100% espirulina con el mismo perfil nutricional — sale del mismo cultivo en Arequipa. Cambia el formato: el Polvo se disuelve bien en líquidos (smoothies, jugos, masas), mientras que el Crunchie son gránulos crocantes ideales como topping para yogurt, bowls y ensaladas, o para comer puro como snack.",
  },
  {
    q: "¿Cuánto debo tomar al día?",
    a: "El uso culinario habitual es 1 cucharadita (5 g) por porción. Para ajustar la cantidad a tu rutina específica — sobre todo si tienes anemia diagnosticada, fatiga crónica o estás bajo seguimiento médico — conversa con un médico integrativo de Organnical para que te oriente.",
  },
  {
    q: "¿Tiene efectos secundarios? ¿Quién no debería tomarla?",
    a: "La espirulina es bien tolerada por la mayoría de personas. Sin embargo, debes consultar con un médico antes de incorporarla si: tomas anticoagulantes (la espirulina aporta vitamina K y puede interferir con warfarina); tienes una enfermedad autoinmune (lupus, artritis reumatoide, esclerosis múltiple), porque puede estimular el sistema inmune; o tienes fenilcetonuria (PKU), porque contiene fenilalanina. En todos esos casos, la indicación médica es obligatoria.",
    safety: true,
  },
  {
    q: "¿Por qué Spirusol vs otras espirulinas en el mercado?",
    a: "Spirusol se cultiva en Arequipa bajo radiación solar excepcionalmente alta, lo que favorece densidad nutricional. Greenner SAC seca a baja temperatura para preservar nutrientes. Cada lote tiene Registro Sanitario MINSA vigente (M5828924N), certificación Vegan Verified internacional y análisis del IIN — todos los valores nutricionales del rotulado y del marketing están respaldados por estos documentos, que están disponibles para revisión en esta misma página.",
  },
  {
    q: "¿Cómo guardo el producto y cuánto dura abierto?",
    a: "Vida útil: 12 meses desde la fecha de fabricación, indicada en el envase. Guarda el doypack cerrado en un lugar seco, fresco y protegido de la luz directa. Una vez abierto, mantén el cierre hermético del doypack y consume preferentemente en 60 días para conservar color y sabor óptimos.",
  },
  {
    q: "¿De dónde viene? ¿Cómo se certifica que es vegana?",
    a: "Spirusol es producida por Greenner SAC en Moquegua, con cultivos en Arequipa (Perú). La certificación vegana es VeganVerified.org (ID 05-260281-1), una entidad internacional independiente que audita la cadena de producción para confirmar ausencia de ingredientes animales y que ningún proceso involucra testeo en animales. Vigencia hasta febrero 2027.",
  },
  {
    q: "¿Hacen envío a todo el Perú?",
    a: "Sí. Organnical hace envío a todo el Perú vía courier. Envío gratis desde S/300 de compra; debajo de ese monto se cobra delivery según destino. Los pedidos en Lima Metropolitana llegan en 24–48 h; provincias en 3–6 días hábiles.",
  },
]
