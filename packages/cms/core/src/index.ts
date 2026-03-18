/**
 * @file packages/cms/core/src/index.ts
 * @description Punto de entrada soberano para el núcleo del CMS.
 *              Exporta la configuración y las colecciones directamente.
 * @version 2.0 - Centralized Workspace Exports
 * @author Raz Podestá - MetaShark Tech
 * 
 * @note DIRECTRIZ DE ARQUITECTURA (VISIÓN HIPER-HOLÍSTICA):
 *       A partir de esta versión, se eliminan los índices intermedios (ej. collections/index.ts).
 *       Todos los exports se gestionarán exclusivamente desde este index base en todos 
 *       los workspaces del monorepo. Esto reduce la profundidad del grafo de dependencias 
 *       y erradica las colisiones de resolución ESM.
 */

// Importación de configuración principal
import config from './payload.config.js';
export default config;

// Exportaciones atómicas directas (Sustituye a collections/index.ts)
export * from './collections/Users.js';
export * from './collections/BlogPosts.js';
export * from './collections/Projects.js';
export * from './collections/Media.js';
export * from './collections/Access.js';