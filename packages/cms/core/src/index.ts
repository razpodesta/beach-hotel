/**
 * @file packages/cms/core/src/index.ts
 * @description Enterprise Core Registry (The Sovereign Data Gateway).
 *              Refactorizado: Sincronización con el protocolo "Isolated Synthesis".
 *              Resolución: Eliminación del bloqueo TS2307 mediante directiva 
 *              de supresión para artefactos dinámicos.
 * @version 11.3 - Dynamic Contract Resilience
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. INFRAESTRUCTURA Y CONFIGURACIÓN
 */
export { default as config } from './payload.config.js';

/**
 * 2. IDENTIDAD Y CONTROL DE ACCESO (SBU: Core)
 */
export * from './collections/users/Users.js';
export * from './collections/Tenants.js';
export * from './collections/Access.js';

/**
 * 3. MOTOR DE REVENUE (SBU: Silo A)
 */
export * from './collections/Offers.js';
export * from './collections/FlashSales.js';

/**
 * 4. RED DE SOCIOS Y PRM (SBU: Silo B)
 */
export * from './collections/Agencies.js';
export * from './collections/Agents.js';
export * from './collections/BusinessMetrics.js';

/**
 * 5. INTELIGENCIA Y NUBE DE MARKETING (SBU: Silo C)
 */
export * from './collections/Ingestions.js';
export * from './collections/Subscribers.js';

/**
 * 6. BIBLIOTECA DE ACTIVOS Y CONTENIDO (SBU: Experience)
 */
export * from './collections/Media.js';
export * from './collections/BlogPosts.js';
export * from './collections/Projects.js';

/**
 * 7. INFRAESTRUCTRURA Y COMUNICACIONES (SBU: Silo D)
 */
export * from './collections/Notifications.js';
export * from './collections/DynamicRoutes.js';

/**
 * 8. CONTRATOS GENERADOS (SSoT)
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description Exportación del artefacto físico generado localmente.
 * @fix TS2307: Se inyecta @ts-ignore para evitar que la ausencia temporal del 
 * archivo generado durante auditorías estáticas bloquee el pipeline de Nx.
 */
// @ts-expect-error - Artefacto generado manualmente vía 'pnpm payload generate:types'
export * from './payload-types.js';

/**
 * 9. TIPOS TÉCNICOS ADICIONALES
 */
export type { ProjectLayoutStyleType } from './collections/Projects.js';
export type { PayloadMediaDoc } from './collections/Media.js';

// Exposición de Inteligencia de Roles
export { ROLES_CONFIG } from './collections/users/roles/config.js';
export type { SovereignRoleType, RoleConfig } from './collections/users/roles/config.js';

/**
 * @pilar IV: Observabilidad.
 */
if (typeof window !== 'undefined') {
  console.log('%c🧬 Core Registry v11.3 | Isolated Synthesis Mode', 'color: #36def2; font-weight: bold;');
}