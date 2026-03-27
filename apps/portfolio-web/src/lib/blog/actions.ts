/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial (The Concierge Journal).
 *              Implementa arquitectura de datos híbrida (CMS + Mocks), instrumentación 
 *              Heimdall para observabilidad y compilación JIT de Lexical a Markdown.
 *              Refactorizado: Higiene absoluta de variables y telemetría de errores persistente.
 * @version 21.0 - Linter Hygiene & Forensic Error Tracking
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload } from 'payload';
import type { Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';

/**
 * IMPORTACIONES DE CONTRATO (Saneadas)
 * @pilar V: Adherencia arquitectónica a las fronteras de Nx.
 */
import { postWithSlugSchema } from '../schemas/blog.schema';
import type { PostWithSlug } from '../schemas/blog.schema';
import { i18n } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks';
import type { RawMockPost } from '../../data/mocks/cms.mocks';

/**
 * ESTADO DE INFRAESTRUCTRURA
 */
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS TÉCNICOS: Abstract Syntax Tree (AST) de Lexical
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
 * @description Transforma el AST del editor de Payload en texto plano formateado.
 * @pilar X: Rendimiento - Transformación eficiente sin dependencias pesadas.
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
    return typeof contentNode === 'string' ? contentNode : '';
  }
}

/**
 * SHAPER POLIMÓRFICO: mapToSovereignPost
 * @description Normaliza datos del CMS o Mocks al contrato inmutable de Zod.
 */
function mapToSovereignPost(entry: unknown): PostWithSlug {
  const parsedResult = postWithSlugSchema.safeParse(entry);
  if (parsedResult.success) return parsedResult.data;

  const raw = entry as RawPayloadPost;

  let authorName = 'Concierge Team';
  if (raw.author) {
    if (typeof raw.author === 'object') {
      authorName = raw.author.username || raw.author.email?.split('@')[0] || authorName;
    } else if (typeof raw.author === 'string') {
      authorName = raw.author;
    }
  }

  const sanitizedTags = Array.isArray(raw.tags) 
    ? raw.tags.map((t) => (typeof t === 'string' ? t : t?.tag || '')).filter(Boolean) 
    : [];

  const ogImageUrl = raw.ogImage && typeof raw.ogImage === 'object' 
    ? raw.ogImage.url 
    : (typeof raw.ogImage === 'string' ? raw.ogImage : undefined);

  const mappedData = {
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

  const validation = postWithSlugSchema.safeParse(mappedData);
  if (!validation.success) {
    console.error('[HEIMDALL][DATA-CORRUPTION] Article Shaper Failed:', validation.error.format());
    return postWithSlugSchema.parse(MOCK_POSTS[0]); 
  }

  return validation.data;
}

/**
 * ACCIÓN PÚBLICA: getAllPosts
 * @description Recupera la totalidad de artículos publicados para un idioma.
 */
export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  console.group(`[HEIMDALL][EDITORIAL] Syncing Hub Journal [${lang}]`);
  
  if (IS_BUILD_ENV && !DB_READY) {
    console.log('[BUILD-MODE] Persistent DB unreachable. Delivering Genesis Mocks.');
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
      ? docs.map(mapToSovereignPost) 
      : MOCK_POSTS.map(mapToSovereignPost);
      
    console.log(`[SUCCESS] Synchronized ${result.length} articles.`);
    console.groupEnd();
    return result;
  } catch (error: unknown) {
    /**
     * @pilar IV: Observabilidad Forense.
     * @fix Erradicación de variable no usada. Se reporta el motivo técnico de la caída.
     */
    const message = error instanceof Error ? error.message : 'DATABASE_HANDSHAKE_FAILED';
    console.warn(`[RECOVERY] Logic fallback engaged due to CMS latency: ${message}`);
    console.groupEnd();
    return MOCK_POSTS.map(mapToSovereignPost);
  }
}

/**
 * ACCIÓN PÚBLICA: getPostBySlug
 * @description Recupera el detalle de un artículo específico con integridad E-E-A-T.
 */
export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  console.group(`[HEIMDALL][EDITORIAL] Deep-Fetching Article: ${slug}`);
  
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      locale: lang,
    });
    
    if (docs[0]) {
      console.log('[SUCCESS] Article found in Production Cloud.');
      console.groupEnd();
      return mapToSovereignPost(docs[0]);
    }
    
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    console.log(mockMatch ? '[INFO] Article served from Genesis Mirror.' : '[FAILED] Content not located.');
    console.groupEnd();
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'FETCH_ABORTED';
    console.warn(`[HEIMDALL][EDITORIAL] Error al recuperar artículo: ${message}`);
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    console.groupEnd();
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  }
}

/**
 * ACCIÓN PÚBLICA: getPostsByTag
 * @description Filtra la colección editorial por taxonomía saneada.
 */
export async function getPostsByTag(tagSlug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  const normalizedTarget = tagSlug.toLowerCase().trim().replace(/\s+/g, '-');
  console.group(`[HEIMDALL][EDITORIAL] Taxonomy Filtering: ${normalizedTarget}`);

  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { 'tags.tag': { equals: tagSlug }, status: { equals: 'published' } },
      locale: lang,
    });

    if (docs.length > 0) {
      console.log(`[SUCCESS] Located ${docs.length} assets with tag synergy.`);
      console.groupEnd();
      return docs.map(mapToSovereignPost);
    }

    const mockMatches = MOCK_POSTS.filter((p: RawMockPost) => 
      p.tags.some((t: string) => t.toLowerCase().replace(/\s+/g, '-') === normalizedTarget)
    );
    
    console.log(`[INFO] Serving ${mockMatches.length} mock matches for taxonomy.`);
    console.groupEnd();
    return mockMatches.map(mapToSovereignPost);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'FILTERING_FAILED';
    console.warn(`[HEIMDALL][EDITORIAL] Error en filtrado por etiqueta: ${message}`);
    const mockMatches = MOCK_POSTS.filter((p: RawMockPost) => 
      p.tags.some((t: string) => t.toLowerCase().replace(/\s+/g, '-') === normalizedTarget)
    );
    console.groupEnd();
    return mockMatches.map(mapToSovereignPost);
  }
}