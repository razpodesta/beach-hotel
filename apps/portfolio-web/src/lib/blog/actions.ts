/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Concierge Journal.
 *              Implementa compilación JIT de Lexical a MDX, detección de atmósfera
 *              por IA y protocolo de resiliencia DB-First con observabilidad forense.
 * @version 31.0 - Linter Pure & Forensic Telemetry Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload } from 'payload';
import type { Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a fronteras Nx.
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
 * CONTRATOS TÉCNICOS: Lexical AST (Sovereign CMS)
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

// Cache Singleton para el motor Payload (Pilar X)
let cachedPayload: Payload | null = null;

/**
 * @description Inicialización resiliente del motor de datos.
 */
async function getSovereignPayload(): Promise<Payload> {
  if (cachedPayload) return cachedPayload;
  const config = await configPromise;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

/**
 * COMPILADOR JIT: Lexical to Markdown
 * @pilar X: Performance - Transformación eficiente de nodos AST a contenido MDX.
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown AST anomaly';
    console.warn(`[HEIMDALL][PARSER] Lexical conversion degraded: ${msg}`);
    return '';
  }
}

/**
 * DETECTOR DE ATMÓSFERA (Día/Noche)
 * @pilar XII: MEA/UX - Sincroniza el "Vibe" del contenido con los shaders de la UI.
 */
function detectAtmosphere(tags: string[]): 'day' | 'night' {
  const nightKeywords = ['nightlife', 'party', 'festival', 'club', 'sunset', 'techno', 'night', 'pride', 'noite', 'fiesta'];
  const hasNightVibe = tags.some(tag => nightKeywords.includes(tag.toLowerCase()));
  return hasNightVibe ? 'night' : 'day';
}

/**
 * SHAPER SOBERANO: mapToSovereignPost
 * @description Transforma la data cruda del CMS en una entidad validada por el Contrato.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
function mapToSovereignPost(entry: unknown, dict: Dictionary): PostWithSlug {
  const t = dict.blog_page;
  
  try {
    const raw = entry as RawPayloadPost;
    
    // 1. Resolución de Atribución (Author fallback)
    let resolvedAuthor = t.hero_title;
    const authorData = raw.author;
    if (authorData) {
      if (typeof authorData === 'object') {
        resolvedAuthor = authorData.username || authorData.email?.split('@')[0] || resolvedAuthor;
      } else {
        resolvedAuthor = authorData;
      }
    }

    // 2. Procesamiento de Taxonomía
    const rawTags = Array.isArray(raw.tags) 
      ? raw.tags.map((item) => item.tag).filter(Boolean) 
      : ['sanctuary'];
    
    const atmosphere = detectAtmosphere(rawTags);
    const mdxContent = compileLexicalToMarkdown(raw.content);

    // 3. Cálculo dinámico de métricas (Pilar X)
    const wordCount = mdxContent.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 225));

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
        readingTime,
      },
      content: mdxContent,
    };

    return postWithSlugSchema.parse(mappedData);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Validation Drift';
    console.error(`[HEIMDALL][DATA-CORRUPTION] Post Shaper critical failure: ${msg}`);
    
    // Fallback de Resiliencia Nivel 0 (Pilar VIII)
    return {
      slug: 'emergency-recovery',
      metadata: {
        title: 'Editorial Sanctuary: Recovery Mode',
        description: 'System integrity preserved through forensic fallback.',
        author: 'MetaShark Sentinel',
        published_date: new Date().toISOString(),
        tags: ['maintenance'],
        vibe: 'day'
      },
      content: 'Contenido temporalmente no disponible por tareas de mantenimiento de datos.'
    } as PostWithSlug;
  }
}

/**
 * ACCIÓN PÚBLICA: getAllPosts
 * @description Recupera el catálogo completo. Prioriza DB > Mocks.
 * @fix Erradica error ESLint 'error' is defined but never used.
 */
export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  console.group(`[HEIMDALL][EDITORIAL] Syncing Journal Cluster [${lang}]`);
  const dict = await getDictionary(lang);
  
  if (IS_BUILD_ENV && !DB_READY) {
    console.log('[RECOVERY] DB Unreachable during Build phase. serving Genesis Mocks.');
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Signal Lost';
    console.warn(`[HEIMDALL][RECOVERY] Editorial sync aborted: ${msg}. Serving local sanctuary.`);
    console.groupEnd();
    return MOCK_POSTS.map((mock) => mapToSovereignPost(mock, dict));
  }
}

/**
 * ACCIÓN PÚBLICA: getPostBySlug
 * @description Localización quirúrgica de un artículo por su identificador semántico.
 */
export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  console.group(`[HEIMDALL][EDITORIAL] Single-Fetch Request: ${slug}`);
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Search Interrupted';
    console.error(`[HEIMDALL][RECOVERY] Search failed for ${slug}: ${msg}. Attempting Mock Sync.`);
    console.groupEnd();
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch, dict) : null;
  }
}

/**
 * ACCIÓN PÚBLICA: getPostsByTag
 * @description Filtrado por taxonomía localizado con normalización de rumbos.
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Taxonomy Drift';
    console.error(`[HEIMDALL][RECOVERY] Tag filter failed for ${normalized}: ${msg}.`);
    return MOCK_POSTS
      .map((mock) => mapToSovereignPost(mock, dict))
      .filter((p) => p.metadata.tags.some((t) => t.toLowerCase().replace(/\s+/g, '-') === normalized));
  }
}