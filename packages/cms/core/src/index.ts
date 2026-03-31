/**
 * @file packages/cms/core/src/index.ts
 * @description Fachada pública soberana de la librería @metashark/cms-core.
 *              Orquesta la exposición atómica de colecciones y configuración 
 *              para el ecosistema monorepo. Actúa como el Único Punto de Entrada (SSoT).
 * @version 8.0 - CRM Hub Integrated & Identity Sovereign
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * 1. CONFIGURACIÓN DE INFRAESTRUCTRURA
 * @description Exportación del orquestador de Payload 3.0.
 */
export { default as config } from './payload.config';

/**
 * 2. COLECCIONES SOBERANAS (SSoT)
 * @pilar IX: Modularización y exportación atómica.
 */
export * from './collections/Users';
export * from './collections/Tenants';
export * from './collections/Subscribers'; // <-- INTEGRACIÓN DEL CRM HUB
export * from './collections/BlogPosts';
export * from './collections/Projects';
export * from './collections/Media';

/**
 * 3. LÓGICA DE SEGURIDAD Y PERÍMETROS
 * @description Reglas de acceso Multi-Tenant y RBAC.
 */
export * from './collections/Access';

/**
 * 4. CONTRATOS DE TIPOS (Type-Only Exports)
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description El uso de 'export type' garantiza que estas definiciones 
 *              no generen código JavaScript en el bundle final.
 */
export type { ProjectLayoutStyleType } from './collections/Projects';

/**
 * @fix TS2307: Erradicación del "Chicken-and-Egg".
 * Exportamos contratos estructurales estáticos para blindar el build de Vercel
 * contra la latencia de autogeneración de tipos de Payload.
 */
export type { PayloadMediaDoc } from './collections/Media';