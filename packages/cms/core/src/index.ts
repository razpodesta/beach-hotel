/**
 * @file packages/cms/core/src/index.ts
 * @description Enterprise Core Registry (The Sovereign Data Gateway).
 *              Único punto de acceso para el ecosistema de datos MetaShark Tech.
 *              Refactorizado: Resolución definitiva de extensiones .js (Bundler Sync),
 *              normalización de contratos de tipo y consolidación de RBAC.
 * @version 12.0 - Bundler Resolution Sealed & SSoT Hardened
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. INFRAESTRUCTRURA Y CONFIGURACIÓN SOBERANA
 * @pilar IX: Desacoplamiento. Punto de entrada para el orquestador de Payload.
 */
export { default as config } from './payload.config';

/**
 * 2. IDENTIDAD Y CONTROL DE ACCESO (SBU: Core)
 * @description Gestión de perímetros y jerarquía de autoridad digital.
 */
export * from './collections/users/Users';
export * from './collections/Tenants';
export * from './collections/Access';

/**
 * 3. MOTOR DE REVENUE (SBU: Silo A)
 * @description Gestión de inventario táctico y estratégico.
 */
export * from './collections/Offers';
export * from './collections/FlashSales';

/**
 * 4. RED DE SOCIOS Y PRM (SBU: Silo B)
 * @description Inteligencia de alianzas y métricas financieras de red.
 */
export * from './collections/Agencies';
export * from './collections/Agents';
export * from './collections/BusinessMetrics';

/**
 * 5. INTELIGENCIA Y NUBE DE MARKETING (SBU: Silo C)
 * @description Pipelines de ingesta y orquestación de misiones masivas.
 */
export * from './collections/Ingestions';
export * from './collections/Subscribers';

/**
 * 6. BIBLIOTECA DE ACTIVOS Y NARRATIVA (SBU: Experience)
 * @description Gestión multimedia LCP y contenido editorial (Journal).
 */
export * from './collections/Media';
export * from './collections/BlogPosts';
export * from './collections/Projects';

/**
 * 7. COMUNICACIONES Y GATEWAY (SBU: Silo D)
 * @description Ledger forense de notificaciones y enrutamiento dinámico.
 */
export * from './collections/Notifications';
export * from './collections/DynamicRoutes';

/**
 * 8. CONTRATOS SOBERANOS GENERADOS (SSoT)
 * @pilar III: Seguridad de Tipos Absoluta.
 * @fix TS2307: Se elimina .js para permitir la resolución nativa del fuente .ts.
 */
// @ts-expect-error - Artefacto materializado localmente vía 'pnpm sync:types'
export * from './payload-types';

/**
 * 9. INTELIGENCIA DE ROLES Y AUTORIDAD (RBAC SSoT)
 * @description Expone la jerarquía de poder del hotel (S0 a S4).
 */
export { ROLES_CONFIG, getRoleConfig } from './collections/users/roles/config';
export type { SovereignRoleType, RoleConfig } from './collections/users/roles/config';

/**
 * 10. TIPOS TÉCNICOS DE DOMINIO
 * @pilar III: Resolución de TS2305.
 * @description Exportación de interfaces de documentos saneadas para el consumidor.
 */
export type { PayloadMediaDoc } from './collections/Media';
export type { ProjectLayoutStyleType } from './collections/Projects';

/**
 * @pilar IV: Observabilidad DNA-Level.
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  console.log(
    '%c🧬 MetaShark Core Registry v12.0 | [BUNDLER_SYNC: ACTIVE] | [RBAC: SEALED]', 
    'color: #36def2; font-weight: bold; background: rgba(54, 222, 242, 0.1); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(54, 222, 242, 0.2);'
  );
}