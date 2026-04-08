📋 PLAN DE ACCIÓN: IDENTITY FORTRESS (TODO.md)
Este es el plan que ejecutaremos paso a paso, uno a uno, verificando cada aparato antes de tocarlo:
Fase 1: Auditoría de Contratos (SSoT):

Refactorizar auth_portal.schema.ts: Incluir los nuevos campos de consentimiento (TOS, Newsletter) y validadores de fortaleza de contraseña.

Actualizar diccionarios (en-US, es-ES, pt-BR) con las nuevas etiquetas de UI (tooltip del ojo, labels de checkboxes, mensajes de error de bloqueo).
Fase 2: Motor de Fortaleza (Auth Lib):

Crear packages/auth-shield/src/lib/security.ts: Lógica pura y agnóstica para analyzePasswordStrength y gestión de estados de bloqueo (cálculo de 24h).
Fase 3: Refactorización del Aparato AuthPortal.tsx:

Implementar el "Secuestrador de Estado" (sessionStorage context).

Integrar el input de contraseña con visibilidad toggle.

Implementar barra de progreso OKLCH.

Integrar checkboxes de consentimiento (Zod-validated).
Fase 4: Blindaje del Gateway (Backend/Server Actions):

Refactorizar auth/callback/route.ts: Implementar la lógica de recuperación de contexto (redirigir al estado anterior tras callback).

Crear lib/portal/actions/auth-security.actions.ts: Gestión de intentos fallidos, persistencia de estado de bloqueo en Supabase y despacho de alertas al CommsHubManager.
Fase 5: Verificación de Integridad:

Ejecutar pruebas de regresión en el Espejo de Calidad (Ruta tests/).

---

### 🚀 IDENTITY FORTRESS ROADMAP
- [ ] **Data layer (Backend):** Crear `apps/cms-api/src/services/auth-security.ts` para registrar intentos fallidos en `notifications` table y disparar correos de bloqueo.
- [ ] **State Persistence:** Implementar `sessionStorage` para guardar el estado del form antes de disparar `supabase.auth.signInWithOAuth`.
- [ ] **UI/UX:** Integrar `EmailPasswordForm` en `AuthPortal.tsx` usando la lógica de "Secuestrador de Estado".
- [ ] **Telemetry:** Conectar `Heimdall` para loguear intentos de login (éxito/fallo) hacia el Silo D.

---

