/**
 * @file actions.ts
 * @description Orquestador soberano de datos para el Hub Editorial (The Concierge Journal).
 *              Implementa un Adaptador Polimórfico para unificar Mocks y Payload CMS 3.0,
 *              compilación JIT de Lexical a Markdown y protocolos de resiliencia para el build.
 * @version 15.0 - Zero Any Compliance
 * @author Raz Podestá - MetaShark Tech
 */

import { getPayload, type Payload } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { type PostWithSlug, postWithSlugSchema } from '../schemas/blog.schema';
import { type Locale, i18n } from '../../config/i18n.config';
import { MOCK_POSTS } from '../../data/mocks/cms.mocks';

/**
 * DETERMINANTES DE INFRAESTRUCTRURA
 * @description Evalúan el entorno para decidir entre datos reales o modo de resiliencia.
 */
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DB_READY = Boolean(process.env.DATABASE_URL);

/**
 * CONTRATOS TÉCNICOS SOBERANOS (Internal Schema)
 */
interface LexicalNode {
  type: string;
  text?: string;
  tag?: string;
  listType?: 'number' | 'bullet';
  children?: LexicalNode[];
}

interface LexicalRoot {
  root?: {
    children?: LexicalNode[];
  };
}

/**
 * Interfaz que define la forma cruda esperada desde Payload CMS.
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
 * CACHÉ DE INSTANCIA SOBERANA
 * @pilar X: Performance - Singleton para evitar múltiples handshakes con la DB.
 */
let cachedPayload: Payload | null = null;

/**
 * @description Recupera o inicializa la instancia de Payload CMS.
 * @returns {Promise<Payload>} Instancia orquestada del CMS.
 */
async function getSovereignPayload(): Promise<Payload> {
  if (cachedPayload) return cachedPayload;
  const config = await configPromise;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

/**
 * COMPILADOR JIT: Lexical AST a Markdown
 * @description Transforma la estructura compleja de Lexical en texto plano Markdown.
 * @pilar VIII: Resiliencia - Maneja recursividad y tipos de bloque editoriales.
 * @param {unknown} contentNode - Nodo raíz del editor Lexical.
 * @returns {string} Contenido listo para MDXRemote.
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
      case 'quote': return `> ${childrenText}\n\n`;
      case 'list': {
        const bullet = node.listType === 'number' ? '1.' : '-';
        return node.children.map((li: LexicalNode) => `${bullet} ${extract(li)}`).join('\n') + '\n\n';
      }
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
 * @description Normaliza la entrada de datos (Mocks o CMS) al contrato inmutable de Zod.
 * @pilar III: Seguridad de Tipos Absoluta - Erradicación de 'any'.
 * @param {unknown} entry - Datos crudos de cualquier origen.
 * @returns {PostWithSlug} Entidad validada y saneada.
 */
function mapToSovereignPost(entry: unknown): PostWithSlug {
  // @guard: Verificamos si el objeto ya es una entidad procesada (Mocks)
  if (entry && typeof entry === 'object' && 'metadata' in entry && 'slug' in entry) {
    return postWithSlugSchema.parse(entry);
  }

  // @logic: Mapeo de datos crudos desde Payload CMS (Cast controlado)
  const raw = entry as RawPayloadPost;

  let authorName = 'Concierge Team';
  if (raw.author && typeof raw.author === 'object') {
    authorName = raw.author.username || raw.author.email?.split('@')[0] || 'Concierge Team';
  }

  const sanitizedTags = Array.isArray(raw.tags) 
    ? raw.tags.map((t) => {
        if (typeof t === 'string') return t;
        return t?.tag || '';
      }).filter(Boolean) 
    : [];

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
 * ACCIÓN: getAllPosts
 * @description Recupera la colección completa de artículos con protocolo de rescate.
 * @param {Locale} lang - Idioma para la resolución de contenido (SSoT).
 * @returns {Promise<PostWithSlug[]>}
 */
export async function getAllPosts(lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  console.group(`[HEIMDALL][FETCH] Editorial Sync: ${lang}`);
  
  // Protocolo de Resiliencia en Build: Bypass si la DB no está lista
  if (IS_BUILD_ENV && !DB_READY) {
    console.warn('[SECURITY] Database bypass active. Using Sovereign Mocks.');
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
    console.error('[CRITICAL] Fallo en la comunicación con el CMS.', error);
    console.groupEnd();
    return MOCK_POSTS.map(mapToSovereignPost);
  }
}

/**
 * ACCIÓN: getPostBySlug
 * @description Localiza un activo editorial único mediante su identificador semántico.
 * @param {string} slug - Identificador de la URL.
 * @param {Locale} lang - Idioma de la solicitud.
 */
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
    
    // Búsqueda en Mocks como última línea de defensa (Resiliencia Pilar VIII)
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  } catch {
    const mockMatch = MOCK_POSTS.find(p => p.slug === slug);
    return mockMatch ? mapToSovereignPost(mockMatch) : null;
  }
}

/**
 * ACCIÓN: getPostsByTag
 * @description Filtra la base editorial por taxonomía específica.
 * @param {string} tagSlug - Etiqueta de búsqueda.
 * @param {Locale} lang - Idioma de la solicitud.
 */
export async function getPostsByTag(tagSlug: string, lang: Locale = i18n.defaultLocale): Promise<PostWithSlug[]> {
  try {
    const payload = await getSovereignPayload();
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { 
        'tags.tag': { equals: tagSlug }, 
        status: { equals: 'published' } 
      },
      locale: lang,
    });
    return docs.map(mapToSovereignPost);
  } catch {
    return [];
  }
}