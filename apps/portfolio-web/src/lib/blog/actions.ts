/**
 * @file apps/portfolio-web/src/lib/blog/actions.ts
 * @description Orquestador soberano de datos editoriales y Reactor de Reputación.
 *              Refactorizado: Resolución de TS2322 mediante mapeo dinámico de parámetros.
 *              Optimizado: Purificación de tipos en el pipeline de Lexical y Mocks.
 *              Estándar: Multi-Tenant Shield & Forensic Reputation Sync.
 * @version 43.5 - TS2322 Fixed & Type Narrowing Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import { getPayload } from 'payload';
import type { Payload, Where, CollectionSlug } from 'payload';
import { unstable_noStore as noStore } from 'next/cache';

/** IMPORTACIONES DE INFRAESTRUCTRURA (SSoT) */
import { postWithSlugSchema } from '../schemas/blog.schema';
import type { PostWithSlug } from '../schemas/blog.schema';
import { i18n } from '../../config/i18n.config';
import type { Locale } from '../../config/i18n.config';
import { getDictionary } from '../get-dictionary';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks';
import type { Dictionary } from '../schemas/dictionary.schema';
import { calculateProgress } from '@metashark/protocol-33';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * GUARDIANES DE INFRAESTRUCTRURA
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
 * @description Contrato de entrada desde el clúster de datos.
 */
interface RawPayloadPost {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: LexicalRoot | string | null;
  publishedDate?: string | null;
  author?: string | { name?: string; email?: string; id?: string } | null;
  tags?: Array<{ tag: string }> | string[] | null;
  ogImage?: string | { url: string; id?: string } | null;
  vibe?: 'day' | 'night' | null;
}

let cachedPayload: Payload | null = null;

// ============================================================================
// 1. MOTOR DE COMPILACIÓN: LexicalCompiler (AST to MDX)
// ============================================================================
class LexicalCompiler {
  /**
   * @description Transmuta el árbol sintáctico de Lexical en Markdown compatible con MDX.
   */
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
      const rootNode = contentNode as LexicalRoot;
      return processNodes(rootNode.root?.children);
    } catch {
      return '';
    }
  }
}

// ============================================================================
// 2. ALQUIMIA DE DATOS: EditorialShaper (SSoT Normalizer)
// ============================================================================
class EditorialShaper {
  /**
   * @description Modela la entidad cruda hacia el contrato de la UI.
   */
  public static shape(entry: unknown, dict: Dictionary): PostWithSlug | null {
    const raw = entry as RawPayloadPost;
    const t = dict.blog_page;

    // A. Resolución de Autoría (Pilar III)
    let authorName = t.hero_title;
    if (raw.author && typeof raw.author === 'object') {
      authorName = raw.author.name || raw.author.email?.split('@')[0] || authorName;
    }

    // B. Normalización de Taxonomía
    const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
    const tags = rawTags.map(tag => {
      if (typeof tag === 'string') return tag.toLowerCase();
      return tag && typeof tag === 'object' && 'tag' in tag ? (tag as { tag: string }).tag.toLowerCase() : '';
    }).filter(Boolean);

    const mdx = LexicalCompiler.compile(raw.content);
    const readingTime = Math.max(1, Math.ceil(mdx.split(/\s+/).length / 225));
    
    // C. Verificación de Contrato
    const result = postWithSlugSchema.safeParse({
      slug: raw.slug || `post-${Date.now()}`,
      metadata: {
        title: raw.title || 'Untitled',
        description: raw.description || '',
        author: authorName,
        published_date: raw.publishedDate || new Date().toISOString(),
        tags: tags.length > 0 ? tags : ['sanctuary'],
        vibe: raw.vibe || 'day',
        ogImage: typeof raw.ogImage === 'object' ? raw.ogImage?.url : raw.ogImage,
        readingTime
      },
      content: mdx
    });

    return result.success ? result.data : null;
  }
}

// ============================================================================
// 3. ORQUESTADOR: EditorialDataResolver (Handshake Engine)
// ============================================================================
class EditorialDataResolver {
  private static async getPayload(): Promise<Payload | null> {
    if (IS_TYPE_GEN) return null;
    if (cachedPayload) return cachedPayload;
    
    try {
      const configModule = await import('@metashark/cms-core/config');
      cachedPayload = await getPayload({ config: configModule.default });
      return cachedPayload;
    } catch {
      return null;
    }
  }

  /**
   * @description Recuperación de nodos con soporte multi-tenant y mocks.
   */
  public static async fetch(options: { slug?: string; tag?: string; lang: Locale }): Promise<PostWithSlug[]> {
    const dict = await getDictionary(options.lang);
    const payload = await this.getPayload();
    const { slug, tag } = options;

    // Protocolo de Rescate: Mocks si el clúster está offline o en modo build local sin DB
    if (!payload || !process.env.DATABASE_URL) {
      const mocks = MOCK_POSTS
        .map(m => EditorialShaper.shape({ ...m, ogImage: m.ogImageLocal }, dict))
        .filter((p): p is PostWithSlug => p !== null);
      
      if (slug) return mocks.filter(m => m.slug === slug);
      if (tag) return mocks.filter(m => m.metadata.tags.includes(tag));
      return mocks;
    }

    try {
      const conditions: Where[] = [
        { status: { equals: 'published' } },
        { tenant: { equals: MASTER_TENANT_ID } }
      ];

      if (slug) conditions.push({ slug: { equals: slug } });
      if (tag) conditions.push({ 'tags.tag': { equals: tag } });

      /**
       * @fix: RESOLUCIÓN DE TS2322
       * Extraemos dinámicamente el tipo aceptado por la propiedad 'locale' de Payload 
       * para asegurar que nuestro tipo 'Locale' encaje en el union-type de la librería.
       */
      type PayloadLocale = NonNullable<Parameters<Payload['find']>[0]['locale']>;

      const { docs } = await payload.find({
        collection: 'blog-posts',
        where: { and: conditions },
        sort: '-publishedDate',
        locale: options.lang as PayloadLocale, // Sincronía técnica con Payload Core
        depth: 2
      });

      return docs
        .map(doc => EditorialShaper.shape(doc, dict))
        .filter((p): p is PostWithSlug => p !== null);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown Cluster Drift';
      console.error(`${C.red}[HEIMDALL][EDITORIAL] Fetch failed: ${msg}. Switching to Sanctuary Mocks.${C.reset}`);
      
      const mocks = MOCK_POSTS
        .map(m => EditorialShaper.shape({ ...m, ogImage: m.ogImageLocal }, dict))
        .filter((p): p is PostWithSlug => p !== null);
      
      if (slug) return mocks.filter(m => m.slug === slug);
      if (tag) return mocks.filter(m => m.metadata.tags.includes(tag));
      return mocks;
    }
  }
}

// ============================================================================
// 4. INTERFAZ PÚBLICA (Server Actions)
// ============================================================================

export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  if (!IS_BUILD) noStore();
  return EditorialDataResolver.fetch({ lang });
}

export async function getPostBySlug(slug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug | null> {
  if (!IS_BUILD) noStore();
  const results = await EditorialDataResolver.fetch({ slug, lang });
  return results[0] || null;
}

export async function getPostsByTag(tag: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  if (!IS_BUILD) noStore();
  return EditorialDataResolver.fetch({ tag: tag.toLowerCase(), lang });
}

/**
 * REPUTATION BRIDGE: recordReadingXPAction
 */
export async function recordReadingXPAction(
  userId: string, 
  articleSlug: string,
  tenantId: string
): Promise<{ success: boolean; xpGained: number; traceId: string }> {
  const traceId = `p33_read_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD) return { success: false, xpGained: 0, traceId };

  console.log(`${C.magenta}${C.bold}[DNA][P33]${C.reset} Reading event detected: ${C.cyan}${articleSlug}${C.reset}`);

  try {
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });

    const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 });
    if (!user) throw new Error('IDENTITY_NOT_FOUND');

    const xpBonus = 10; 
    const currentXp = Number(user.experiencePoints || 0);
    const newXp = currentXp + xpBonus;
    const { currentLevel } = calculateProgress(newXp);

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        experiencePoints: newXp,
        level: currentLevel
      }
    });

    await payload.create({
      collection: 'notifications' as CollectionSlug,
      data: {
        subject: 'XP por Leitura Concedido',
        message: `Você ganhou ${xpBonus} RazTokens por ler "${articleSlug}".`,
        priority: 'low',
        category: 'comms',
        source: 'JOURNAL_REACTOR',
        tenant: tenantId,
        recipient: userId,
        isRead: false,
        traceId
      }
    });

    console.log(`${C.green}   ✓ [GRANTED]${C.reset} ${xpBonus} RZB added to ${user.email} | Trace: ${traceId}`);
    return { success: true, xpGained: xpBonus, traceId };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'REPUTATION_DRIFT';
    console.error(`${C.red}   ✕ [BREACH] Reputation injection failed: ${msg}${C.reset}`);
    return { success: false, xpGained: 0, traceId };
  }
}