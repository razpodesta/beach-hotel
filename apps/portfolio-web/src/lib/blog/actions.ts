/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Concierge Journal (Silo C).
 *              Refactorizado: Resolución de TS18048 mediante síntesis de filtros 
 *              inmutables, aislamiento Multi-Tenant y normalización S3.
 *              Estándar: Heimdall v2.5 Forensic Logging & React 19 Pure.
 * @version 42.1 - Type-Safe Filter Synthesis & S3 Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import { getPayload } from 'payload';
import type { Payload, Where } from 'payload';
import { unstable_noStore as noStore } from 'next/cache';

import { postWithSlugSchema } from '../schemas/blog.schema';
import type { PostWithSlug } from '../schemas/blog.schema';
import { i18n } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import { getDictionary } from '../get-dictionary';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks';
import type { RawMockPost } from '../../data/mocks/cms.mocks';
import type { Dictionary } from '../schemas/dictionary.schema';

/**
 * PROTOCOLO CROMÁTICO HEIMDALL v2.5
 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * GUARDIANES DE INFRAESTRUCTRURA (Sovereign Detection)
 * @pilar VIII: Resiliencia de Build.
 */
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const IS_TYPE_GEN = process.env.PAYLOAD_GENERATE === 'true';
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';

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

/**
 * @interface RawPayloadPost
 * @description Contrato de entrada desde el CMS (Unshaked Entity).
 */
interface RawPayloadPost {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: LexicalRoot | string | null;
  publishedDate?: string | null;
  author?: string | { username?: string; email?: string; id?: string } | null;
  tags?: Array<{ tag: string }> | string[] | null;
  ogImage?: string | { url: string; id?: string } | null;
  vibe?: 'day' | 'night' | null;
}

let cachedPayload: Payload | null = null;

/**
 * CLASS: LexicalCompiler
 * @description Transmuta el AST de Lexical a Markdown puro para el motor MDX.
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
          case 'list': return acc + `${children}\n`;
          case 'listitem': return acc + `- ${children}\n`;
          default: return acc + children;
        }
      }, '');
    };

    try {
      const rootNode = contentNode as LexicalRoot;
      return processNodes(rootNode.root?.children);
    } catch {
      return '';
    }
  }
}

/**
 * CLASS: EditorialShaper
 * @description Alquimia de datos: transforma el documento crudo en una entidad soberana.
 */
class EditorialShaper {
  public static shape(entry: unknown, dict: Dictionary): PostWithSlug | null {
    const raw = entry as RawPayloadPost;
    const t = dict.blog_page;

    // 1. RESOLUCIÓN DE AUTOR (Pilar III)
    let authorName = t.hero_title;
    if (raw.author) {
      if (typeof raw.author === 'string') {
        authorName = raw.author;
      } else if (typeof raw.author === 'object') {
        const authorObj = raw.author as { username?: string; email?: string };
        authorName = authorObj.username || authorObj.email?.split('@')[0] || authorName;
      }
    }

    // 2. NORMALIZACIÓN DE TAXONOMÍA
    const rawTagsArray = Array.isArray(raw.tags) ? raw.tags : [];
    const normalizedTags = rawTagsArray.map(tagItem => {
      if (typeof tagItem === 'string') return tagItem.toLowerCase().trim();
      if (typeof tagItem === 'object' && tagItem !== null && 'tag' in tagItem) {
        return (tagItem as { tag: string }).tag.toLowerCase().trim();
      }
      return null;
    }).filter((tag): tag is string => tag !== null);

    const mdx = LexicalCompiler.compile(raw.content);
    
    // 3. DETECCIÓN DE ATMÓSFERA (SSoT)
    const isNight = raw.vibe === 'night' || ['festival', 'techno', 'night'].some(v => 
      normalizedTags.includes(v) || raw.title?.toLowerCase().includes(v)
    );

    // 4. VALIDACIÓN DE CONTRATO SOBERANO
    const shapeResult = postWithSlugSchema.safeParse({
      slug: raw.slug || `journal-fallback-${Date.now()}`,
      metadata: {
        title: raw.title || 'Untitled Sanctuary Entry',
        description: raw.description || t.page_description,
        author: authorName,
        published_date: raw.publishedDate || new Date().toISOString(),
        tags: normalizedTags.length > 0 ? normalizedTags : ['sanctuary'],
        vibe: isNight ? 'night' : 'day',
        // Resolución de imagen S3: Soporta tanto string como objeto relacional
        ogImage: typeof raw.ogImage === 'object' ? raw.ogImage?.url : (raw.ogImage || undefined),
        readingTime: Math.max(1, Math.ceil(mdx.split(/\s+/).length / 225))
      },
      content: mdx
    });

    if (!shapeResult.success) {
      console.warn(`${C.yellow}[HEIMDALL][DATA-DROP]${C.reset} Contract Violation in: ${raw.slug || 'unknown'}`);
      return null;
    }

    return shapeResult.data;
  }
}

/**
 * CLASS: EditorialDataResolver
 * @description Orquestador de recuperación de datos con soporte para degradado elegante.
 */
class EditorialDataResolver {
  private static async getPayloadInstance(): Promise<Payload | null> {
    if (IS_TYPE_GEN) return null;

    if (!process.env.DATABASE_URL) {
      console.log(`${C.yellow}[HEIMDALL][CONFIG] No DATABASE_URL. Sanctuary Mode (Mocks) enabled.${C.reset}`);
      return null;
    }
    
    if (cachedPayload) return cachedPayload;
    
    try {
      const configModule = await import('@metashark/cms-core/config');
      cachedPayload = await getPayload({ config: configModule.default });
      return cachedPayload;
    } catch {
      console.error(`${C.red}[HEIMDALL][CRITICAL] Database Handshake Failed. Switching to Mocks.${C.reset}`);
      return null;
    }
  }

  private static adaptMockToRaw(mock: RawMockPost): RawPayloadPost {
    return { ...mock, ogImage: mock.ogImageLocal };
  }

  public static async fetch(options: { 
    slug?: string, 
    tag?: string, 
    lang: Locale 
  }, dict: Dictionary): Promise<PostWithSlug[]> {
    const traceId = `journal_fetch_${Date.now()}`;
    const payload = await this.getPayloadInstance();

    // 1. RESOLUCIÓN DE MOCKS (Fallo de red o entorno sin DB)
    if (!payload) {
      console.log(`${C.magenta}[HEIMDALL][${traceId}] Mode: LOCAL_SANCTUARY (Mocked Data)${C.reset}`);
      const mocks = MOCK_POSTS
        .map(m => EditorialShaper.shape(this.adaptMockToRaw(m), dict))
        .filter((post): post is PostWithSlug => post !== null);
      
      const { slug, tag } = options;
      if (slug) return mocks.filter(m => m.slug === slug);
      if (tag) return mocks.filter(m => m.metadata.tags.includes(tag));
      return mocks;
    }

    // 2. RECUPERACIÓN REAL DESDE EL CLÚSTER
    try {
      /**
       * @pilar IX: Aislamiento Multi-Tenant.
       * @fix TS18048: Construcción de array de condiciones independiente para 
       * garantizar seguridad de tipos incondicional.
       */
      const conditions: Where[] = [
        { status: { equals: 'published' } },
        { tenant: { equals: MASTER_TENANT_ID } }
      ];

      if (options.slug) conditions.push({ slug: { equals: options.slug } });
      if (options.tag) conditions.push({ 'tags.tag': { equals: options.tag } });

      const whereClause: Where = { and: conditions };

      const { docs } = await payload.find({
        collection: 'blog-posts',
        where: whereClause,
        sort: '-publishedDate',
        locale: options.lang,
        depth: 2,
      });

      const modeLabel = IS_BUILD ? 'BUILD_REAL_SYNC' : 'CLOUD_PRODUCTION';
      console.log(`${C.green}[HEIMDALL][${traceId}] Mode: ${modeLabel} (Nodes: ${docs.length})${C.reset}`);

      return docs
        .map(doc => EditorialShaper.shape(doc, dict))
        .filter((post): post is PostWithSlug => post !== null);

    } catch {
      console.warn(`${C.yellow}[HEIMDALL][${traceId}] Connection degraded. Activating Recovery Fallback.${C.reset}`);
      
      return MOCK_POSTS
        .map(m => EditorialShaper.shape(this.adaptMockToRaw(m), dict))
        .filter((post): post is PostWithSlug => post !== null);
    }
  }
}

/**
 * INTERFAZ PÚBLICA (Server Actions)
 */

export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  if (!IS_BUILD) noStore();
  const dict = await getDictionary(lang);
  return EditorialDataResolver.fetch({ lang }, dict);
}

export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  if (!IS_BUILD) noStore();
  const dict = await getDictionary(lang);
  const results = await EditorialDataResolver.fetch({ slug, lang }, dict);
  return results[0] || null;
}

export async function getPostsByTag(tag: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  if (!IS_BUILD) noStore();
  const dict = await getDictionary(lang);
  const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
  return EditorialDataResolver.fetch({ tag: normalizedTag, lang }, dict);
}