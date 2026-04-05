🛡️ I. Manifiesto de Nivelación Incremental: Protocolo HEIMDALL v2.0
Este manifiesto rige la inyección obligatoria de observabilidad en cada aparato refactorizado del ecosistema.
DNA-Level Logging (Trazabilidad): Cada operación crítica (Handshake, Sync, Dispatch) debe generar un Trace ID único al inicio. Este ID debe propagarse por todo el ciclo de vida del proceso para permitir auditorías cruzadas entre el Cliente, el Edge y el CMS.
Métricas de Micro-Acción (Performance): Queda prohibida la ejecución de lógica síncrona o asíncrona sin un cronómetro de precisión (performance.now()). Cada log de finalización debe reportar la latencia en milisegundos con 4 decimales para detectar degradación en el TTFB.
Resiliencia Atómica (Fail-Safe): Todo aparato debe poseer un protocolo de rescate. Si una dependencia externa (S3, Supabase, Diccionarios) falla, Heimdall debe interceptar la anomalía, emitir una alerta roja (CRITICAL_ALARM) y activar un Bypass de Emergencia o servir un Mock de Seguridad.
Visualización Cromática (Terminal Visibility): Los logs deben seguir la paleta de colores estandarizada (Paleta C) para identificación instantánea en Vercel/Node:
Magenta [DNA]: Carga de infraestructura y definiciones.
Cyan [STREAM]: Flujo de datos y transformaciones.
Green [GRANTED]: Éxito de validación o acceso.
Red [BREACH]: Error crítico o violación de perímetro.
Aislamiento de Build (Worker Safety): Las sondas deben detectar el entorno IS_BUILD_ENV. Durante el prerenderizado en Vercel, Heimdall debe silenciar procesos de red y asegurar que el build sea determinista y ligero.
📝 II. Bitácora de Sincronización: El Pivot Soberano (Actualizada 05/04/2026)
Estatus del Sistema: Infraestructura Nivelada | Perímetro de Datos Blindado | Interfaz Operativa v4.0.
1. Infraestructura de Construcción (The Engine)
Orquestador Único: Se creó sovereign-prebuild.ts, fusionando el ensamblaje de diccionarios (MACS) y la generación de tipos Payload. Incluye un Watchdog de 180s para evitar bloqueos infinitos.
Aislamiento de Vercel: Refactorizado payload.config.ts y payload.generate.config.ts con el patrón Lazy DB Handshake. El build ahora usa una base de datos virtual, eliminando el error TypeError: Cannot read properties of undefined (reading 'env').
2. Núcleo de Datos (The CMS Cluster)
Atomización de Identidad: El clúster se movió a users/Users.ts. Se unificó la autoridad mediante ROLES_CONFIG (SSoT), erradicando la duplicidad de roles en el Middleware.
Gobernanza Multi-Tenant: Todas las colecciones (Media, Offers, Projects, Agencies, Subscribers) poseen ahora hooks de Handshake de Propiedad. Un usuario no puede ver ni mutar datos fuera de su Tenant ID.
Reactor de Reputación: Se inyectó lógica reactiva en BusinessMetrics. Al confirmar una reserva, el sistema dispara automáticamente actualizaciones de XP (Protocolo 33) en el Usuario y de Trust Score en la Agencia.
Bóveda Multimedia: Migración total de URLs de texto a relaciones de tipo upload. Los activos ahora son "Asset-Aware", permitiendo optimización LCP automática.
3. Borde y Tráfico (The Sentinel)
Route Guard v7.0: Centralización de la jerarquía de poder. El Edge ahora consume los niveles de autoridad directamente del CMS.
Middleware Resiliente: Implementado protocolo de pánico. Si la validación de ruta falla, el sistema activa un bypass para mantener el hotel online mientras reporta la anomalía.
4. Experiencia de Usuario (Oxygen Portal)
Portal Page v26.0: Refactorizado con Handshake de Identidad de Nivel 5. Mide y reporta la latencia de hidratación entre Supabase y Payload.
Silo Managers: Consolas de Ingestion y Marketing Cloud niveladas. Soportan reporte forense de errores por fila (Excel/CSV) y telemetría de despacho de misiones masivas.

---

