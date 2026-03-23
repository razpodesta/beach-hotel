/**
 * @file index.ts
 * @description Fachada pública de la librería @metashark/cms-core.
 *              Orquesta la exposición atómica de colecciones y configuración 
 *              para el ecosistema monorepo, eliminando dependencias de barrel files intermedios.
 * @version 4.0 - Explicit Export Standard
 * @author Raz Podestá - MetaShark Tech
 */

// Exportación de la configuración centralizada por defecto
export { default as config } from './payload.config.js';

// Exportación atómica de Colecciones (SSoT)
export * from './collections/Users.js';
export * from './collections/BlogPosts.js';
export * from './collections/Projects.js';
export * from './collections/Media.js';

// Exportación de lógica de seguridad y acceso
export * from './collections/Access.js';

// Exportación de tipos de utilidad para el dominio de hospitalidad
export type { ProjectLayoutStyleType } from './collections/Projects.js';