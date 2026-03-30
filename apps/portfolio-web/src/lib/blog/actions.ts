/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Concierge Journal.
 *              Implementa el Patrón Resolver para conmutación dinámica entre 
 *              infraestructura Cloud y Genesis Mocks, compilación JIT de Lexical 
 *              y observabilidad forense integrada.
 *              Refactorizado: Erradicación de non-null assertions y variables huérfanas.
 * @version 33.0 - Linter Pure & Robust Error Handling
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload, type Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA Y CONTRATO
 * @pilar V: Adherencia arquitectónica.
 */
import { postWithSlugSchema, type PostWithSlug } from '../schemas/blog.schema';
import { i18n, type Locale } from '../../config/i18n.config';
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
  url?: string;
  children?: LexicalNode[];
}

interface LexicalRoot {
  root?: { children?: LexicalNode[] };
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

// Singleton de conexión para el motor de datos (Pilar X)
let cachedPayload: Payload | null = null;

/**
 * COMPILADOR JIT: Lexical to Markdown
 * @description Transmuta nodos AST en contenido MDX puro de forma recursiva.
 * @pilar X: Performance de transpilación.
 */
function compileLexicalToMarkdown(contentNode: unknown): string {
  if (!contentNode) return '';
  if (typeof contentNode === 'string') return contentNode;

  const processNodes = (nodes: LexicalNode[] = []): string => {
    return nodes.reduce((acc, node) => {
      const children = node.children ? processNodes(node.children) : '';
      
      switch (node.type) {
        case 'text': return acc + (node.text || '');
        case 'paragraph': return acc + `${children}\n\n`;
        case 'heading': {
          const level = node.tag?.replace('h', '') || '2';
          return acc + `${'#'.repeat(Number(level))} ${children}\n\n`;
        }
        case 'link': return acc + `[${children}](${node.url || '#'})`;
        case 'quote': return acc + `> ${children}\n\n`;
        default: return acc + children;
      }
    }, '');
  };

  try {
    return processNodes((contentNode as LexicalRoot).root?.children);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown AST Anomaly';
    console.warn(`[HEIMDALL][PARSER] AST Corruption detected: ${msg}`);
    return '';
  }
}

/**
 * SHAPER SOBERANO: Normalización de Entidades
 * @pilar III: Seguridad de Tipos Absoluta.
 */
function shapeEditorialEntry(entry: unknown, dict: Dictionary): PostWithSlug {
  const raw = entry as RawPayloadPost;
  const t = dict.blog_page;

  // 1. Resolución de Atribución (Author Authority)
  let author = t.hero_title;
  if (raw.author) {
    author = typeof raw.author === 'object' 
      ? raw.author.username || raw.author.email?.split('@')[0] || author 
      : raw.author;
  }

  // 2. Inteligencia de Contenido
  const rawTags = (raw.tags || []).map(t => t.tag.toLowerCase());
  const mdx = compileLexicalToMarkdown(raw.content);
  
  // Detección de atmósfera (Pilar XII: MEA/UX)
  const isNight = ['night', 'festival', 'party', 'techno', 'pride'].some(v => rawTags.includes(v));

  // 3. Inferencia y Validación SSoT
  return postWithSlugSchema.parse({
    slug: raw.slug || `journal-fallback-${Date.now()}`,
    metadata: {
      title: raw.title || 'Untitled Sanctuary Entry',
      description: raw.description || t.page_description,
      author,
      published_date: raw.publishedDate || new Date().toISOString(),
      tags: rawTags.length > 0 ? rawTags : ['sanctuary'],
      vibe: isNight ? 'night' : 'day',
      ogImage: typeof raw.ogImage === 'object' ? raw.ogImage?.url : (raw.ogImage || undefined),
      readingTime: Math.max(1, Math.ceil(mdx.split(/\s+/).length / 225))
    },
    content: mdx
  });
}

/**
 * PRIVATE CLASS: EditorialDataResolver
 * @description Centraliza la orquestación de fuentes de datos con resiliencia total.
 */
class EditorialDataResolver {
  private static async getPayload() {
    if (cachedPayload) return cachedPayload;
    cachedPayload = await getPayload({ config: await configPromise });
    return cachedPayload;
  }

  /**
   * @description Determina si el sistema debe operar en modo "Mocks Only".
   */
  private static get useMocks(): boolean {
    return (IS_BUILD_ENV && !DB_READY) || process.env.DATA_SOURCE === 'MOCKS';
  }

  public static async fetch(options: { 
    slug?: string, 
    tag?: string, 
    lang: Locale 
  }, dict: Dictionary): Promise<PostWithSlug[]> {
    const sourceLabel = this.useMocks ? 'MOCKS' : 'CMS';
    console.log(`[HEIMDALL][EDITORIAL] Source: ${sourceLabel} | Lang: ${options.lang}`);

    if (this.useMocks) {
      const mocks = MOCK_POSTS.map(m => shapeEditorialEntry(m, dict));
      if (options.slug) return mocks.filter(m => m.slug === options.slug);
      if (options.tag) {
        const targetTag = options.tag;
        return mocks.filter(m => m.metadata.tags.includes(targetTag));
      }
      return mocks;
    }

    try {
      const payload = await this.getPayload();
      const { docs } = await payload.find({
        collection: 'blog-posts',
        where: {
          status: { equals: 'published' },
          ...(options.slug ? { slug: { equals: options.slug } } : {}),
          ...(options.tag ? { 'tags.tag': { equals: options.tag } } : {})
        },
        sort: '-publishedDate',
        locale: options.lang,
      });

      if (docs.length === 0 && !options.slug && !options.tag) {
        throw new Error('EMPTY_COLLECTION');
      }

      return docs.map(doc => shapeEditorialEntry(doc, dict));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Link Interrupted';
      console.warn(`[HEIMDALL][RECOVERY] CMS Link Degraded: ${msg}. Activating Genesis Fallback.`);
      return MOCK_POSTS.map(m => shapeEditorialEntry(m, dict));
    }
  }
}

/**
 * ACCIONES PÚBLICAS SOBERANAS
 */

export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  const dict = await getDictionary(lang);
  return EditorialDataResolver.fetch({ lang }, dict);
}

export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  const dict = await getDictionary(lang);
  const results = await EditorialDataResolver.fetch({ slug, lang }, dict);
  return results[0] || null;
}

export async function getPostsByTag(tag: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  const dict = await getDictionary(lang);
  const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
  return EditorialDataResolver.fetch({ tag: normalizedTag, lang }, dict);
}