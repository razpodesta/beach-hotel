/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial.
 *              Refactorizado: Erradicación de errores ESLint, optimización 
 *              de resiliencia y prioridad absoluta a base de datos.
 * @version 29.0 - Linter Pure & DB-Priority Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload } from 'payload';
import type { Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { postWithSlugSchema } from '../schemas/blog.schema';
import type { PostWithSlug } from '../schemas/blog.schema';
import { i18n } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import { getDictionary } from '../get-dictionary';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks';
import type { Dictionary } from '../schemas/dictionary.schema';

/**
 * CONSTANTES DE INFRAESTRUCTRURA
 */
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS TÉCNICOS: Lexical AST
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
 * COMPILADOR JIT: Lexical to Markdown
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
    // Protocolo Heimdall: Trazabilidad de fallo de parseo sin variables huérfanas
    console.warn('[HEIMDALL][PARSER] Lexical conversion degraded: Structural anomaly detected.');
    return '';
  }
}

/**
 * DETECTOR DE ATMÓSFERA (Día/Noche)
 * @pilar XII: MEA/UX - Permite que la UI reaccione al contenido.
 */
function detectAtmosphere(tags: string[]): 'day' | 'night' {
  const nightKeywords = ['nightlife', 'party', 'festival', 'club', 'sunset', 'techno'];
  const hasNightVibe = tags.some(tag => nightKeywords.includes(tag.toLowerCase()));
  return hasNightVibe ? 'night' : 'day';
}

/**
 * SHAPER SOBERANO: mapToSovereignPost
 * @pilar X: Performance - Inyección de diccionario para evitar I/O.
 */
function mapToSovereignPost(entry: unknown, dict: Dictionary): PostWithSlug {
  const t = dict.blog_page;
  
  try {
    const raw = entry as RawPayloadPost;
    
    let resolvedAuthor = t.hero_title;
    const authorData = raw.author;
    if (authorData) {
      if (typeof authorData === 'object') {
        resolvedAuthor = authorData.username || authorData.email?.split('@')[0] || resolvedAuthor;
      } else {
        resolvedAuthor = authorData;
      }
    }

    const rawTags = Array.isArray(raw.tags) 
      ? raw.tags.map((item) => item.tag).filter(Boolean) 
      : ['sanctuary'];
    
    const atmosphere = detectAtmosphere(rawTags);

    const mappedData = {
      slug: raw.slug || `journal-${Date.now()}`,
      metadata: {
        title: raw.title || t.empty_state,
        description: raw.description || t.page_description,
        author: resolvedAuthor,
        published_date: raw.publishedDate || new Date().toISOString(),
        tags: rawTags,
        ogImage: typeof raw.ogImage === 'object' ? raw.ogImage?.url : (raw.ogImage || undefined),
        vibe: atmosphere, 
      },
      content: compileLexicalToMarkdown(raw.content),
    };

    /**
     * @note: El error TS2353 persistirá hasta que nivelemos blog.schema.ts
     * en el siguiente paso de la cadena de refactorización.
     */
    return postWithSlugSchema.parse(mappedData);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Structure Violation';
    console.error(`[HEIMDALL][DATA-CORRUPTION] Shaper Failed: ${msg}`);
    
    return {
      slug: 'recovery-active',
      metadata: {
        title: t.hero_title,
        description: t.empty_state,
        author: 'MetaShark Sentinel',
        published_date: new Date().toISOString(),
        tags: ['maintenance'],
        vibe: 'day'
      },
      content: t.empty_state
    } as PostWithSlug;
  }
}

/**
 * ACCIÓN PÚBLICA: getAllPosts
 */
export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  console.group(`[HEIMDALL][EDITORIAL] Syncing Hub Journal [${lang}]`);
  const dict = await getDictionary(lang);
  
  // Resiliencia durante Build: Evita fallos si la DB está inaccesible en CI/CD
  if (IS_BUILD_ENV && !DB_READY) {
    console.log('[RECOVERY] DB Offline durante Build. Sirviendo Génesis Mocks.');
    console.groupEnd();
    return MOCK_POSTS.map(mock => mapToSovereignPost(mock, dict));
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
      ? docs.map((doc) => mapToSovereignPost(doc, dict))
      : MOCK_POSTS.map((mock) => mapToSovereignPost(mock, dict));
      
    console.groupEnd();
    return result;
  } catch {
    console.warn('[HEIMDALL][RECOVERY] Database Connection Error. Serving local sanctuary data.');
    console.groupEnd();
    return MOCK_POSTS.map((mock) => mapToSovereignPost(mock, dict));
  }
}

/**
 * ACCIÓN PÚBLICA: getPostBySlug
 */
export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  console.group(`[HEIMDALL][EDITORIAL] Deep-Fetch: ${slug}`);
  const dict = await getDictionary(lang);
  
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      locale: lang,
    });
    
    console.groupEnd();
    if (docs[0]) return mapToSovereignPost(docs[0], dict);
    
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch, dict) : null;
  } catch {
    console.error(`[HEIMDALL][RECOVERY] Search Aborted for ${slug}: Signal lost.`);
    console.groupEnd();
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch, dict) : null;
  }
}

/**
 * ACCIÓN PÚBLICA: getPostsByTag
 */
export async function getPostsByTag(tagSlug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  const normalized = tagSlug.toLowerCase().trim().replace(/\s+/g, '-');
  const dict = await getDictionary(lang);
  
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { 'tags.tag': { equals: tagSlug }, status: { equals: 'published' } },
      locale: lang,
    });

    if (docs.length > 0) return docs.map((doc) => mapToSovereignPost(doc, dict));

    return MOCK_POSTS
      .map((mock) => mapToSovereignPost(mock, dict))
      .filter((p) => p.metadata.tags.some((t) => t.toLowerCase().replace(/\s+/g, '-') === normalized));
  } catch {
    console.error(`[HEIMDALL][RECOVERY] Taxonomy Filter failed for ${normalized}.`);
    return MOCK_POSTS
      .map((mock) => mapToSovereignPost(mock, dict))
      .filter((p) => p.metadata.tags.some((t) => t.toLowerCase().replace(/\s+/g, '-') === normalized));
  }
}