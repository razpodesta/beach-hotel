// RUTA: packages/cms/core/src/collections/index.ts

/**
 * @file Índice Central de Colecciones
 * @version 1.0 - Barrel File
 * @description Centraliza la exportación de todas las colecciones del CMS.
 *              Facilita la importación en `payload.config.ts`.
 */

export * from './collections/Users.js';
export * from './collections/BlogPosts.js';
export * from './collections/Projects.js';
// Futuras colecciones (ej: Media, Newsletters, etc.) se agregan aquí.