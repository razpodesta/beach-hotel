/**
 * @file packages/cms/core/src/index.ts
 * @description Punto de entrada soberano para el núcleo del CMS.
 *              Exporta la configuración y las colecciones para el ecosistema.
 * @version 1.3 - Bundler Resolution Recovery
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @pilar V: Adherencia Arquitectónica.
 * Se eliminan las extensiones .js para que el motor de empaquetado de Next.js 15
 * pueda resolver los archivos fuente .ts directamente desde el Monorepo.
 */
import config from './payload.config';
export default config;

export * from './collections/index';