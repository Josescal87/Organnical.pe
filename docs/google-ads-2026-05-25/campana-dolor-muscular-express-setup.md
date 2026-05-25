# Campaña Dolor Muscular Express — Setup Google Ads

> Lista de configuración paso a paso para crear la nueva campaña. Copiar/pegar directo.

## 0. Pre-flight checklist (antes de crear la campaña)

- [ ] Landing `/especialidades/dolor-muscular` ya está deployada en producción (confirmar visitando `https://www.organnical.pe/especialidades/dolor-muscular`)
- [ ] Conversión `consulta_express_pagada` ya está importada en Ads como acción principal (si no, hacerlo primero — toma 10 min en GA4 → Eventos → marcar como conversión → 24h después aparece para importar)
- [ ] Verificar que la campaña vieja **Dolor Crónico** quedó pausada/detenida (su budget se libera)

---

## 1. Crear campaña — datos generales

| Campo | Valor |
|---|---|
| **Tipo** | Búsqueda |
| **Objetivo** | Ventas (o Clientes potenciales) |
| **Nombre** | `Organnical — Dolor Muscular Express — Búsqueda` |
| **Red** | Solo Búsqueda (DESMARCAR Display y Search Partners) |
| **Ubicación** | Perú |
| **Idioma** | Español |
| **Audiencias** | Sin segmentación demográfica al inicio |
| **Budget diario** | **S/12/día** (mismo que liberó Dolor Crónico) |
| **Estrategia de oferta** | Maximizar clics con CPC manual máximo S/0.50 (cambiar a Maximizar conversiones cuando haya 30+ conv. tracked) |
| **Programación** | 24/7 inicialmente, luego ajustar |
| **Ajuste de oferta domingos** | +20% |
| **Dispositivo** | Mobile +10%, Desktop -50% (97% del tráfico es mobile) |

---

## 2. Estructura — 3 Ad Groups

Separamos en 3 ad groups para que el copy haga match específico con la búsqueda (mejora Quality Score y baja el CPC):

### Ad Group 1: Cuello & Tortícolis

**Keywords (concordancia de frase, entre comillas):**

```
"dolor de cuello"
"tortícolis"
"dolor cervical"
"me duele el cuello"
"tengo torticolis"
"como aliviar dolor de cuello"
"dolor de cuello y hombros"
"cuello tenso"
```

### Ad Group 2: Contractura & Tensión Muscular

**Keywords:**

```
"contractura muscular"
"tensión muscular"
"musculo contracturado"
"como aliviar una contractura"
"contractura cervical"
"contractura en la espalda"
"musculos tensos"
"que tomar para contractura"
```

### Ad Group 3: Dolor de Espalda & Lumbar

**Keywords:**

```
"dolor de espalda"
"dolor lumbar"
"me duele la espalda"
"como aliviar el dolor de espalda"
"dolor de espalda baja"
"dolor de espalda alta"
"que hacer si me duele la espalda"
"dolor de cintura"
```

> **Tip:** Pegar las keywords directamente como están (con comillas) — Ads las reconoce como concordancia de frase. Si quieres más volumen, agregá `[exact match]` con corchetes para 2-3 de las más frecuentes después del primer test.

---

## 3. Anuncio responsivo de búsqueda — copy

**Misma estructura para los 3 ad groups** (Google selecciona los títulos que mejor encajen con cada keyword). Si querés copy súper específico por ad group, podés duplicar este template y cambiar los títulos #1 y #2 para que mencionen el sub-tipo (cuello / contractura / espalda).

### URL final
```
https://www.organnical.pe/especialidades/dolor-muscular
```

### Paths (URL visible)
- Path 1: `consulta-express`
- Path 2: `dolor-muscular`

### Títulos (15 máx, 30 caracteres c/u)

```
1.  Dolor de Espalda o Cuello?
2.  Consulta Express por S/30
3.  Médico te Escribe en 2 Horas
4.  Sin Filas Ni Salas de Espera
5.  Por WhatsApp Desde tu Casa
6.  Médico Online S/30 — Perú
7.  Contractura? Te Orienta Hoy
8.  Tortícolis Aguda — Atención Hoy
9.  Plan de Manejo Documentado
10. Médico Certificado MINSA
11. Atención Sin Agendar Cita
12. Dra Prialé · Médica MINSA
13. Dolor Muscular — Médico Online
14. Pagas Solo Si Confirmas
15. Lumbalgia — Orientación Médica
```

### Descripciones (4 máx, 90 caracteres c/u)

```
1. Te duele la espalda o el cuello? Médico te escribe por WhatsApp en menos de 2h. S/30.
2. Médico certificado MINSA evalúa tu dolor agudo. Plan de manejo documentado. Sin filas.
3. Consulta Express por S/30. Sin agendar. La Dra te contacta cuando tú elijas (hoy o mañana).
4. Contractura, tortícolis, dolor lumbar. Orientación médica real por WhatsApp. Desde Perú.
```

### Sitelinks (mínimo 6 según Google)

| Texto | URL | Descripción 1 | Descripción 2 |
|---|---|---|---|
| Consulta Express S/30 | `/consulta-express` | Te escribe la Dra en menos de 2h | Sin agendar, sin filas |
| Cómo funciona | `/especialidades/dolor-muscular#como-funciona` | 4 pasos simples | Pagas solo si confirmas |
| Conocé a tu médica | `/especialidades/dolor-muscular#doctora` | Dra. Mariana Prialé | CMP 63694 · Certificada MINSA |
| Preguntas frecuentes | `/preguntas-frecuentes` | Resuelve dudas comunes | Sobre la consulta Express |
| Plan documentado | `/especialidades/dolor-muscular#plan` | Médica te orienta paso a paso | Plan registrado oficialmente |
| Otras especialidades | `/especialidades/sueno` | También atendemos sueño | Ansiedad, salud femenina |

### Callouts (extensiones de texto destacado)

```
Médico Certificado MINSA
Plan de Manejo Documentado
Sin Lista de Espera
Atención Misma Tarde
Pago por MercadoPago
Por WhatsApp 9am–9pm
```

### Structured snippets (servicios)

- **Encabezado:** Servicios
- **Valores:** `Consulta Express por WhatsApp, Plan de Manejo Documentado, Orientación Médica, Derivación a Especialista, Seguimiento por Mensaje`

---

## 4. Negativas iniciales — agregar a nivel campaña

Aplicar las del reporte #3 + algunas específicas de esta vertical:

**Generales (ya identificadas en el reporte):**
```
debilidad muscular
cansancio y dolor muscular
remedios caseros
remedios naturales
productos naturales
hipnosis
magnesio para dormir
vitaminas
enrique villanueva
```

**Específicas de Dolor Muscular Express (excluir):**
```
fisioterapia
quiropráctico
quiropractico
masaje
masajista
osteopata
acupuntura
fractura
esguince grave
me golpeé
accidente
operación
cirugía
crónico
crónica
fibromialgia
```

> El bloque de "específicas" excluye búsquedas que buscan otro tipo de servicio (físico) o casos crónicos/graves que no son para Express. Mantenemos el ticket S/30 para dolor agudo subagudo manejable por WhatsApp.

---

## 5. Tracking — verificar que estos eventos se cuenten

| Acción de conversión | Estado deseado | Notas |
|---|---|---|
| `consulta_express_pagada` | **Acción principal de ventas** | Esta es la que tiene que disparar Smart Bidding |
| `cita_solicitada` | Acción principal secundaria | Sigue siendo válida para teleconsulta S/150 |
| `PURCHASE` (page view /agendar) | **Bajar a secundaria** (renombrar a `pageview_agendar`) | Era engañosa como primary |

---

## 6. Después del lanzamiento — qué monitorear

**Primeras 48 horas:**
- ¿La landing está convirtiendo? Si CTR>4% pero 0 visitas a `/consulta-express` desde dolor-muscular, hay problema en el CTA
- ¿Algún anuncio rechazado por política? Si pasa, dolor muscular agudo no debería disparar el filtro de "drogas recreativas" porque no mencionamos cannabis, CBD ni términos crónicos

**Primera semana:**
- CTR objetivo: >4%
- CPC objetivo: <S/0.40
- Conversion rate objetivo: 5-8% (de visita a `/consulta-express` a pago confirmado)
- CPA objetivo: <S/45 inicial (luego optimizar a <S/30 con Smart Bidding)

**Si al día 5 no hay conversiones:**
- Verificar que `consulta_express_pagada` se está disparando (probar con un coupon de 100% descuento end-to-end)
- Considerar bajar el bid manual a S/0.30 para forzar más eficiencia
- Aumentar negativas si los términos de búsqueda muestran intención no alineada

---

## 7. Resumen de cambios totales después de este sprint

Si todo se ejecuta esta semana, así queda la cuenta:

| Campaña | Budget/día | Landing | Estado |
|---|---|---|---|
| Insomnio | S/18 | `/consulta-express?motivo=Insomnio...` | Habilitada — URL actualizada |
| Ansiedad | S/15 | `/consulta-express?motivo=Ansiedad...` | Habilitada — URL actualizada |
| Dolor Crónico | S/0 | — | **Pausada definitivamente** |
| 🆕 Dolor Muscular Express | S/12 | `/especialidades/dolor-muscular` | **NUEVA** |
| **Total** | **S/45/día** | | |

Eso es +S/21/día vs los S/24 actuales (+87%), justificado por:
- Tracking real funcionando (CPA medible)
- Express S/30 baja el CPA esperado y mejora eficiencia
- Una landing dedicada por vertical (Quality Score sube → CPC baja)
