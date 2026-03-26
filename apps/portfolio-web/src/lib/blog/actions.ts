/**
 * @file actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial.
 *              Nivelado: Resolución de error TS2339 (tags as strings),
 *              sincronización con Mocks v9.0 y compilación JIT de Lexical.
 * @version 19.0 - Tag Logic Normalization & TS2339 Fix
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload } from 'payload';
import type { Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';

import { postWithSlugSchema } from '../schemas/blog.schema.js';
import type { PostWithSlug } from '../schemas/blog.schema.js';
import { i18n } from '../../config/i18n.config.js';
import type { Locale } from '../../config/i18n.config.js';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks.js';
import type { RawMockPost } from '../../data/mocks/cms.mocks.js';

const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS TÉCNICOS
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

interface RawPayloadPost {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: LexicalRoot | string | null;
  publishedDate?: string | null;
  author?: { username?: string; email?: string } | string | null;
  tags?: Array<{ tag?: string | null } | string> | null;
  status?: 'draft' | 'published' | null;
  ogImage?: { url?: string } | string | null;
}

let cachedPayload: Payload | null = null;

async function getSovereignPayload(): Promise<Payload> {
  if (cachedPayload) return cachedPayload;
  const config = await configPromise;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

function compileLexicalToMarkdown(contentNode: unknown): string {
  if (!contentNode) return '';
  if (typeof contentNode === 'string') return contentNode;

  const extract = (node: LexicalNode): string => {
    if (node.type === 'text') return node.text || '';
    if (!node.children) return '';
    const childrenText = node.children.map(extract).join('');
    
    switch (node.type) {
      case 'paragraph': return `${childrenText}\n\n`;
      case 'heading': {
        const level = parseInt(node.tag?.replace('h', '') || '2', 10);
        return `${'#'.repeat(level)} ${childrenText}\n\n`;
      }
      case 'list': {
        const bullet = node.listType === 'number' ? '1.' : '-';
        return node.children.map((li) => `${bullet} ${extract(li)}`).join('\n') + '\n\n';
      }
      case 'listitem': return childrenText;
      case 'link': return `[${childrenText}](${node.url || '#'})`;
      case 'quote': return `> ${childrenText}\n\n`;
      default: return childrenText;
    }
  };

  try {
    const ast = contentNode as LexicalRoot;
    return ast.root?.children?.map(extract).join('') || '';
  } catch {
    return typeof contentNode === 'string' ? contentNode : '';
  }
}

/**
 * SHAPER POLIMÓRFICO
 * @description Transforma datos del CMS o Mocks al esquema soberano de Zod.
 */
function mapToSovereignPost(entry: unknown): PostWithSlug {
  const parsedResult = postWithSlugSchema.safeParse(entry);
  if (parsedResult.success) return parsedResult.data;

  const raw = entry as RawPayloadPost;

  // Resolución de Autoría
  let authorName = 'Concierge Team';
  if (raw.author) {
    if (typeof raw.author === 'object') {
      authorName = raw.author.username || raw.author.email?.split('@')[0] || authorName;
    } else if (typeof raw.author === 'string') {
      authorName = raw.author;
    }
  }

  // Resolución de Taxonomía (Soporta ambos formatos)
  const sanitizedTags = Array.isArray(raw.tags) 
    ? raw.tags.map((t) => (typeof t === 'string' ? t : t?.tag || '')).filter(Boolean) 
    : [];

  const ogImageUrl = raw.ogImage && typeof raw.ogImage === 'object' 
    ? raw.ogImage.url 
    : (typeof raw.ogImage === 'string' ? raw.ogImage : undefined);

  const mapped = {
    slug: raw.slug || 'unknown-article',
    metadata: {
      title: raw.title || 'Untitled Sanctuary Post',
      description: raw.description || '',
      author: authorName,
      published_date: raw.publishedDate || new Date().toISOString(),
      tags: sanitizedTags,
      ogImage: ogImageUrl ?? undefined,
    },
    content: compileLexicalToMarkdown(raw.content),
  };

  return postWithSlugSchema.parse(mapped);
}

/**
 * ACCIONES PÚBLICAS
 */

export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  if (IS_BUILD_ENV && !DB_READY) return MOCK_POSTS.map(mapToSovereignPost);
  
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedDate',
      locale: lang,
    });
    return docs.length > 0 ? docs.map(mapToSovereignPost) : MOCK_POSTS.map(mapToSovereignPost);
  } catch {
    return MOCK_POSTS.map(mapToSovereignPost);
  }
}

export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      locale: lang,
    });
    if (docs[0]) return mapToSovereignPost(docs[0]);
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  } catch {
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  }
}

/**
 * @description Filtra artículos por etiqueta.
 * @fix Resolución TS2339: Se actualiza el filtrado para tratar 't' como string (Mocks v9.0).
 */
export async function getPostsByTag(tagSlug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { 'tags.tag': { equals: tagSlug }, status: { equals: 'published' } },
      locale: lang,
    });
    return docs.map(mapToSovereignPost);
  } catch {
    const normalizedTarget = tagSlug.toLowerCase().trim();
    
    const mockMatches = MOCK_POSTS.filter((p: RawMockPost) => 
      p.tags.some((t: string) => t.toLowerCase().replace(/\s+/g, '-') === normalizedTarget)
    );
    
    return mockMatches.map(mapToSovereignPost);
  }
}