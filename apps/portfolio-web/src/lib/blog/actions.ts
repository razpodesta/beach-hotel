/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial.
 *              Implementa arquitectura de datos híbrida, validación Zod 
 *              y erradicación total de tipos 'any'.
 * @version 23.0 - Zero Any Compliance & Forensic Logging
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload } from 'payload';
import type { Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';

/**
 * IMPORTACIONES DE CONTRATO
 * @pilar V: Adherencia arquitectónica.
 */
import { postWithSlugSchema } from '../schemas/blog.schema';
import type { PostWithSlug } from '../schemas/blog.schema';
import { i18n } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks';

/**
 * ESTADO DE INFRAESTRUCTRURA
 */
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS TÉCNICOS (SSoT)
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
 * @description Representación del esquema de Payload para evitar 'any'.
 */
interface RawPayloadPost {
  title: string;
  slug: string;
  description: string;
  content: LexicalRoot | string;
  publishedDate: string;
  author: string | { username?: string; email?: string };
  tags?: Array<{ tag: string }>;
  ogImage?: string | { url: string };
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
 * COMPILADOR JIT: Lexical to Markdown (Recursivo)
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
  } catch {
    return typeof contentNode === 'string' ? contentNode : '';
  }
}

/**
 * SHAPER POLIMÓRFICO: mapToSovereignPost
 * @pilar III: Seguridad de Tipos Absoluta.
 */
function mapToSovereignPost(entry: unknown): PostWithSlug {
  try {
    const parsedResult = postWithSlugSchema.safeParse(entry);
    if (parsedResult.success) return parsedResult.data;

    const raw = entry as RawPayloadPost;

    const mappedData = {
      slug: raw.slug,
      metadata: {
        title: raw.title,
        description: raw.description,
        author: typeof raw.author === 'object' 
          ? raw.author.username || raw.author.email?.split('@')[0] || 'Concierge Team'
          : raw.author,
        published_date: raw.publishedDate,
        tags: Array.isArray(raw.tags) 
          ? raw.tags.map((t) => t.tag).filter(Boolean) 
          : [],
        ogImage: typeof raw.ogImage === 'object' ? raw.ogImage.url : raw.ogImage,
      },
      content: compileLexicalToMarkdown(raw.content),
    };

    return postWithSlugSchema.parse(mappedData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Corruption';
    console.error(`[HEIMDALL][DATA-CORRUPTION] Article Shaper Failed: ${msg}`);
    
    return {
      slug: 'rescue-sync',
      metadata: {
        title: 'Editorial Sync in Progress',
        description: 'Synchronizing sanctuary assets.',
        author: 'System',
        published_date: new Date().toISOString(),
        tags: ['system'],
      },
      content: 'Data recovery protocol active.'
    };
  }
}

/**
 * ACCIÓN PÚBLICA: getAllPosts
 */
export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  console.group(`[HEIMDALL][EDITORIAL] Syncing Journal [${lang}]`);
  
  if (IS_BUILD_ENV && !DB_READY) {
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
    
    console.groupEnd();
    return docs.length > 0 ? docs.map(mapToSovereignPost) : MOCK_POSTS.map(mapToSovereignPost);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Database Timeout';
    console.warn(`[RECOVERY] Logic fallback engaged: ${msg}`);
    console.groupEnd();
    return MOCK_POSTS.map(mapToSovereignPost);
  }
}

/**
 * ACCIÓN PÚBLICA: getPostBySlug
 */
export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  console.group(`[HEIMDALL][EDITORIAL] Fetching Detail: ${slug}`);
  
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
    const msg = error instanceof Error ? error.message : 'Fetch Aborted';
    console.warn(`[HEIMDALL][RECOVERY] Search failed for ${slug}: ${msg}`);
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
  console.group(`[HEIMDALL][EDITORIAL] Taxonomy Search: ${normalized}`);

  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { 'tags.tag': { equals: tagSlug }, status: { equals: 'published' } },
      locale: lang,
    });

    console.groupEnd();
    if (docs.length > 0) return docs.map(mapToSovereignPost);

    return MOCK_POSTS
      .map(mapToSovereignPost)
      .filter((p: PostWithSlug) => 
        p.metadata.tags.some((t) => t.toLowerCase().replace(/\s+/g, '-') === normalized)
      );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Taxonomy Error';
    console.warn(`[HEIMDALL][RECOVERY] Tag fallback active: ${msg}`);
    console.groupEnd();
    return MOCK_POSTS
      .map(mapToSovereignPost)
      .filter((p: PostWithSlug) => 
        p.metadata.tags.some((t) => t.toLowerCase().replace(/\s+/g, '-') === normalized)
      );
  }
}