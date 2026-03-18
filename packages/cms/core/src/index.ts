/**
 * @file packages/cms/core/src/index.ts
 * @description Fachada pública de la librería.
 */

export { default as config } from './payload.config.js';
export * from './collections/Users.js';
export * from './collections/BlogPosts.js';
export * from './collections/Projects.js';
export * from './collections/Media.js';
export * from './collections/Access.js';

export type { ProjectLayoutStyleType } from './collections/Projects.js';