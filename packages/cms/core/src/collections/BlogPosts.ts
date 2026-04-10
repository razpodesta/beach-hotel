/**
 * @file packages/cms/core/src/collections/BlogPosts.ts
 * @description Colección Soberana del Motor Editorial (Concierge Journal).
 *              Orquesta la narrativa del santuario con inteligencia de metadatos,
 *              aislamiento Multi-Tenant y blindaje SEO inmutable.
 *              Refactorizado: Resolución ESM (.js), normalización de taxonomía,
 *              protección de permalinks y telemetría Heimdall v2.5.
 * @version 8.0 - SEO Shield & ESM Resolution Hardened
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

/** 
 * IMPORTACIONES DE PERÍMETRO SOBERANO
 * @pilar V: Adherencia Arquitectónica. Extensiones .js para rigor ESM.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: BLOG POSTS (Editorial Core)...${C.reset}`);
}

// ============================================================================
// INTELIGENCIA EDITORIAL ESTÁTICA (Pilar X - Performance)
// ============================================================================

/**
 * @function generateSemanticSlug
 * @description Transmuta títulos en identificadores SEO-Friendly inmutables.
 */
const generateSemanticSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve acentos
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * @function calculateReadingTime
 * @description Motor de estimación cronológica basado en densidad de AST.
 */
const calculateReadingTime = (content: unknown): number => {
  if (!content || typeof content !== 'object') return 1;
  try {
    const wordCount = JSON.stringify(content).split(/\s+/g).length;
    return Math.max(1, Math.ceil(wordCount / 225)); // Standard reading pace
  } catch {
    return 1;
  }
};

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (Editorial DNA Hooks)
// ============================================================================

const beforeChangeEditorial: CollectionBeforeChangeHook = async ({ req, data, operation, originalDoc }) => {
  const start = performance.now();
  const traceId = `edit_sync_${Date.now().toString(36).toUpperCase()}`;

  // 1. Handshake de Propiedad (Multi-Tenant Shield)
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
    
    // Auto-atribución de Autoría (Smart Mapping)
    if (!data.author) data.author = req.user.id;
  }

  // 2. Sello de Identidad SEO (Slug Guard)
  if (data.title && !data.slug) {
    data.slug = generateSemanticSlug(data.title);
  }

  // Protección de Permalink: No cambiar slug si el post ya está publicado
  if (operation === 'update' && originalDoc?.status === 'published' && data.slug !== originalDoc.slug) {
    console.warn(`${C.red}   [SEO_ALERT] Permanent link mutation blocked for: ${originalDoc.slug}${C.reset}`);
    data.slug = originalDoc.slug;
  }

  // 3. Normalización de Taxonomía
  if (data.tags && Array.isArray(data.tags)) {
    data.tags = data.tags.map((item: { tag: string }) => ({
      tag: item.tag.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
    }));
  }

  // 4. Recalibración de Métricas de Lectura
  data.readingTime = calculateReadingTime(data.content);

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][EDITORIAL] Narrative Sealed | Trace: ${traceId} | Lat: ${duration}ms${C.reset}`);
  }
  
  return data;
};

// ============================================================================
// DEFINICIÓN DE LA COLECCIÓN
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
  
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  hooks: {
    beforeChange: [beforeChangeEditorial],
    afterChange: [
      (async ({ doc, operation: _op }) => {
        if (process.env.NODE_ENV !== 'test') {
          console.log(`   ${C.cyan}→ [JOURNAL_SYNC]${C.reset} "${doc.title}" synchronized | Vibe: ${doc.vibe}`);
        }
      }) as CollectionAfterChangeHook,
    ],
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
        description: 'Propriedade detentora desta narrativa.'
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Conteúdo & Narrativa',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'title', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '70%', placeholder: 'Título de impacto' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  index: true, 
                  required: true, 
                  admin: { width: '30%', description: 'Permalink inalterável após publicação.' } 
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
            },
            { 
              name: 'description', 
              type: 'textarea', 
              required: true,
              admin: { description: 'Resumo crítico para meta-tags SEO.' }
            },
          ],
        },
        {
          label: 'Atribuição & Atmosfera',
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
                    date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' }
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
                    { label: 'Draft', value: 'draft' },
                    { label: 'Published', value: 'published' }
                  ], 
                  admin: { width: '50%' }
                },
                { 
                  name: 'vibe', 
                  type: 'select', 
                  required: true, 
                  defaultValue: 'day',
                  options: [
                    { label: 'Day (Luz)', value: 'day' },
                    { label: 'Night (Sanctuary)', value: 'night' }
                  ], 
                  admin: { width: '50%', description: 'Define o tema visual no Portal.' }
                },
              ]
            },
            { 
              name: 'tags', 
              type: 'array', 
              labels: { singular: 'Tag', plural: 'Tags' },
              fields: [{ name: 'tag', type: 'text', required: true }],
              admin: { description: 'Taxonomia indexada por busca semântica.' }
            }
          ],
        },
        {
          label: 'Metadata & Social',
          fields: [
            { 
              name: 'ogImage', 
              type: 'upload', 
              relationTo: 'media', 
              required: true,
              admin: { description: 'Asset visual de alta fidelidade para LCP.' }
            },
            { 
              name: 'readingTime', 
              type: 'number', 
              admin: { 
                position: 'sidebar', 
                readOnly: true,
                description: 'Cálculo de densidade (wpm: 225).' 
              } 
            },
          ],
        }
      ]
    }
  ],
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Editorial Core calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}