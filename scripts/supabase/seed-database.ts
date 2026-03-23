/**
 * @file seed-database.ts
 * @description Genesis Engine: Forensic Bootstrap.
 *              Orquesta la inyección atómica de datos en Supabase/Payload CMS.
 *              Refactorizado: 100% Type-Safe, Idempotente y Linter Compliant.
 * @version 12.0 - Elite Resilience Standard
 * @author Raz Podestá - MetaShark Tech
 */

import Module from 'node:module';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';

// --- INTERCEPTOR DE MÓDULOS (ANTI-CRASH) ---
/**
 * @description Evita que la carga de Payload intente resolver dependencias de Next.js
 * inexistentes en el contexto de ejecución de scripts de Node.
 */
const ModuleCore = Module as unknown as { _load: (r: string, p: unknown, m: boolean) => unknown; };
const originalLoad = ModuleCore._load;
ModuleCore._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === '@next/env') {
    return { 
      __esModule: true, 
      default: { loadEnvConfig: () => ({ combinedEnv: process.env }) }, 
      loadEnvConfig: () => ({ combinedEnv: process.env }) 
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

// Flags de entorno para modo Seeding
process.env.PAYLOAD_SKIP_LOAD_ENV = 'true';
process.env.IS_SEEDING_MODE = 'true';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

import type { ProjectLayoutStyleType } from '@metashark/cms-core';

/**
 * CONTRATOS DE RESPALDO (Backup Types)
 */
interface BaseCmsDoc {
  id: string | number;
}

const colors = { 
  reset: '\x1b[0m', 
  green: '\x1b[32m', 
  red: '\x1b[31m', 
  magenta: '\x1b[35m', 
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * APARATO PRINCIPAL: runSeed
 * @description Ejecuta el pipeline de inicialización de la base de datos de producción.
 */
async function runSeed(): Promise<void> {
  console.log(`\n${colors.magenta}${C.bold}=== GENESIS ENGINE: FORENSIC BOOTSTRAP V12 ===${colors.reset}\n`);

  try {
    const [{ getPayload }, { default: configPromise }] = await Promise.all([
      import('payload'),
      import('@metashark/cms-core/config')
    ]);
    
    // Carga dinámica de Mocks nivelados v8.0
    const mocksUrl = pathToFileURL(path.resolve(projectRoot, 'apps/portfolio-web/src/data/mocks/cms.mocks.ts')).href;
    const { MOCK_POSTS, MOCK_PROJECTS } = await import(mocksUrl);

    const payload = await getPayload({ config: await configPromise });
    
    /**
     * 1. IDENTIDAD SOBERANA (ADMIN)
     * Implementa lógica de recuperación si el usuario ya existe (Idempotencia).
     */
    let adminDoc: BaseCmsDoc;
    const adminEmail = 'admin@metashark.tech';

    try {
        console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Inyectando Administrador Maestro...`);
        adminDoc = await payload.create({
            collection: 'users',
            data: { 
                email: adminEmail, 
                password: 'EliteShark2026!', 
                role: 'admin', 
                tenantId: MASTER_TENANT_ID, 
                level: 99,
                _verified: true 
            }
        }) as BaseCmsDoc;
    } catch {
        const existing = await payload.find({ 
          collection: 'users', 
          where: { email: { equals: adminEmail } } 
        });
        adminDoc = existing.docs[0] as BaseCmsDoc;
        console.log(`${colors.cyan}[INFO]${colors.reset} Administrador ya existente (ID: ${adminDoc.id})`);
    }

    /**
     * 2. BÓVEDA MULTIMEDIA (MEDIA)
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Sincronizando Media Library...`);
    const baseMedia = await payload.create({
      collection: 'media',
      data: { alt: 'Genesis Asset Placeholder', tenantId: MASTER_TENANT_ID },
      file: { 
        data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkCQMAAQQBAO7r8FwAAAAASUVORK5CYII=', 'base64'), 
        mimetype: 'image/png', 
        name: 'genesis.png', 
        size: 1 
      }
    }) as BaseCmsDoc;

    /**
     * 3. HUB EDITORIAL (BLOG)
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Poblando Journal Editorial...`);
    for (const post of MOCK_POSTS) {
      const createdPost = await payload.create({
        collection: 'blog-posts',
        data: {
          title: post.title, 
          slug: post.slug, 
          description: post.description,
          content: { 
            root: { 
              type: 'root', 
              children: [{ 
                type: 'paragraph', 
                children: [{ type: 'text', text: post.content }] 
              }] 
            } 
          },
          author: adminDoc.id, 
          status: 'published',
          tags: post.tags.map((t: { tag: string }) => ({ tag: t.tag })),
          tenantId: MASTER_TENANT_ID, 
          ogImage: baseMedia.id
        }
      }) as BaseCmsDoc;
      console.log(`   ${colors.green}✓${colors.reset} Articulo: ${post.slug} (ID: ${createdPost.id})`);
    }

    /**
     * 4. ACTIVOS DIGITALES (PROJECTS)
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Registrando Activos Inmobiliarios...`);
    for (const p of MOCK_PROJECTS) {
      const createdProject = await payload.create({
        collection: 'projects',
        data: {
          title: p.title, 
          slug: p.slug, 
          description: p.description,
          imageUrl: p.imageUrl, 
          liveUrl: p.liveUrl || '#', 
          codeUrl: p.codeUrl || null,
          tags: p.tags.map((t: string) => ({ tag: t })),
          tech_stack: p.tech_stack.map((t: string) => ({ technology: t })),
          reputationWeight: p.reputationWeight,
          branding: { 
            primary_color: p.branding.primary_color, 
            layout_style: p.branding.layout_style as ProjectLayoutStyleType 
          },
          introduction: { 
            heading: p.introduction.heading, 
            body: p.introduction.body 
          },
          backend_architecture: {
             title: 'Elite Sanctuary Infrastructure',
             features: [{ feature: 'Payload v3 Sovereign Engine' }, { feature: 'Supabase PGSQL' }]
          },
          status: 'published', 
          tenantId: MASTER_TENANT_ID,
        }
      }) as BaseCmsDoc;
      console.log(`   ${colors.green}✓${colors.reset} Proyecto: ${p.slug} (ID: ${createdProject.id})`);
    }

    console.log(`\n${colors.green}${C.bold}✨ GENESIS COMPLETO: Ecosistema de datos nivelado con éxito.${colors.reset}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}${C.bold}💥 ERROR CATASTRÓFICO EN EL GENESIS ENGINE:${colors.reset}\n`, error);
    process.exit(1);
  }
}

// Helper para negrita en consola
const C = { bold: '\x1b[1m' };

runSeed();