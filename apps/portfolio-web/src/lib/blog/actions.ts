// RUTA: apps/portfolio-web/src/lib/blog/actions.ts
/**
 * @file Adaptador de integridad para Payload CMS 3.0.
 * @description Mapea respuestas crudas de GraphQL a los tipos del dominio.
 * @version 6.0
 * @author Raz Podestá - MetaShark Tech
 */

import { fetchGraphQL } from '../graphql-client';
import { type PostWithSlug, postWithSlugSchema } from '../schemas/blog.schema';

/**
 * Mapea y valida la respuesta del CMS.
 * @param entry - Entrada cruda de la API (unknown para seguridad).
 * @returns PostWithSlug validado o lanza un error si la estructura es inválida.
 */
function mapPayloadToPost(entry: unknown): PostWithSlug {
  // 1. Trazabilidad de entrada
  if (typeof entry !== 'object' || entry === null) {
    throw new Error('[BlogAdapter] Entrada de datos inválida: no es un objeto.');
  }

  const raw = entry as Record<string, any>;

  // 2. Transformación de datos (Shaper)
  const mappedData = {
    slug: raw.slug ?? 'unknown-slug',
    metadata: {
      title: raw.title ?? 'Sin título',
      description: raw.description ?? '',
      author: raw.author?.username ?? 'Concierge Team',
      published_date: raw.publishedDate ?? new Date().toISOString(),
      tags: Array.isArray(raw.tags) ? raw.tags.map((t: { tag: string }) => t.tag) : [],
    },
    content: typeof raw.content === 'object' ? JSON.stringify(raw.content) : (raw.content ?? ''),
  };

  // 3. Validación contra el Contrato Soberano (Zod)
  const result = postWithSlugSchema.safeParse(mappedData);

  if (!result.success) {
    console.error('[BlogAdapter] Violación de contrato en slug:', raw.slug, result.error.format());
    throw new Error(`[BlogAdapter] Error de validación: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Obtiene todos los artículos publicados.
 * @returns Promesa de lista de posts validados.
 */
export async function getAllPosts(): Promise<PostWithSlug[]> {
  const query = `
    query GetAllPosts {
      BlogPosts(where: { status: { equals: "published" } }) {
        docs {
          title slug description content author { username } publishedDate tags { tag }
        }
      }
    }
  `;
  
  try {
    const response = await fetchGraphQL<{ BlogPosts: { docs: unknown[] } }>(query);
    return (response.BlogPosts.docs || []).map(mapPayloadToPost);
  } catch (error) {
    console.error('[BlogActions] Fallo en getAllPosts:', error);
    return []; // Retorno de resiliencia
  }
}

/**
 * Obtiene un único artículo por slug.
 */
export async function getPostBySlug(slug: string): Promise<PostWithSlug | null> {
  const query = `
    query GetPostBySlug($slug: String!) {
      BlogPosts(where: { slug: { equals: $slug } }) {
        docs {
          title slug description content author { username } publishedDate tags { tag }
        }
      }
    }
  `;
  
  try {
    const response = await fetchGraphQL<{ BlogPosts: { docs: unknown[] } }>(query, { slug });
    const post = response.BlogPosts.docs[0];
    return post ? mapPayloadToPost(post) : null;
  } catch (error) {
    console.error(`[BlogActions] Fallo en getPostBySlug (${slug}):`, error);
    return null;
  }
}