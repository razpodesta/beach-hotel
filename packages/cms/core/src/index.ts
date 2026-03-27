/**
 * @file packages/cms/core/src/index.ts
 * @description Fachada pública soberana de la librería @metashark/cms-core.
 *              Orquesta la exposición atómica de colecciones y configuración 
 *              para el ecosistema monorepo. Actúa como el Único Punto de Entrada (SSoT).
 *              Nivelado: Eliminación de extensiones .js para garantizar compatibilidad
 *              con el motor de resolución de Next.js 15 y el pipeline de Vercel.
 * @version 6.0 - Vercel Build Sync (Source-First Resolution)
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * 1. CONFIGURACIÓN DE INFRAESTRUCTRURA
 * Exportación nominada de la configuración centralizada para Payload CMS.
 * @nivelación: Remoción de extensión .js para compatibilidad con 'moduleResolution: bundler'.
 */
export { default as config } from './payload.config';

/**
 * 2. COLECCIONES SOBERANAS (SSoT)
 * Exportación atómica de los esquemas de datos del ecosistema.
 */
export * from './collections/Users';
export * from './collections/Tenants';
export * from './collections/BlogPosts';
export * from './collections/Projects';
export * from './collections/Media';

/**
 * 3. LÓGICA DE SEGURIDAD Y PERÍMETROS
 * Exportación de reglas de acceso multi-tenant para orquestación de RBAC.
 */
export * from './collections/Access';

/**
 * 4. CONTRATOS DE TIPOS (Type-Only Exports)
 * @pilar III: Seguridad de Tipos Absoluta.
 * El uso de 'export type' garantiza que el compilador descarte estas 
 * líneas en el bundle de ejecución, evitando errores de referencia.
 */
export type { ProjectLayoutStyleType } from './collections/Projects';