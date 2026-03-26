/**
 * @file apps/portfolio-web/src/lib/blog-api.ts
 * @description Fachada Pública del Dominio Editorial (The Concierge Journal).
 *              Actúa como el único punto de entrada autorizado para el consumo 
 *              de datos del blog, abstrayendo el origen (Mocks o Payload CMS).
 *              Nivelado para 'verbatimModuleSyntax' y compatibilidad con Edge.
 * @version 3.0 - Sovereign Domain Facade
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @pilar V: Adherencia Arquitectónica.
 * Re-exportación nominada para control total sobre la API pública del dominio.
 * Esto mejora el tiempo de resolución del compilador y el Tree-Shaking.
 */
export { 
  getAllPosts, 
  getPostBySlug, 
  getPostsByTag 
} from './blog/actions.js';

/**
 * @pilar III: Seguridad de Tipos.
 * Exportación de contratos de datos para asegurar que los componentes de la UI
 * sigan el esquema soberano de Zod.
 */
export type { 
  PostWithSlug, 
  BlogPost, 
  BlogPageDictionary 
} from './schemas/blog.schema.js';