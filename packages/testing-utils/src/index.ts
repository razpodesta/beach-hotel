// RUTA: /packages/testing-utils/src/index.ts
// VERSIÓN: 3.0 - Compatible con Módulos ESM
// DESCRIPCIÓN: Se añaden las extensiones '.js' a las importaciones relativas
//              para cumplir con las reglas de 'nodenext' module resolution.

export * from './lib/rendering/custom-render.js';
export * from './lib/factories/user.factory.js';
export * from './lib/mocks/server.js';
