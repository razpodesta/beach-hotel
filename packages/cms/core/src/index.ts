/**
 * @file packages/cms/core/src/index.ts
 * @description Fachada pública soberana de la librería @metashark/cms-core.
 *              Orquesta la exposición atómica de colecciones y configuración 
 *              para el ecosistema monorepo. Actúa como el Único Punto de Entrada (SSoT).
 * @version 7.0 - Decoupled Types & Build Safe
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * 1. CONFIGURACIÓN DE INFRAESTRUCTRURA
 */
export { default as config } from './payload.config';

/**
 * 2. COLECCIONES SOBERANAS (SSoT)
 */
export * from './collections/Users';
export * from './collections/Tenants';
export * from './collections/BlogPosts';
export * from './collections/Projects';
export * from './collections/Media';

/**
 * 3. LÓGICA DE SEGURIDAD Y PERÍMETROS
 */
export * from './collections/Access';

/**
 * 4. CONTRATOS DE TIPOS (Type-Only Exports)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export type { ProjectLayoutStyleType } from './collections/Projects';

// @fix TS2307: Erradicación del "Chicken-and-Egg".
// En lugar de depender de 'payload-types.ts' (que se genera post-build y rompe el CI),
// exportamos un contrato estructural estático directamente desde la colección SSoT.
// Esto garantiza que la librería compilará siempre, independientemente de Payload.
export type { PayloadMediaDoc } from './collections/Media';