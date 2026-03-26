/**
 * @file scripts/supabase/seed-database.ts
 * @description Genesis Engine: Forensic Bootstrap.
 *              Nivelado: Resolución de violación NOT NULL mediante generación 
 *              de UUIDs deterministas y aleatorios para todas las colecciones.
 * @version 16.0 - Full Identity Sovereignty (randomUUID)
 * @author Raz Podestá - MetaShark Tech
 */

import Module from 'node:module';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto'; // <-- Motor de identidad local

// --- INTERCEPTOR DE MÓDULOS (ANTI-CRASH) ---
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

// Configuración de Entorno
process.env.PAYLOAD_SKIP_LOAD_ENV = 'true';
process.env.IS_SEEDING_MODE = 'true';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

import type { ProjectLayoutStyleType } from '@metashark/cms-core';

interface BaseCmsDoc {
  id: string | number;
}

const colors = { 
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', 
  magenta: '\x1b[35m', blue: '\x1b[34m', cyan: '\x1b[36m', gray: '\x1b[90m'
};

const C = { bold: '\x1b[1m' };
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const MASTER_ADMIN_ID = 'b174d3a8-e1ed-4054-8b63-55cce8749c11';
const MASTER_MEDIA_ID = 'c123d456-e789-4054-8b63-99fce8749c22';

async function runSeed(): Promise<void> {
  console.log(`\n${colors.magenta}${C.bold}=== GENESIS ENGINE: DETERMINISTIC UUID BOOTSTRAP V16 ===${colors.reset}\n`);

  try {
    const [{ getPayload }, { default: configPromise }] = await Promise.all([
      import('payload'),
      import('@metashark/cms-core/config')
    ]);
    
    const mocksPath = path.resolve(projectRoot, 'apps/portfolio-web/src/data/mocks/cms.mocks.ts');
    const { MOCK_POSTS, MOCK_PROJECTS } = await import(pathToFileURL(mocksPath).href);

    const payload = await getPayload({ config: await configPromise });
    
    /**
     * 1. IDENTIDAD SOBERANA (ADMIN)
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Sincronizando Administrador Maestro...`);
    const adminEmail = 'admin@metashark.tech';
    
    await payload.delete({
      collection: 'users',
      where: { email: { equals: adminEmail } }
    });

    const adminDoc = await payload.create({
      collection: 'users',
      data: { 
        id: MASTER_ADMIN_ID,
        email: adminEmail, 
        password: 'EliteShark2026!', 
        role: 'admin', 
        tenantId: MASTER_TENANT_ID, 
        level: 99,
        _verified: true 
      }
    }) as BaseCmsDoc;
    console.log(`   ${colors.green}✓ Identidad inyectada (ID: ${adminDoc.id})${colors.reset}`);

    /**
     * 2. TENANT INICIAL
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Sincronizando Propiedad Principal...`);
    await payload.delete({ collection: 'tenants', where: { slug: { equals: 'beach-hotel' } } });
    
    const tenantDoc = await payload.create({
      collection: 'tenants',
      data: {
        id: MASTER_TENANT_ID,
        name: 'Beach Hotel Canasvieiras',
        slug: 'beach-hotel'
      }
    });
    console.log(`   ${colors.green}✓ Tenant registrado (ID: ${tenantDoc.id})${colors.reset}`);

    /**
     * 3. BÓVEDA MULTIMEDIA
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Sincronizando Media Library...`);
    await payload.delete({ collection: 'media', where: { id: { equals: MASTER_MEDIA_ID } } });
    
    const baseMedia = await payload.create({
      collection: 'media',
      data: { 
        id: MASTER_MEDIA_ID,
        alt: 'Genesis Asset Placeholder', 
        tenantId: MASTER_TENANT_ID 
      },
      file: { 
        data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkCQMAAQQBAO7r8FwAAAAASUVORK5CYII=', 'base64'), 
        mimetype: 'image/png', name: 'genesis-1.png', size: 1 
      }
    }) as BaseCmsDoc;
    console.log(`   ${colors.green}✓ Media Placeholder activo (ID: ${baseMedia.id})${colors.reset}`);

    /**
     * 4. HUB EDITORIAL (Journal)
     * @fix Resolución de NOT NULL constraint mediante inyección de randomUUID
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Poblando Journal Editorial...`);
    for (const post of MOCK_POSTS) {
      const isoDate = new Date(post.publishedDate).toISOString();

      const createdPost = await payload.create({
        collection: 'blog-posts',
        data: {
          id: randomUUID(), // <-- GARANTÍA DE IDENTIDAD TEXTUAL
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
          tags: post.tags.map((t: string) => ({ tag: t })),
          tenantId: MASTER_TENANT_ID, 
          publishedDate: isoDate,
          ogImage: baseMedia.id
        }
      }) as BaseCmsDoc;
      console.log(`   ${colors.green}✓${colors.reset} Articulo: ${colors.gray}${post.slug}${colors.reset} (DB_ID: ${createdPost.id})`);
    }

    /**
     * 5. ACTIVOS DIGITALES (Projects)
     * @fix Resolución de NOT NULL constraint mediante inyección de randomUUID
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Registrando Activos de Ingeniería...`);
    for (const p of MOCK_PROJECTS) {
      const createdProject = await payload.create({
        collection: 'projects',
        data: {
          id: randomUUID(), // <-- GARANTÍA DE IDENTIDAD TEXTUAL
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
            title: 'Sovereign Engine Architecture', 
            features: [{ feature: 'Payload v3' }, { feature: 'Supabase' }] 
          },
          status: 'published', 
          tenantId: MASTER_TENANT_ID,
        }
      }) as BaseCmsDoc;
      console.log(`   ${colors.green}✓${colors.reset} Proyecto: ${colors.gray}${p.slug}${colors.reset} (DB_ID: ${createdProject.id})`);
    }

    console.log(`\n${colors.green}${C.bold}✨ GENESIS COMPLETO: Datos maestros inyectados con IDs soberanos.${colors.reset}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}${C.bold}💥 ERROR CATASTRÓFICO EN EL GENESIS ENGINE:${colors.reset}\n`, error);
    process.exit(1);
  }
}

runSeed();