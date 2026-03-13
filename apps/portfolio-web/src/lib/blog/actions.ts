/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial (The Concierge Journal).
 *              Gestiona la comunicación con Payload CMS 3.0 y el "shaping" de entidades.
 * @version 11.0 - Optimized Query Architecture
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload } from 'payload';
/**
 * @pilar V: Adherencia Arquitectónica.
 * Vinculación mediante alias soberano definido en la Constitución (tsconfig.base.json).
 */
import configPromise from '@metashark/cms-core/config';
import { type PostWithSlug, postWithSlugSchema } from '../schemas/blog.schema';

/**
 * CONTRATO DE INTERFAZ CMS (Bridge Interface)
 * Define la estructura esperada de los documentos crudos de Payload.
 */
interface RawBlogPostEntry {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: unknown;
  publishedDate?: string | null;
  author?: { username?: string; email?: string } | string | null;
  tags?: Array<{ tag?: string | null }> | null;
  status?: 'draft' | 'published' | null;
}

/**
 * FUNCIÓN SHAPER: mapPayloadToPost
 * @pilar III: Seguridad de Tipos Absoluta.
 * Transforma y valida la entrada cruda del CMS al dominio tipado de la aplicación.
 * @param {unknown} entry - Documento crudo proveniente de la base de datos.
 * @returns {PostWithSlug} Objeto saneado y validado por el contrato de Zod.
 */
function mapPayloadToPost(entry: unknown): PostWithSlug {
  const traceId = `SHAPER-${Date.now()}`;

  if (!entry || typeof entry !== 'object') {
    throw new Error(`[HEIMDALL][${traceId}] Entrada de CMS inválida.`);
  }

  const raw = entry as RawBlogPostEntry;

  /**
   * @pilar VIII: Resiliencia.
   * Lógica de extracción de autoría con fallbacks seguros.
   */
  const authorName = (typeof raw.author === 'object' && raw.author !== null)
    ? (raw.author.username ?? raw.author.email?.split('@')[0] ?? 'Concierge Team')
    : 'Concierge Team';

  // Saneamiento de etiquetas
  const sanitizedTags = Array.isArray(raw.tags) 
    ? raw.tags.map((t) => t.tag ?? '').filter(Boolean) 
    : [];

  // Mapeo al contrato de dominio
  const mappedData = {
    slug: raw.slug ?? 'unknown-slug',
    metadata: {
      title: raw.title ?? 'Untitled Post',
      description: raw.description ?? '',
      author: authorName,
      published_date: raw.publishedDate ?? new Date().toISOString(),
      tags: sanitizedTags,
    },
    /**
     * Gestión de Contenido: 
     * Payload 3.0 puede devolver objetos Lexical. Aseguramos formato string para MDXRemote.
     */
    content: typeof raw.content === 'string' 
      ? raw.content 
      : JSON.stringify(raw.content ?? ''),
  };

  /**
   * @pilar I: Validación Innegociable.
   * Si el dato no cumple el esquema, se bloquea la propagación para evitar errores de UI.
   */
  const validation = postWithSlugSchema.safeParse(mappedData);

  if (!validation.success) {
    console.error(
      `[HEIMDALL][DATA-VIOLATION][${traceId}] Fallo de esquema en: ${mappedData.slug}`,
      validation.error.flatten().fieldErrors
    );
    throw new Error(`[Blog-Shaper] Integridad comprometida para el slug: ${mappedData.slug}`);
  }

  return validation.data;
}

/**
 * RECUPERACIÓN SOBERANA: getAllPosts
 * Obtiene el inventario de artículos publicados con orden cronológico inverso.
 */
export async function getAllPosts(): Promise<PostWithSlug[]> {
  const traceId = `BLOG-FETCH-ALL-${Date.now()}`;
  
  try {
    const config = await configPromise;
    const payload = await getPayload({ config });
    
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { 
        status: { equals: 'published' } 
      },
      sort: '-publishedDate', // @pilar XII: UX - Priorizar contenido fresco
      limit: 100,
      depth: 1,
    });
    
    return docs.map(mapPayloadToPost);
  } catch (error) {
    console.error(`[HEIMDALL][CRITICAL][${traceId}] Fallo en getAllPosts:`, error);
    return [];
  }
}

/**
 * RECUPERACIÓN INDIVIDUAL: getPostBySlug
 * @param {string} slug - Identificador semántico del artículo.
 */
export async function getPostBySlug(slug: string): Promise<PostWithSlug | null> {
  const traceId = `BLOG-FETCH-SLUG-${slug}`;
  
  try {
    const config = await configPromise;
    const payload = await getPayload({ config });
    
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { 
        slug: { equals: slug },
        status: { equals: 'published' }
      },
      limit: 1,
    });
    
    return docs[0] ? mapPayloadToPost(docs[0]) : null;
  } catch (error) {
    console.error(`[HEIMDALL][ERROR][${traceId}] Error al recuperar artículo:`, error);
    return null;
  }
}

/**
 * FILTRADO TAXONÓMICO OPTIMIZADO: getPostsByTag
 * @pilar X: Performance de Élite.
 * Filtrado directo en la base de datos para evitar carga innecesaria de memoria.
 * @param {string} tagSlug - Slug de la etiqueta a buscar.
 */
export async function getPostsByTag(tagSlug: string): Promise<PostWithSlug[]> {
  const traceId = `BLOG-FETCH-TAG-${tagSlug}`;
  
  try {
    