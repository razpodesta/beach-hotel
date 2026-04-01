/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Concierge Journal.
 *              Refactorizado: Atomización funcional en Clases Especializadas,
 *              resolución del Crash de Build (Polimorfismo en Tags Mocks vs CMS),
 *              y erradicación del "non-null assertion" (Linter Strict Compliance).
 * @version 35.0 - Elite Linter Pure & Atomic Pipeline
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
import { MOCK_POSTS, type RawMockPost } from '../../data/mocks/cms.mocks';
import type { Dictionary } from '../schemas/dictionary.schema';

/**
 * CONSTANTES DE ENTORNO SOBERANAS
 */
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS TÉCNICOS: Frontera de Datos (Raw Payloads)
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

/** Contrato híbrido para soportar tanto la DB real como los Mocks en la extracción */
interface RawPayloadPost {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: LexicalRoot | string | null;
  publishedDate?: string | null;
  author?: string | { username?: string; email?: string } | null;
  tags?: Array<{ tag: string }> | string[] | null;
  ogImage?: string | { url: string } | null;
}

// Singleton de conexión para el motor de datos
let cachedPayload: Payload | null = null;

/**
 * ============================================================================
 * APARATO 1: COMPILADOR LEXICAL (The Transmuter)
 * @description Responsabilidad Única: Transmutar nodos AST a Markdown puro.
 * ============================================================================
 */
class LexicalCompiler {
  public static compile(contentNode: unknown): string {
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
}

/**
 * ============================================================================
 * APARATO 2: SHAPER EDITORIAL (The Purifier)
 * @description Responsabilidad Única: Normalizar la entidad y garantizar Zod SSoT.
 * ============================================================================
 */
class EditorialShaper {
  public static shape(entry: unknown, dict: Dictionary): PostWithSlug {
    /** 
     * @pilar III: Justificación de 'as' -> El motor de DB retorna 'unknown' o 
     * Record genéricos. Aserimos al contrato intermedio antes de pasarlo a Zod 
     * para su validación final estricta.
     */
    const raw = entry as RawPayloadPost;
    const t = dict.blog_page;

    // 1. Resolución de Atribución
    let author = t.hero_title;
    if (raw.author) {
      author = typeof raw.author === 'object' 
        ? raw.author.username || raw.author.email?.split('@')[0] || author 
        : raw.author;
    }

    // 2. Resolución de Taxonomía Polimórfica (Soporte Mocks vs CMS)
    const rawTagsArray = Array.isArray(raw.tags) ? raw.tags : [];
    const normalizedTags = rawTagsArray.map(tagItem => {
      if (typeof tagItem === 'string') return tagItem.toLowerCase().trim();
      if (typeof tagItem === 'object' && tagItem !== null && 'tag' in tagItem) {
        return String(tagItem.tag).toLowerCase().trim();
      }
      return null;
    }).filter(Boolean) as string[];

    // 3. Inteligencia de Contenido
    const mdx = LexicalCompiler.compile(raw.content);
    
    // Detección de atmósfera (Pilar XII: MEA/UX)
    const isNight = ['night', 'festival', 'party', 'techno', 'pride'].some(v => normalizedTags.includes(v));

    // 4. Inferencia y Validación Estricta SSoT
    return postWithSlugSchema.parse({
      slug: raw.slug || `journal-fallback-${Date.now()}`,
      metadata: {
        title: raw.title || 'Untitled Sanctuary Entry',
        description: raw.description || t.page_description,
        author,
        published_date: raw.publishedDate || new Date().toISOString(),
        tags: normalizedTags.length > 0 ? normalizedTags : ['sanctuary'],
        vibe: isNight ? 'night' : 'day',
        ogImage: typeof raw.ogImage === 'object' ? raw.ogImage?.url : (raw.ogImage || undefined),
        readingTime: Math.max(1, Math.ceil(mdx.split(/\s+/).length / 225))
      },
      content: mdx
    });
  }
}

/**
 * ============================================================================
 * APARATO 3: DATA RESOLVER (The Orchestrator)
 * @description Responsabilidad Única: Enlace de Red, Mocks y Fallbacks.
 * ============================================================================
 */
class EditorialDataResolver {
  private static async getPayloadInstance() {
    if (cachedPayload) return cachedPayload;
    cachedPayload = await getPayload({ config: await configPromise });
    return cachedPayload;
  }

  private static get useMocks(): boolean {
    return (IS_BUILD_ENV && !DB_READY) || process.env.DATA_SOURCE === 'MOCKS';
  }

  private static adaptMockToRaw(mock: RawMockPost): RawPayloadPost {
    return {
      ...mock,
      ogImage: mock.ogImageLocal,
    };
  }

  public static async fetch(options: { 
    slug?: string, 
    tag?: string, 
    lang: Locale 
  }, dict: Dictionary): Promise<PostWithSlug[]> {
    const sourceLabel = this.useMocks ? 'MOCKS' : 'CMS';
    console.log(`[HEIMDALL][EDITORIAL] Source: ${sourceLabel} | Lang: ${options.lang}`);

    // VIA 1: GENESIS MOCKS
    if (this.useMocks) {
      const mocks = MOCK_POSTS.map(m => EditorialShaper.shape(this.adaptMockToRaw(m), dict));
      
      if (options.slug) {
        const targetSlug = options.slug;
        return mocks.filter(m => m.slug === targetSlug);
      }
      
      if (options.tag) {
        /** 
         * @fix Linter 'no-non-null-assertion': Se aísla el valor en una constante de 
         * bloque para que TS garantice que no es nulo dentro del closure de filtrado.
         */
        const targetTag = options.tag;
        return mocks.filter(m => m.metadata.tags.includes(targetTag));
      }
      
      return mocks;
    }

    // VIA 2: PAYLOAD CMS
    try {
      const payload = await this.getPayloadInstance();
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

      return docs.map(doc => EditorialShaper.shape(doc, dict));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Link Interrupted';
      console.warn(`[HEIMDALL][RECOVERY] CMS Link Degraded: ${msg}. Activating Genesis Fallback.`);
      return MOCK_POSTS.map(m => EditorialShaper.shape(this.adaptMockToRaw(m), dict));
    }
  }
}

/**
 * ============================================================================
 * ACCIONES PÚBLICAS SOBERANAS (The Public API)
 * ============================================================================
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