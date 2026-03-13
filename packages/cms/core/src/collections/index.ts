/**
 * @file packages/cms/core/src/collections/index.ts
 * @description Punto de entrada (Barrel File) para las colecciones del CMS.
 *              Nivelado para compatibilidad con el Bundler de Next.js 15.
 * @version 2.1 - Extensionless Cleanup
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @pilar V: Adherencia Arquitectónica.
 * Se eliminan las extensiones .js para que el motor de empaquetado (Vercel/Next.js)
 * pueda resolver los archivos fuente .ts nativamente.
 */
export * from './Users';
export * from './BlogPosts';
export * from './Projects';