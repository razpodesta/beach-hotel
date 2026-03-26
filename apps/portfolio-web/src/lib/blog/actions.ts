/**
 * @file actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial (The Concierge Journal).
 *              Implementa un Adaptador Polimórfico para unificar Mocks y Payload CMS 3.0,
 *              compilación JIT de Lexical a Markdown y protocolos de resiliencia.
 * @version 16.0 - Staff Resilience & Polymorphic Mapping
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload, type Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { type PostWithSlug, postWithSlugSchema } from '../schemas/blog.schema';
import { type Locale, i18n } from '../../config/i18n.config';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks';

/**
 * DETERMINANTES DE INFRAESTRUCTRURA
 * @description Protocolo de rescate para la fase de construcción en Vercel (Pilar VIII).
 */
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS TÉCNICOS SOBERANOS
 */
interface LexicalNode {
  type: string;
  text?: string;
  tag?: string;
  listType?: 'number' | 'bullet';
  children?: LexicalNode[];
  url?: string; // Para enlaces
}

interface LexicalRoot {
  root?: {
    children?: LexicalNode[];
  };
}

/**
 * @interface RawPayloadPost
 * @description Representa la forma cruda polimórfica que entrega el CMS.
 */
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

/**
 * CACHÉ DE INSTANCIA SOBERANA (Pilar X)
 */
let cachedPayload: Payload | null = null;

async function getSovereignPayload(): Promise<Payload> {
  if (cachedPayload) return cachedPayload;
  const config = await configPromise;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

/**
 * COMPILADOR JIT: Lexical AST a Markdown
 * @description Transforma la estructura de nodos de Payload en Markdown semántico.
 */
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
    return '';
  }
}

/**
 * SHAPER POLIMÓRFICO: mapToSovereignPost
 * @description Normaliza la entrada de datos (Mocks o CMS) al contrato de Zod.
 * @pilar III: Erradicación de 'any' mediante validación estricta de esquema.
 */
function mapToSovereignPost(entry: unknown): PostWithSlug {
  // 1. Detección de Mocks (Pilar VIII)
  if (entry && typeof entry === 'object' && 'metadata' in entry && 'slug' in entry) {
    return postWithSlugSchema.parse(entry);
  }

  const raw = entry as RawPayloadPost;

  // 2. Resolución de Autoría
  let authorName = 'Concierge Team';
  if (raw.author && typeof raw.author === 'object') {
    authorName = raw.author.username || raw.author.email?.split('@')[0] || authorName;
  }

  // 3. Resolución de Taxonomía
  const sanitizedTags = Array.isArray(raw.tags) 
    ? raw.tags.map((t) => (typeof t === 'string' ? t : t?.tag || '')).filter(Boolean) 
    : [];

  // 4. Resolución de Imagen (Media Library)
  const ogImageUrl = raw.ogImage && typeof raw.ogImage === 'object' 
    ? raw.ogImage.url 
    : undefined;

  const mapped = {
    slug: raw.slug || 'unknown-article',
    metadata: {
      title: raw.title || 'Untitled Sanctuary Post',
      description: raw.description || '',
      author: authorName,
      published_date: raw.publishedDate || new Date().toISOString(),
      tags: sanitizedTags,
      ogImage: ogImageUrl,
    },
    content: compileLexicalToMarkdown(raw.content),
  };

  return postWithSlugSchema.parse(mapped);
}

/**
 * ACCIONES DEL SERVIDOR (Public Actions)
 */

export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  console.group(`[HEIMDALL][FETCH] Editorial Sync: ${lang}`);
  
  // Guardia de Resiliencia en el Build (Pilar VIII)
  if (IS_BUILD_ENV && !DB_READY) {
    console.warn('[SECURITY] Database unavailable during build. Using Sovereign Mocks.');
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
  } catch (error) {
    console.error('[CRITICAL] CMS failure. Defaulting to Mocks.', error);
    console.groupEnd();
    return MOCK_POSTS.map(mapToSovereignPost);
  }
}

export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
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
    
    if (docs[0]) return mapToSovereignPost(docs[0]);
    
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  } catch {
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  }
}

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
    return [];
  }
}