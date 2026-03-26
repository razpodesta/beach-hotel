/**
 * @file index.ts
 * @description Fachada pública de la librería @metashark/cms-core.
 *              Orquesta la exposición atómica de colecciones y configuración 
 *              para el ecosistema monorepo. Actúa como el Único Punto de Entrada (SSoT).
 *              Nivelado: Inclusión de la colección Tenants y sincronización ESM.
 * @version 5.0 - Full Collection Export Sync
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * 1. CONFIGURACIÓN DE INFRAESTRUCTRURA
 * Exportación nominada de la configuración centralizada para Payload CMS.
 */
export { default as config } from './payload.config.js';

/**
 * 2. COLECCIONES SOBERANAS (SSoT)
 * Exportación atómica de los esquemas de datos del ecosistema.
 */
export * from './collections/Users.js';
export * from './collections/Tenants.js'; // <-- INTEGRACIÓN DE INFRAESTRUCTRURA
export * from './collections/BlogPosts.js';
export * from './collections/Projects.js';
export * from './collections/Media.js';

/**
 * 3. LÓGICA DE SEGURIDAD Y PERÍMETROS
 * Exportación de reglas de acceso multi-tenant para orquestación de RBAC.
 */
export * from './collections/Access.js';

/**
 * 4. CONTRATOS DE TIPOS (Type-Only Exports)
 * Exportación de tipos de utilidad para el Shaper de datos y Seeder.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export type { ProjectLayoutStyleType } from './collections/Projects.js';