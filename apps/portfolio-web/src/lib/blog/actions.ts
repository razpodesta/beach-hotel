/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos para el Concierge Journal.
 *              Refactorizado: Inyección dinámica de configuración (Lazy Loading)
 *              para garantizar la compatibilidad con el Build de Vercel.
 * @version 37.4 - Build Integrity Fix
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import { getPayload, type Payload } from 'payload';
import type { Where } from 'payload';

import { postWithSlugSchema, type PostWithSlug } from '../schemas/blog.schema';
import { i18n, type Locale } from '../../config/i18n.config';
import { getDictionary } from '../get-dictionary';
import { MOCK_POSTS, type RawMockPost } from '../../data/mocks/cms.mocks';
import type { Dictionary } from '../schemas/dictionary.schema';

const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

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
  tags?: Array<{ tag: string }> | string[] | null;
  ogImage?: string | { url: string } | null;
}

let cachedPayload: Payload | null = null;

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
      console.warn(`[HEIMDALL][PARSER] AST Corruption detected: ${error instanceof Error ? error.message : 'Unknown'}`);
      return '';
    }
  }
}

class EditorialShaper {
  public static shape(entry: unknown, dict: Dictionary): PostWithSlug | null {
    const raw = entry as RawPayloadPost;
    const t = dict.blog_page;

    let author = t.hero_title;
    if (raw.author) {
      author = typeof raw.author === 'object' 
        ? raw.author.username || raw.author.email?.split('@')[0] || author 
        : raw.author;
    }

    const rawTagsArray = Array.isArray(raw.tags) ? raw.tags : [];
    const normalizedTags = rawTagsArray.map(tagItem => {
      if (typeof tagItem === 'string') return tagItem.toLowerCase().trim();
      if (typeof tagItem === 'object' && tagItem !== null && 'tag' in tagItem) {
        return String(tagItem.tag).toLowerCase().trim();
      }
      return null;
    }).filter(Boolean) as string[];

    const mdx = LexicalCompiler.compile(raw.content);
    const isNight = ['night', 'festival', 'party', 'techno', 'pride'].some(v => normalizedTags.includes(v));

    const shapeResult = postWithSlugSchema.safeParse({
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

    if (!shapeResult.success) {
      console.warn(`[HEIMDALL][DATA-DROP] Post omitted: ${raw.slug || 'unknown'}`);
      return null;
    }

    return shapeResult.data;
  }
}

class EditorialDataResolver {
  /**
   * @description Carga dinámica de la configuración para evitar el error de resolución de módulos en el Build.
   */
  private static async getPayloadInstance() {
    if (cachedPayload) return cachedPayload;
    const config = await import('@metashark/cms-core/config');
    cachedPayload = await getPayload({ config: config.default });
    return cachedPayload;
  }

  private static get useMocks(): boolean {
    return (IS_BUILD_ENV && !DB_READY) || process.env.DATA_SOURCE === 'MOCKS';
  }

  private static adaptMockToRaw(mock: RawMockPost): RawPayloadPost {
    return { ...mock, ogImage: mock.ogImageLocal };
  }

  public static async fetch(options: { 
    slug?: string, 
    tag?: string, 
    lang: Locale 
  }, dict: Dictionary): Promise<PostWithSlug[]> {
    if (this.useMocks) {
      const mocks = MOCK_POSTS
        .map(m => EditorialShaper.shape(this.adaptMockToRaw(m), dict))
        .filter((post): post is PostWithSlug => post !== null);
      
      if (options.slug) return mocks.filter(m => m.slug === options.slug);
      
      if (options.tag) {
        const targetTag = options.tag;
        return mocks.filter(m => m.metadata.tags.includes(targetTag));
      }
      
      return mocks;
    }

    try {
      const payload = await this.getPayloadInstance();
      
      const whereClause: Where = { status: { equals: 'published' } };
      
      if (options.slug) whereClause.slug = { equals: options.slug };
      if (options.tag) whereClause['tags.tag'] = { equals: options.tag };

      const { docs } = await payload.find({
        collection: 'blog-posts',
        where: whereClause,
        sort: '-publishedDate',
        locale: options.lang,
      });

      return docs
        .map(doc => EditorialShaper.shape(doc, dict))
        .filter((post): post is PostWithSlug => post !== null);

    } catch (error: unknown) {
      console.warn(`[HEIMDALL][RECOVERY] Editorial Link Degraded: ${error instanceof Error ? error.message : 'Unknown'}`);
      return MOCK_POSTS
        .map(m => EditorialShaper.shape(this.adaptMockToRaw(m), dict))
        .filter((post): post is PostWithSlug => post !== null);
    }
  }
}

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