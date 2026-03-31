/**
 * @file packages/cms/core/src/index.ts
 * @description Enterprise Core Registry (The Data Gateway).
 *              Fachada pública soberana que orquesta la exposición atómica de 
 *              colecciones y configuraciones del ecosistema MetaShark.
 *              Organizado por Unidades Estratégicas de Negocio (SBU).
 * @version 9.0 - Enterprise Level 4.0 | Multi-Silo Integration
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. INFRASTRUCTURE & CONFIGURATION
 * @description Exportación del orquestador central de Payload 3.0.
 */
export { default as config } from './payload.config';

/**
 * 2. IDENTITY & ACCESS CONTROL (SBU: Core)
 */
export * from './collections/Users';
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
export * from './collections/Notifications'; // <-- INTEGRACIÓN DEL LEDGER OPERATIVO
export * from './collections/DynamicRoutes';

/**
 * 8. STATIC CONTRACTS & TYPES (Type-Only Exports)
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description Estos contratos blindan el build contra la latencia de autogeneración.
 */
export type { ProjectLayoutStyleType } from './collections/Projects';
export type { PayloadMediaDoc } from './collections/Media';
export type { SovereignRoleType } from './collections/users/roles/config';