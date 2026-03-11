/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Concierge Journal. 
 *              Implementa adaptadores de integridad para Payload CMS 3.0 con 
 *              validación Zod y erradicación total de tipos 'any'.
 * @version 8.0
 * @author Raz Podestá - MetaShark Tech
 */

import { fetchGraphQL } from '../graphql-client';
import { type PostWithSlug, postWithSlugSchema } from '../schemas/blog.schema';

/**
 * Interfaz técnica que modela el contrato de datos crudos de GraphQL.
 * Provee seguridad de tipos desde la captura hasta la transformación.
 */
interface RawBlogPostEntry {
  title?: string;
  slug?: string;
  description?: string;
  content?: string | Record<string, unknown>;
  publishedDate?: string;
  author?: {
    username?: string;
  } | null;
  tags?: Array<{
    tag: string;
  }> | null;
}

/**
 * Respuesta tipada de la consulta GraphQL para BlogPosts.
 */
interface BlogPostsResponse {
  BlogPosts: {
    docs: RawBlogPostEntry[];
  };
}

/**
 * Función "Shaper": Transforma y valida la entrada del CMS al dominio de la aplicación.
 * 
 * @param {unknown} entry - Datos provenientes de la consulta GraphQL.
 * @returns {PostWithSlug} Objeto validado por el contrato soberano de Zod.
 * @throws {Error} Si la integridad de los datos es inaceptable.
 */
function mapPayloadToPost(entry: unknown): PostWithSlug {
  // 1. Guardia de Tipo: Verificación de integridad estructural.
  if (typeof entry !== 'object' || entry === null) {
    throw new Error('[Blog-Adapter] Payload inválido: Se esperaba un objeto no nulo.');
  }

  // Cast seguro a la interfaz técnica (Sin 'any').
  const raw = entry as RawBlogPostEntry;

  // 2. Construcción del objeto de dominio (Shaping).
  const mappedData = {
    slug: raw.slug ?? 'unknown-slug',
    metadata: {
      title: raw.title ?? 'Untitled Post',
      description: raw.description ?? '',
      author: raw.author?.username ?? 'Concierge Team',
      published_date: raw.publishedDate ?? new Date().toISOString(),
      tags: Array.isArray(raw.tags) ? raw.tags.map((t) => t.tag) : [],
    },
    /**
     * Gestión de Contenido Lexical/Markdown:
     * Si Payload devuelve un objeto (Lexical JSON), lo serializamos para su transporte.
     */
    content: typeof raw.content === 'object' 
      ? JSON.stringify(raw.content) 
      : (raw.content ?? ''),
  };

  // 3. Validación SSoT: El contrato de Zod es la ley.
  const validation = postWithSlugSchema.safeParse(mappedData);

  if (!validation.success) {
    console.error(
      `[HEIMDALL][DATA-VIOLATION] Fallo de esquema en post [${mappedData.slug}]:`,
      validation.error.flatten().fieldErrors
    );
    throw new Error(`[Blog-Adapter] Integridad de datos comprometida.`);
  }

  return validation.data;
}

/**
 * Recupera el inventario completo de artículos publicados.
 * Implementa un ciclo de recuperación (Resilience) para evitar caídas en cascada.
 * 
 * @returns {Promise<PostWithSlug[]>} Lista de artículos procesados y validados.
 */
export async function getAllPosts(): Promise<PostWithSlug[]> {
  const query = `
    query GetAllPosts {
      BlogPosts(where: { status: { equals: "published" } }, limit: 100) {
        docs {
          title
          slug
          description
          content
          author { username }
          publishedDate
          tags { tag }
        }
      }
    }
  `;
  
  try {
    const response = await fetchGraphQL<BlogPostsResponse>(query);
    const docs = response?.BlogPosts?.docs ?? [];
    
    return docs.map(mapPayloadToPost);
  } catch (error) {
    console.error('[Blog-Actions][HEIMDALL] Fallo en getAllPosts, activando protocolo de emergencia:', error);
    return []; // Resiliencia: La aplicación continúa funcionando sin contenido dinámico.
  }
}

/**
 * Recupera un artículo individual mediante su identificador semántico.
 * 
 * @param {string} slug - El identificador único del artículo.
 * @returns {Promise<PostWithSlug | null>} El artículo procesado o nulo si no se localiza.
 */
export async function getPostBySlug(slug: string): Promise<PostWithSlug | null> {
  const query = `
    query GetPostBySlug($slug: String!) {
      BlogPosts(where: { slug: { equals: $slug } }, limit: 1) {
        docs {
          title
          slug
          description
          content
          author { username }
          publishedDate
          tags { tag }
        }
      }
    }
  `;
  
  try {
    const response = await fetchGraphQL<BlogPostsResponse>(query, { slug });
    const post = response?.BlogPosts?.docs?.[0];
    
    return post ? mapPayloadToPost(post) : null;
  } catch (error) {
    console.error(`[Blog-Actions][HEIMDALL] Error de recuperación para slug [${slug}]:`, error);
    return null;
  }
}