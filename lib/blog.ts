export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }

export type SourceType = "pubmed" | "examine" | "nhs" | "mayo" | "minsa" | "cochrane" | "other"

export interface BlogSource {
  label: string
  url: string
  type: SourceType
}

export interface BlogRelatedProduct {
  slug: string
  reason: string
}

export type BlogPrimaryCta =
  | { kind: "teleconsulta"; specialty?: string; label?: string }
  | { kind: "product"; slug: string; label?: string }

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
  sources?: BlogSource[]
  relatedProducts?: BlogRelatedProduct[]
  primaryCta?: BlogPrimaryCta
}

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=630&q=85`

export const posts: BlogPost[] = [
  // Junio 2026 ──────────────────────────────────────────────────────────────
  {
    slug: "calor-o-frio-para-el-cuello-como-usarlos-bien",
    title: "Calor o frío para el cuello: cuándo cada uno y cómo usarlos sin errores",
    excerpt: "La cuellera térmica funciona — pero muchos la usan mal: la calientan de más, la dejan puesta media hora, o eligen calor cuando el cuerpo pedía frío. Guía rápida para que la termoterapia rinda en serio.",
    date: "2026-06-04",
    dateFormatted: "4 de junio de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Dolor Crónico",
    tags: ["cuello", "dolor cervical", "warmy", "termoterapia", "tensión"],
    image: "/images/blog/calor-o-frio-para-el-cuello-como-usarlos-bien.jpg",
    readTime: 7,
    primaryCta: { kind: "product", slug: "warmy", label: "Ver Warmy" },
    relatedProducts: [
      { slug: "warmy", reason: "Cuellera artesanal de semillas naturales. Calor en microondas o frío del refrigerador con la misma pieza, adaptable a la curva de la nuca." },
      { slug: "yumi-gumi-cero-drama-90", reason: "Si la tensión del cuello viene principalmente del estrés laboral o emocional, trabajar el componente nervioso acelera la recuperación física." },
    ],
    sources: [
      {
        label: "Garra G et al. — Heat or Cold Packs for Neck and Back Strain: A Randomized Controlled Trial of Efficacy. Academic Emergency Medicine, 2010.",
        url: "https://onlinelibrary.wiley.com/doi/10.1111/j.1553-2712.2010.00735.x",
        type: "pubmed",
      },
      {
        label: "Cervical Myofascial Pain — etiology, clinical presentation, management. StatPearls.",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK507825/",
        type: "pubmed",
      },
      {
        label: "Neck pain — symptoms, causes and self-care.",
        url: "https://www.nhs.uk/conditions/neck-pain/",
        type: "nhs",
      },
      {
        label: "Neck pain — symptoms and causes.",
        url: "https://www.mayoclinic.org/diseases-conditions/neck-pain/symptoms-causes/syc-20375581",
        type: "mayo",
      },
    ],
    content: [
      { type: "p", text: "Daniel compró una cuellera térmica el viernes. La probó tres veces el sábado y le pareció increíble — el cuello se sentía liviano por primera vez en meses. El lunes la usó otra vez y casi no notó cambio. El martes le pareció que le daba más rigidez. Para el jueves la guardó en un cajón pensando que 'no le había funcionado'." },
      { type: "p", text: "Lo que pasó con Daniel no es que la termoterapia no sirve. Es que la usó mal en cuatro detalles seguidos: la calentó demasiado, la dejó puesta media hora, la aplicó en el momento incorrecto del día, y eligió calor cuando el cuerpo le estaba pidiendo frío. Cada uno parece menor; sumados, neutralizan el efecto." },

      { type: "h2", text: "Calor o frío: la decisión que muchos hacen al revés" },
      { type: "p", text: "Un ensayo clínico controlado publicado en Academic Emergency Medicine comparó calor versus frío en pacientes con dolor agudo de cuello y espalda. El resultado: ambos producen alivio leve a moderado, sin diferencia estadística significativa entre uno y otro. La conclusión clínica importante no es 'da lo mismo' — es 'la elección depende del tipo de dolor, no de la moda'." },
      { type: "p", text: "La regla práctica, simplificada:" },
      { type: "ul", items: [
        "Calor — para tensión muscular crónica, contractura, dolor que aparece sin trauma específico, rigidez al despertar, dolor que empeora con frío ambiental.",
        "Frío — para inflamación aguda con calor o hinchazón visible, dolor después de un golpe o movimiento brusco (primeras 24 a 48 horas), dolor de cabeza tensional que empeora con calor, dolor pulsátil.",
      ]},
      { type: "p", text: "Cuando hay duda, una buena pregunta: ¿el dolor mejora cuando el ambiente está más cálido? Sí → calor. ¿Empeora con calor y mejora cuando me echo agua fría? → frío. El cuerpo suele dar la pista." },

      { type: "h2", text: "Calor: cómo hacerlo bien (y por qué la mayoría lo hace mal)" },
      { type: "p", text: "El calor funciona por dos mecanismos: vasodilatación local (más sangre, más oxígeno, más limpieza metabólica) y modulación del reflejo de contracción muscular. Pero ambos efectos tienen una ventana de respuesta limitada. Pasada esa ventana, el tejido se vuelve refractario — y peor, puede irritarse." },
      { type: "p", text: "Las reglas que cambian todo:" },
      { type: "ul", items: [
        "Calentar en intervalos cortos. Si usas microondas, 1 a 2 minutos máximo, en tramos de 30 segundos, verificando la temperatura con el dorso de la mano entre cada tramo. Calentar de un solo tirón es la forma más rápida de quemar la piel y dejar la cuellera caliente por fuera y fría por dentro.",
        "Aplicar 15 a 20 minutos máximo por sesión. No 30. No 'lo que aguante'. Pasada esa ventana, el músculo se acostumbra y los receptores cutáneos dejan de responder.",
        "Esperar mínimo una hora entre aplicaciones. El tejido necesita recuperar circulación basal.",
        "Postura sentada o reclinada, nunca acostado totalmente plano. La cuellera necesita apoyarse de forma uniforme; acostada presiona las cervicales inferiores asimétricamente.",
        "Sobre piel sana, sin lesiones, sin enrojecimiento previo. Si la piel ya está caliente al tacto, frío — no calor.",
      ]},

      { type: "h2", text: "Frío: cuándo y cómo" },
      { type: "p", text: "El frío reduce inflamación y enlentece la conducción nerviosa del dolor. Funciona muy bien para dolor agudo y para dolor de cabeza tensional. Las reglas:" },
      { type: "ul", items: [
        "Refrigerador, no freezer. Una temperatura entre 4 y 10°C es suficiente. El freezer congela las semillas y crea áreas demasiado frías que pueden producir quemadura por frío.",
        "Una tela fina entre la cuellera y la piel. Nunca contacto directo prolongado.",
        "10 a 15 minutos máximo. Más tiempo no aumenta el beneficio y aumenta el riesgo de irritación.",
        "No si la piel está enrojecida, con erupción o pérdida de sensibilidad.",
        "No en personas con Raynaud, neuropatía periférica o hipersensibilidad al frío sin consultar primero con un médico.",
      ]},

      { type: "h2", text: "El timing del día también importa" },
      { type: "p", text: "Algo que poca gente considera: cuándo aplicar la termoterapia cambia el resultado." },
      { type: "ul", items: [
        "Rigidez matutina al despertar — calor 15 minutos al levantarse, antes de empezar el día. Prepara el músculo para movimiento.",
        "Tensión por trabajo de oficina — calor entre las 5 y 7 de la tarde, cuando la jornada está terminando y el músculo lleva horas contraído. No esperar a las 11 de la noche cuando ya estás agotado.",
        "Antes de dormir — calor 10 minutos máximo, no más. Suficiente para relajar; demasiado puede activar la circulación y dificultar conciliar el sueño.",
        "Después de un episodio de estrés agudo (reunión difícil, mala noticia, esfuerzo) — calor 15 minutos en cuanto sea posible. La intervención temprana evita que la contractura se instale.",
        "Después de un movimiento brusco o golpe — frío en las primeras 24-48 horas, luego calor cuando la inflamación aguda baje.",
      ]},

      { type: "h2", text: "Errores que vuelven inútil la termoterapia" },
      { type: "ul", items: [
        "Calentar de más para 'que dure'. Crea diferencia térmica peligrosa: superficie quemante, núcleo aún tibio. La piel sufre antes de que el efecto llegue al músculo.",
        "Sesiones de 40 minutos o más. La fisiología muscular no responde proporcionalmente al tiempo. Pasado un punto, hay solo desgaste.",
        "Combinar calor con compresión fuerte (apretar la cuellera contra el cuello). La presión sostenida + calor puede generar más inflamación.",
        "Usar calor en la fase aguda de un traumatismo. Si te diste un golpe ayer y el cuello duele al moverlo, primero frío durante 24-48 horas, después calor.",
        "Olvidar la postura mientras se usa. Si la cuellera te queda bien colocada pero estás encorvado sobre el laptop, el efecto se cancela.",
      ]},

      { type: "h2", text: "Combinaciones que potencian el efecto" },
      { type: "p", text: "La termoterapia no actúa sola, y combinada bien puede multiplicar su efecto." },
      { type: "ul", items: [
        "Calor 15 minutos + estiramiento suave 5 minutos. El calor prepara el tejido; el estiramiento lo redistribuye. Esta combinación tiene mejor evidencia que cualquiera de las dos por separado.",
        "Calor + respiración diafragmática lenta (4 segundos inhalar, 6 segundos exhalar, durante 5 minutos). Trabaja el componente físico y el nervioso al mismo tiempo. Especialmente útil cuando la tensión viene mayormente del estrés.",
        "Caminata 10 minutos antes de aplicar calor. Mejora oxigenación local; el calor encuentra mejor terreno.",
        "Hidratación adecuada el día previo. Tejido bien hidratado responde mejor a calor que tejido deshidratado.",
      ]},

      { type: "h2", text: "Cuándo la termoterapia no es suficiente" },
      { type: "p", text: "El calor (o el frío) baja el síntoma. No resuelve la causa. Si el dolor lleva más de dos semanas sin mejora a pesar de uso constante y bien hecho, o si aparecen señales que sugieren algo más, necesitas evaluación médica. Banderas claras:" },
      { type: "ul", items: [
        "Dolor que irradia hacia un brazo o mano (puede indicar compresión nerviosa).",
        "Hormigueos persistentes, pérdida de fuerza en una mano o brazo.",
        "Dolor que te despierta de noche.",
        "Dolor de cabeza severo nuevo, sobre todo con rigidez de nuca.",
        "Fiebre asociada al dolor cervical.",
        "Después de un accidente o caída significativa.",
        "Vértigo o pérdida de equilibrio.",
      ]},
      { type: "p", text: "En cualquiera de esos casos, la prioridad es diagnóstico — no termoterapia. Una consulta médica general resuelve la mayoría de los casos sin necesidad de imágenes. Si requieres derivación a fisioterapia o traumatología, el médico te la indica." },

      { type: "quote", text: "La termoterapia no cura el origen. Pero bien usada, baja la intensidad lo suficiente para que tu cuerpo deje de pelear contra el dolor y empiece a recuperarse." },

      { type: "p", text: "Daniel cambió tres cosas. Calienta 90 segundos verificando con el dorso de la mano (no 3 minutos a ciegas). Usa 15 minutos y descansa una hora antes de repetir. Aplica entre las 5 y 7 de la tarde, cuando vuelve del trabajo, no a las 11 de la noche. A la semana siguiente, el primer alivio real desde hacía meses. Pequeñas decisiones — el resultado, distinto." },
    ],
  },
  {
    slug: "dolor-cervical-por-estres-y-postura",
    title: "Dolor de cuello por estrés y postura: por qué se instala y qué realmente lo alivia",
    excerpt: "El cuello concentra la tensión que no expresas. Y la postura frente al laptop o el celular la cronifica. La buena noticia: el patrón es predecible — y por lo tanto, reversible.",
    date: "2026-06-01",
    dateFormatted: "1 de junio de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Dolor Crónico",
    tags: ["dolor cervical", "cuello", "estrés", "postura", "tech neck", "termoterapia"],
    image: "/images/blog/dolor-cervical-por-estres-y-postura.jpg",
    readTime: 11,
    primaryCta: { kind: "product", slug: "warmy", label: "Ver Warmy" },
    relatedProducts: [
      { slug: "warmy", reason: "Cuellera de semillas para terapia de calor o frío. Adaptable a la curva de la nuca, retiene la temperatura el tiempo justo para una sesión efectiva." },
      { slug: "yumi-gumi-cero-drama-90", reason: "Cuando la tensión del cuello viene principalmente del estrés y la ansiedad, trabajar el componente nervioso es parte del tratamiento, no un extra." },
    ],
    sources: [
      {
        label: "Cervical Myofascial Pain — etiology, presentation and treatment. StatPearls.",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK507825/",
        type: "pubmed",
      },
      {
        label: "Alshahrani A et al. — Prevalence of text neck posture, smartphone addiction, and its association with neck disorders among university students. Healthcare, 2022.",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9760021/",
        type: "pubmed",
      },
      {
        label: "Garra G et al. — Heat or Cold Packs for Neck and Back Strain: A Randomized Controlled Trial of Efficacy. Academic Emergency Medicine, 2010.",
        url: "https://onlinelibrary.wiley.com/doi/10.1111/j.1553-2712.2010.00735.x",
        type: "pubmed",
      },
      {
        label: "Bazzichi L et al. — Trapezius activity of fibromyalgia patients is enhanced in stressful situations. BMC Musculoskelet Disord.",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3606617/",
        type: "pubmed",
      },
      {
        label: "Neck pain — overview, causes, self-care and when to seek help.",
        url: "https://www.nhs.uk/conditions/neck-pain/",
        type: "nhs",
      },
      {
        label: "Neck pain — symptoms, causes and diagnosis.",
        url: "https://www.mayoclinic.org/diseases-conditions/neck-pain/symptoms-causes/syc-20375581",
        type: "mayo",
      },
    ],
    content: [
      { type: "p", text: "Carmen tiene 36 años, es project manager. Hace cuatro meses empezó a sentir el cuello rígido al despertar. Al principio era 'ya se pasará con un buen estiramiento'. A las pocas semanas, el dolor subía hasta la nuca y bajaba hasta los hombros. Para el tercer mes, había un punto específico bajo el omoplato derecho que pulsaba después de cinco o seis horas frente a la laptop. Tomó analgésico tres veces seguidas. Le funcionó las dos primeras y nada la tercera." },
      { type: "p", text: "Lo que tiene Carmen no es una lesión. Tampoco es una mala suerte. Es un patrón que el cuerpo arma cuando se cruzan tres cosas a la vez: estrés sostenido, postura que no cambia, y falta de movimiento que descomprima. El cuello es el músculo donde más se acumula esa combinación. Y cuando se instala, no se va sola — pero tampoco es complicada de revertir, una vez que entiendes qué la sostiene." },

      { type: "h2", text: "Por qué el cuello y los hombros son donde 'guardas' el estrés" },
      { type: "p", text: "Cuando hay estrés sostenido, el sistema nervioso simpático queda en estado de alerta crónica. Es el mismo sistema que se activa cuando hay un peligro real — solo que ahora se activa por reuniones, deadlines, conflictos interpersonales o ruido digital constante. El cuerpo no distingue: la respuesta es idéntica." },
      { type: "p", text: "Esa respuesta incluye una secuencia automática: aumento de cortisol y adrenalina, frecuencia cardíaca elevada, respiración más superficial, atención focal estrecha, y un aumento generalizado del tono muscular. La meta evolutiva era preparar el cuerpo para pelear o huir. El problema es que hoy el peligro no se libera con acción física — se queda. Y los músculos que más sostienen esa preparación son los del cuello, los hombros, la mandíbula y el suelo pélvico." },
      { type: "p", text: "Un estudio publicado en BMC Musculoskeletal Disorders mostró, en pacientes con fibromialgia, que la actividad eléctrica del trapecio superior aumenta significativamente durante situaciones estresantes, incluso cuando la persona está físicamente quieta. La tensión no necesita movimiento — necesita estado nervioso. Y cuando ese estado se cronifica, el músculo termina apretado las 24 horas, sin que la persona pueda relajarlo a voluntad." },

      { type: "h2", text: "Tech neck: la postura que el smartphone está creando" },
      { type: "p", text: "Encima del estrés, la postura. La cabeza adulta pesa entre 4 y 5 kilos cuando está alineada sobre los hombros. Cada 2.5 centímetros que se proyecta hacia adelante — la postura típica frente al celular o el laptop — suma unos 4 kilos de carga aparente sobre los músculos cervicales posteriores. A 45 grados de flexión (mirar el celular en la mano), el cuello carga el equivalente a unos 22 kilos." },
      { type: "p", text: "Estudios recientes han llamado a este patrón 'text neck' o 'tech neck'. Una revisión sistemática en una población universitaria encontró prevalencias de entre 17% y 68% de algún grado de text neck en usuarios de smartphone, con tasas de postura adelantada de cabeza alcanzando el 67% en usuarios intensivos comparado con un 25% en grupos control. Un 28% de los participantes reportaba discapacidad por dolor cervical asociada al uso del dispositivo." },
      { type: "p", text: "El término es discutido en la literatura — algunos investigadores señalan que el cuadro clínico no es radicalmente distinto al dolor cervical crónico mecánico. Lo que sí es claro es la mecánica: la combinación de pantalla baja, cuello flexionado y horas continuas crea un patrón muscular que el cuerpo eventualmente cronifica." },

      { type: "h2", text: "Los músculos clave (y por qué duelen ahí)" },
      { type: "p", text: "El cuello no es un músculo único. Es un sistema con varios actores principales que rara vez trabajan solos:" },
      { type: "ul", items: [
        "Trapecio superior — el músculo que va de la base del cráneo hasta el hombro. Es el primero en contraerse con estrés y postura adelantada. Cuando duele, el dolor sube hacia la cabeza y baja hacia el hombro.",
        "Levator scapulae — conecta las vértebras cervicales con el omóplato. Suele alojar trigger points (puntos sensibles que refieren dolor a distancia). El dolor típico se siente en la parte alta del omóplato y sube hacia el cuello.",
        "Suboccipitales — pequeños músculos en la base del cráneo. Sostenidos contraídos producen dolor de cabeza tensional, sensación de presión en las sienes y rigidez al girar el cuello.",
        "Romboides — entre los omóplatos, en la espalda alta. Cuando los hombros se proyectan hacia adelante (postura digital típica), los romboides quedan estirados y débiles, lo que produce dolor 'a punto fijo' entre las paletas.",
        "Esternocleidomastoideo — el músculo lateral del cuello. Suele estar acortado en personas con respiración torácica superficial. Su tensión genera dolor irradiado a sien y oído.",
      ]},
      { type: "p", text: "Cuando uno se contrae crónicamente, los demás compensan. Es por eso que el dolor migra: empieza en el trapecio, después aparece en el omóplato, luego en la cabeza. No estás teniendo varios problemas — tienes un solo problema que se está extendiendo." },

      { type: "h2", text: "Lo que NO funciona (o funciona menos de lo que crees)" },
      { type: "ul", items: [
        "Solo analgésicos en serie. Reducen el dolor, no la causa. Útiles para un episodio agudo; contraproducentes como estrategia mensual — enmascaran señales que necesitas escuchar.",
        "Aparatos vibratorios de masaje sin estrategia. Pueden dar alivio temporal pero no corrigen postura ni manejo de estrés. Después de tres semanas el efecto se diluye.",
        "Almohadas 'milagro' o sillas 'ergonómicas perfectas'. La evidencia es débil. Importa más cómo te mueves a lo largo del día que el objeto específico.",
        "Estiramiento aislado sin movimiento. Estirar dos minutos por la mañana y pasar diez horas sentado sin moverse no compensa.",
        "Esperar a que se vaya sola. El dolor crónico no es paciente: cuanto más se instala el patrón muscular, más difícil revertirlo después.",
      ]},

      { type: "h2", text: "Lo que SÍ tiene evidencia" },
      { type: "p", text: "Cinco intervenciones con respaldo razonable que, combinadas, hacen la mayor parte del trabajo:" },
      { type: "h3", text: "1. Movimiento regular — la regla de los 45 minutos" },
      { type: "p", text: "Cada 45 minutos como máximo, una pausa de movimiento de 30 a 60 segundos. Levantarse, rotar el cuello suavemente, girar los hombros hacia atrás, mirar al horizonte (relaja los músculos extraoculares y por reflejo el cuello). No es 'cuando me acuerde' — es cronómetro. La diferencia entre quien hace esto y quien no, después de un mes, es notable." },
      { type: "h3", text: "2. Ejercicio aeróbico moderado, 3 a 4 veces por semana" },
      { type: "p", text: "Reduce cortisol basal, baja el tono simpático crónico, mejora la calidad del sueño. No tiene que ser intenso: 25 a 40 minutos de caminata rápida, bicicleta o natación. La evidencia para dolor crónico cervical es consistente." },
      { type: "h3", text: "3. Termoterapia local — calor o frío según contexto" },
      { type: "p", text: "Un ensayo clínico controlado publicado en Academic Emergency Medicine encontró que tanto calor como frío producen alivio leve a moderado en dolor agudo de cuello y espalda, sin diferencia significativa entre los dos. La elección depende del tipo de dolor: calor para tensión crónica, contractura, rigidez al despertar; frío para inflamación aguda, dolor de cabeza tensional, después de un movimiento brusco. Aplicar 15 a 20 minutos por sesión — no más. Más tiempo no aumenta el beneficio." },
      { type: "h3", text: "4. Estiramientos específicos, no genéricos" },
      { type: "p", text: "Tres movimientos por la mañana y tres por la tarde, sostenidos 20 a 30 segundos cada uno: inclinación lateral del cuello (oreja al hombro), rotación lenta hasta 80% del rango (no forzar), y retracción cervical (llevar el mentón hacia atrás, manteniendo la mirada al frente — el movimiento del 'doble mentón'). Sumar uno semanal de movilidad torácica también ayuda porque la columna alta libera carga del cuello." },
      { type: "h3", text: "5. Manejo del componente nervioso" },
      { type: "p", text: "No opcional. Si la tensión cervical viene mayormente de estrés sostenido, ningún masaje ni termoterapia hace el trabajo solo. Cinco minutos de respiración diafragmática lenta antes de dormir (4 segundos inhalar, 6 segundos exhalar), una práctica regular de mindfulness o meditación guiada de 10 minutos, terapia psicológica cuando el estrés excede la capacidad personal de manejarlo. Esto no es 'pensamiento positivo' — es trabajo concreto sobre el sistema nervioso que mantiene los músculos contraídos." },

      { type: "h2", text: "Cuándo no es solo tensión muscular" },
      { type: "p", text: "Hay señales que no se deben aguantar buscando que pasen solas. Si aparece cualquiera de estas, evaluación médica antes que más estiramientos:" },
      { type: "ul", items: [
        "Dolor irradiado hacia un brazo o mano, especialmente con hormigueos o sensación de electricidad.",
        "Pérdida de fuerza en una mano o brazo (te cuesta agarrar objetos, abrir frascos).",
        "Dolor que te despierta de noche o no cede con cambios de posición.",
        "Dolor de cabeza nuevo, severo, con rigidez de nuca o fiebre.",
        "Vértigo, pérdida de equilibrio o visión borrosa asociada al dolor cervical.",
        "Dolor que apareció después de un accidente, caída o golpe directo.",
        "Pérdida de peso involuntaria, sudores nocturnos o fiebre persistente junto al dolor.",
      ]},
      { type: "p", text: "La mayoría del dolor cervical no entra en ninguno de estos cuadros. Pero cuando uno está presente, la consulta médica es no negociable — el médico decide si necesitas imágenes, si requieres derivación a traumatólogo, neurólogo o reumatólogo, y descarta causas serias antes de seguir buscando alivio sintomático." },

      { type: "h2", text: "Una rutina diaria que cubre todo" },
      { type: "p", text: "Combinando los elementos con respaldo, una semana típica podría verse así, sin que requiera más de 35 a 45 minutos diarios totales:" },
      { type: "ul", items: [
        "Mañana — 5 minutos de estiramientos cervicales suaves + check postural (¿dónde está mi pantalla?, ¿dónde están mis hombros?).",
        "Durante el trabajo — micro-pausa de 30 segundos cada 45 minutos. Levantarse, mirar lejos, girar los hombros.",
        "Tarde-noche (idealmente entre 5 y 7 pm) — 15 a 20 minutos de termoterapia con calor si hay tensión acumulada. Postura sentada o reclinada, no acostada plana.",
        "Antes de dormir — 5 minutos de respiración diafragmática lenta. Reduce activación simpática y mejora la calidad del primer ciclo de sueño.",
        "3 a 4 veces por semana — 30 minutos de ejercicio aeróbico moderado.",
        "Una vez por semana — 15 minutos de movilidad torácica más larga (puentes, rotaciones, apertura de pecho).",
      ]},

      { type: "quote", text: "El cuello no es un músculo que se pueda 'aguantar'. O lo cuidas activamente, o se cobra solo." },

      { type: "p", text: "Carmen no resolvió todo con estiramientos. Bajó dos horas semanales de pantalla recreativa, agregó caminata diaria de 30 minutos, compró una cuellera térmica para usar entre las 5 y 7 de la tarde, y empezó terapia psicológica para el estrés laboral. A las seis semanas, el dolor de hombros era aproximadamente la mitad. A los tres meses, el punto bajo el omóplato derecho casi no aparecía. La diferencia: dejó de tratar el síntoma y empezó a tratar el contexto. El dolor crónico se va igual que llegó — por capas. Pero se va." },
    ],
  },
  // Mayo 2026 ───────────────────────────────────────────────────────────────
  {
    slug: "espirulina-energia-que-esperar-por-semana",
    title: "Espirulina: qué esperar semana a semana",
    excerpt: "Empezaste a tomar espirulina y a las dos semanas no notas nada. ¿Es normal? Sí — y entender la curva real evita que abandones justo antes de que empiece a funcionar.",
    date: "2026-05-28",
    dateFormatted: "28 de mayo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Nutrición",
    tags: ["espirulina", "energía", "cansancio", "spirusol", "suplementación"],
    image: "/images/blog/espirulina-energia-que-esperar-por-semana.jpg",
    readTime: 7,
    primaryCta: { kind: "product", slug: "spirusol-en-polvo", label: "Probar Spirusol" },
    relatedProducts: [
      { slug: "spirusol-en-polvo", reason: "Formato más versátil para empezar. Una cucharadita disuelta en agua de limón por la mañana es la rutina con mejor cumplimiento." },
      { slug: "spirusol-crunchie", reason: "Misma espirulina arequipeña, formato crocante. Para quienes no toleran el sabor del polvo en bebida." },
    ],
    sources: [
      {
        label: "Johnson M et al. — A randomized, double blind, placebo controlled study of spirulina supplementation on indices of mental and physical fatigue in men. Int J Food Sci Nutr, 2016.",
        url: "https://pubmed.ncbi.nlm.nih.gov/26888417/",
        type: "pubmed",
      },
      {
        label: "Karkos PD et al. — Spirulina in Clinical Practice: Evidence-Based Human Applications. Evid Based Complement Alternat Med, 2011.",
        url: "https://pubmed.ncbi.nlm.nih.gov/18955364/",
        type: "pubmed",
      },
      {
        label: "Baicus C et al. — Spirulina did not ameliorate idiopathic chronic fatigue in four N-of-1 randomized controlled trials. Phytother Res, 2007.",
        url: "https://pubmed.ncbi.nlm.nih.gov/17335116/",
        type: "pubmed",
      },
      {
        label: "Spirulina — health benefits, evidence, dosage and food sources.",
        url: "https://examine.com/supplements/spirulina/",
        type: "examine",
      },
      {
        label: "Iron in your diet — heme vs non-heme sources and absorption.",
        url: "https://www.nhs.uk/live-well/eat-well/food-types/iron-in-your-diet/",
        type: "nhs",
      },
    ],
    content: [
      { type: "p", text: "Lucía tiene 38 años, es diseñadora freelance. Compró espirulina porque le hablaron muy bien de su efecto en la energía. Llevaba tres semanas tomándola cada mañana, religiosamente, y a la cuarta empezó a sospechar que era humo. No notaba nada. La cucharadita seguía sabiendo a hierba mojada y seguía bajándole el ánimo cada vez que la metía en su jugo. A las cinco semanas estaba a punto de tirar el frasco." },
      { type: "p", text: "Lo que Lucía no sabía es que estaba justo en el punto donde casi todo el mundo abandona — y justo a una o dos semanas de que empezara a sentir la diferencia. La curva real de la espirulina no se parece en nada a la del café." },

      { type: "h2", text: "Por qué la espirulina no te 'despierta' como el café" },
      { type: "p", text: "El café da una sensación de energía porque la cafeína bloquea los receptores de adenosina, la molécula que el cerebro acumula durante el día como señal de cansancio. El efecto es rápido — 20 a 40 minutos — y agudo. Sentís el cambio." },
      { type: "p", text: "La espirulina no funciona así. Es un alimento denso en nutrientes: hierro biodisponible, proteína completa, antioxidantes como la ficocianina, B-complex, clorofila. Lo que aporta entra a sistemas que tardan en moverse — las reservas de ferritina, la capacidad antioxidante celular, la integridad de las mitocondrias. Esos sistemas no responden en horas. Responden en semanas." },
      { type: "p", text: "Por eso buscar el efecto de la espirulina como si fuera un estimulante es perder antes de empezar. Lo que hace es otra cosa: corregir déficits que producen cansancio sostenido. Y los déficits no se rellenan en dos días." },

      { type: "h2", text: "Lo que pasa cada semana — y lo que no" },
      { type: "p", text: "Vale ser específico, porque la ansiedad de no notar nada es la primera causa de abandono." },
      { type: "h3", text: "Semanas 1 a 2" },
      { type: "p", text: "Casi nadie nota cambios subjetivos en este rango. Lo que pasa internamente es que el cuerpo empieza a recibir un aporte estable de hierro no-hemo, antioxidantes y B-complex, pero las reservas aún no se mueven significativamente. Si alguien dice que sintió 'una energía nueva' a la semana, lo más probable es un efecto placebo o la diferencia psicológica de tener una rutina nueva. No le creas a tu cuerpo todavía — el efecto real no llegó." },
      { type: "p", text: "Lo único que sí puede notarse aquí: una mejora leve en función cognitiva y disminución de fatiga mental aguda. Un ensayo controlado en hombres jóvenes que tomaron 3 gramos diarios mostró que, ya a las 4 horas de la primera dosis, había mejora medible en pruebas de fatiga mental — un efecto de los componentes B-complex y antioxidantes inmediatos. Pero esto es sutil, no transformador." },
      { type: "h3", text: "Semanas 3 a 4" },
      { type: "p", text: "Es el momento en que la mayoría de la gente abandona. La curva fisiológica está empezando a moverse — el hierro está siendo absorbido, las reservas hepáticas empiezan a recibir aporte — pero las personas con fatiga crónica idiopática (causa no clara) no muestran diferencia con placebo en este rango, según un ensayo N-of-1 publicado en Phytotherapy Research. Si tu cansancio es nutricional (el caso más común en mujeres en edad reproductiva), aquí puede asomar el primer cambio: te despiertas un día sintiéndote un poco más liviana, o aguantas mejor una tarde larga sin café. Casi siempre el cambio es tan gradual que solo lo notas después de un par de días, no en el momento." },
      { type: "h3", text: "Semanas 5 a 8" },
      { type: "p", text: "Aquí está donde el ensayo de Johnson et al., publicado en International Journal of Food Sciences and Nutrition, mostró el efecto más claro. Con 3 gramos diarios de espirulina durante 8 semanas, los hombres del estudio reportaron mejora significativa en fatiga física y mental, mejor rendimiento en ejercicio submáximo y mejor recuperación post-esfuerzo. Es la ventana donde las reservas de hierro y la capacidad antioxidante celular muestran cambios medibles." },
      { type: "p", text: "Para Lucía, esta es la semana en que volvió a hacer un pilates después de meses sin ir y, al día siguiente, no sintió la fatiga aplastante de antes. No es magia. Es que el cuerpo finalmente tiene combustible y antioxidantes para procesar el esfuerzo." },
      { type: "h3", text: "Semanas 9 a 12 y más" },
      { type: "p", text: "El efecto se consolida. Estudios en poblaciones con enfermedad inflamatoria crónica (colitis ulcerativa, esclerosis múltiple remitente-recurrente) han mostrado, con tratamientos de 8 a 12 semanas, mejoras significativas en calidad de vida, marcadores inflamatorios y energía percibida. La espirulina no cura ninguna de estas condiciones, pero el aporte sostenido cambia el contexto fisiológico." },
      { type: "p", text: "Para una persona sana con cansancio nutricional, a los tres meses la línea base es claramente distinta a la de partida. Hay quien dice 'no me acuerdo de la última vez que dependí del café a las cuatro de la tarde'. Esa frase es típica del corte de los tres meses, no de las dos semanas." },

      { type: "h2", text: "Qué NO va a hacer la espirulina (importante)" },
      { type: "p", text: "Aclarar esto evita decepciones costosas y, peor, retrasar consultas médicas necesarias." },
      { type: "ul", items: [
        "No reemplaza vitamina B12. La B12 que aparece en las etiquetas de espirulina convencional es mayoritariamente pseudo-B12, un análogo inactivo en humanos. Si sigues una dieta sin alimentos de origen animal o tienes gastritis atrófica, necesitas suplemento específico de B12 o controles de niveles en sangre.",
        "No cura anemia clínica. Si tu hemoglobina está claramente baja (por debajo de 12 g/dL en mujeres, 13 g/dL en hombres), eso requiere diagnóstico médico y muy probablemente suplementación con dosis terapéuticas de hierro, no un alimento denso.",
        "No reemplaza tratamiento médico para hipotiroidismo, depresión clínica, apnea del sueño, fatiga crónica idiopática o enfermedades autoinmunes. Si tu cansancio es por alguna de estas causas, los suplementos pueden complementar — nunca reemplazar — el tratamiento.",
        "No 'despierta' agudamente como un estimulante. Si necesitas un empujón puntual para una reunión a las cuatro de la tarde, la espirulina no es la herramienta. Es para construir un piso de energía, no para picos.",
      ]},

      { type: "h2", text: "Cómo tomarla para que rinda más rápido" },
      { type: "p", text: "Hay detalles de uso que afectan claramente el resultado." },
      { type: "ul", items: [
        "Una cucharadita (5 g) al día como mínimo para una persona sana. Los estudios con efectos clínicos usan 3 a 6 gramos diarios. La dosis de 'mantenimiento' es más para acompañar una dieta, no para corregir déficit.",
        "Tomarla por la mañana, en agua con jugo de limón o con un licuado que tenga frutas cítricas. La vitamina C aumenta la absorción de hierro no-hemo (el tipo que tiene la espirulina) entre 3 y 4 veces.",
        "Evitar tomarla junto con café, té negro, té verde o vino tinto. Los taninos y polifenoles de estas bebidas se unen al hierro y bloquean su absorción. Mínimo dos horas de distancia entre ambos.",
        "Constancia diaria. La espirulina no funciona en días de 'sí, hoy me siento como tomarla'. Funciona porque el cuerpo recibe el aporte sin saltos. Cinco días sí, dos no, rompe la curva.",
        "Mínimo seis a ocho semanas antes de evaluar. Si después de ese tiempo, con uso constante, no notas ningún cambio, vale revisar otras causas con un médico.",
      ]},

      { type: "h2", text: "Cuándo hablar con un médico antes de seguir" },
      { type: "p", text: "Si después de seis a ocho semanas con uso diario y técnica correcta no sientes nada de cambio, hay que abrir el rango. Las causas que la espirulina no resuelve por sí sola incluyen: deficiencia profunda de hierro o B12 que requiere protocolo médico, hipotiroidismo, depresión, apnea del sueño, y enfermedades autoinmunes. Cualquiera de estas se beneficia de una consulta médica con un análisis completo (hemograma, ferritina, TSH, B12, vitamina D)." },
      { type: "p", text: "Y hay banderas que no esperan seis semanas: cansancio severo de más de tres meses sin mejora alguna, pérdida de peso no buscada, sudores nocturnos, fiebres persistentes, sangrados anormales. Eso es consulta médica primero, suplemento después." },

      { type: "quote", text: "La espirulina no falla. Falla la expectativa de que actúe como café." },

      { type: "p", text: "Lucía no tiró el frasco. A las seis semanas — justo cuando lo iba a hacer — notó que llegaba a las seis de la tarde sin sentir que el cuerpo pesaba. No era un cambio espectacular: era discreto, casi imperceptible. A las diez semanas, en cambio, ya no necesitaba ese café de las cuatro que llevaba años bebiendo. Esa fue la primera vez que se permitió decir 'sí, está funcionando'. La diferencia entre abandonar y descubrir que funciona suele ser una sola semana de paciencia más." },
    ],
  },
  // Mayo 2026 ───────────────────────────────────────────────────────────────
  {
    slug: "cansancio-nutricional-vs-descanso",
    title: "Cansancio nutricional vs cansancio de descanso: cómo saber cuál es el tuyo",
    excerpt: "Duermes 8 horas y te despiertas cansada. El café ya no aguanta hasta las 11. Lo más probable: tu cansancio no es de descanso — es nutricional. Y es muy distinto.",
    date: "2026-05-25",
    dateFormatted: "25 de mayo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Salud Femenina",
    tags: ["cansancio", "fatiga", "hierro", "espirulina", "nutrición"],
    image: "/images/blog/cansancio-nutricional-vs-descanso.jpg",
    readTime: 9,
    primaryCta: { kind: "product", slug: "spirusol-en-polvo", label: "Probar Spirusol" },
    relatedProducts: [
      { slug: "spirusol-en-polvo", reason: "Una cucharadita al día disuelta en agua, jugo o smoothie. El formato más versátil para empezar." },
      { slug: "spirusol-crunchie", reason: "Misma espirulina, formato crocante. Para topping de yogur, ensaladas o snack puro." },
    ],
    sources: [
      {
        label: "Krayenbuehl P-A et al. — Intravenous iron for the treatment of fatigue in nonanemic, premenopausal women with low serum ferritin. Blood, 2011.",
        url: "https://pubmed.ncbi.nlm.nih.gov/21436073/",
        type: "pubmed",
      },
      {
        label: "Karkos PD et al. — Spirulina in Clinical Practice: Evidence-Based Human Applications. Evid Based Complement Alternat Med, 2011.",
        url: "https://pubmed.ncbi.nlm.nih.gov/18955364/",
        type: "pubmed",
      },
      {
        label: "Vitamin B12 or folate deficiency anaemia — symptoms, causes and treatment.",
        url: "https://www.nhs.uk/conditions/vitamin-b12-or-folate-deficiency-anaemia/",
        type: "nhs",
      },
      {
        label: "Iron in your diet — heme vs non-heme sources and absorption.",
        url: "https://www.nhs.uk/live-well/eat-well/food-types/iron-in-your-diet/",
        type: "nhs",
      },
      {
        label: "Magnesium — health benefits, evidence, dosage and food sources.",
        url: "https://examine.com/supplements/magnesium/",
        type: "examine",
      },
      {
        label: "Perimenopause — symptoms, causes and management.",
        url: "https://www.mayoclinic.org/diseases-conditions/perimenopause/symptoms-causes/syc-20354666",
        type: "mayo",
      },
    ],
    content: [
      { type: "p", text: "Dormiste siete u ocho horas. Comes razonablemente bien. No estás enferma — los análisis básicos salen normales. Y aun así, te despiertas con la sensación de que el cuerpo no terminó de cargar. El café aguanta hasta las once; después, nada. Si esto te suena familiar, lo más probable es que llevas meses tratando de resolver el problema durmiendo más, descansando más, bajando el ritmo — y no funciona." },
      { type: "p", text: "El motivo casi siempre es el mismo: no todo el cansancio es de descanso. Hay un tipo distinto, mucho más común de lo que parece, que no se resuelve durmiendo. Y entender la diferencia es lo que separa a alguien que sigue cansada durante años de alguien que en unas semanas empieza a sentir el cuerpo otra vez." },

      { type: "h2", text: "La diferencia que casi nadie hace" },
      { type: "p", text: "El cansancio de descanso es el que tiene todo el mundo en mente: dormiste poco, descansas, te recuperas. Responde a horas y calidad de sueño. Es agudo y autolimitado." },
      { type: "p", text: "El cansancio nutricional es otra cosa. Es la sensación de que el cuerpo no tiene combustible disponible aunque hayas descansado. Las mitocondrias — las fábricas de energía dentro de cada célula — necesitan ciertos nutrientes para producir ATP, que es la moneda de energía corporal. Si esos nutrientes están en déficit, no importa cuántas horas duermas: el sistema no tiene con qué encender." },
      { type: "p", text: "Ambos pueden coexistir, y de hecho suelen hacerlo. Pero confundir uno con otro es la razón por la que llevas meses sintiéndote igual a pesar de dormir 'lo que debes'. Si lo único que cambia es la duración del sueño y la energía no vuelve, el problema está en otro lado." },

      { type: "h2", text: "Cómo reconocer cuál es el tuyo" },
      { type: "p", text: "El cansancio nutricional tiene huellas reconocibles. No son diagnóstico — son señales para sospecharlo." },
      { type: "ul", items: [
        "Dormiste siete horas o más y te despiertas igual que cuando dormiste cinco.",
        "Mejora momentáneamente cuando comes y vuelve al rato.",
        "Niebla mental por la tarde, especialmente después del almuerzo.",
        "Mareo o vista borrosa cuando te paras rápido.",
        "Uñas frágiles, caída de cabello más visible, palidez en mucosas.",
        "Esfuerzos físicos moderados (subir escaleras, cargar bolsas) se sienten desproporcionadamente pesados.",
        "Análisis de hemoglobina normales — pero nunca te midieron ferritina.",
      ]},
      { type: "p", text: "Marina tiene 42 años, es contadora. Duerme 7 a 8 horas, come razonablemente bien, no fuma. No está enferma — los análisis básicos salen normales. Y aun así se despierta con la sensación de no haber descansado. El café aguanta hasta las once; después, nada. Marina no necesita más sueño. Necesita revisar qué le está faltando." },
      { type: "p", text: "Un detalle clave: las reservas de hierro (ferritina) pueden estar agotadas mucho antes de que la hemoglobina caiga. Esto se llama deficiencia de hierro sin anemia y es una causa muy frecuente de fatiga sostenida en mujeres premenopáusicas — y está subdiagnosticada porque el análisis estándar (hemoglobina sola) no la detecta. Un ensayo clínico publicado en Blood mostró que mujeres con ferritina baja sin anemia mejoraron significativamente su fatiga tras restaurar las reservas de hierro." },

      { type: "h2", text: "Lo que el cansancio nutricional necesita" },
      { type: "p", text: "Cinco nutrientes hacen la mayor parte del trabajo en la producción de energía celular. Cuando uno o varios faltan, el sistema funciona en modo de baja potencia." },
      { type: "ul", items: [
        "Hierro biodisponible — transporta oxígeno en sangre y es cofactor en la cadena respiratoria mitocondrial. Hierro hemo (carne, pescado) se absorbe más fácil que el no-hemo (vegetales). La vitamina C aumenta la absorción del no-hemo.",
        "B12 — esencial para producción de glóbulos rojos y función neurológica. Solo está en alimentos de origen animal (huevo, lácteo, pescado, carne) o en suplemento. Las dietas vegetarianas estrictas la pierden.",
        "Proteína completa — los aminoácidos esenciales no se almacenan; el cuerpo los necesita todos los días para mantener y reparar tejido. Sin proteína suficiente, la sensación de cansancio se cronifica.",
        "Antioxidantes — el estrés crónico genera radicales libres que dañan mitocondrias. Vitamina C, E, selenio y compuestos vegetales como ficocianina actúan de contrapeso.",
        "Magnesio — cofactor en más de 300 reacciones enzimáticas, incluida la producción de ATP. Se pierde más con estrés. Las estimaciones sugieren que la mayoría de la población tiene ingesta insuficiente.",
      ]},
      { type: "p", text: "Hay un problema con la dieta moderna: pierde estos cinco sistemáticamente. Granos refinados pierden hasta el 85% del magnesio del grano entero. Vegetales cultivados en suelos empobrecidos tienen menos hierro y zinc que los de hace 50 años. Los ultraprocesados aportan calorías pero pocos micronutrientes. Comer 'normal' hoy ya no garantiza la base que el cuerpo asume." },

      { type: "h2", text: "Por qué los alimentos densos son la primera línea" },
      { type: "p", text: "Densidad nutricional es la cantidad de nutrientes por caloría. Un alimento denso aporta mucho con poco — la opción más eficiente para llenar déficits sin sumar carga calórica ni depender de suplementos sintéticos desde el inicio." },
      { type: "p", text: "Un ejemplo concreto: la espirulina (Arthrospira platensis) es una microalga acuática que la FAO ha llamado 'uno de los alimentos más completos del siglo XXI'. Aporta entre 60 y 70 por ciento de proteína completa con todos los aminoácidos esenciales, hierro biodisponible (en formato no-hemo, pero acompañado por compuestos que facilitan su absorción), antioxidantes como la ficocianina, B-complex y clorofila. Una cucharadita (5 g) aporta lo equivalente a varias porciones de hojas verdes en hierro y antioxidantes." },
      { type: "p", text: "Una aclaración importante, porque hay marketing engañoso al respecto: la espirulina aporta hierro biodisponible, proteína completa, antioxidantes y minerales. No aporta B12 utilizable — lo que figura como 'B12' en la mayoría de etiquetas de espirulina es un análogo inactivo en humanos (pseudovitamina B12). Si necesitas B12, las fuentes son huevo, lácteo, pescado, carne, o suplemento de cianocobalamina o metilcobalamina." },

      { type: "quote", text: "El cansancio nutricional no se cura durmiendo más. Se cura comiendo distinto." },

      { type: "p", text: "Spirusol se cultiva en Arequipa, donde la radiación solar excepcionalmente alta favorece la densidad de pigmentos y antioxidantes. El Informe IIN 000114-2025 verifica 67,33% de proteína, 9,69 mg de hierro por 100 g y 13.648 µmol Trolox de capacidad antioxidante por 100 g. Tiene Registro Sanitario MINSA vigente y certificación Vegan Verified internacional. El uso habitual es una cucharadita al día — en agua de limón por la mañana, en un jugo verde, o en un smoothie." },

      { type: "h2", text: "Cuándo el cansancio no es esto" },
      { type: "p", text: "Antes de asumir que el cansancio es nutricional, hay señales que requieren evaluación médica antes que cualquier ajuste alimentario." },
      { type: "ul", items: [
        "Cansancio severo de más de tres meses sin ninguna mejora.",
        "Pérdida de peso involuntaria.",
        "Fiebre persistente o sudores nocturnos.",
        "Dolor articular nuevo o cambios en piel.",
        "Cambios menstruales drásticos (sangrados muy abundantes, ausencia inexplicada).",
        "Ánimo persistentemente bajo o pérdida de interés por cosas que antes disfrutabas.",
      ]},
      { type: "p", text: "Las causas que la alimentación no resuelve incluyen anemia severa que requiere suplementación bajo control, hipotiroidismo (la glándula tiroides regula el metabolismo entero — si funciona lento, ningún alimento compensa), depresión clínica, fatiga crónica idiopática y deficiencias profundas que necesitan protocolo médico. En todos estos casos, lo primero es la evaluación, no el suplemento." },

      { type: "p", text: "Para el cansancio nutricional, en cambio, el camino es más simple. Empezar por densidad: agregar alimentos que aporten mucho por porción. Una cucharadita al día e ir observando. Los cambios en niveles de hierro y reservas nutricionales toman semanas, no días — paciencia con el cuerpo. Y si después de seis a ocho semanas no notas ningún cambio, ese es el momento de consultar con un médico para revisar qué más puede estar pasando." },
    ],
  },
  {
    slug: "melatonina-cuando-funciona",
    title: "Melatonina: cuándo funciona, cuándo no, y por qué la dosis importa menos de lo que crees",
    excerpt: "Todo el mundo la toma. Pocos entienden qué hace realmente. La melatonina no es un somnífero — y esa confusión explica por qué a tantas personas no les funciona.",
    date: "2026-05-18",
    dateFormatted: "18 de mayo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Sueño",
    tags: ["melatonina", "sueño", "ritmo circadiano", "insomnio"],
    image: u("1758273239288-9b60777397c5"),
    readTime: 6,
    content: [
      { type: "p", text: "Si buscas en cualquier farmacia o tienda de suplementos, la melatonina probablemente ocupe un estante entero. Hay en cápsulas de 1 mg, de 5 mg, de 10 mg. En spray. En gominolas. Para adultos, para niños, para viajeros frecuentes. Es el suplemento de sueño más vendido en el mundo — y también uno de los más malentendidos." },
      { type: "p", text: "La confusión principal es esta: la gente la toma como si fuera un somnífero. Tomo la pastilla, me duermo. Pero no funciona así. Y entender por qué marca la diferencia entre tomarla bien — cuando funciona — o seguir tomándola sin resultado esperando que a ti te haga efecto." },
      { type: "h2", text: "Qué hace la melatonina (y qué no hace)" },
      { type: "p", text: "La melatonina es una hormona que produce la glándula pineal cuando oscurece. No induce el sueño directamente — es una señal circadiana: le dice al cuerpo que es de noche y que es momento de prepararse para dormir. Baja la temperatura corporal, sincroniza el ritmo interno con el ciclo luz-oscuridad del entorno. Piénsala como un marcador de tiempo, no como un sedante." },
      { type: "p", text: "Un somnífero actúa sobre el sistema nervioso para generarte sedación. La melatonina no hace eso. Por eso no 'noqueará' a alguien con insomnio severo ni resolverá el problema de alguien que no puede quedarse dormido por ansiedad, apnea o mala higiene del sueño. No actúa sobre esas causas." },
      { type: "h2", text: "Cuándo funciona de verdad" },
      { type: "ul", items: [
        "Jet lag: es para lo que mejor funciona. Tomar melatonina a la hora local de llegada ayuda al cuerpo a resincronizarse más rápido.",
        "Trabajo por turnos: personas con horarios rotatorios que necesitan sincronizar su reloj interno a una ventana diferente.",
        "Síndrome de fase de sueño retrasada: las personas que naturalmente se duermen muy tarde (2, 3, 4 a.m.) y quieren adelantar su ventana de sueño. Tomada 5 a 6 horas antes del sueño deseado, funciona muy bien.",
        "Adultos mayores: la producción de melatonina cae significativamente después de los 55-60 años. La suplementación puede restaurar señales circadianas que ya no se producen en cantidad suficiente.",
      ]},
      { type: "h2", text: "Por qué la dosis importa menos de lo que crees — y por qué más no es mejor" },
      { type: "p", text: "La mayoría de los suplementos del mercado vienen en dosis de 5 o 10 mg. Pero la investigación sobre melatonina exógena muestra que las dosis efectivas para resincronizar el ritmo circadiano están entre 0.3 y 1 mg. Dosis más altas saturan los receptores — no tienen más efecto sobre el ritmo, y en algunos casos producen somnolencia al día siguiente, sueños vívidos o incluso interfieren con el ritmo circadiano propio." },
      { type: "p", text: "¿Por qué se venden 5 y 10 mg? Porque el umbral de dosis para producir somnolencia subjetiva es más alto — y la gente asocia 'me da sueño' con 'funciona'. Pero somnolencia no es sincronización circadiana. Son cosas distintas." },
      { type: "quote", text: "La melatonina no es una pastilla para dormir. Es un reloj. Tomarla bien significa usarla para ajustar el tiempo, no para producir sedación." },
      { type: "h2", text: "Cuándo mejor buscar otra causa" },
      { type: "p", text: "Si llevas semanas tomando melatonina y no notas diferencia — o la notas solo un poco la primera noche y luego nada — lo más probable es que tu problema no sea de señal circadiana. Las causas más frecuentes de insomnio que la melatonina no resuelve: ansiedad o activación del sistema nervioso a la hora de dormir, apnea del sueño no diagnosticada, higiene del sueño muy deficiente, déficits nutricionales que afectan la arquitectura del sueño, o patrones de pensamiento rumiativo en la noche." },
      { type: "p", text: "En todos esos casos, hay intervenciones con mucha más evidencia: terapia cognitivo-conductual para el insomnio, evaluación de apnea, ajuste nutricional, protocolos de regulación del sistema nervioso. La melatonina es una herramienta útil cuando se usa para lo que hace. Para todo lo demás, hay que buscar en el lugar correcto." },
    ],
  },
  {
    slug: "colageno-35-anos-que-tipo",
    title: "Colágeno a los 35: cuándo empieza a importar y qué tipo necesitas",
    excerpt: "A partir de los 25 años la producción de colágeno cae un 1 % cada año. A los 35 ya se acumula. Aquí explicamos qué tipos existen, cuál es para qué, y cómo no gastar en el equivocado.",
    date: "2026-05-11",
    dateFormatted: "11 de mayo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Salud Femenina",
    tags: ["colágeno", "piel", "articulaciones", "suplementos"],
    image: u("1570172619644-dfd03ed5d881"),
    readTime: 7,
    content: [
      { type: "p", text: "El colágeno es la proteína estructural más abundante del cuerpo. No solo en la piel — también en huesos, cartílagos, tendones, ligamentos y paredes vasculares. Es literalmente el andamiaje que mantiene todo en su lugar. Y su producción empieza a caer alrededor de los 25 años, a un ritmo de aproximadamente 1 % por año." },
      { type: "p", text: "A los 35, la caída acumulada es suficiente para que los efectos empiecen a ser visibles y sentidos: más lentitud en la recuperación de pequeñas lesiones, articulaciones que crujen más, piel que cambia de textura. No es catastrófico — es fisiológico. Pero hay cosas que se pueden hacer al respecto, y entenderlas vale la pena." },
      { type: "h2", text: "Los tipos que más importan y para qué sirven" },
      { type: "p", text: "No existe 'el colágeno' — existen al menos 28 tipos identificados. Los que más aparecen en suplementos y clínica son tres:" },
      { type: "ul", items: [
        "Tipo I: el más abundante en el cuerpo. Clave para la piel (firmeza, elasticidad), huesos y tendones. Es el que más baja con la edad y el que más efecto estético tiene.",
        "Tipo II: el principal componente del cartílago articular. Relevante para articulaciones — especialmente rodillas, caderas y columna — y para manejo de osteoartritis.",
        "Tipo III: coexiste con el tipo I en piel, vasos sanguíneos y tejidos blandos. Relevante para la integridad intestinal y vascular.",
      ]},
      { type: "p", text: "Los suplementos que se venden para 'piel y uñas' suelen ser tipo I o una mezcla de I y III. Los orientados a articulaciones incluyen tipo II — y a veces condroitina y glucosamina para potenciar el efecto." },
      { type: "h2", text: "Hidrolizado, péptidos y gelatina: no es lo mismo" },
      { type: "p", text: "El colágeno en su forma nativa no se absorbe como suplemento — las proteínas grandes no pasan íntegras al torrente sanguíneo. Lo que funciona es el colágeno hidrolizado, también llamado péptidos de colágeno: la proteína cortada en fragmentos pequeños que se absorben en el intestino y llegan al tejido objetivo como señales que estimulan la producción de colágeno propio." },
      { type: "p", text: "La gelatina es colágeno parcialmente hidrolizado — tiene beneficios, pero menor biodisponibilidad que los péptidos. Marcas como Verisol (específica para piel), UC-II (tipo II nativo para articulaciones) o Peptan tienen ensayos clínicos propios que avalan sus formulaciones. No es solo marketing — hay diferencias reales según el proceso de hidrólisis." },
      { type: "h2", text: "Lo que potencia su efecto (y lo que lo destruye)" },
      { type: "ul", items: [
        "Vitamina C: esencial para la síntesis de colágeno. Sin ella, el precursor no se convierte en colágeno maduro. Si tomas colágeno sin vitamina C, produces menos de lo que podrías.",
        "Zinc y cobre: cofactores necesarios para las enzimas que estabilizan la estructura del colágeno.",
        "Azúcar en exceso: la glicación — el proceso en que la glucosa se une a las proteínas — destruye el colágeno existente. El azúcar hace lo opuesto de lo que hace el suplemento.",
        "Tabaco y UV sin protección: dos de los mayores aceleradores de la degradación de colágeno cutáneo.",
      ]},
      { type: "quote", text: "El colágeno no es vanidad disfrazada de salud. Es infraestructura. Y como cualquier infraestructura, mantenerla es mucho más eficiente que intentar reconstruirla cuando ya colapsó." },
      { type: "h2", text: "Lo que no hace el colágeno (aunque lo vendan así)" },
      { type: "p", text: "Tomar colágeno no elimina las arrugas que ya tienes — las modifica muy gradualmente y en cierta medida. No rellena el cartílago articular dañado de la noche a la mañana — actúa a lo largo de meses, con efectos más preventivos que curativos en etapas avanzadas. Y no tiene mucho sentido tomarlo sin saber qué tipo necesitas ni en qué dosis." },
      { type: "p", text: "Si tienes 35 años o más: el tipo I hidrolizado (10-15 g diarios con vitamina C) es el punto de entrada más respaldado para piel y tejido conectivo general. Si hay dolor articular, el tipo II en dosis bajas (40 mg de UC-II nativo) tiene evidencia específica. Si quieres hacer algo al respecto, empieza por saber qué tipo es para ti." },
    ],
  },
  {
    slug: "magnesio-ansiedad-deficit",
    title: "Magnesio y ansiedad: el mineral que la mayoría tiene en déficit",
    excerpt: "El magnesio es el cuarto mineral más abundante del cuerpo — y la mayoría lo tiene bajo sin saberlo. La conexión con la ansiedad, el insomnio y el estrés crónico es más directa de lo que parece.",
    date: "2026-05-04",
    dateFormatted: "4 de mayo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Ansiedad",
    tags: ["magnesio", "ansiedad", "suplementos", "sistema nervioso"],
    image: u("1506905925346-21bda4d32df4"),
    readTime: 6,
    content: [
      { type: "p", text: "El magnesio participa en más de 300 reacciones enzimáticas en el cuerpo. Está involucrado en la producción de energía, la síntesis de proteínas, la regulación del calcio, la contracción muscular y — lo que aquí más nos importa — la función del sistema nervioso. Y sin embargo, las estimaciones sugieren que entre el 60 y el 80 % de la población tiene ingesta insuficiente. No es un número marginal: es la mayoría." },
      { type: "p", text: "La deficiencia subclínica de magnesio — la que no es tan severa como para causar síntomas obvios, pero sí lo suficientemente baja como para afectar la función — pasa completamente desapercibida en los análisis de sangre estándar, porque el magnesio sérico no refleja las reservas intracelulares. Puedes salir 'normal' en la analítica y estar funcionalmente bajo." },
      { type: "h2", text: "Por qué casi todos estamos bajos" },
      { type: "p", text: "Tres factores principales. Primero: los suelos agrícolas modernos tienen menor contenido mineral que hace cincuenta años — los vegetales que comemos tienen menos magnesio que los de generaciones anteriores. Segundo: la dieta procesada es baja en magnesio por definición (los cereales refinados pierden hasta el 85 % del magnesio del grano entero). Tercero, y quizás el más relevante: el estrés crónico aumenta la excreción urinaria de magnesio. El estrés te depleta el magnesio, y el magnesio bajo empeora el estrés. Un ciclo cerrado." },
      { type: "h2", text: "La conexión directa con la ansiedad" },
      { type: "p", text: "El magnesio actúa como antagonista natural del receptor NMDA de glutamato — básicamente bloquea uno de los principales mensajeros excitatorios del cerebro. Cuando el magnesio está bajo, el sistema nervioso se vuelve más reactivo: mayor sensibilidad al estrés, mayor activación de la amígdala, mayor dificultad para 'bajar' de un estado de alerta. Es como si el freno del sistema nervioso perdiera efectividad." },
      { type: "p", text: "También interviene en la síntesis de GABA — el neurotransmisor inhibidor que produce la sensación de calma — y en la regulación del eje HPA (el sistema de estrés del cuerpo). Estudios controlados muestran que la suplementación con magnesio reduce síntomas de ansiedad leve a moderada, mejora la calidad del sueño y reduce marcadores de activación del sistema de estrés." },
      { type: "h2", text: "Señales de que puedes estar bajo en magnesio" },
      { type: "ul", items: [
        "Calambres musculares nocturnos o espasmos en párpados",
        "Insomnio o sueño muy ligero y reactivo",
        "Ansiedad, irritabilidad o sensación de 'estar al límite' sin causa clara",
        "Cefaleas tensionales frecuentes",
        "Estreñimiento crónico",
        "Palpitaciones sin causa cardíaca",
        "Fatiga persistente que no mejora con descanso",
      ]},
      { type: "quote", text: "Ninguno de estos síntomas por separado diagnostica déficit de magnesio. Pero si tienes varios a la vez y nadie ha evaluado tu estado mineral, vale la pena incluirlo en la conversación." },
      { type: "h2", text: "No todos los magnesios son iguales" },
      { type: "p", text: "El óxido de magnesio — la forma más barata y común — tiene una biodisponibilidad de apenas el 4 %. Es básicamente un laxante. Para efectos sobre el sistema nervioso y la ansiedad, las formas con mejor evidencia son el glicinato de magnesio (alta absorción, sin efecto laxante, buen acceso al sistema nervioso central) y el treonato de magnesio (específicamente estudiado para función cognitiva y ansiedad). El citrato es una opción intermedia con buena absorción, útil también si hay estreñimiento." },
      { type: "p", text: "La dosis habitual en estudios de ansiedad es de 200 a 400 mg de magnesio elemental al día, por las noches. El efecto no es inmediato — toma semanas de suplementación consistente notar diferencia en el sistema nervioso. Pero es de los suplementos con mejor relación riesgo-beneficio disponibles: seguro, bien tolerado, y con un mecanismo claro." },
    ],
  },
  {
    slug: "curcuma-omega3-antiinflamatorios",
    title: "Cúrcuma y omega-3: la dupla antiinflamatoria que la reumatología está tomando en serio",
    excerpt: "No es hype de wellness. Hay evidencia real detrás de estos dos compuestos — pero también hay mucha confusión sobre cómo tomarlos y qué esperar. Aquí está lo que realmente dice la ciencia.",
    date: "2026-04-27",
    dateFormatted: "27 de abril de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Dolor Crónico",
    tags: ["cúrcuma", "omega-3", "inflamación", "dolor crónico"],
    image: u("1526354720401-1ce6416805c6"),
    readTime: 7,
    content: [
      { type: "p", text: "Hay dos suplementos que aparecen en casi todas las conversaciones sobre dolor articular y en casi todos los estantes de las herboristerías: la cúrcuma y el omega-3. Y hay también mucha confusión sobre qué hacen exactamente, si funcionan juntos o separados, en qué forma tomarlos y para quién son realmente útiles." },
      { type: "p", text: "Lo que sí es cierto es que la investigación sobre ambos ha madurado bastante en los últimos años — y hay suficiente evidencia como para que la medicina integrativa los use con respaldo, no solo por tradición. Pero esa evidencia viene con condiciones que conviene entender." },
      { type: "h2", text: "El problema que ambos abordan: la inflamación crónica de bajo grado" },
      { type: "p", text: "La inflamación aguda es útil: es la respuesta del cuerpo ante una lesión o infección. Enrojece, duele, calienta — y luego se apaga. El problema es cuando la inflamación no se apaga del todo. Cuando queda encendida a un nivel bajo, sostenida en el tiempo, sin que haya una amenaza activa. Eso es la inflamación crónica de bajo grado — y está detrás de la mayoría de las enfermedades crónicas: artritis, dolor musculoesqueletal, fatiga persistente, muchos problemas digestivos." },
      { type: "p", text: "No duele como la inflamación aguda. No hincha de forma visible. Por eso tarda en detectarse. Y es exactamente aquí donde la cúrcuma y el omega-3 tienen su papel más documentado." },
      { type: "h2", text: "La cúrcuma: lo que hace la curcumina (y el problema de absorberla)" },
      { type: "p", text: "El principio activo de la cúrcuma es la curcumina — un polifenol con propiedades antiinflamatorias e inhibidor del NF-κB, que es básicamente el interruptor molecular que activa muchas rutas inflamatorias. Los estudios en dolor articular, especialmente en artritis reumatoide y osteoartritis, muestran reducciones en marcadores inflamatorios (PCR, IL-6) y mejoras en dolor y movilidad comparables en algunos casos con antiinflamatorios de primera línea — con un perfil de efectos adversos mucho mejor." },
      { type: "p", text: "El problema clásico de la curcumina es su biodisponibilidad: el cuerpo la absorbe muy mal en su forma natural. La cúrcuma en polvo que agregas a las comidas tiene beneficios, pero no entrega las concentraciones necesarias para efectos antiinflamatorios significativos. Lo que funciona es la curcumina con piperina (un compuesto de la pimienta negra que aumenta su absorción hasta 20 veces) o fórmulas liposomales. Sin esto, buena parte de lo que tomas se va sin llegar al tejido objetivo." },
      { type: "h2", text: "El omega-3: el ratio que nadie te explica" },
      { type: "p", text: "El omega-3 — específicamente EPA y DHA, que vienen del aceite de pescado — tiene un mecanismo antiinflamatorio diferente. Compite con el ácido araquidónico (omega-6) en las rutas que producen eicosanoides: cuando hay más EPA y DHA disponible, se producen más moléculas pro-resolución de la inflamación y menos mensajeros proinflamatorios. El efecto no es inmediato — tarda semanas — pero hay evidencia sólida en dolor articular, rigidez matutina en artritis y marcadores sistémicos de inflamación." },
      { type: "p", text: "El contexto que importa aquí es el ratio omega-6:omega-3. La dieta moderna — procesados, aceites vegetales refinados, poca pesca — tiene un ratio de 15:1 o peor. El ratio al que evolucionó el metabolismo humano es cercano a 4:1. Suplementar con omega-3 ayuda, pero reducir la carga de omega-6 también importa." },
      { type: "quote", text: "Estos dos compuestos no son alternativas a un tratamiento médico para el dolor severo. Son parte de un abordaje que también incluye evaluar causas y ajustar el estilo de vida. Lo que aportan es soporte real al sistema." },
      { type: "h2", text: "Por qué la combinación tiene sentido" },
      { type: "p", text: "Actúan sobre rutas inflamatorias diferentes — curcumina sobre NF-κB, omega-3 sobre la cascada de eicosanoides — lo que significa que su efecto es aditivo, no redundante. Algunos ensayos combinados muestran mejores resultados que cada uno por separado, especialmente en dolor articular y reducción de rigidez." },
      { type: "h2", text: "Lo que el empaque no te cuenta" },
      { type: "p", text: "La calidad varía enormemente. Para omega-3: la forma triglicérido se absorbe mejor que el etil éster (que es lo que traen muchos suplementos baratos). La dosis efectiva de EPA+DHA combinados en estudios de inflamación es de 2 a 3 gramos diarios — no la dosis de 500 mg que traen las cápsulas de entrada. Para curcumina: busca que especifique el estándar de extracto (Meriva, BCM-95, Longvida son formulas con biodisponibilidad probada) o que venga con piperina. Si no dice nada de eso, probablemente se absorbe mal." },
      { type: "p", text: "¿Tiene sentido tomarlos? Para alguien con dolor articular, inflamación documentada o simplemente un estilo de vida que genera inflamación crónica: sí. Pero como parte de un abordaje. No como reemplazo de entender qué está causando la inflamación y actuar sobre eso." },
    ],
  },
  // Ronda 1 ─────────────────────────────────────────────────────────────────
  {
    slug: "por-que-me-despierto-a-las-3am",
    title: "Las 3 de la madrugada: por qué tu cerebro te despierta (y cómo volver a dormir)",
    excerpt: "Despertar en mitad de la noche y no poder volver a dormirte es más común de lo que crees. Aquí explicamos qué está pasando en tu cuerpo — y qué puedes hacer.",
    date: "2026-04-20",
    dateFormatted: "20 de abril de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Sueño",
    tags: ["insomnio", "sueño fragmentado", "despertar nocturno", "ritmo circadiano"],
    image: u("1541480601022-2308c0f02487"),
    readTime: 6,
    content: [
      { type: "p", text: "Ya sé qué hora es. No necesitas mirar el teléfono — el cuerpo lo sabe antes que tú. Son las 3, o las 3 y algo, y estás completamente despierto sin haber decidido estarlo." },
      { type: "p", text: "Lo frustrante no es el despertar. Es lo que viene después: la mente que se enciende sola, el repaso mental de todo lo pendiente, la cuenta regresiva de cuántas horas quedan antes de que suene la alarma. Y la certeza — esa certeza horrible — de que esta noche tampoco vas a dormir bien." },
      { type: "h2", text: "El sueño no es un interruptor" },
      { type: "p", text: "Tendemos a pensar en el sueño como algo que se enciende y se apaga. Pero en realidad es una secuencia de ciclos de unos 90 minutos, y cada ciclo termina con un momento de sueño más ligero — casi una pequeña pausa — antes de entrar al siguiente. El despertar a las 3 a.m. suele coincidir justo con una de esas pausas. La mayoría de las noches, la transición es tan suave que ni la notas. Pero cuando el cuerpo está bajo estrés sostenido, cuando el cortisol empieza a subir antes de tiempo, o cuando hay algo perturbando la arquitectura del sueño, esa pequeña pausa se convierte en un agujero por el que te caes." },
      { type: "h2", text: "El cortisol no es tu enemigo. Solo llega demasiado temprano" },
      { type: "p", text: "El cortisol es la hormona que te prepara para el día. Normalmente empieza a subir alrededor de las 5 o 6 de la mañana. Pero en personas con estrés crónico, ansiedad, o el ritmo circadiano desajustado, ese pico llega antes — a las 3, a las 4 — y el cuerpo interpreta la señal como: ya es de día, hay que funcionar. No es que no puedas dormir. Es que tu reloj interno está adelantado. Otras causas frecuentes: una caída de azúcar en sangre a mitad de la noche, una habitación demasiado cálida, o el alcohol de la cena que fragmenta los ciclos justo en la segunda mitad del sueño." },
      { type: "quote", text: "El problema no siempre es quedarte dormido. A veces es quedarte dormido después de despertar. Y eso tiene causas muy específicas que se pueden abordar." },
      { type: "h2", text: "Lo que no funciona, aunque parezca lógico" },
      { type: "p", text: "Revisar el teléfono. Mirar la hora. Levantarte a comer algo. Ponerte a planear lo de mañana 'ya que estás despierto de todas formas'. Todo eso le confirma al cerebro que las 3 a.m. es un momento de actividad. Y el cerebro aprende rápido: en pocas semanas, lo que era un despertar ocasional se convierte en hábito. El cuerpo empieza a esperarlo." },
      { type: "h2", text: "Cuándo preocuparse de verdad" },
      { type: "p", text: "Un mal sueño puntual no es nada. Tres semanas seguidas despertando a la misma hora, con cansancio acumulado, el humor y la concentración afectados — eso ya merece atención. El sueño fragmentado crónico no es solo cansancio: eleva marcadores inflamatorios, altera el metabolismo, y tiene efectos sobre el estado de ánimo que a veces se confunden con ansiedad o depresión. La buena noticia es que casi siempre hay una causa identificable. Y si hay una causa, hay algo que hacer." },
    ],
  },
  {
    slug: "cuando-el-dolor-no-tiene-explicacion",
    title: "Cuando el dolor no tiene explicación: qué hacer si tus exámenes salen normales",
    excerpt: "Tener dolor real con exámenes normales no significa que estés inventándotelo. Significa que el sistema médico convencional aún no encontró la causa — y eso tiene solución.",
    date: "2026-04-13",
    dateFormatted: "13 de abril de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Dolor Crónico",
    tags: ["dolor crónico", "fibromialgia", "diagnóstico", "medicina integrativa"],
    image: u("1571019613454-1cb2f99b2d8b"),
    readTime: 7,
    content: [
      { type: "p", text: "\"Sus exámenes están normales.\" Para alguien que lleva meses con dolor, esa frase debería ser un alivio. Pero no lo es. Porque la conclusión implícita — la que nadie dice pero todos entienden — es: entonces el problema está en tu cabeza." },
      { type: "p", text: "No está en tu cabeza. O bueno, sí está en tu cabeza, en el sentido de que todo dolor ocurre en el sistema nervioso. Pero eso no significa que sea inventado. Significa que los exámenes de rutina no están mirando en el lugar correcto." },
      { type: "h2", text: "El problema con 'normal'" },
      { type: "p", text: "La medicina convencional es extraordinariamente buena para detectar daño estructural: fracturas, tumores, inflamación aguda visible en imágenes. Pero el dolor crónico frecuentemente ocurre sin daño estructural visible. La fibromialgia, el síndrome de sensibilización central, el dolor miofascial, el dolor neuropático — todas son condiciones reales, con décadas de investigación detrás, que no aparecen en una resonancia ni en una analítica de sangre estándar. Un examen normal no descarta el dolor. Solo descarta ciertas causas del dolor." },
      { type: "h2", text: "Señales de que podrías estar ante dolor crónico no diagnosticado" },
      { type: "ul", items: [
        "Dolor que se mueve o cambia de lugar sin razón aparente",
        "Fatiga que no mejora con descanso, aunque hayas dormido bien",
        "Hipersensibilidad rara: la ropa roza, la luz molesta, los ruidos irritan más de lo habitual",
        "Varios síntomas 'sin relación': intestino, cefaleas, sueño, dolor — todo junto",
        "Empeora con el estrés o con unos días de mal sueño",
        "Varios médicos, varios diagnósticos distintos, ninguno que termine de encajar",
      ]},
      { type: "quote", text: "El dolor es siempre real. Si lo sientes, existe. El trabajo médico es encontrar su origen — no descartarlo porque no aparezca en los exámenes de rutina." },
      { type: "h2", text: "Buscar el sistema, no solo el síntoma" },
      { type: "p", text: "Un enfoque integrativo del dolor crónico no busca la lesión en la imagen: busca el patrón en el sistema. El sistema nervioso, el sistema inmune, el microbioma, los patrones de sueño, el estado nutricional, la carga de estrés sostenido. El dolor sin explicación casi siempre tiene múltiples causas que se potencian entre sí. Cuando se abordan en conjunto — en lugar de una a la vez, en consultas separadas — los pacientes encuentran alivio que nunca tuvieron tratando solo una pieza del rompecabezas." },
      { type: "p", text: "Si llevas tiempo con dolor que nadie ha sabido explicar, no normalices. No es que seas especialmente sensible ni que tengas mala suerte. Hay algo que está pasando — y merece una evaluación que lo busque de verdad." },
    ],
  },
  {
    slug: "ansiedad-vs-estres-como-diferenciarlos",
    title: "Ansiedad o estrés: cómo diferenciarlos y por qué importa la distinción",
    excerpt: "\"Son los nervios\" o \"es el trabajo\" — la ansiedad se disfraza de estrés cotidiano durante años. Entender la diferencia puede cambiar completamente cómo la abordas.",
    date: "2026-04-06",
    dateFormatted: "6 de abril de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Ansiedad",
    tags: ["ansiedad", "estrés", "salud mental", "bienestar emocional"],
    image: u("1507003211169-0a1dd7228f2d"),
    readTime: 5,
    content: [
      { type: "p", text: "\"Estoy muy estresado\" es probablemente la frase que más se escucha en consulta. Y tiene sentido: el estrés es una explicación que lo justifica todo y que además no asusta. Es socialmente aceptable, incluso admirado. Estar estresado significa que estás ocupado, que te importa, que eres productivo." },
      { type: "p", text: "El problema es que a veces eso que llamamos estrés tiene otro nombre. Y ese otro nombre implica un mecanismo diferente — y un abordaje diferente." },
      { type: "h2", text: "La diferencia que cambia todo" },
      { type: "p", text: "El estrés tiene un origen claro: la reunión de mañana, la deuda, el conflicto con tu pareja. Cuando ese factor desaparece o se resuelve, el estrés baja. Lo notas. La ansiedad no funciona así. Persiste cuando el factor externo ya no está. Salta de una preocupación a otra sin que ninguna se resuelva del todo. O peor: aparece sin ninguna razón concreta, como una alarma que suena aunque no haya humo. El cerebro ansioso no necesita una razón real para activarse. Crea las suyas." },
      { type: "h2", text: "Señales de que puede ser ansiedad y no solo estrés" },
      { type: "ul", items: [
        "Te preocupas de forma desproporcionada por cosas que 'racionalmente' sabes que no son graves",
        "Tensión muscular crónica en cuello, mandíbula u hombros que no recuerdas cuándo empezó",
        "No puedes dejar de pensar cuando intentas dormirte",
        "Sensación constante de urgencia o apuro, aunque no haya nada urgente",
        "Irritabilidad que no corresponde a lo que pasó ese día",
        "Palpitaciones, mareos o dificultad para respirar que el médico dice que 'no son nada'",
        "Evitas cosas o compromisos porque anticipas que algo saldrá mal",
      ]},
      { type: "quote", text: "La ansiedad no llega con un cartel. Se instala de a poco, disfrazada de 'soy muy exigente' o 'tengo mucho en la cabeza', hasta que un día te das cuenta de que llevas años sin estar tranquilo." },
      { type: "h2", text: "Por qué la distinción importa tanto" },
      { type: "p", text: "Si lo tuyo es estrés situacional, manejar los tiempos, poner límites y descansar activo puede ser suficiente. Si lo tuyo es ansiedad — una activación sostenida del sistema nervioso que ya no depende de los eventos externos — esas mismas herramientas ayudan poco sin abordar la fisiología que la sostiene. No es que seas débil ni que debas 'relajarte más'. Es que hay algo en tu sistema nervioso que está en alerta permanente, y eso tiene solución." },
    ],
  },
  {
    slug: "spm-severo-no-es-normal",
    title: "SPM severo: cuando tu ciclo te tumba y te dicen que \"es normal\"",
    excerpt: "No es dramatismo ni falta de carácter. El síndrome premenstrual severo es una condición médica real — y decirte que \"todas las mujeres lo tienen\" no es una respuesta suficiente.",
    date: "2026-03-30",
    dateFormatted: "30 de marzo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Salud Femenina",
    tags: ["SPM", "síndrome premenstrual", "salud femenina", "ciclo menstrual"],
    image: u("1554151228-14d9def656e4"),
    readTime: 6,
    content: [
      { type: "p", text: "Hay una semana al mes — a veces diez días — en que no te reconoces. El humor se va al piso sin previo aviso. El cuerpo duele de una forma difícil de explicar. La irritabilidad es tan intensa que tú misma te asustas. Y cuando intentas contarlo, alguien dice: \"es que todas somos así antes de la regla\"." },
      { type: "p", text: "No. No todas son así. Y aunque algunas molestias premenstruales sean comunes, hay un punto en que dejan de ser normales — y ese punto es cuando interfieren con tu vida." },
      { type: "h2", text: "SPM y TDPM: no es lo mismo" },
      { type: "p", text: "El síndrome premenstrual afecta a muchas mujeres con síntomas leves o moderados que son manejables. Pero existe una forma severa llamada Trastorno Disfórico Premenstrual — TDPM — que es otra cosa. Disforia intensa, llanto sin causa aparente, irritabilidad que puede arruinar relaciones, pensamientos que asustan. Todo eso aparece de forma predecible en la segunda mitad del ciclo y desaparece con la menstruación. No es carácter. No es dramatismo. Es una respuesta hormonal desproporcionada con mecanismos neurobiológicos identificables." },
      { type: "h2", text: "Señales de que tu SPM merece atención médica" },
      { type: "ul", items: [
        "Los síntomas aparecen y desaparecen de forma cíclica y predecible",
        "Afectan tu trabajo, tus relaciones o tu capacidad de hacer cosas cotidianas",
        "Tú misma percibes que 'no eres tú' en esos días",
        "El dolor físico — senos, hinchazón, cabeza — es intenso y no cede fácilmente",
        "Llevas años adaptando tu vida alrededor de esa semana",
      ]},
      { type: "quote", text: "Muchas mujeres llegan a consulta con 35 o 40 años habiendo normalizado algo que podría haberse abordado mucho antes. El tiempo que se perdió no vuelve, pero el alivio sí es posible." },
      { type: "h2", text: "Qué incluye un abordaje real" },
      { type: "p", text: "No una pastilla para el dolor el día que duele. Un abordaje real del SPM severo mira el perfil hormonal a lo largo del ciclo — no en un solo punto —, evalúa cómo está durmiendo esa persona, qué está pasando con su estado nutricional, con la inflamación. El objetivo no es aguantar mejor. Es entender por qué tu cuerpo específico responde así, y actuar sobre las causas." },
    ],
  },

  // Ronda 2 ─────────────────────────────────────────────────────────────────
  {
    slug: "dormir-8-horas-no-es-suficiente",
    title: "Duermo mis horas pero sigo agotado: qué está pasando",
    excerpt: "Si duermes 7 u 8 horas y aun así te levantas sin energía, el problema no es la cantidad de sueño. Aquí te explicamos qué puede estar fallando y por qué importa atenderlo.",
    date: "2026-03-23",
    dateFormatted: "23 de marzo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Sueño",
    tags: ["sueño no reparador", "fatiga", "insomnio", "calidad del sueño"],
    image: u("1520206183501-b80df61043c2"),
    readTime: 7,
    content: [
      { type: "p", text: "\"Pero si duermo bien\" — eso es lo que dices cuando alguien sugiere que quizás el problema es el sueño. Y técnicamente tienes razón: cumples las horas. Siete, a veces ocho. Te acuestas a una hora razonable. No trasnochas. Y aun así, cada mañana es una negociación con la alarma." },
      { type: "p", text: "La cafeína de las 7 a.m. es obligatoria. La de las 11 también. A las 3 de la tarde el cuerpo pide la siesta que no puedes tomarte. Y esa sensación de arrastrar los pies — de funcionar al 70% — se ha convertido en tu estado normal. Tan normal que ya ni la cuestionas." },
      { type: "h2", text: "Horas en cama no es lo mismo que sueño reparador" },
      { type: "p", text: "El sueño tiene fases. Las que importan para despertar con energía — el sueño profundo de onda lenta, donde el cuerpo se repara, y el sueño REM, donde el cerebro procesa — representan solo una parte del tiempo total en cama. Una persona puede estar 8 horas durmiendo y pasar la mayor parte de ese tiempo en sueño superficial, rozando la superficie sin llegar al fondo. El resultado: muchas horas, poco descanso." },
      { type: "h2", text: "Señales de que tu sueño no está reparando" },
      { type: "ul", items: [
        "Te despiertas con la misma sensación de cansancio con la que te dormiste",
        "Necesitas alarma aunque hayas dormido suficiente",
        "Niebla mental en las primeras horas del día que no termina de despejarse",
        "Humor irritable o plano sin razón aparente",
        "Antojos de dulce o carbohidratos durante el día — el cuerpo buscando energía rápida",
        "Te quedas dormido en el sofá sin haberlo planeado",
      ]},
      { type: "h2", text: "Qué puede estar interrumpiendo las fases profundas" },
      { type: "p", text: "Microdespertares que no recuerdas — muy frecuentes en apnea del sueño no diagnosticada. Ansiedad de baja intensidad que mantiene el sistema nervioso levemente activado toda la noche. Déficits nutricionales que afectan la producción de melatonina. Ritmos circadianos desajustados por falta de exposición a la luz natural en las mañanas. Ninguna de estas cosas aparece si le dices al médico 'duermo 8 horas': hay que buscarlas." },
      { type: "quote", text: "Hay personas que llevan años creyendo que son malos durmientes por naturaleza. La mayoría de las veces hay una causa concreta. Y si hay una causa, hay algo que hacer." },
    ],
  },
  {
    slug: "dolor-cronico-y-sueno-circulo-vicioso",
    title: "El dolor que no te deja dormir (y el insomnio que lo empeora)",
    excerpt: "El dolor crónico y el mal sueño se alimentan mutuamente en un ciclo que pocos médicos abordan de frente. Entender la conexión es el primer paso para salir de él.",
    date: "2026-03-16",
    dateFormatted: "16 de marzo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Dolor Crónico",
    tags: ["dolor crónico", "insomnio", "sueño", "fibromialgia"],
    image: u("1506126613408-eca07ce68773"),
    readTime: 6,
    content: [
      { type: "p", text: "Hay una crueldad particular en esto: el dolor te impide dormir. Y la falta de sueño hace que el dolor del día siguiente sea más intenso. Que lo toleres menos. Que dure más. Y así te quedas atrapado entre dos problemas que se alimentan mutuamente — sin que nadie te haya explicado por qué ocurre ni cómo se interrumpe." },
      { type: "h2", text: "Por qué el sueño cambia cómo percibes el dolor" },
      { type: "p", text: "Durante el sueño profundo, el cuerpo libera hormona de crecimiento y moléculas antiinflamatorias que modulan activamente las señales de dolor. Cuando ese sueño se fragmenta o acorta, el umbral de dolor baja: estímulos que normalmente no dolerían, duelen. Los que ya duelen, duelen más. Esto no es psicológico — es neurofisiología documentada. La privación de sueño activa las mismas vías cerebrales que el daño tisular." },
      { type: "h2", text: "El ciclo que nadie interrumpe" },
      { type: "p", text: "El dolor nocturno fragmenta el sueño. El sueño fragmentado reduce la tolerancia al dolor. La mayor sensibilidad genera ansiedad anticipatoria — miedo a que esta noche también sea mala. Esa ansiedad dificulta conciliar el sueño. El ciclo se repite y cada vuelta lo hace un poco más fuerte." },
      { type: "quote", text: "Tratar solo el dolor sin abordar el sueño — o el sueño sin abordar el dolor — es como intentar vaciar un bote con un agujero. El agujero va primero." },
      { type: "h2", text: "Por qué nadie lo trata junto" },
      { type: "p", text: "Los sistemas de salud están organizados por especialidades: el reumatólogo ve el dolor, el neurólogo ve el sueño. Rara vez alguien los mira juntos como parte del mismo problema. El resultado son tratamientos parciales que funcionan a medias — o medicamentos que alivian uno y empeoran el otro." },
      { type: "h2", text: "Lo que hace la diferencia" },
      { type: "p", text: "Una evaluación que pregunte por el sueño cuando evalúa el dolor, y por el dolor cuando evalúa el sueño. Que entienda cómo interactúan en tu caso específico. Que diseñe un plan que los aborde en paralelo. No es un lujo clínico — es la condición mínima para que mejores de verdad." },
    ],
  },
  {
    slug: "senales-fisicas-de-ansiedad",
    title: "El cuerpo que grita lo que la mente calla: síntomas físicos de ansiedad que ignoramos",
    excerpt: "Las palpitaciones, la tensión en el cuello, el intestino revuelto. Tu cuerpo lleva tiempo enviando señales de ansiedad — y probablemente las has estado atendiendo en el lugar equivocado.",
    date: "2026-03-09",
    dateFormatted: "9 de marzo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Ansiedad",
    tags: ["ansiedad", "síntomas físicos", "sistema nervioso", "salud"],
    image: u("1559839734-2b71ea197ec2"),
    readTime: 6,
    content: [
      { type: "p", text: "El cardiólogo dice que el corazón está bien. El gastroenterólogo descarta causa orgánica. El neurólogo no encuentra nada. Y tú sigues con las palpitaciones, el nudo en el estómago, la tensión en el cuello que no se va con ningún masaje. El cuerpo insiste en que algo pasa — y tiene razón. Lo que pasa es que nadie está buscando en el lugar correcto." },
      { type: "h2", text: "Por qué la ansiedad vive en el cuerpo" },
      { type: "p", text: "La ansiedad activa el sistema nervioso autónomo — la rama que prepara al cuerpo para una amenaza. El corazón late más rápido, los músculos se tensan, la digestión se detiene, la respiración se vuelve superficial. Todo eso tiene sentido cuando hay un peligro real. El problema es cuando ese estado de activación se sostiene en el tiempo, sin una amenaza concreta, porque entonces esos mismos síntomas se vuelven crónicos — y lo que era una respuesta de emergencia se convierte en el estado basal del cuerpo." },
      { type: "h2", text: "Síntomas físicos de ansiedad que se confunden con otras cosas" },
      { type: "ul", items: [
        "Palpitaciones o sensación de corazón acelerado sin causa cardíaca",
        "Cuello rígido, mandíbula apretada, cefaleas tensionales que vuelven siempre",
        "Intestino irritable, náuseas, sensación de nudo en el estómago",
        "Dificultad para respirar profundo — sensación de que el aire no alcanza",
        "Mareos o inestabilidad que no es vértigo",
        "Hormigueos en manos, pies o cara",
        "Fatiga que no mejora con descanso",
        "Brotes en la piel sin causa dermatológica clara",
      ]},
      { type: "quote", text: "Hay personas que llevan años yendo de especialista en especialista tratando síntomas físicos que son, en realidad, la forma en que su sistema nervioso pide ayuda." },
      { type: "h2", text: "El costo de tratar solo el síntoma" },
      { type: "p", text: "Descartar causas orgánicas es necesario y correcto. El problema es cuando eso es todo lo que se hace. Sin abordar el sistema nervioso que está generando los síntomas, estos migran o vuelven. El intestino mejora y aparecen las cefaleas. Las cefaleas bajan y vuelven las palpitaciones. El cuerpo sigue hablando — solo que en otro idioma." },
      { type: "p", text: "Un abordaje integrativo mira los síntomas físicos como lo que son: manifestaciones de un sistema nervioso desregulado. Eso cambia completamente qué se hace con ellos." },
    ],
  },
  {
    slug: "sintomas-perimenopausia-que-nadie-explica",
    title: "Perimenopausia: los síntomas que nadie te preparó para tener",
    excerpt: "Insomnio inexplicable, ansiedad nueva, niebla mental, ciclos irregulares. Puede que tengas entre 38 y 50 años y nadie te haya dicho que esto tiene nombre — y solución.",
    date: "2026-03-02",
    dateFormatted: "2 de marzo de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Salud Femenina",
    tags: ["perimenopausia", "menopausia", "salud femenina", "hormonas"],
    image: u("1438761681033-6461ffad8d80"),
    readTime: 7,
    content: [
      { type: "p", text: "Tienes 42 años. O 38. O 47. Empezaste a dormir mal de repente, sin razón aparente. Tienes episodios de ansiedad que antes no tenías. Te cuesta recordar palabras en medio de una conversación y eso nunca te había pasado. Tu ciclo cambió. Estás distinta — y no sabes por qué." },
      { type: "p", text: "El médico dice que estás bien. Los exámenes salen normales. Y tú sabes que algo está pasando, pero no tienes nombre para ponerle. Lo más probable es que sí lo tenga: perimenopausia." },
      { type: "h2", text: "Qué es y por qué se diagnostica tan tarde" },
      { type: "p", text: "La perimenopausia es la transición hormonal que antecede a la menopausia — y puede empezar hasta 10 años antes de que el ciclo se detenga. El estrógeno y la progesterona empiezan a fluctuar de forma impredecible, y esas fluctuaciones afectan el sueño, el estado de ánimo, la memoria, el peso, la libido y la respuesta al estrés. El problema es que estos síntomas llegan dispersos, años antes de lo que se esperaría, y con frecuencia se atribuyen a depresión, ansiedad, estrés laboral o simplemente 'la edad'." },
      { type: "h2", text: "Síntomas que pocas veces se conectan con las hormonas" },
      { type: "ul", items: [
        "Insomnio nuevo o sueño muy fragmentado, especialmente en la segunda mitad de la noche",
        "Ansiedad que apareció o empeoró sin motivo claro",
        "Niebla mental: concentración, memoria de palabras, sensación de lentitud cognitiva",
        "Cambios en el ciclo: más corto, más largo, distinto al de siempre",
        "Sofocos leves — pueden pasar desapercibidos o confundirse con calor ambiental",
        "Irritabilidad o bajones emocionales que no tienen explicación en lo que pasó ese día",
        "Sequedad vaginal o molestias durante las relaciones",
        "Dificultad para mantener el peso sin haber cambiado nada",
      ]},
      { type: "quote", text: "La perimenopausia puede empezar a los 38 años. No necesitas que el ciclo se detenga para que tus hormonas estén cambiando — y para que esos cambios afecten profundamente tu calidad de vida." },
      { type: "h2", text: "Por qué los análisis de sangre no la capturan" },
      { type: "p", text: "FSH, estradiol, progesterona — pueden salir 'normales' en plena perimenopausia, porque las hormonas fluctúan tanto que una sola medición no captura el patrón. Por eso el diagnóstico es clínico: se basa en la historia, la edad, los síntomas y los cambios en el tiempo. Una analítica puntual no dice nada si no se lee en contexto." },
      { type: "p", text: "Si te identificas con esto, no lo normalices. Hay mucho que se puede hacer — y la mayoría de las mujeres que reciben atención adecuada notan una diferencia real." },
    ],
  },

  // Ronda 3 ─────────────────────────────────────────────────────────────────
  {
    slug: "que-le-pasa-cuerpo-sin-dormir-bien",
    title: "Lo que le pasa a tu cuerpo cuando llevas meses sin dormir bien",
    excerpt: "El insomnio crónico no es solo cansancio. Afecta tu peso, tu sistema inmune, tu memoria y tu estado de ánimo de formas que quizás no estás relacionando con el sueño.",
    date: "2026-02-23",
    dateFormatted: "23 de febrero de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Sueño",
    tags: ["insomnio crónico", "salud", "fatiga", "sueño"],
    image: u("1486312338219-ce68d2c6f44d"),
    readTime: 8,
    content: [
      { type: "p", text: "Hay un momento en que el mal sueño deja de ser un problema de energía y se convierte en un problema de salud. No hay una fecha exacta ni un aviso previo. Simplemente, en algún punto, los efectos de semanas y meses de sueño fragmentado empiezan a aparecer en lugares que no esperabas: el peso, el humor, el sistema inmune, la memoria." },
      { type: "p", text: "Y lo más confuso es que nadie los conecta con el sueño. Porque ¿quién relaciona que engordó con que lleva meses durmiendo mal? ¿O que se le olvidan más las cosas con que no está llegando al sueño profundo? Nadie. Por eso vale la pena entender qué está pasando." },
      { type: "h2", text: "Lo que el cuerpo hace mientras duermes — y deja de hacer cuando no" },
      { type: "p", text: "El sueño no es tiempo muerto. Es el momento en que el cuerpo hace las cosas que no puede hacer mientras estás despierto: reparar tejidos, consolidar memorias, regular hormonas, limpiar el cerebro literalmente — el sistema glinfático elimina proteínas de desecho asociadas con el deterioro cognitivo durante el sueño profundo. Cuando ese tiempo se recorta o fragmenta de forma crónica, ese mantenimiento no ocurre. Y los efectos se acumulan." },
      { type: "h2", text: "La conexión con el peso que a nadie le explican" },
      { type: "p", text: "El sueño insuficiente eleva la grelina — la hormona del hambre — y reduce la leptina — la de la saciedad. El resultado: más hambre, más antojos específicos de dulce y carbohidratos, mayor dificultad para sentirte satisfecho. Esto no es falta de voluntad. Es biología. Y explica por qué personas que comen bien y hacen ejercicio no logran mantener el peso cuando duermen mal." },
      { type: "h2", text: "El sistema inmune que empieza a fallar" },
      { type: "p", text: "Después de dos o tres semanas de sueño insuficiente o fragmentado, el sistema inmune empieza a mostrar cambios: menor producción de células NK (las que eliminan células infectadas o tumorales), mayor susceptibilidad a infecciones, y un estado inflamatorio de bajo grado que se sostiene en el tiempo. Infecciones más frecuentes, más lentas en irse. Alergias que empeoran. Recuperaciones que tardan más de lo normal." },
      { type: "quote", text: "No existe ningún sistema en el cuerpo que no se vea afectado por el sueño insuficiente sostenido. El sueño no es un lujo — es mantenimiento básico." },
      { type: "h2", text: "Cuándo el cansancio deja de ser normal" },
      { type: "p", text: "Si llevas más de un mes durmiendo mal y empiezas a notar cambios en tu peso, tu humor, tu memoria o tu capacidad de recuperarte de cualquier cosa, esos síntomas están relacionados. Una evaluación médica puede identificar qué está fallando en tu caso específico — y en la mayoría de los casos, hay causas tratables." },
    ],
  },
  {
    slug: "dolor-cronico-y-vida-social",
    title: "Cómo el dolor crónico destruye tu vida social — y qué hacer al respecto",
    excerpt: "Cancelar planes, sentirte incomprendido, alejarte de quien quieres. El dolor crónico tiene un costo social que nadie habla. Aquí lo nombramos — y lo abordamos.",
    date: "2026-02-16",
    dateFormatted: "16 de febrero de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Dolor Crónico",
    tags: ["dolor crónico", "salud mental", "aislamiento", "bienestar"],
    image: u("1506126613408-eca07ce68773"),
    readTime: 6,
    content: [
      { type: "p", text: "Primero cancelas un plan porque ese día el dolor es insoportable. Luego cancelas otro. Y otro. Con el tiempo dejas de comprometerte a nada, porque no sabes cómo estarás. Tus amigos dejan de invitarte — no por maldad, sino porque aprendieron a no esperarte. Y tú terminas solo con tu dolor, que curiosamente se alimenta del aislamiento." },
      { type: "h2", text: "El costo que nadie mide" },
      { type: "p", text: "El dolor crónico tiene síntomas que aparecen en los estudios clínicos y síntomas que no. La pérdida de vida social, el deterioro de las relaciones cercanas, la identidad que se va erosionando — 'yo antes era de los que...' — son consecuencias reales pero que rara vez entran en la consulta. El médico pregunta dónde duele y cuánto. No qué perdiste en el camino." },
      { type: "h2", text: "Lo que sienten las personas con dolor crónico y pocas veces dicen" },
      { type: "ul", items: [
        "Vergüenza o culpa por cancelar una vez más",
        "Sensación de ser una carga para la pareja o la familia",
        "La frase 'pero si no te ves enfermo' como puñalada suave",
        "Duelo real por la vida que tenían antes del dolor",
        "Ansiedad anticipatoria ante actividades que antes disfrutaban",
        "Soledad — incluso rodeados de gente",
      ]},
      { type: "quote", text: "No es que quieras aislarte. Es que el costo energético de salir, explicarte y gestionar las expectativas ajenas a veces supera la energía disponible ese día." },
      { type: "h2", text: "Por qué el aislamiento hace el dolor más intenso" },
      { type: "p", text: "La conexión social tiene efectos analgésicos documentados. La interacción positiva libera oxitocina y endorfinas que modulan la percepción del dolor. El aislamiento, por el contrario, activa respuestas de estrés que lo amplifican. No es casualidad que pacientes con redes sociales activas reporten mejor manejo de su condición — incluso con el mismo diagnóstico y la misma severidad." },
      { type: "h2", text: "Un plan que incluya la dimensión humana" },
      { type: "p", text: "Un buen abordaje del dolor crónico no puede ignorar su impacto en la vida social y en la identidad del paciente. No solo los síntomas físicos — también las estrategias para mantener vínculos, comunicar límites sin culpa, y recuperar gradualmente actividades con significado. El objetivo no es solo reducir el dolor. Es recuperar una vida." },
    ],
  },
  {
    slug: "burnout-cuando-el-cansancio-es-una-condicion",
    title: "Burnout: cuándo el agotamiento pasa de ser cansancio a ser una condición médica",
    excerpt: "No es flojera, no es debilidad y no se soluciona con vacaciones. El burnout es el agotamiento del sistema nervioso — y tiene señales específicas que conviene reconocer a tiempo.",
    date: "2026-02-09",
    dateFormatted: "9 de febrero de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Ansiedad",
    tags: ["burnout", "agotamiento", "estrés crónico", "salud mental"],
    image: u("1516534775068-ba3e7458af70"),
    readTime: 7,
    content: [
      { type: "p", text: "Llegaste a las vacaciones completamente vaciado. Dos semanas después, de vuelta al trabajo, la sensación no cambió. O quizás ya ni puedes tomarte vacaciones — porque el solo pensamiento de lo que te espera al regresar genera más estrés que el trabajo mismo." },
      { type: "p", text: "Eso no es cansancio normal. Eso es burnout. Y la diferencia importa." },
      { type: "h2", text: "Qué es el burnout — y qué no es" },
      { type: "p", text: "La OMS lo reconoce como un fenómeno ocupacional caracterizado por tres cosas: agotamiento energético, distancia mental creciente del trabajo, y reducción de la eficacia profesional. No es depresión, aunque puede precederla. No es estrés, aunque el estrés crónico es su causa principal. Es el resultado de un sistema nervioso que estuvo en modo de alerta demasiado tiempo — y llegó a su límite operativo." },
      { type: "h2", text: "Señales que suelen ignorarse hasta que ya es tarde" },
      { type: "ul", items: [
        "Cansancio que no mejora con descanso, ni siquiera después de un fin de semana largo",
        "Cinismo o distancia emocional ante cosas que antes te importaban",
        "Sensación de que nada de lo que haces tiene impacto real",
        "Dificultad para concentrarte en tareas simples que antes hacías automáticamente",
        "Irritabilidad desproporcionada, especialmente con las personas más cercanas",
        "Infecciones recurrentes, dolores musculares, problemas digestivos sin causa clara",
        "Imposibilidad de desconectarte mentalmente fuera del horario laboral",
      ]},
      { type: "quote", text: "El burnout no llega de golpe. Se construye lentamente, a fuerza de ignorar señales menores, hasta que el cuerpo hace lo que la mente no pudo: parar." },
      { type: "h2", text: "Por qué las vacaciones no lo resuelven" },
      { type: "p", text: "El burnout no es falta de descanso puntual — es la acumulación de un sistema nervioso que nunca bajó del estado de alerta. Una semana de playa puede aliviar la tensión superficial, pero no cambia el patrón de activación crónica. Al regresar, el contexto es el mismo, la fisiología no cambió, y el ciclo continúa. Más rápido que antes, de hecho, porque la reserva ya estaba agotada." },
      { type: "h2", text: "Cuándo pedir ayuda" },
      { type: "p", text: "Si llevas más de un mes así, si está afectando tus relaciones o tu rendimiento de forma sostenida, o si sientes que ya no reconoces quién eras antes de este estado — es el momento. El burnout tiene solución, pero requiere más que descanso: requiere entender qué le está pasando a tu sistema nervioso, cambiar las condiciones que lo produjeron, y darle al cuerpo lo que necesita para recuperar su capacidad de regularse." },
    ],
  },
  {
    slug: "ciclo-menstrual-senales-de-salud",
    title: "Tu ciclo como brújula: señales que tu período te da sobre tu salud",
    excerpt: "El ciclo menstrual es el quinto signo vital para la mujer. Lo que ves cada mes — la regularidad, el color, el dolor — habla de tu salud hormonal, inmune y metabólica en general.",
    date: "2026-02-02",
    dateFormatted: "2 de febrero de 2026",
    author: "Mary Keting",
    authorRole: "Medicina Integrativa",
    category: "Salud Femenina",
    tags: ["ciclo menstrual", "salud femenina", "hormonas", "bienestar"],
    image: u("1571019613454-1cb2f99b2d8b"),
    readTime: 6,
    content: [
      { type: "p", text: "Durante mucho tiempo, el ciclo menstrual se trató en consulta como un detalle administrativo: fecha de última regla, siguiente pregunta. Como si lo que ocurre cada mes fuera solo un marcador de tiempo y no una fuente de información sobre el cuerpo." },
      { type: "p", text: "Hoy lo entendemos diferente. El ciclo menstrual es, para las mujeres en edad reproductiva, uno de los indicadores más sensibles de salud general. Cuando algo cambia — la regularidad, la intensidad, el dolor, el color — hay algo que vale la pena escuchar." },
      { type: "h2", text: "Qué es un ciclo saludable" },
      { type: "p", text: "Entre 21 y 35 días. Entre 3 y 7 días de sangrado. Un volumen moderado — ni tan escaso que apenas mancha ni tan abundante que requiera cambios de protección cada hora o dos. Algo de molestia premenstrual puede ser común; el dolor que requiere analgésicos fuertes o que te impide funcionar no lo es, aunque lo hayas normalizado hace años." },
      { type: "h2", text: "Señales que merecen atención" },
      { type: "ul", items: [
        "Ciclos menores de 21 días: puede indicar fase lútea insuficiente",
        "Ciclos irregulares o muy largos: frecuentemente asociados con SOP",
        "Sangrado muy abundante: fibromas, adenomiosis o alteraciones tiroideas",
        "Ausencia de menstruación sin embarazo: hipotiroidismo, amenorrea hipotalámica, SOP",
        "Dolor intenso o incapacitante: endometriosis o adenomiosis merecen evaluación",
        "Sangrado entre períodos: siempre merece investigarse",
        "Cambio brusco en tu patrón habitual, aunque el nuevo patrón parezca 'normal'",
      ]},
      { type: "quote", text: "Si tu ciclo cambió, tu cuerpo te está diciendo algo. El trabajo médico es escucharlo — no normalizarlo." },
      { type: "h2", text: "El ciclo como espejo del sistema hormonal y metabólico" },
      { type: "p", text: "El ciclo menstrual refleja el equilibrio entre estrógenos, progesterona, hormonas tiroideas, insulina y cortisol. Un ciclo irregular no es un problema aislado: es una señal de que algo en ese equilibrio merece atención. El estrés crónico puede suprimir la ovulación. El hipotiroidismo puede alargar los ciclos. La resistencia a la insulina puede generar irregularidad con ovarios poliquísticos. Cada patrón tiene una historia detrás." },
      { type: "p", text: "Registrar tu ciclo durante dos o tres meses — duración, intensidad, síntomas, estado de ánimo — es la herramienta más simple y poderosa para entender tu salud hormonal. Esa información, en manos de un médico que sepa leerla, puede orientar una evaluación mucho más precisa que cualquier analítica hecha sin contexto." },
    ],
  },
]

// Hora de publicación por defecto: 05:00 Lima (UTC-5, sin DST). Un post con
// `date: "2026-05-25"` queda invisible hasta 2026-05-25T05:00:00-05:00 (= 10:00 UTC).
// Vercel + Next.js ISR (revalidate = 60s en /blog y /blog/[slug]) hacen que el post
// aparezca en a más tardar ~60s después de su publishTimestamp.
export function publishTimestamp(post: BlogPost): Date {
  return new Date(`${post.date}T05:00:00-05:00`)
}

export function isPublished(post: BlogPost, now: Date = new Date()): boolean {
  return publishTimestamp(post) <= now
}

export function getPublishedPosts(now: Date = new Date()): BlogPost[] {
  return posts.filter((p) => isPublished(p, now))
}

export function getAllSlugs(): string[] {
  return getPublishedPosts().map((p) => p.slug)
}

export function getPost(slug: string): BlogPost | undefined {
  const post = posts.find((p) => p.slug === slug)
  if (!post || !isPublished(post)) return undefined
  return post
}
