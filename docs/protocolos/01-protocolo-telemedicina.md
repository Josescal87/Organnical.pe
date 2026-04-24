# Protocolo de Atención en Telemedicina
**Organnical Ventures S.A.C.**  
Versión 1.0 — Abril 2026  
Elaborado por: Dirección Médica  
Aprobado por: Administración General

---

## 1. Objetivo

Establecer el procedimiento estándar para la atención médica mediante teleconsulta en la plataforma Organnical, garantizando la calidad, seguridad y trazabilidad de cada consulta, en cumplimiento del D.S. 029-2020-SA y la NTS 139-MINSA/2018.

---

## 2. Alcance

Aplica a todos los médicos registrados en Organnical que realicen teleconsultas a pacientes ubicados en territorio peruano.

---

## 3. Marco Legal

- D.S. 029-2020-SA — Reglamento de Telesalud
- NTS 139-MINSA/2018 — Historia Clínica
- RM 447-2024/MINSA — Uso obligatorio CIE-10
- RM 164-2025/MINSA — Sistema de Historia Clínica Electrónica (SIHCE)
- Ley 29733 — Protección de Datos Personales

---

## 4. Requisitos Previos para la Consulta

### 4.1 Del paciente
- Registro completo en la plataforma (nombre, DNI, fecha de nacimiento)
- Aceptación de los 4 consentimientos informados (tratamiento general, telemedicina, uso de cannabis medicinal, tratamiento de datos)
- Dispositivo con cámara, micrófono y conexión a internet estable

### 4.2 Del médico
- CMP activo y verificado en SISERMED
- RNE vigente (para especialistas)
- Perfil completo con horario semanal configurado en la plataforma
- Conexión a internet estable, entorno privado e iluminado

---

## 5. Procedimiento de Atención

### Paso 1 — Preparación (5 min antes)
1. El médico accede al dashboard en organnical.pe
2. Revisa los datos del paciente y su historial clínico previo
3. Ingresa a la sala de videoconsulta por el enlace de host (Whereby)

### Paso 2 — Identificación del paciente
1. Solicitar al paciente que muestre su DNI a cámara
2. Verificar que coincida con los datos registrados en la plataforma
3. Si no coincide, suspender la consulta y notificar al área administrativa

### Paso 3 — Anamnesis y Evaluación (formato SOAP)
- **S (Subjetivo):** Motivo de consulta, historia de la enfermedad, antecedentes relevantes
- **O (Objetivo):** Signos vitales reportados por el paciente, examen físico observable por cámara
- **A (Análisis):** Diagnóstico principal y secundarios con código CIE-10
- **P (Plan):** Tratamiento, indicaciones, seguimiento, derivaciones si aplica

### Paso 4 — Documentación
1. Completar la Historia Clínica Electrónica en la plataforma durante o inmediatamente después de la consulta
2. Firmar digitalmente la HC (el sistema aplica hash SHA-256 o FEA INDECOPI según configuración)
3. Emitir receta digital si corresponde (número correlativo automático formato IPRESS-YYYY-000001)

### Paso 5 — Cierre
1. Informar al paciente sobre el plan de tratamiento
2. Indicar próxima consulta o criterios de derivación presencial
3. Confirmar que el paciente recibió la receta digital por email

---

## 6. Criterios de Derivación Presencial

El médico debe derivar a atención presencial o emergencia cuando:
- Signos vitales fuera de rangos seguros (PA >180/110, FC >130, SpO2 <90%)
- Dolor agudo severo no controlable por vía oral
- Signos de alarma neurológicos (pérdida de conciencia, convulsiones)
- Necesidad de examen físico no evaluable por teleconsulta
- El paciente no puede comunicarse adecuadamente

---

## 7. Problemas Técnicos

| Problema | Acción |
|----------|--------|
| Corte de video/audio < 5 min | Esperar reconexión, continuar consulta |
| Corte > 5 min | Reagendar consulta, notificar al paciente por email |
| Paciente no se conecta en 10 min | Marcar como "no show", notificar por email |
| Falla total de plataforma | Usar Google Meet como respaldo, documentar en HC |

---

## 8. Registros y Trazabilidad

- Toda consulta genera un registro inmutable en el sistema (audit log)
- Las HCs firmadas no pueden modificarse; solo se pueden agregar notas de evolución
- Los registros se conservan por **15 años** según NTS 139-MINSA

---

## 9. Revisión del Protocolo

Este protocolo será revisado anualmente o ante cambios normativos relevantes.

---

*Organnical Ventures S.A.C. | RUC: [completar] | IPRESS código: [completar]*  
*Dirección: [completar] | Teléfono: +51 952 476 574 | reservas@organnical.com*
