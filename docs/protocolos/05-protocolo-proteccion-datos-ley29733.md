# Protocolo de Protección de Datos Personales
**Organnical Ventures S.A.C.**  
Versión 1.0 — Abril 2026  
Elaborado por: Administración General  
Aprobado por: Gerencia General

---

## 1. Objetivo

Establecer las políticas y procedimientos para el tratamiento, protección y gestión de los datos personales y clínicos de los pacientes de Organnical, en cumplimiento de la Ley N° 29733 y su Reglamento D.S. 003-2013-JUS.

---

## 2. Responsable del Tratamiento

**Organnical Ventures S.A.C.**  
RUC: [completar]  
Dirección: [completar], Lima, Perú  
Correo de privacidad: privacidad@organnical.com  
Responsable designado: [nombre del responsable]

---

## 3. Datos que se Recopilan

### 3.1 Datos de identificación
- Nombre completo, DNI/CE, fecha de nacimiento, género
- Teléfono, correo electrónico, dirección

### 3.2 Datos clínicos (datos sensibles — Art. 13 Ley 29733)
- Historia clínica electrónica (SOAP)
- Diagnósticos con código CIE-10
- Recetas médicas y medicamentos prescritos
- Signos vitales registrados durante consultas
- Antecedentes médicos, alergias, cirugías previas

### 3.3 Datos de uso de la plataforma
- Logs de acceso (IP, navegador, timestamp)
- Registros de consultas realizadas
- Consentimientos aceptados con fecha y hora

---

## 4. Finalidad del Tratamiento

| Finalidad | Base legal |
|-----------|-----------|
| Prestación del servicio médico | Ejecución del contrato |
| Emisión de recetas y HCs | Obligación legal (NTS 139-MINSA) |
| Facturación y pagos | Obligación legal (SUNAT) |
| Mejora de la plataforma | Interés legítimo |
| Comunicaciones de salud | Consentimiento explícito |
| WhatsApp recordatorios | Consentimiento explícito (opt-in) |

---

## 5. Transferencias Internacionales

Organnical utiliza los siguientes proveedores con infraestructura fuera de Perú, con garantías contractuales adecuadas:

| Proveedor | País | Servicio | Garantía |
|-----------|------|---------|---------|
| Supabase (AWS) | Estados Unidos | Base de datos | Cláusulas contractuales estándar |
| Vercel | Estados Unidos | Hosting | Cláusulas contractuales estándar |
| Resend | Estados Unidos | Emails transaccionales | Cláusulas contractuales estándar |
| MercadoPago | Argentina | Pagos | Acuerdo de tratamiento de datos |
| Google (Workspace) | Estados Unidos | Calendario y Meet | BAA / DPA |
| Whereby | Noruega/UE | Videoconsulta | HIPAA BAA, GDPR compliant |
| WATI (Meta) | India/Global | WhatsApp Business | Acuerdo de procesador de datos |

---

## 6. Plazos de Conservación

| Tipo de dato | Plazo | Base legal |
|-------------|-------|-----------|
| Historia clínica electrónica | 15 años | NTS 139-MINSA/2018 |
| Audit logs de acceso | 5 años | RM 164-2025/MINSA |
| Datos de pago y facturación | 5 años | SUNAT / Ley 29733 |
| Consentimientos informados | Permanente | Obligación legal |
| Datos de marketing (opt-in) | Hasta revocación | Consentimiento |

Vencido el plazo, los datos se eliminan de forma segura o se anonomizan irreversiblemente.

---

## 7. Derechos ARCO+ del Titular

Los pacientes tienen derecho a:

| Derecho | Descripción | Plazo de respuesta |
|---------|------------|-------------------|
| **Acceso** | Obtener copia de sus datos personales | 20 días hábiles |
| **Rectificación** | Corregir datos inexactos o incompletos | 20 días hábiles |
| **Cancelación** | Solicitar eliminación de datos (sujeto a plazos legales) | 20 días hábiles |
| **Oposición** | Oponerse a tratamientos específicos (ej: marketing) | 20 días hábiles |
| **Portabilidad** | Recibir sus datos en formato estructurado | 20 días hábiles |
| **No discriminación** | No ser discriminado por ejercer sus derechos | Inmediato |

### Cómo ejercer los derechos
Enviar solicitud escrita a **privacidad@organnical.com** con:
- Nombre completo y DNI
- Derecho que desea ejercer
- Descripción de la solicitud

Si la respuesta no es satisfactoria, el titular puede acudir a la **Autoridad Nacional de Protección de Datos Personales (ANPDP)** — MINJUSDH.

---

## 8. Medidas de Seguridad

Ver Manual de Bioseguridad Digital (Protocolo 04) para el detalle técnico. Resumen:

- Cifrado AES-256 en reposo y TLS 1.3 en tránsito
- Control de acceso por roles (RLS)
- Audit trail inmutable de todas las acciones
- Videoconsultas cifradas de extremo a extremo (Whereby HIPAA)
- Sin acceso de terceros a datos sin contrato de encargado de tratamiento

---

## 9. Cookies

La plataforma usa cookies técnicas necesarias para el funcionamiento. No se usan cookies publicitarias sin consentimiento explícito. El usuario puede aceptar o rechazar cookies opcionales mediante el banner en la plataforma.

---

## 10. Modificaciones a este Protocolo

Cualquier cambio relevante en el tratamiento de datos será comunicado a los pacientes por email con al menos 30 días de anticipación.

---

## 11. Revisión del Protocolo

Revisión anual o ante cambios en la Ley 29733 o incorporación de nuevos proveedores con transferencias internacionales.

---

*Organnical Ventures S.A.C. | RUC: [completar] | IPRESS código: [completar]*  
*Dirección: [completar] | Teléfono: +51 952 476 574 | privacidad@organnical.com*
