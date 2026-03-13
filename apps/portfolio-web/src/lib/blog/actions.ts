/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial.
 *              Implementa resiliencia extrema para entornos de build y consultas optimizadas.
 * @version 11.3 - Build Resiliency & Phase-Aware Execution
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload, type Payload } from 'payload';
/**
 * @pilar V: Adherencia Arquitectónica.
 */
import configPromise from '@metashark/cms-core/config';
import { type PostWithSlug, postWithSlugSchema } from '../schemas/blog.schema';

/**
 * DETECTORES DE ENTORNO SOBERANOS
 */
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const isDatabaseAvailable = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATO DE INTERFAZ CMS (Bridge Interface)
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
 * CACHÉ DE INSTANCIA (Pilar X)
 */
let cachedPayload: Payload | null = null;

async function getSovereignPayload(): Promise<Payload> {
  if (cachedPayload) return cachedPayload;
  const config = await configPromise;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

/**
 * FUNCIÓN SHAPER: mapPayloadToPost
 * @pilar III: Seguridad de Tipos Absoluta.
 */
function mapPayloadToPost(entry: unknown): PostWithSlug {
  const traceId = `SHAPER-${Date.now()}`;

  if (!entry || typeof entry !== 'object') {
    throw new Error(`[HEIMDALL][${traceId}] Entrada de CMS inválida.`);
  }

  const raw = entry as RawBlogPostEntry;

  const authorName = (typeof raw.author === 'object' && raw.author !== null)
    ? (raw.author.username ?? raw.author.email?.split('@')[0] ?? 'Concierge Team')
    : 'Concierge Team';

  const sanitizedTags = Array.isArray(raw.tags) 
    ? raw.tags.map((t) => t.tag ?? '').filter(Boolean) 
    : [];

  const mappedData = {
    slug: raw.slug ?? 'unknown-slug',
    metadata: {
      title: raw.title ?? 'Untitled Post',
      description: raw.description ?? '',
      author: authorName,
      published_date: raw.publishedDate ?? new Date().toISOString(),
      tags: sanitizedTags,
    },
    content: typeof raw.content === 'string' 
      ? raw.content 
      : JSON.stringify(raw.content ?? ''),
  };

  return postWithSlugSchema.parse(mappedData);
}

/**
 * RECUPERACIÓN SOBERANA: getAllPosts
 * @pilar VIII: Resiliencia ante fallos de infraestructura en fase de build.
 */
export async function getAllPosts(): Promise<PostWithSlug[]> {
  const traceId = `BLOG-FETCH-ALL-${Date.now()}`;

  // Guardia de Construcción: Evita el crash ECONNREFUSED en Vercel
  if (isBuildPhase && !isDatabaseAvailable) {
    console.warn(`[HEIMDALL][${traceId}] Fase de Build detectada sin DATABASE_URL. Retornando dataset vacío.`);
    return [];
  }
  
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedDate',
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
 */
export async function getPostBySlug(slug: string): Promise<PostWithSlug | null> {
  const traceId = `BLOG-FETCH-SLUG-${slug}`;

  if (isBuildPhase && !isDatabaseAvailable) return null;

  try {
    const payload = await getSovereignPayload();
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
 */
export async function getPostsByTag(tagSlug: string): Promise<PostWithSlug[]> {
  const traceId = `BLOG-FETCH-TAG-${tagSlug}`;

  if (isBuildPhase && !isDatabaseAvailable) return [];
  
  try {
    const payload = await getSovereignPayload();
    const normalizedTag = tagSlug.toLowerCase().trim();

    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          { 'tags.tag': { equals: normalizedTag } }
        ]
      },
      sort: '-publishedDate',
      limit: 50,
    });
    
    return docs.map(mapPayloadToPost);
  } catch (error) {
    console.error(`[HEIMDALL][ERROR][${traceId}] Fallo en búsqueda por tag:`, error);
    return [];
  }
}