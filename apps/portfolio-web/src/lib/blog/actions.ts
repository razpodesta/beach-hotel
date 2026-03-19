/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial (The Concierge Journal).
 *              Implementa comunicación resiliente con Payload CMS 3.0, soporte para i18n
 *              nativo en queries y compilación JIT de Lexical AST a Markdown.
 * @version 13.0 - i18n Query Support & Type-Safe Shaper
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload, type Payload } from 'payload';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante alias unificados.
 */
import configPromise from '@metashark/cms-core/config';
import { type PostWithSlug, postWithSlugSchema } from '../schemas/blog.schema';
import { type Locale, i18n } from '../../config/i18n.config';

/**
 * DETECTORES DE ENTORNO SOBERANOS
 * @description Previenen fallos durante la fase de compilación estática (Build) 
 *              cuando la infraestructura de datos no es accesible.
 */
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const isDatabaseAvailable = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS DE INTERFAZ CMS (Bridge)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
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

interface RawPayloadPost {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: LexicalRoot | string | null;
  publishedDate?: string | null;
  author?: { username?: string; email?: string } | string | null;
  tags?: Array<{ tag?: string | null }> | null;
  status?: 'draft' | 'published' | null;
  ogImage?: { url?: string } | string | null;
}

/**
 * CACHÉ DE INSTANCIA (Pilar X: Performance)
 */
let cachedPayload: Payload | null = null;

/**
 * @description Recupera la instancia soberana de Payload.
 * @returns {Promise<Payload>}
 */
async function getSovereignPayload(): Promise<Payload> {
  if (cachedPayload) return cachedPayload;
  const config = await configPromise;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

/**
 * COMPILADOR JIT: Lexical AST a Markdown
 * @description Transforma el árbol de nodos de Lexical en Markdown puro para MDXRemote.
 * @pilar VIII: Resiliencia - Maneja recursividad y tipos de bloque editoriales.
 */
function compileLexicalToMarkdown(contentNode: unknown): string {
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
    return ast.root?.children?.map(processNode).join('') || '';
  } catch (error) {
    console.warn('[HEIMDALL][LEXICAL] Fallo en compilación JIT. Retornando vacío.', error);
    return '';
  }
}

/**
 * FUNCIÓN SHAPER: mapPayloadToPost
 * @description Transforma la entidad de DB en el contrato inmutable de Zod.
 */
function mapPayloadToPost(entry: unknown): PostWithSlug {
  const raw = entry as RawPayloadPost;

  let authorName = 'Concierge Team';
  if (typeof raw.author === 'object' && raw.author !== null) {
    authorName = raw.author.username ?? (raw.author.email?.split('@')[0] ?? 'Concierge Team');
  }

  const sanitizedTags = Array.isArray(raw.tags) 
    ? raw.tags.map((t) => t.tag ?? '').filter(Boolean) 
    : [];

  const ogImageUrl = (typeof raw.ogImage === 'object' && raw.ogImage !== null) 
    ? raw.ogImage.url 
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
    content: compileLexicalToMarkdown(raw.content),
  };

  return postWithSlugSchema.parse(mappedData);
}

/**
 * @description Obtiene todos los artículos publicados.
 * @param {Locale} lang - El idioma para la resolución de contenido (SSoT).
 * @returns {Promise<PostWithSlug[]>}
 */
export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  const traceId = `BLOG-FETCH-ALL-${Date.now()}`;

  if (isBuildPhase && !isDatabaseAvailable) {
    console.log(`[HEIMDALL][BUILD] ${traceId}: Database bypass active.`);
    return [];
  }
  
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedDate',
      limit: 100,
      locale: lang, // @pilar VI: Internacionalización nativa en query
    });
    
    return docs.map(mapPayloadToPost);
  } catch (error) {
    console.error(`[HEIMDALL][CRITICAL] ${traceId}: Failed to fetch editorial content.`, error);
    return [];
  }
}

/**
 * @description Localiza un artículo por su slug único.
 * @param {string} slug - Identificador semántico.
 * @param {Locale} lang - Idioma de la solicitud.
 */
export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
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
      locale: lang,
    });
    
    return docs[0] ? mapPayloadToPost(docs[0]) : null;
  } catch (error) {
    console.error(`[HEIMDALL][ERROR] Failed to fetch post by slug: ${slug}`, error);
    return null;
  }
}

/**
 * @description Obtiene artículos vinculados a una etiqueta específica.
 * @param {string} tagSlug - Tag normalizada.
 * @param {Locale} lang - Idioma de la solicitud.
 */
export async function getPostsByTag(tagSlug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
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
      locale: lang,
    });
    
    return docs.map(mapPayloadToPost);
  } catch (error) {
    console.error(`[HEIMDALL][ERROR] Tag lookup failed for: ${tagSlug}`, error);
    return [];
  }
}