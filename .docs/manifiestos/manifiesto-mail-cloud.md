# Manifiesto: Clúster de Comunicación Masiva (MailCloud)
**Versión:** 1.0 (Protocolo de Ingesta y Despacho)
**Estatus:** OBLIGATORIO / LEGO-Library
**Workspace:** `@metashark/mail-cloud`

## 1. Misión
Proveer una infraestructura de envío de correo masivo y transaccional altamente disponible, desacoplada del proveedor final, con capacidad de ingesta de bases de datos externas.

## 2. Protocolo de Ingesta (Excel/CSV)
- **Validación Forense:** El parser debe validar en el Edge la estructura del archivo.
- **Campos Requeridos:** `email` (Unique Index), `name`.
- **Sanitización:** Eliminación automática de duplicados y validación de sintaxis RFC 5322.

## 3. Motor de Despacho (Adapter Pattern)
- **Fase Actual:** Implementación via Resend API (REST).
- **Fase Soberana:** Preparado para migración a Servidor SMTP propio mediante el patrón "Adapter".
- **Telemetría Heimdall:** Seguimiento de `sent_id`, `open_rate`, y `bounce_log`.

## 4. Resiliencia SaaS
- Los envíos se agrupan por `tenant_id` para evitar penalizaciones de reputación cruzada entre propiedades.