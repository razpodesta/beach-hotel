/**
 * @file packages/cms/core/src/index.ts
 * @description Enterprise Core Registry (The Data Gateway).
 *              Fachada pública soberana que orquesta la exposición atómica de 
 *              colecciones, configuraciones y contratos del ecosistema MetaShark.
 *              Refactorizado: Sincronización de rutas para Identity Cluster, 
 *              exposición de constantes de autoridad y limpieza de dependencias.
 * @version 10.0 - SSoT Path Synchronization
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. INFRASTRUCTURE & CONFIGURATION
 * @description Exportación del orquestador central de Payload 3.0.
 */
export { default as config } from './payload.config';

/**
 * 2. IDENTITY & ACCESS CONTROL (SBU: Core)
 * @fix: Nivelación de ruta tras la atomización del dominio de identidad.
 */
export * from './collections/users/Users';
export * from './collections/Tenants';
export * from './collections/Access';

/**
 * 3. REVENUE ENGINE (SBU: Silo A)
 */
export * from './collections/Offers';
export * from './collections/FlashSales';

/**
 * 4. PARTNER NETWORK & PRM (SBU: Silo B)
 */
export * from './collections/Agencies';
export * from './collections/Agents';
export * from './collections/BusinessMetrics';

/**
 * 5. INTELLIGENCE & MARKETING CLOUD (SBU: Silo C)
 */
export * from './collections/Ingestions';
export * from './collections/Subscribers';

/**
 * 6. ASSET LIBRARY & CONTENT (SBU: Experience)
 */
export * from './collections/Media';
export * from './collections/BlogPosts';
export * from './collections/Projects';

/**
 * 7. INFRASTRUCTURE & COMMS (SBU: Silo D)
 */
export * from './collections/Notifications';
export * from './collections/DynamicRoutes';

/**
 * 8. STATIC CONTRACTS, CONSTANTS & TYPES
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description Estos contratos blindan el build contra la latencia de autogeneración
 *              y permiten el consumo de lógica de autoridad en el Edge.
 */

// Exportación de tipos de maquetación y documentos
export type { ProjectLayoutStyleType } from './collections/Projects';
export type { PayloadMediaDoc } from './collections/Media';

// Exportación de Inteligencia de Roles (Para Middleware y Route Guard)
// @fix: Exposición de constante y tipos para evitar violaciones de frontera Nx.
export { ROLES_CONFIG } from './collections/users/roles/config';
export type { SovereignRoleType, RoleConfig } from './collections/users/roles/config';

/**
 * @note Protocolo Heimdall:
 * Este archivo es el punto de falla único para la resolución de módulos.
 * La versión 10.0 garantiza que el árbol de dependencias sea 100% verídico
 * con respecto a la estructura física de carpetas del monorepo.
 */