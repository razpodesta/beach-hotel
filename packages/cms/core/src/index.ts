/**
 * @file packages/cms/core/src/index.ts
 * @description Punto de entrada soberano para el núcleo del CMS.
 *              Exporta la configuración y las colecciones para el ecosistema.
 * @version 1.2 - Strict ESM Compliance
 * @author Raz Podestá - MetaShark Tech
 */

// @pilar III: Se añade extensión .js obligatoria para resolución nodenext.
import config from './payload.config.js';
export default config;

export * from './collections/index.js';