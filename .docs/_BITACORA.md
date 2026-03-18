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

---

## Hito: Unificación Soberana (Namespace @metashark) - 11/03/2026
**Estatus:** Sincronización de Contratos Completada

### Avances Técnicos
- **Estandarización de Namespaces:** Migración total de `@razpodesta` y `@portfolio` a `@metashark/`.
- **Higiene de Compilación:** Eliminación de errores TS17002 y TS2307 mediante la nivelación de `tsconfig.json` y la inyección de declaraciones globales de CSS Modules.
- **Blindaje de Dependencias:** Corrección del adaptador de base de datos en `cms-core` para compatibilidad con Payload 3.0 (SSL Pool fix).
- **Consolidación Nx:** Refactorización de `nx.json` y `project.json` para builds secuenciales y caché inteligente.

### Estado de Infraestructura
- [x] Grafo de dependencias unificado bajo `@metashark`.
- [x] Sistema de Typecheck raíz operativo.
- [x] Librerías Core, UI, Auth y Gamificación niveladas.

---

BITÁCORA DE EVOLUCIÓN: Beach Hotel Canasvieiras & Fest 2026
Estatus: Infraestructura de Producción Validada & Blindaje de Build
Fecha: 16 de Marzo de 2026
1. Hito: Resiliencia de Build y Despliegue (Fase Crítica)
Problema: El proceso de compilación en Vercel colapsaba con un TypeError: Cannot read properties of null (reading 'useContext') debido a intentos prematuros de hidratación de componentes de cliente en el servidor durante el SSG (Static Site Generation).
Acciones de Nivelación:
Hidratación Atómica: Implementación de un Hook soberano useIsMounted basado en la primitiva useSyncExternalStore de React 19 en componentes críticos (Providers, VisitorHud, NewsletterModal, BlogCard). Esto erradica los renders en cascada y los errores de contexto nulo.
Aislamiento de Renderizado: Refactorización del RootLayout inyectando límites de Suspense alrededor de componentes de cliente que dependen de estados globales (Header, Ticker, NavigationTracker).
Limpieza de Lógica Muerta: Eliminación de advertencias de ESLint (no-empty-function, no-unused-vars) en scripts y componentes de UI, asegurando una higiene de código de grado producción.
2. Hito: Unificación Soberana y Aplanamiento de Núcleo
Objetivo: Reducir la complejidad del grafo de dependencias y optimizar la resolución de módulos ESM.
Acciones de Nivelación:
Erradicación de Barrel Files: Eliminación física del archivo intermedio packages/cms/core/src/collections/index.ts.
Exportación Directa: Centralización de todas las colecciones (Users, BlogPosts, Projects, Media) y la configuración de Payload en el índice raíz del paquete @metashark/cms-core.
Sincronización de Alias: Actualización masiva de tsconfig.base.json, tsconfig.json de apps y configuraciones de Jest para reflejar el nuevo esquema de exportaciones atómicas, eliminando rutas huérfanas de collections.
3. Hito: Blindaje de Infraestructura de Datos (Supabase Real)
Objetivo: Conectar el CMS a una base de datos de producción real ignorando las restricciones de red y certificados de los poolers transaccionales.
Acciones de Nivelación:
Compatibilidad libpq: Refactorización de la cadena de conexión en payload.config.ts y scripts de diagnóstico para forzar uselibpqcompat=true y sslmode=require.
Relajación de Handshake SSL: Configuración de rejectUnauthorized: false para permitir la conexión a través de los poolers de Supabase en entornos Serverless, resolviendo el error self-signed certificate in certificate chain.
Estandarización de Variables: Alineación total entre el Dashboard de Vercel y el código fuente para el uso unívoco de DATABASE_URL y PAYLOAD_SECRET.
4. Hito: Suite de Diagnóstico Forense
Objetivo: Proveer visibilidad total sobre el estado del ecosistema de datos antes del despliegue.
Herramientas Implementadas:
db:connection: Script verboso para validar el latido (heartbeat) de la base de datos y la integridad de las variables de entorno.
db:schema: Herramienta de auditoría profunda que genera reportes JSON sobre tablas existentes, estado de RLS (Row Level Security) y políticas activas.
Integración tsx: Migración de ts-node a tsx para garantizar compatibilidad nativa con módulos ESM y ejecución de scripts de alta velocidad.
Estado Actual de la Arquitectura

Conexión TCP/SSL a Supabase Producción: EXITOSA.

Grafo de Dependencias (Pnpm Workspaces): SANEADO.

Blindaje de Hidratación de Layout: COMPLETADO.

Auditoría de Esquema (DB Virgen): CONFIRMADA.
Próximo Paso Crítico
Fase "Big Bang": Ejecución del servidor en modo development local contra la DB de producción para realizar el Schema Push automático y creación del Usuario Administrador Global a través del panel de Payload.

---

BITÁCORA DE EVOLUCIÓN: Beach Hotel Canasvieiras & Fest 2026
Fecha: 16 de Marzo de 2026 | 21:05 BRT
Estatus: Estabilización de Capa de Datos e Infraestructura de Build
1. Hitos Completados (Cierre de Fase de Estabilización)
Purga Semántica del Proyecto: Eliminación total de código huérfano, archivos JSON redundantes (quien_soy, curriculum) y limpieza profunda de importaciones (no-unused-vars erradicado de AboutSection.tsx y route-guard.ts).
Blindaje de Enrutamiento: Refactorización del middleware.ts y route-guard.ts con una Arquitectura de Túnel (Bypass) para las rutas del CMS (/admin, /_payload). Esto soluciona los errores de redirección y colisión de i18n, permitiendo el acceso directo al panel administrativo.
Integridad de Tipos (Zero Drift): Resolución total de errores de compilación TS2339 y TS2367 en route-guard.ts mediante la implementación de Discriminated Unions y desestructuración de sesión, garantizando un flujo de trabajo 100% Type-Safe.
Orquestador de Diccionarios (Prebuild v12.1): El script de pre-construcción ahora es un Sistema de Diagnóstico Forense. Ya no depende de archivos .js compilados (evitando errores de resolución), utiliza tsx para ejecución directa y genera un reporte JSON de auditoría (reports/dictionaries/prematch-report.json) que bloquea el build si detecta cualquier inconsistencia entre idiomas.
2. Mapa de Ruta: Rumbo al "Build Exitoso" en Vercel
Para que el despliegue en Vercel sea un "reloj suizo" sin regresiones, los pasos finales son:
[ ] Inyección de Datos (Seeding): Ejecutar pnpm db:seed. Esto poblará la base de datos de producción con el estado inicial (Admin + Media Library + Proyectos + Journal), evitando que Next.js intente renderizar páginas con datos nulos.
[ ] Validación de Assets Públicos: Verificar que las imágenes referenciadas en MOCK_POSTS y MOCK_PROJECTS existan en la carpeta /public (actualmente algunas reportaron 404 al intentar cargar desde el dashboard).
[ ] Auditoría Final de Environment: Verificar las variables en el Dashboard de Vercel (DATABASE_URL, PAYLOAD_SECRET) contra nuestro script scripts/supabase/check-connection.ts.
[ ] Build Final: Ejecución de vercel-build (que corre prebuild + build).
