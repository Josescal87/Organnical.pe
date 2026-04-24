# Manual de Bioseguridad Digital
**Organnical Ventures S.A.C.**  
Versión 1.0 — Abril 2026  
Elaborado por: Área de Tecnología  
Aprobado por: Administración General

---

## 1. Objetivo

Definir las medidas de seguridad técnicas y organizativas que Organnical implementa para proteger la confidencialidad, integridad y disponibilidad de los datos clínicos y personales de los pacientes, en cumplimiento de la Ley 29733 y la RM 164-2025/MINSA.

---

## 2. Alcance

Aplica a todo el personal médico, administrativo y técnico que acceda a la plataforma Organnical o a los datos de pacientes.

---

## 3. Infraestructura de Seguridad

### 3.1 Plataforma tecnológica
- **Base de datos:** Supabase (PostgreSQL) con cifrado en reposo AES-256
- **Transmisión:** HTTPS/TLS 1.3 en todos los endpoints
- **Autenticación:** Supabase Auth con tokens JWT de corta duración
- **Videoconsulta:** Whereby (certificación HIPAA) con cifrado extremo a extremo
- **Hosting:** Vercel (infraestructura AWS us-east-1) con redundancia automática
- **Emails transaccionales:** Resend con autenticación SPF/DKIM

### 3.2 Control de acceso (RLS)
- Cada usuario solo puede acceder a sus propios datos (Row Level Security)
- Los médicos solo pueden ver HCs de sus propios pacientes
- Los administradores tienen acceso auditado y registrado
- No existe acceso directo a la base de datos desde el frontend

---

## 4. Gestión de Credenciales

### 4.1 Médicos y personal
- Contraseña mínima: 8 caracteres, combinación de letras y números
- Sesiones con expiración automática a las 24 horas de inactividad
- Cada sesión queda registrada con IP y timestamp en el audit log
- Prohibido compartir credenciales entre personas

### 4.2 Credenciales del sistema
- Todas las claves API y secretos se almacenan en variables de entorno cifradas (Vercel)
- Nunca se almacenan en el código fuente
- Rotación de claves cada 12 meses o ante sospecha de compromiso

---

## 5. Audit Trail (RM 164-2025/MINSA)

Toda acción sobre datos clínicos genera un registro inmutable que incluye:
- Fecha y hora exacta (UTC)
- ID del actor (médico o admin)
- Rol del actor
- Dirección IP
- Acción realizada (ver, crear, actualizar, firmar, descargar, eliminar)
- Recurso afectado y su ID
- ID del paciente relacionado

Los logs de auditoría:
- No pueden modificarse ni eliminarse
- Se conservan por **5 años**
- Son exportables en CSV para inspecciones SUSALUD

---

## 6. Firma Digital de Historias Clínicas

- Todas las HCs firmadas incluyen un hash criptográfico (SHA-256 mínimo)
- El hash vincula el contenido clínico con la identidad del médico y el timestamp
- Una HC firmada no puede modificarse; cualquier cambio invalida el hash
- El sistema está preparado para integrar Firma Electrónica Avanzada (FEA) acreditada INDECOPI (DigiSign) cuando se active

---

## 7. Protocolo ante Incidente de Seguridad

### Detección
- Monitoreo continuo de accesos anómalos
- Alertas automáticas ante múltiples intentos de login fallidos

### Respuesta (primeras 72 horas)
1. Identificar el alcance del incidente
2. Aislar los sistemas afectados si es necesario
3. Notificar a la Autoridad Nacional de Protección de Datos (ANPDP) si corresponde
4. Notificar a los pacientes afectados por email
5. Documentar el incidente y las medidas tomadas

### Contacto de respuesta
- Responsable técnico: jose@organnical.com
- Responsable de privacidad: privacidad@organnical.com

---

## 8. Capacitación del Personal

- Todo médico nuevo recibe inducción sobre este manual antes de su primera consulta
- Capacitación anual de actualización
- El personal firma declaración de confidencialidad al incorporarse

---

## 9. Revisión del Manual

Revisión anual o ante cambios en la infraestructura tecnológica o normativa aplicable.

---

*Organnical Ventures S.A.C. | RUC: [completar] | IPRESS código: [completar]*  
*Dirección: [completar] | Teléfono: +51 952 476 574 | reservas@organnical.com*
