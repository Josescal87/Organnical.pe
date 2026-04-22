# 📧 Templates de Email — Dolor Crónico · Reactivación Abril 2025
**Plataforma:** Resend API · `lib/emails.ts`  
**Segmento:** Pacientes inactivos +90 días

---

## Email 1 — Jueves 23 · Lanzamiento (Reconocimiento emocional)

**Asunto A:** ¿Cómo está tu dolor estos días, [Nombre]?  
**Asunto B (A/B test):** Hace tiempo no sabemos de ti — y eso nos importa  
**Preview text:** Tenemos algo para ti esta semana 💚

---

Hola [Nombre],

Hace un tiempo nos consultaste por tu dolor crónico.

Sabemos que el dolor — cuando es constante — termina volviéndose parte de la rutina. Uno lo aguanta, lo normaliza, y a veces deja de buscar soluciones porque ya intentó de todo.

Queríamos decirte algo:

**Eso no tiene que ser así.**

La medicina integrativa parte de un principio simple: tu caso de hoy no es el mismo de hace seis meses. Y merece una evaluación fresca, con lo que estás viviendo ahora.

---

### 🎁 Esta semana, solo para pacientes que ya nos conocen:

**Teleconsulta de seguimiento a S/100**  
*(precio regular: S/150)*

✅ 45 minutos con tu médico  
✅ Revisión de tu protocolo actual  
✅ Ajustes personalizados si es necesario  
✅ Todas tus preguntas respondidas  
✅ 100% online — desde donde estés

**Válida hasta el miércoles 29 de abril.**

---

[**AGENDAR MI CONSULTA → S/100**]  
*(botón CTA · link a calendario)*

O escríbenos por WhatsApp: **+51 952 476 574**

---

Con mucho cariño,  
**Equipo Organnical** 🌿  
Telemedicina · Medicina Integrativa · Lima, Perú  
[organnical.pe](https://organnical.pe)

*Si no deseas recibir más correos, puedes darte de baja aquí.*

---

## Email 2 — Domingo 26 · Recordatorio suave (no respondieron Email 1)

**Asunto:** Una consulta rápida, [Nombre] 😊  
**Preview text:** Tu oferta sigue vigente hasta el miércoles

---

Hola [Nombre],

El jueves te escribimos y queríamos insistir — con respeto — porque sabemos que el momento importa.

El dolor crónico tiene algo difícil: cuando uno lo vive mucho tiempo, empieza a sentir que *"así nomás es"*. Pero eso no es cierto.

Esta semana aún tienes la oportunidad de una **teleconsulta de seguimiento a S/100** con nuestros médicos especializados.

---

**¿Qué pasa en esa consulta?**

Tu médico revisa cómo estás *hoy*. No el expediente de hace meses — sino cómo te sientes, qué cambió, qué funciona y qué no. A partir de ahí, ajustan el enfoque.

Es el tipo de atención que mereces.

---

[**AGENDAR AHORA → S/100**]  
*(botón CTA)*

Válida hasta el **29 de abril**. Después vuelve a S/150.

Con cariño,  
**Equipo Organnical** 🌿  
+51 952 476 574

---

## Email 3 — Martes 29 · Cierre con urgencia real

**Asunto:** Hoy es el último día, [Nombre]  
**Asunto B:** S/100 solo hasta hoy — después vuelve a S/150  
**Preview text:** No te lo pierdas ⏰

---

Hola [Nombre],

Hoy cierra la oferta.

**Teleconsulta de seguimiento a S/100 — solo hasta las 11:59pm de hoy.**

Si tu dolor crónico sigue siendo parte de tu día a día — si sientes que el tratamiento ya no te funciona igual, o si simplemente llevas tiempo sin revisarte — *hoy es el mejor momento para dar ese paso.*

Mañana vuelve a S/150. No hay extensión.

---

[**AGENDAR MI CONSULTA — ÚLTIMO DÍA**]  
*(botón CTA, color rojo/urgencia)*

O escríbenos ahora: **+51 952 476 574**

---

Con cariño,  
**Equipo Organnical** 🌿

---

## Notas técnicas para implementación (Resend)

```typescript
// lib/emails.ts — estructura base para esta campaña
const reactivacionEmail = {
  from: 'Equipo Organnical <hola@organnical.pe>',
  replyTo: 'contacto@organnical.pe',
  tags: [
    { name: 'campaign', value: 'dolor-cronico-reactivacion-abril2025' },
    { name: 'segment', value: 'pacientes-inactivos-90d' }
  ]
}
```

**Segmentos Supabase para el envío:**
```sql
-- Pacientes inactivos +90 días (schema medical)
SELECT p.email, p.first_name
FROM medical.profiles p
LEFT JOIN medical.appointments a ON a.patient_id = p.id
WHERE p.role = 'patient'
  AND (
    a.id IS NULL
    OR a.scheduled_at < NOW() - INTERVAL '90 days'
  )
GROUP BY p.id
HAVING MAX(a.scheduled_at) < NOW() - INTERVAL '90 days'
   OR MAX(a.scheduled_at) IS NULL;
```

---

*Marketing OS · Organnical.pe · Templates aprobados compliance Ley 30681*
