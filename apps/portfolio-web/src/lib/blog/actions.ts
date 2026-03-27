/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial.
 *              Implementa un Shaper infalible, compilador Lexical de alta fidelidad
 *              y blindaje total contra corrupciones de datos en Vercel.
 * @version 25.0 - Zero Any & Forensic Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload } from 'payload';
import type { Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';

/**
 * IMPORTACIONES DE CONTRATO (SSoT)
 * @pilar V: Adherencia arquitectónica.
 */
import { postWithSlugSchema } from '../schemas/blog.schema';
import type { PostWithSlug } from '../schemas/blog.schema';
import { i18n } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks';

/**
 * ESTADO DE INFRAESTRUCTRURA (Detectado en tiempo de ejecución)
 */
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS TÉCNICOS: Lexical AST & Raw Content
 */
interface LexicalNode {
  type: string;
  text?: string;
  tag?: string;
  listType?: 'number' | 'bullet';
  children?: LexicalNode[];
  url?: string;
}

interface LexicalRoot {
  root?: {
    children?: LexicalNode[];
  };
}

/**
 * @interface RawPayloadPost
 * @description Representación tipada del esquema del CMS para evitar 'any'.
 */
interface RawPayloadPost {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: LexicalRoot | string | null;
  publishedDate?: string | null;
  author?: string | { username?: string; email?: string } | null;
  tags?: Array<{ tag: string }> | null;
  ogImage?: string | { url: string } | null;
}

let cachedPayload: Payload | null = null;

/**
 * @description Inicialización Singleton del motor de Payload.
 */
async function getSovereignPayload(): Promise<Payload> {
  if (cachedPayload) return cachedPayload;
  const config = await configPromise;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

/**
 * COMPILADOR JIT: Lexical to Markdown (Deep Recursive)
 * @description Transforma el AST del editor en narrativa Markdown pura.
 */
function compileLexicalToMarkdown(contentNode: unknown): string {
  if (!contentNode) return '';
  if (typeof contentNode === 'string') return contentNode;

  const extractRecursive = (nodes: LexicalNode[] = []): string => {
    return nodes.map((node) => {
      if (node.type === 'text') return node.text || '';
      const childrenText = node.children ? extractRecursive(node.children) : '';
      
      switch (node.type) {
        case 'paragraph': return `${childrenText}\n\n`;
        case 'heading': {
          const level = parseInt(node.tag?.replace('h', '') || '2', 10);
          return `${'#'.repeat(level)} ${childrenText}\n\n`;
        }
        case 'list': {
          const bullet = node.listType === 'number' ? '1.' : '-';
          return node.children?.map((li) => `${bullet} ${extractRecursive([li])}`).join('\n') + '\n\n' || '';
        }
        case 'listitem': return childrenText;
        case 'link': return `[${childrenText}](${node.url || '#'})`;
        case 'quote': return `> ${childrenText}\n\n`;
        default: return childrenText;
      }
    }).join('');
  };

  try {
    const ast = contentNode as LexicalRoot;
    return extractRecursive(ast.root?.children);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Parser Error';
    console.warn(`[HEIMDALL][PARSER] Lexical conversion degraded: ${msg}`);
    return typeof contentNode === 'string' ? contentNode : '';
  }
}

/**
 * SHAPER POLIMÓRFICO: mapToSovereignPost
 * @description Garantiza que el objeto de salida sea 100% compatible con Zod.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
function mapToSovereignPost(entry: unknown): PostWithSlug {
  try {
    // 1. Verificación de tipo para entrada de Mocks
    const quickResult = postWithSlugSchema.safeParse(entry);
    if (quickResult.success) return quickResult.data;

    // 2. Procesamiento del objeto crudo del CMS
    const raw = (entry || {}) as RawPayloadPost;

    // Resolución de Autor (Blindaje contra undefined/null)
    let resolvedAuthor = 'Sanctuary Team';
    const authorData = raw.author;
    if (authorData) {
      if (typeof authorData === 'object') {
        resolvedAuthor = authorData.username || authorData.email?.split('@')[0] || resolvedAuthor;
      } else {
        resolvedAuthor = authorData;
      }
    }

    const mappedData = {
      slug: raw.slug || `journal-${Date.now()}`,
      metadata: {
        title: raw.title || 'Untitled Article',
        description: raw.description || 'Editorial content in progress.',
        author: resolvedAuthor,
        published_date: raw.publishedDate || new Date().toISOString(),
        tags: Array.isArray(raw.tags) 
          ? raw.tags.map((t) => t.tag).filter(Boolean) 
          : ['sanctuary'],
        ogImage: typeof raw.ogImage === 'object' ? raw.ogImage?.url : (raw.ogImage || undefined),
      },
      content: compileLexicalToMarkdown(raw.content),
    };

    return postWithSlugSchema.parse(mappedData);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Structural Corruption';
    console.error(`[HEIMDALL][DATA-CORRUPTION] Article Shaper failed: ${msg}`);
    
    // OBJETO DE RESCATE: Garantiza que generateStaticParams no falle por tipos.
    return {
      slug: 'recovery-sync-active',
      metadata: {
        title: 'Editorial Sync Active',
        description: 'Synchronizing with the digital core.',
        author: 'System',
        published_date: new Date().toISOString(),
        tags: ['maintenance'],
      },
      content: 'The Sanctuary is updating its editorial assets.'
    };
  }
}

/**
 * ACCIÓN PÚBLICA: getAllPosts
 */
export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  console.group(`[HEIMDALL][EDITORIAL] Syncing Hub Journal [${lang}]`);
  
  if (IS_BUILD_ENV && !DB_READY) {
    console.log('[BUILD-MODE] Persistencia offline. Sirviendo Génesis Mocks.');
    console.groupEnd();
    return MOCK_POSTS.map(mapToSovereignPost);
  }
  
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedDate',
      locale: lang,
    });
    
    const result = docs.length > 0 
      ? docs.map((doc) => mapToSovereignPost(doc)) 
      : MOCK_POSTS.map((mock) => mapToSovereignPost(mock));
      
    console.groupEnd();
    return result;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Database Connection Timeout';
    console.warn(`[RECOVERY] Fallback activado: ${msg}`);
    console.groupEnd();
    return MOCK_POSTS.map(mapToSovereignPost);
  }
}

/**
 * ACCIÓN PÚBLICA: getPostBySlug
 */
export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  console.group(`[HEIMDALL][EDITORIAL] Deep-Fetch: ${slug}`);
  
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      locale: lang,
    });
    
    console.groupEnd();
    if (docs[0]) return mapToSovereignPost(docs[0]);
    
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Search Aborted';
    console.warn(`[HEIMDALL][RECOVERY] Detail failed for ${slug}: ${msg}`);
    console.groupEnd();
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  }
}

/**
 * ACCIÓN PÚBLICA: getPostsByTag
 */
export async function getPostsByTag(tagSlug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  const normalized = tagSlug.toLowerCase().trim().replace(/\s+/g, '-');
  console.group(`[HEIMDALL][EDITORIAL] Filter by Tag: ${normalized}`);

  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { 'tags.tag': { equals: tagSlug }, status: { equals: 'published' } },
      locale: lang,
    });

    console.groupEnd();
    if (docs.length > 0) return docs.map((doc) => mapToSovereignPost(doc));

    return MOCK_POSTS
      .map((mock) => mapToSovereignPost(mock))
      .filter((p) => p.metadata.tags.some((t) => t.toLowerCase().replace(/\s+/g, '-') === normalized));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Filter Failed';
    console.warn(`[HEIMDALL][RECOVERY] Tag fallback active: ${msg}`);
    console.groupEnd();
    return MOCK_POSTS
      .map((mock) => mapToSovereignPost(mock))
      .filter((p) => p.metadata.tags.some((t) => t.toLowerCase().replace(/\s+/g, '-') === normalized));
  }
}