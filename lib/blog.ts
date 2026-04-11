export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  dateFormatted: string
  author: string
  authorRole: string
  category: string
  tags: string[]
  image: string
  readTime: number
  content: ContentBlock[]
}

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=630&q=85`

export const posts: BlogPost[] = [
  {
    slug: "cannabis-medicinal-fibromialgia-peru",
    title: "Cannabis medicinal para fibromialgia: Una nueva esperanza contra el dolor crónico en Perú",
    excerpt:
      "Una nueva investigación revela por qué el cannabis medicinal podría cambiar la vida de pacientes con fibromialgia. El dolor crónico afecta a miles de personas en Perú y muchos no reciben tratamiento adecuado.",
    date: "2025-12-15",
    dateFormatted: "15 de diciembre de 2025",
    author: "Equipo Organnical",
    authorRole: "Medicina Integrativa",
    category: "Dolor Crónico",
    tags: ["cannabis medicinal", "fibromialgia", "dolor crónico", "formulación personalizada"],
    image: u("1571019613454-1cb2f99b2d8b"),
    readTime: 7,
    content: [
      {
        type: "p",
        text: "El dolor crónico afecta a miles de personas en Perú. Para muchos, este dolor se convierte en un compañero constante que aparece cada día y condiciona cómo se trabaja, cómo se duerme y cómo se disfruta incluso de las actividades más simples.",
      },
      { type: "h2", text: "La realidad del dolor crónico en Lima y Perú" },
      {
        type: "p",
        text: "Un estudio en Lima Metropolitana reveló que más del 65% de adultos ha experimentado dolor en los últimos tres meses, y aproximadamente 40% vive con dolor crónico. La mayoría no recibe tratamiento adecuado.",
      },
      {
        type: "p",
        text: "Para la fibromialgia específicamente, estudios peruanos estiman una prevalencia cercana al 3%. Muchas personas dependen exclusivamente de antiinflamatorios, que pueden causar gastritis, daño renal o hipertensión con el tiempo.",
      },
      { type: "h2", text: "Avances en la regulación y el cannabis medicinal" },
      {
        type: "p",
        text: "Perú ha avanzado en la regulación del cannabis medicinal en años recientes, abriendo la posibilidad de explorar terapias más naturales y con mejor tolerancia. Una revisión reciente sugiere que el cannabis medicinal podría ser útil en diversas formas de dolor crónico.",
      },
      { type: "h2", text: "El impacto del THC en la modulación del dolor" },
      {
        type: "p",
        text: "Un estudio fundamental publicado en 2025 en Journal of Cannabis Research analizó los efectos del THC en mujeres con fibromialgia mediante un diseño aleatorizado, doble ciego y controlado con placebo. Los resultados mostraron que el THC:",
      },
      {
        type: "ul",
        items: [
          "Redujo significativamente el dolor espontáneo",
          "Mejoró la respuesta de Offset Analgesia (OA)",
          "Ayudó al sistema nervioso a filtrar mejor las señales dolorosas",
        ],
      },
      {
        type: "p",
        text: "El mecanismo afecta cómo el cerebro procesa y regula ese dolor, en lugar de solo abordar la sensación inmediata. Este es un avance significativo para pacientes que no han encontrado alivio con tratamientos convencionales.",
      },
      { type: "h2", text: "Ecosistema clínico y medicina personalizada" },
      {
        type: "p",
        text: "Organnical ha construido uno de los ecosistemas clínicos más sólidos del Perú en el uso responsable y médico del cannabis medicinal. Estos servicios incluyen:",
      },
      {
        type: "ul",
        items: [
          "Telemedicina especializada con médicos certificados",
          "Protocolos basados en evidencia científica actualizada",
          "Formación continua para médicos",
          "Seguimiento activo de pacientes",
        ],
      },
      {
        type: "p",
        text: "Hasta la fecha, hemos atendido a más de 4,000 pacientes peruanos, muchos con dolor crónico que no había encontrado alivio previo con tratamientos convencionales.",
      },
      { type: "h2", text: "Conclusión" },
      {
        type: "p",
        text: "La evidencia crece, la regulación lo permite, y las instituciones especializadas están preparadas. El futuro del manejo del dolor en el Perú ya está cambiando hacia un modelo de salud más natural, más personalizado y más alineado con las necesidades reales de las personas.",
      },
      {
        type: "quote",
        text: "El cannabis medicinal no reemplaza la atención médica integral, pero bajo supervisión responsable puede ser una herramienta poderosa para quienes el dolor ha sido una constante.",
      },
    ],
  },
  {
    slug: "cannabis-para-insomnio-benzodiacepinas",
    title: "Cannabis, Insomnio y la trampa de las Benzodiacepinas: Lo que deben saber los profesionales y los adultos mayores",
    excerpt:
      "El insomnio afecta significativamente a profesionales activos y adultos mayores. Las benzodiacepinas, tratamiento convencional durante décadas, generan dependencia y riesgos serios. El cannabis medicinal emerge como alternativa con evidencia creciente.",
    date: "2025-12-15",
    dateFormatted: "15 de diciembre de 2025",
    author: "Equipo Organnical",
    authorRole: "Medicina Integrativa",
    category: "Sueño",
    tags: ["insomnio", "benzodiacepinas", "cannabis medicinal", "adultos mayores", "sueño"],
    image: u("1586281380349-83f59d5c7e37"),
    readTime: 9,
    content: [
      {
        type: "p",
        text: "El insomnio afecta significativamente a profesionales activos y adultos mayores. Factores como ansiedad crónica, presión laboral y rumiación nocturna se combinan con el uso prolongado de benzodiacepinas, resultando en noches fragmentadas, concentración reducida, irritabilidad y deterioro cognitivo.",
      },
      { type: "h2", text: "La trampa de las benzodiacepinas" },
      {
        type: "p",
        text: "Durante décadas, las benzodiacepinas han sido el tratamiento convencional para el insomnio. Aunque efectivas inicialmente, su uso crónico —especialmente en adultos mayores— genera riesgos significativos: caídas, deterioro cognitivo y dependencia.",
      },
      {
        type: "p",
        text: "Organizaciones como la American Geriatrics Society recomiendan evitar su uso crónico. Sin embargo, muchos pacientes no pueden suspenderlas sin experimentar rebote severo de ansiedad y empeoramiento del sueño, creando precisamente la trampa que les da nombre.",
      },
      { type: "h2", text: "Evidencia actual del cannabis medicinal para el sueño" },
      {
        type: "p",
        text: "El interés clínico en cannabis medicinal crece como alternativa terapéutica, no como moda. La investigación muestra:",
      },
      {
        type: "ul",
        items: [
          "Un ensayo clínico aleatorizado con extracto THC:CBD (ZTL-101) demostró reducciones significativas en la severidad del insomnio comparado con placebo",
          "Un metaanálisis incluyendo más de 1,000 pacientes encontró mejoras en calidad del sueño, particularmente con formulaciones que incluyen THC",
          "El CBD aislado ha mostrado resultados mixtos o mínimos",
          "Una revisión 2024 en JAMA Internal Medicine concluyó que los cannabinoides pueden beneficiar a algunos pacientes",
        ],
      },
      { type: "h2", text: "Marco clínico para uso seguro" },
      {
        type: "p",
        text: "El Dr. Jordan Tishler, MD, presidente de la Association of Cannabis Specialists, propone un enfoque clave: tratar el cannabis como medicamento, con dosis precisas e individualización.",
      },
      {
        type: "p",
        text: "Consideraciones fundamentales para un uso responsable:",
      },
      {
        type: "ul",
        items: [
          "El cannabis debe prescribirse con atención especial a cómo afecta la arquitectura del sueño",
          "Bien prescrito, parece significativamente más seguro que el uso crónico de benzodiacepinas",
          "Nunca debe reemplazar la evaluación de causas médicas, higiene del sueño y terapia cognitivo-conductual para insomnio (CBT-I)",
          "Para profesionales con ansiedad, puede disminuir la hiperactivación mental nocturna con dosis cuidadosamente controladas",
          "Dosis altas de THC pueden agravar ansiedad y afectar el rendimiento diurno",
        ],
      },
      { type: "h2", text: "Consideraciones especiales para adultos mayores" },
      {
        type: "p",
        text: "Para adultos mayores, la situación es más delicada. Enfrentan mayores riesgos por benzodiacepinas y son más sensibles al THC e interacciones medicamentosas, especialmente con CBD. Si se utiliza cannabis, debe ser parte de un plan supervisado para reducir gradualmente benzodiacepinas.",
      },
      {
        type: "quote",
        text: "El cannabis no es un reemplazo mágico para medicamentos tradicionales. Bajo supervisión médica rigurosa, puede ser una herramienta potencialmente más segura para ciertos pacientes con insomnio crónico.",
      },
      { type: "h2", text: "Conclusión" },
      {
        type: "p",
        text: "La investigación continúa avanzando y el diálogo médico está modernizándose. En Organnical acompañamos a cada paciente con protocolos individualizados, siempre dentro de un marco médico serio y supervisado.",
      },
    ],
  },
  {
    slug: "cannabis-medicinal-adultos-mayores-geriatria",
    title: "Medicina con cannabis en adultos mayores: Una perspectiva conservadora y basada en evidencia para la atención geriátrica",
    excerpt:
      "A medida que las poblaciones envejecen, el interés por el cannabis medicinal en adultos mayores ha crecido. Este artículo adopta una visión conservadora y basada en investigación para la atención geriátrica en el Perú.",
    date: "2025-12-15",
    dateFormatted: "15 de diciembre de 2025",
    author: "Equipo Organnical",
    authorRole: "Medicina Integrativa",
    category: "Medicina",
    tags: ["adultos mayores", "geriatría", "cannabis medicinal", "farmacia magistral", "bienestar"],
    image: u("1576091160399-112ba8d25d1d"),
    readTime: 10,
    content: [
      {
        type: "p",
        text: "A medida que las poblaciones envejecen y aumentan las tasas de enfermedades crónicas, el interés por el cannabis medicinal en adultos mayores ha crecido significativamente. Los especialistas en geriatría enfrentan la tarea compleja de equilibrar seguridad, evidencia, resultados funcionales y calidad de vida para una población vulnerable.",
      },
      { type: "h2", text: "El contexto demográfico en el Perú" },
      {
        type: "p",
        text: "En Perú, el envejecimiento poblacional avanza rápidamente. La proporción de personas de 60 años o más representa aproximadamente el 14% de la población nacional. Datos del INEI muestran que:",
      },
      {
        type: "ul",
        items: [
          "El 60.8% de los adultos mayores presenta al menos una comorbilidad (hipertensión, diabetes)",
          "Más de la mitad tiene riesgo cardiovascular muy alto",
          "Para 2050, los adultos mayores podrían representar el 22% de la población peruana",
        ],
      },
      { type: "h2", text: "La realidad del insomnio, el dolor y la ansiedad en adultos mayores" },
      {
        type: "p",
        text: "Para muchos adultos mayores, los problemas de sueño no son simplemente noches inquietas, sino una combinación que contribuye a lapsos de memoria, mayor riesgo de caídas, fatiga diurna e irritabilidad. El dolor crónico derivado de artritis o neuropatías, junto con la ansiedad persistente, crean un ciclo de malestar que acelera el deterioro funcional.",
      },
      { type: "h2", text: "Las herramientas tradicionales y sus riesgos" },
      {
        type: "p",
        text: "Durante décadas, el tratamiento ha dependido de benzodiacepinas, Z-drugs, opioides y antidepresivos sedantes. Los Criterios Beers de la American Geriatrics Society destacan a las benzodiacepinas como potencialmente inapropiadas en adultos mayores debido al aumento de caídas, deterioro cognitivo y delirium.",
      },
      { type: "h2", text: "Evidencia del cannabis en adultos mayores" },
      {
        type: "p",
        text: "El cannabis actúa sobre el sistema endocannabinoide, que regula sueño, dolor, apetito y estado de ánimo. La evidencia revisada por pares muestra:",
      },
      {
        type: "ul",
        items: [
          "Un ensayo controlado aleatorizado con extracto THC:CBD (ZTL-101) mejoró la severidad del insomnio",
          "Una revisión sistemática encontró mejoras en calidad subjetiva del sueño con formulaciones que incluían THC",
          "Una cohorte de dos años en mayores de 65 años mostró reducción del dolor y disminución significativa del uso de opioides sin eventos adversos graves",
        ],
      },
      { type: "h2", text: "El enfoque clínico conservador para geriatría" },
      {
        type: "p",
        text: "El Dr. Jordan Tishler, médico internista formado en Harvard, propone principios conservadores para adultos mayores:",
      },
      {
        type: "ol",
        items: [
          "Tratar el cannabis como un medicamento real con dosis precisas, titulación lenta y objetivos definidos",
          "Utilizar formulaciones balanceadas de dosis baja (THC muy bajo + CBD) para mejor perfil de seguridad",
          "Evitar la inhalación; preferir vías oral o sublingual",
          "Comenzar con 0.5–1 mg de THC equivalente e incrementar solo según respuesta clínica",
          "Usar como herramienta de deprescripción para reducir benzodiacepinas y opioides",
          "Monitorear estrechamente caídas, cognición y función cardiovascular",
        ],
      },
      { type: "h2", text: "Una perspectiva cautelosa pero prometedora" },
      {
        type: "p",
        text: "Los adultos mayores merecen terapias que preserven autonomía, reduzcan sufrimiento y minimicen el daño asociado a medicamentos. El cannabis, utilizado cuidadosamente y bajo supervisión médica, puede mejorar el sueño, el dolor, la ansiedad y la polifarmacia.",
      },
      {
        type: "quote",
        text: "Comenzar bajo, avanzar lento, monitorear siempre y priorizar la funcionalidad. El cannabis no reemplaza la atención geriátrica integral, pero en manos clínicas adecuadas puede convertirse en una herramienta valiosa.",
      },
    ],
  },
  {
    slug: "dolor-vulvar-cronico-cannabis-medicinal",
    title: "Dolor vulvar crónico: un problema silencioso donde el cannabis medicinal empieza a ayudar",
    excerpt:
      "Entre el 10 y 16% de mujeres experimentará dolor crónico vulvar en algún momento sin causa clara. Un nuevo estudio sobre gel con CBD y mirceno abre una nueva puerta terapéutica para la vulvodinia y vestibulodinia.",
    date: "2025-11-19",
    dateFormatted: "19 de noviembre de 2025",
    author: "Dra. Estefanía Poma",
    authorRole: "Médico General · Organnical",
    category: "Salud Femenina",
    tags: ["cannabis medicinal", "CBD tópico", "dolor íntimo femenino", "vestibulodinia", "vulvodinia"],
    image: u("1552058544-f2b08422138a"),
    readTime: 8,
    content: [
      {
        type: "p",
        text: "Hablar sobre dolor vulvar sigue siendo difícil, incluso en contextos médicos. Entre un 10 y 16% de mujeres experimentará dolor crónico vulvar en algún momento sin causa clara, denominado vulvodinia médicamente. La forma más frecuente es la vestibulodinia, concentrada en la entrada vaginal.",
      },
      {
        type: "p",
        text: "El dolor se describe como ardiente, quemazón, pinchazos o sensación de cortadas, que empeora con contacto sexual, tampones, copa menstrual o actividades como ciclismo. En Perú existe un patrón de infradiagnóstico y falta de opciones terapéuticas modernas.",
      },
      { type: "h2", text: "¿Qué es la vulvodinia y la vestibulodinia?" },
      {
        type: "ul",
        items: [
          "Vulvodinia: dolor crónico vulvar (mínimo 3 meses) sin causa identificable",
          "Vestibulodinia: dolor crónico localizado en el vestíbulo vaginal",
        ],
      },
      {
        type: "p",
        text: "Físicamente se asocia con nervios hipersensibles, inflamación local y tensión en los músculos del piso pélvico, generando un ciclo donde el dolor genera miedo, contracción corporal y aumento del dolor.",
      },
      { type: "h2", text: "Tratamientos actuales: Ayudan, pero no siempre alcanzan" },
      {
        type: "p",
        text: "Los enfoques terapéuticos establecidos incluyen:",
      },
      {
        type: "ol",
        items: [
          "Cuidados básicos: ropa interior de algodón, evitar jabones fuertes, lubricantes apropiados",
          "Cremas locales como lidocaína previa a relaciones sexuales",
          "Fisioterapia de piso pélvico: relajación muscular y trabajo respiratorio",
          "Apoyo psicológico y sexológico",
          "Terapia cognitivo-conductual combinada con fisioterapia",
        ],
      },
      {
        type: "p",
        text: "Muchas mujeres continúan con dolor significativo a pesar de estos tratamientos, lo que genera interés en tratamientos tópicos de cannabis medicinal como geles, cremas y ungüentos.",
      },
      { type: "h2", text: "Nuevo estudio: Gel con CBD + Mirceno para vestibulodinia" },
      {
        type: "p",
        text: "Un ensayo clínico publicado en Biomedicines (2025) evaluó un gel con CBD al 5% + mirceno en 40 mujeres con vestibulodinia (20 con tratamiento activo, 20 con placebo) durante 60 días de aplicación diaria.",
      },
      {
        type: "p",
        text: "Resultados principales:",
      },
      {
        type: "ul",
        items: [
          "El grupo activo mostró mayor reducción de dolor que el placebo",
          "El dolor sexual se redujo aproximadamente a la mitad",
          "El gel fue bien tolerado sin efectos adversos graves",
          "Es el primer ensayo multicéntrico que demuestra que un gel tópico con cannabinoides puede reducir el dolor vulvar crónico",
        ],
      },
      {
        type: "p",
        text: "El CBD actúa sobre inflamación y dolor neuropático (receptor TRPV1), mientras que el mirceno contribuye con propiedades analgésicas e antiinflamatorias.",
      },
      { type: "h2", text: "Tratamientos personalizados en Organnical" },
      {
        type: "p",
        text: "Ninguna mujer debe normalizar el dolor vulvar. Es un problema médico real, no psicológico ni imaginario. En Organnical ofrecemos evaluación integral del dolor vulvar, tratamientos personalizados con cannabis medicinal (tópicos y sistémicos), receta médica, productos regulados y seguimiento continuo.",
      },
      {
        type: "quote",
        text: "El estudio italiano representa una oportunidad de personalizar tratamientos sin reemplazar terapias estándar, sino integrándolas dentro de un abordaje médico serio. — Dra. Estefanía Poma",
      },
    ],
  },
  {
    slug: "encuentra-tu-balance-organnical",
    title: "Cannabis medicinal y ansiedad: la nueva frontera del bienestar mental",
    excerpt:
      "En los últimos años, la ansiedad se ha convertido en uno de los desafíos principales de salud mental. El uso terapéutico de cannabinoides emerge como alternativa respaldada científicamente para el manejo integral de la ansiedad.",
    date: "2025-11-11",
    dateFormatted: "11 de noviembre de 2025",
    author: "Equipo Organnical",
    authorRole: "Medicina Integrativa",
    category: "Ansiedad",
    tags: ["cannabis medicinal", "CBD", "ansiedad", "bienestar mental", "aceites sublinguales"],
    image: u("1506126613408-eca07ce68773"),
    readTime: 5,
    content: [
      {
        type: "p",
        text: "En los últimos años, la ansiedad se ha convertido en uno de los desafíos principales de salud mental a nivel mundial. En Perú, muchas personas recurren a medicamentos como clonazepam o alprazolam para manejar el estrés y ataques de pánico. Sin embargo, el uso prolongado de estos fármacos puede generar dependencia y efectos secundarios importantes.",
      },
      { type: "h2", text: "El sistema endocannabinoide: el equilibrio entre cuerpo y mente" },
      {
        type: "p",
        text: "El sistema endocannabinoide (SEC) es una red biológica presente en todos los seres humanos que regula funciones esenciales como el sueño, apetito, memoria, estado de ánimo y respuesta al estrés.",
      },
      {
        type: "p",
        text: "Cuando el SEC se desbalancea por estrés o ansiedad, el cuerpo reacciona con tensión, insomnio e irritabilidad. Los fitocompuestos naturales presentes en el cannabis medicinal, particularmente el CBD, pueden ayudar a restablecer la armonía interna actuando sobre receptores específicos del cerebro (CB1 y CB2).",
      },
      { type: "h2", text: "CBD y ansiedad: cómo actúa" },
      {
        type: "p",
        text: "El CBD (cannabidiol) es el compuesto más utilizado para el tratamiento natural de la ansiedad. A diferencia del THC, no produce efectos psicoactivos, permitiendo su uso seguro en tratamientos supervisados. Estudios científicos han demostrado que el CBD:",
      },
      {
        type: "ul",
        items: [
          "Regula neurotransmisores como la serotonina, mejorando el ánimo y bienestar",
          "Reduce la hiperactividad cerebral en zonas asociadas al miedo",
          "Promueve un descanso reparador sin generar somnolencia diurna",
        ],
      },
      { type: "h2", text: "Una alternativa con menos efectos secundarios" },
      {
        type: "p",
        text: "A diferencia de las benzodiacepinas, el uso médico del CBD muestra un perfil de seguridad superior y bajo riesgo de dependencia. Los posibles efectos secundarios, como sequedad bucal o somnolencia leve, suelen ser temporales y ajustables según la dosis.",
      },
      { type: "h2", text: "El desafío en Perú: hacia un uso responsable" },
      {
        type: "p",
        text: "En Perú, el consumo prolongado de ansiolíticos sin receta sigue siendo un problema. Según la DIGEMID, el acceso irregular a estos fármacos favorece la automedicación y agrava los cuadros de ansiedad. El tratamiento con derivados naturales busca atacar la causa, no solo los síntomas.",
      },
      {
        type: "quote",
        text: "La llegada de la medicina natural basada en cannabinoides representa una nueva frontera en el tratamiento de la ansiedad: una forma de sanar que combina evidencia científica, tecnología y humanidad.",
      },
      { type: "h2", text: "Hacia una medicina más consciente" },
      {
        type: "p",
        text: "Organnical acompaña a cada paciente con un enfoque de medicina personalizada, brindando consultas médicas online con especialistas, productos de calidad farmacéutica (aceites sublinguales, formulaciones personalizadas) y acompañamiento y seguimiento constante. Porque la salud mental también merece opciones naturales, seguras y humanas.",
      },
    ],
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug)
}
