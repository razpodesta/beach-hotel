🏛️ MANIFIESTO: IDENTITY FORTRESS & PROTOCOLO DE DEFENSA (v1.0)
Defensa Adaptativa (Multiplicador de Bloqueo): Implementamos un sistema de exponential backoff en los intentos fallidos.
Niveles: 1-5 intentos (Normal), 6 (Bloqueo 1h), 7 (Bloqueo 4h), 8+ (Bloqueo 24h).
Soberanía: Cada evento de bloqueo dispara un evento de telemetría a Notifications (Silo D) y envía un correo preventivo vía MailCloud (Silo C).
Fortaleza Sensorial (UX/UI):
Visualización: Toggle de visibilidad de contraseña (ojo boutique con transición framer-motion).
Análisis: Barra de fortaleza dinámica (zod-based) con colores OKLCH (rojo/amarillo/verde).
Captura de Consentimiento (Compliance):
Checkbox integrado para Términos de Servicio y Newsletter.
Arquitectura "Opt-in" por diseño, cumpliendo con regulaciones de datos.
Continuidad de Estado (Sovereign Context): Serialización del estado de la UI en sessionStorage antes de disparar el OAuth Redirect.

---

