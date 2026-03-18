/**
 * @file actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial.
 *              Gestiona la comunicación con Payload CMS 3.0, la compilación
 *              de contenido Lexical y el mapeo hacia contratos Zod.
 * @version 12.2 - Advanced Lexical Resolution & Forensic Logging
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload, type Payload } from 'payload';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import configPromise from '@metashark/cms-core/config';
import { type PostWithSlug, postWithSlugSchema } from '../schemas/blog.schema';

/**
 * DETECTORES DE ENTORNO SOBERANOS
 */
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const isDatabaseAvailable = Boolean(process.env.DATABASE_URL);

/**
 * ============================================================================
 * CONTRATOS DE INTERFAZ CMS (Bridge Interfaces - Payload 3.0)
 * @pilar III: Seguridad de Tipos Absoluta.
 * ============================================================================
 */

interface PayloadUser {
  id: string;
  username?: string | null;
  email?: string | null;
}

interface PayloadMedia {
  id: string;
  url?: string | null;
  alt?: string | null;
}

interface LexicalNode {
  type: string;
  text?: string;
  tag?: string;
  listType?: 'number' | 'bullet';
  children?: LexicalNode[];
}

interface LexicalRoot {
  root?: {
    children?: LexicalNode[];
  };
}

interface RawBlogPostEntry {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: LexicalRoot | string | null;
  publishedDate?: string | null;
  author?: PayloadUser | string | null;
  tags?: Array<{ tag?: string | null }> | null;
  status?: 'draft' | 'published' | null;
  ogImage?: PayloadMedia | string | null;
}

/**
 * CACHÉ DE INSTANCIA (Pilar X: Performance)
 */
let cachedPayload: Payload | null = null;

/**
 * @description Recupera la instancia soberana de Payload conectada a la infraestructura.
 * @returns {Promise<Payload>} Instancia activa de Payload CMS.
 */
async function getSovereignPayload(): Promise<Payload> {
  if (cachedPayload) return cachedPayload;
  const config = await configPromise;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

/**
 * COMPILADOR JIT: Lexical AST a Markdown Puro
 * @description Transforma el árbol de nodos de Lexical en Markdown compatible con MDX.
 * @pilar VIII: Resiliencia - Maneja recursividad para sub-nodos y tipos de bloque.
 * @param {unknown} contentNode - Nodo de contenido crudo.
 * @returns {string} Contenido transformado.
 */
function extractMarkdownFromLexical(contentNode: unknown): string {
  if (!contentNode) return '';
  if (typeof contentNode === 'string') return contentNode;

  const processNode = (node: LexicalNode): string => {
    switch (node.type) {
      case 'paragraph':
        return `${(node.children || []).map(processNode).join('')}\n\n`;
      case 'text':
        return node.text || '';
      case 'heading': {
        const depth = parseInt(String(node.tag).replace('h', ''), 10) || 2;
        return `${'#'.repeat(depth)} ${(node.children || []).map(processNode).join('')}\n\n`;
      }
      case 'list': {
        const prefix = node.listType === 'number' ? '1.' : '-';
        return `${(node.children || []).map(li => `${prefix} ${processNode(li)}`).join('\n')}\n\n`;
      }
      case 'quote':
        return `> ${(node.children || []).map(processNode).join('')}\n\n`;
      default:
        return (node.children || []).map(processNode).join('');
    }
  };

  try {
    const ast = contentNode as LexicalRoot;
    if (ast.root?.children) {
      return ast.root.children.map(processNode).join('');
    }
    return '';
  } catch (error) {
    console.warn('[HEIMDALL][LEXICAL] Fallo en compilación JIT. Retornando texto plano.', error);
    return '';
  }
}

/**
 * FUNCIÓN SHAPER: mapPayloadToPost
 * @description Transforma la entidad de DB en el contrato inmutable de Zod.
 * @param {unknown} entry - Registro crudo del CMS.
 * @returns {PostWithSlug} Objeto validado.
 */
function mapPayloadToPost(entry: unknown): PostWithSlug {
  const raw = entry as RawBlogPostEntry;

  // 1. Resolución de Autoría
  let authorName = 'Concierge Team';
  if (typeof raw.author === 'object' && raw.author !== null) {
    authorName = raw.author.username ?? (raw.author.email?.split('@')[0] ?? 'Concierge Team');
  }

  // 2. Saneamiento de Taxonomía
  const sanitizedTags = Array.isArray(raw.tags) 
    ? raw.tags.map((t) => t.tag ?? '').filter(Boolean) 
    : [];

  // 3. Resolución de Medios
  const ogImageUrl = (typeof raw.ogImage === 'object' && raw.ogImage !== null) 
    ? raw.ogImage.url ?? undefined 
    : undefined;

  const mappedData = {
    slug: raw.slug ?? 'unknown-slug',
    metadata: {
      title: raw.title ?? 'Untitled Article',
      description: raw.description ?? '',
      author: authorName,
      published_date: raw.publishedDate ?? new Date().toISOString(),
      tags: sanitizedTags,
      ogImage: ogImageUrl,
    },
    content: extractMarkdownFromLexical(raw.content),
  };

  return postWithSlugSchema.parse(mappedData);
}

/**
 * RECUPERACIÓN SOBERANA: getAllPosts
 * @description Obtiene la colección completa de artículos publicados.
 * @returns {Promise<PostWithSlug[]>}
 */
export async function getAllPosts(): Promise<PostWithSlug[]> {
  const traceId = `BLOG-FETCH-ALL-${Date.now()}`;

  if (isBuildPhase && !isDatabaseAvailable) {
    console.log(`[HEIMDALL][BUILD] ${traceId}: Database bypass active.`);
    return [];
  }
  
  try {
    console.group(`[HEIMDALL][TRACE] ${traceId}`);
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedDate',
      limit: 100,
      depth: 1,
    });
    console.log(`[DATA] Docs retrieved: ${docs.length}`);
    console.groupEnd();
    
    return docs.map(mapPayloadToPost);
  } catch (error) {
    console.error(`[HEIMDALL][CRITICAL] ${traceId}: Execution failed.`, error);
    return [];
  }
}

/**
 * RECUPERACIÓN INDIVIDUAL: getPostBySlug
 * @description Localiza un artículo por su slug único.
 * @param {string} slug - Identificador semántico.
 */
export async function getPostBySlug(slug: string): Promise<PostWithSlug | null> {
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
      depth: 1,
    });
    
    return docs[0] ? mapPayloadToPost(docs[0]) : null;
  } catch (error) {
    console.error(`[HEIMDALL][ERROR] Failed to fetch post by slug: ${slug}`, error);
    return null;
  }
}

/**
 * FILTRADO TAXONÓMICO: getPostsByTag
 * @description Obtiene artículos vinculados a una etiqueta específica.
 * @param {string} tagSlug - Tag normalizada.
 */
export async function getPostsByTag(tagSlug: string): Promise<PostWithSlug[]> {
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
      depth: 1,
    });
    
    return docs.map(mapPayloadToPost);
  } catch (error) {
    console.error(`[HEIMDALL][ERROR] Tag lookup failed for: ${tagSlug}`, error);
    return [];
  }
}