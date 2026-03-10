# BITÁCORA DE EVOLUCIÓN: Beach Hotel Canasvieiras & Fest 2026
**Estatus:** Integración CMS FASE A (Configuración de Motor)

## Hitos Completados
1.  **Nivelación de Infraestructura (Fase 0):** Estandarización de `cn()`, tokens semánticos en CSS global y configuración de Tailwind v4.
2.  **Evolución de UI (Fase 1 - Átomos):** Refactorización completa de `Avatar`, `Flag`, `QrCode`, `ColorWaveBar`, `FadeIn` y `PillarCard`. Integración de estándares de élite y accesibilidad.
3.  **Gestión de Moléculas/Organismos (Fase 2):** Integración de `VisitorHud`, `LanguageSwitcher`, `PrintButton`, `Header`, `Footer` y `MobileMenu`.
4.  **Arquitectura de Datos (Fase 3):** Creación del paquete `packages/cms/core`. Definición del motor `payload.config.ts` y colecciones `Users`, `BlogPosts`, `Projects`.
5.  **Puente Web <-> CMS:** Configuración de `next.config.js` y `app/api/payload/[[...slug]]/route.ts` para habilitar la API Local de Payload.

## Estado de la Infraestructura
- [x] Monorepo Nx configurado con fronteras estrictas.
- [x] Middleware de i18n blindado para coexistencia con Payload.
- [x] Base de datos Supabase operativa (validado con script de diagnóstico).
- [ ] Integración final: Payload "Seeding" (Migración de Mocks a DB).

## Pendientes Críticos
- [ ] Refactorización de las rutas `/blog` para consumir datos mediante `getPayloadHMR`.
- [ ] Implementación del motor de búsqueda/filtro de `TechGrid` contra colecciones de Payload.