/**
 * @file packages/cms/core/src/collections/BlogPosts.ts
 * @description Colección Soberana del Motor Editorial (Concierge Journal).
 *              Orquesta la narrativa del santuario con inteligencia de metadatos,
 *              aislamiento Multi-Tenant de Grado S0 y telemetría Heimdall v2.0.
 *              Atomizado para maximizar la performance de build y legibilidad.
 * @version 7.0 - Forensic Editorial Engine (Heimdall Injected)
 * @author Raz Podestá - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook 
} from 'payload';
import { 
  lexicalEditor, 
  HTMLConverterFeature, 
  FixedToolbarFeature, 
  HeadingFeature, 
  LinkFeature 
} from '@payloadcms/richtext-lexical';

/** IMPORTACIONES DE PERÍMETRO SOBERANO */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const collectionStart = performance.now();
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: BLOG POSTS (Editorial Hub)...${C.reset}`);

// ============================================================================
// ATOMIZACIÓN DE INTELIGENCIA EDITORIAL (Pure Functions)
// ============================================================================

/**
 * @function generateSemanticSlug
 * @description Transmuta un título en una ruta SEO-Friendly inmutable.
 */
const generateSemanticSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * @function calculateReadingTime
 * @description Estima el tiempo de lectura basándose en la densidad del Lexical AST.
 */
const calculateReadingTime = (content: unknown): number => {
  if (!content || typeof content !== 'object') return 1;
  try {
    const contentString = JSON.stringify(content);
    const wordCount = contentString.split(/\s+/g).length;
    return Math.max(1, Math.ceil(wordCount / 225)); // Standard: 225 wpm
  } catch {
    return 1;
  }
};

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (DNA Hooks)
// ============================================================================

/**
 * HOOK: beforeChange
 * @description Orquesta la normalización de taxonomía, slugificación y propiedad.
 */
const beforeChangeHook: CollectionBeforeChangeHook = async ({ req, data, operation }) => {
  const start = performance.now();
  const traceId = `blog_sync_${Date.now().toString(36)}`;
  
  console.log(`${C.blue}    [HEIMDALL][EDITORIAL][START] Processing Story | ID: ${traceId}${C.reset}`);

  // 1. Handshake de Propiedad (Multi-Tenant Shield)
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
      ? req.user.tenant.id 
      : req.user.tenant;
    
    // Auto-atribución de autoría
    if (!data.author) data.author = req.user.id;
    console.log(`       [INFO] Story anchored to Tenant and User Identity.`);
  }

  // 2. Inteligencia de Rumbos (Slug Generation)
  if (data.title && !data.slug) {
    data.slug = generateSemanticSlug(data.title);
  }

  // 3. Normalización de Taxonomía (MACS Standard)
  if (data.tags && Array.isArray(data.tags)) {
    data.tags = data.tags.map((item: { tag: string }) => ({
      tag: item.tag.toLowerCase().trim().replace(/\s+/g, '-')
    }));
  }

  // 4. Métrica de Densidad Editorial
  data.readingTime = calculateReadingTime(data.content);

  const duration = performance.now() - start;
  console.log(`${C.green}    [HEIMDALL][EDITORIAL][END] Narrative Prepared | Time: ${duration.toFixed(4)}ms${C.reset}`);
  
  return data;
};

/**
 * HOOK: afterChange
 * @description Reporta la sincronización exitosa al Ledger de infraestructura.
 */
const afterChangeHook: CollectionAfterChangeHook = async ({ doc }) => {
  console.log(`   ${C.cyan}→ [JOURNAL_SYNC]${C.reset} Post "${doc.title}" synchronized | Status: ${doc.status} | Trace: ${Date.now()}`);
};

// ============================================================================
// APARATO PRINCIPAL: BlogPosts
// ============================================================================

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  defaultSort: '-publishedDate',
  admin: {
    useAsTitle: 'title',
    group: 'Editorial Sanctuary',
    defaultColumns: ['title', 'author', 'status', 'publishedDate', 'tenant'],
    description: 'Gestão da narrativa e inteligência editorial do Santuário.',
  },
  
  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar VIII: Resiliencia y Aislamiento Perimetral.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [afterChangeHook],
  },

  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { 
        position: 'sidebar', 
        readOnly: true,
        description: 'Propriedade detentora desta narrativa editorial.'
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Narrativa & Conteúdo',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'title', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '70%', placeholder: 'Título de impacto cinematográfico' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  required: true, 
                  index: true, 
                  admin: { width: '30%', description: 'Ruta semântica para SEO (ex: segredos-da-ilha).' } 
                },
              ]
            },
            { 
              name: 'content', 
              type: 'richText', 
              required: true,
              editor: lexicalEditor({
                features: () => [
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  LinkFeature({}),
                  HTMLConverterFeature({}),
                ],
              }), 
              admin: { description: 'Corpo da matéria com suporte a MDX-like rendering.' }
            },
            { 
              name: 'description', 
              type: 'textarea', 
              required: true,
              admin: { description: 'Extrato para Meta-Description. Crítico para SEO E-E-A-T.' }
            },
          ],
        },
        {
          label: 'Atribuição & Performance',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'author', 
                  type: 'relationship', 
                  relationTo: 'users', 
                  required: true,
                  index: true,
                  admin: { width: '50%' }
                },
                { 
                  name: 'publishedDate', 
                  type: 'date', 
                  index: true, 
                  required: true,
                  admin: { 
                    width: '50%',
                    date: {
                      pickerAppearance: 'dayAndTime',
                      displayFormat: 'dd/MM/yyyy HH:mm'
                    }
                  }
                },
              ]
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'status', 
                  type: 'select', 
                  required: true,
                  defaultValue: 'draft',
                  options: [
                    { label: 'Rascunho (Privado)', value: 'draft' },
                    { label: 'Publicado (Live)', value: 'published' }
                  ], 
                  admin: { width: '50%' }
                },
                { 
                  name: 'vibe', 
                  type: 'select', 
                  required: true,
                  defaultValue: 'day',
                  options: [
                    { label: 'Atmosfera: Dia (Light)', value: 'day' },
                    { label: 'Atmosfera: Noite (Sanctuary)', value: 'night' }
                  ], 
                  admin: { width: '50%', description: 'Define o tema visual do artigo no frontend.' }
                },
              ]
            },
            { 
              name: 'readingTime', 
              type: 'number', 
              admin: { 
                position: 'sidebar', 
                readOnly: true,
                description: 'Tempo estimado calculado automaticamente (wpm: 225).' 
              } 
            },
            { 
              name: 'tags', 
              type: 'array', 
              labels: { singular: 'Tag', plural: 'Taxonomia Editorial' },
              fields: [{ name: 'tag', type: 'text', required: true }],
              admin: { description: 'Palavras-chave para o motor de busca perimetral.' }
            }
          ],
        },
        {
          label: 'SEO & Social Assets',
          fields: [
            { 
              name: 'metaTitle', 
              type: 'text', 
              admin: { description: 'Título alternativo para o cabeçalho do navegador.' } 
            },
            { 
              name: 'ogImage', 
              type: 'upload', 
              relationTo: 'media', 
              required: true,
              admin: { description: 'Ativo visual de alta fidelidade para compartilhamento social.' }
            },
          ],
        }
      ]
    }
  ],
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Editorial Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);