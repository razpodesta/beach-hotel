/**
 * @file packages/cms/core/src/index.ts
 * @description Enterprise Core Registry (The Sovereign Data Gateway).
 *              Único punto de acceso para el ecosistema de datos MetaShark Tech.
 *              Refactorizado: Resolución de TS2305 (ProjectLayoutStyleType sync),
 *              sincronización con el protocolo "Isolated Synthesis" y 
 *              consolidación de la inteligencia de roles (RBAC).
 * @version 11.4 - Registry Alignment & RBAC Sealed
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. INFRAESTRUCTURA Y CONFIGURACIÓN SOBERANA
 * @pilar IX: Desacoplamiento. Punto de entrada para el orquestador de Payload.
 */
export { default as config } from './payload.config.js';

/**
 * 2. IDENTIDAD Y CONTROL DE ACCESO (SBU: Core)
 * @description Gestión de perímetros y jerarquía de autoridad digital.
 */
export * from './collections/users/Users.js';
export * from './collections/Tenants.js';
export * from './collections/Access.js';

/**
 * 3. MOTOR DE REVENUE (SBU: Silo A)
 * @description Gestión de inventario táctico y estratégico.
 */
export * from './collections/Offers.js';
export * from './collections/FlashSales.js';

/**
 * 4. RED DE SOCIOS Y PRM (SBU: Silo B)
 * @description Inteligencia de alianzas y métricas financieras de red.
 */
export * from './collections/Agencies.js';
export * from './collections/Agents.js';
export * from './collections/BusinessMetrics.js';

/**
 * 5. INTELIGENCIA Y NUBE DE MARKETING (SBU: Silo C)
 * @description Pipelines de ingesta y orquestación de misiones masivas.
 */
export * from './collections/Ingestions.js';
export * from './collections/Subscribers.js';

/**
 * 6. BIBLIOTECA DE ACTIVOS Y NARRATIVA (SBU: Experience)
 * @description Gestión multimedia LCP y contenido editorial (Journal).
 */
export * from './collections/Media.js';
export * from './collections/BlogPosts.js';
export * from './collections/Projects.js';

/**
 * 7. COMUNICACIONES Y GATEWAY (SBU: Silo D)
 * @description Ledger forense de notificaciones y enrutamiento dinámico.
 */
export * from './collections/Notifications.js';
export * from './collections/DynamicRoutes.js';

/**
 * 8. CONTRATOS SOBERANOS GENERADOS (SSoT)
 * @pilar III: Seguridad de Tipos Absoluta.
 * @fix TS2307: Artefacto físico generado localmente para el pipeline de Nx.
 */
// @ts-expect-error - Artefacto materializado vía 'pnpm sync:types'
export * from './payload-types.js';

/**
 * 9. INTELIGENCIA DE ROLES Y AUTORIDAD (RBAC SSoT)
 * @description Expone la jerarquía de poder del hotel (S0 a S4).
 */
export { ROLES_CONFIG } from './collections/users/roles/config.js';
export type { SovereignRoleType, RoleConfig } from './collections/users/roles/config.js';

/**
 * 10. TIPOS TÉCNICOS DE DOMINIO
 * @pilar III: Resolución de TS2305. Se alinea el nombre del miembro con 
 * la exportación real de la colección de proyectos.
 */
export type { PayloadMediaDoc } from './collections/Media.js';
export type { ProjectLayoutStyleType } from './collections/Projects.js';

/**
 * @pilar IV: Observabilidad DNA-Level.
 */
if (typeof window !== 'undefined') {
  console.log(
    '%c🧬 Core Registry v11.4 | RBAC & Projects Sync Active', 
    'color: #36def2; font-weight: bold; background: rgba(54, 222, 242, 0.1); padding: 2px 5px; border-radius: 4px;'
  );
}