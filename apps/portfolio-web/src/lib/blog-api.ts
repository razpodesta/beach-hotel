/**
 * @file apps/portfolio-web/src/lib/blog-api.ts
 * @description Fachada Pública Soberana del Dominio Editorial (The Concierge Journal).
 *              Actúa como el único punto de entrada autorizado para el consumo 
 *              de datos del blog, abstrayendo el origen (Mocks o Payload CMS).
 *              Nivelado para resolución nativa en Next.js 15 y Vercel Build Sync.
 * @version 5.0 - Forensic Documentation & Native Resolution Standard
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * EXPORTACIONES LÓGICAS (Server Actions)
 * @pilar V: Adherencia Arquitectónica. Resolución nativa sin extensiones .js
 * para garantizar compatibilidad con el motor SWC de Vercel.
 */

/**
 * @description Recupera la colección completa de artículos publicados.
 * Implementa el Protocolo Heimdall: intenta sincronizar con el CMS y 
 * activa el degrade elegante hacia Mocks si detecta latencia o falta de DB.
 * @returns {Promise<PostWithSlug[]>} Matriz de artículos saneados por el Shaper.
 */
export { getAllPosts } from './blog/actions';

/**
 * @description Localiza un artículo específico mediante su identificador semántico.
 * @param {string} slug - El identificador único de la URL del post.
 * @param {Locale} [lang] - Idioma de la sesión para recuperación localizada.
 * @returns {Promise<PostWithSlug | null>} Entidad editorial validada o null si no existe.
 */
export { getPostBySlug } from './blog/actions';

/**
 * @description Filtra la base del conocimiento editorial por taxonomía.
 * @param {string} tagSlug - El slug de la etiqueta (ej: 'nightlife').
 * @param {Locale} [lang] - Idioma de la sesión.
 * @returns {Promise<PostWithSlug[]>} Colección de artículos vinculados a la etiqueta.
 */
export { getPostsByTag } from './blog/actions';

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