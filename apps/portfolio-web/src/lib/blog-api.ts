/**
 * @file apps/portfolio-web/src/lib/blog-api.ts
 * @description Fachada Pública del Dominio Editorial (The Concierge Journal).
 *              Actúa como el único punto de entrada autorizado para el consumo 
 *              de datos del blog, abstrayendo la complejidad de la capa de datos.
 *              Nivelado para resolución nativa en Next.js 15 y Vercel Build Sync.
 * @version 4.0 - Module Resolution Purge & Type Hardening
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * EXPORTACIONES LÓGICAS (Server Actions)
 * @pilar V: Adherencia Arquitectónica. Eliminación de extensiones .js para 
 * garantizar que el empaquetador localice los archivos fuente .ts correctamente.
 */
export { 
  getAllPosts, 
  getPostBySlug, 
  getPostsByTag 
} from './blog/actions';

/**
 * EXPORTACIONES DE CONTRATO (Sovereign Schemas)
 * @pilar III: Seguridad de Tipos. Uso de 'export type' para garantizar la 
 * elisión de tipos en tiempo de compilación (verbatimModuleSyntax compliance).
 */
export type { 
  PostWithSlug, 
  BlogPost, 
  BlogPageDictionary 
} from './schemas/blog.schema';