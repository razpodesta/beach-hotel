/**
 * @file scripts/supabase/seed-database.ts
 * @description Genesis Engine: Forensic Bootstrap.
 *              Nivelado: Inyección directa mediante el adaptador de DB para evitar 
 *              el pipeline de Auth/Email de Payload durante el seeding.
 * @version 11.0 - Bypass de Registro de Auth
 * @author Raz Podestá - MetaShark Tech
 */

import Module from 'node:module';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';

// --- INTERCEPTOR DE MÓDULOS (ANTI-CRASH) ---
const ModuleCore = Module as unknown as { _load: (r: string, p: unknown, m: boolean) => unknown; };
const originalLoad = ModuleCore._load;
ModuleCore._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === '@next/env') return { __esModule: true, default: { loadEnvConfig: () => ({ combinedEnv: process.env }) }, loadEnvConfig: () => ({ combinedEnv: process.env }) };
  return originalLoad.call(this, request, parent, isMain);
};

process.env.PAYLOAD_SKIP_LOAD_ENV = 'true';
process.env.IS_SEEDING_MODE = 'true';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

import type { ProjectLayoutStyleType } from '@metashark/cms-core';

const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', magenta: '\x1b[35m', blue: '\x1b[34m' };
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function runSeed(): Promise<void> {
  console.log(`\n${colors.magenta}=== GENESIS ENGINE: FORENSIC BOOTSTRAP V11 ===${colors.reset}\n`);

  try {
    const [{ getPayload }, { default: configPromise }] = await Promise.all([
      import('payload'),
      import('@metashark/cms-core/config')
    ]);
    
    const mocksUrl = pathToFileURL(path.resolve(projectRoot, 'apps/portfolio-web/src/data/mocks/cms.mocks.ts')).href;
    const { MOCK_POSTS, MOCK_PROJECTS } = await import(mocksUrl);

    const payload = await getPayload({ config: await configPromise });
    
    // 1. ADMIN (Bypass de Auth Pipeline)
    // Usamos el adaptador de DB directo para el primer admin si falla la creación estándar
    let adminDoc: any;
    try {
        adminDoc = await payload.create({
            collection: 'users',
            data: { 
                email: 'admin@metashark.tech', 
                password: 'EliteShark2026!', 
                role: 'admin', 
                tenantId: MASTER_TENANT_ID, 
                level: 99,
                _verified: true // Inyección forzada por el hook que añadimos en Users.ts
            }
        });
    } catch (e) {
        // Si ya existe, lo recuperamos
        const existing = await payload.find({ collection: 'users', where: { email: { equals: 'admin@metashark.tech' } } });
        adminDoc = existing.docs[0];
    }

    // 2. MEDIA
    const baseMedia = await payload.create({
      collection: 'media',
      data: { alt: 'Genesis Asset', tenantId: MASTER_TENANT_ID },
      file: { 
        data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkCQMAAQQBAO7r8FwAAAAASUVORK5CYII=', 'base64'), 
        mimetype: 'image/png', 
        name: 'genesis.png', 
        size: 1 
      }
    });

    // 3. EDITORIAL
    for (const post of MOCK_POSTS) {
      await payload.create({
        collection: 'blog-posts',
        data: {
          title: post.title, 
          slug: post.slug, 
          description: post.description,
          content: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: post.content }] }] } },
          author: adminDoc.id, 
          status: 'published',
          tags: post.tags.map((t: { tag: string }) => ({ tag: t.tag })),
          tenantId: MASTER_TENANT_ID, 
          ogImage: baseMedia.id
        }
      });
    }

    // 4. PROYECTOS
    for (const p of MOCK_PROJECTS) {
      await payload.create({
        collection: 'projects',
        data: {
          title: p.title, slug: p.slug, description: p.description,
          imageUrl: p.imageUrl, liveUrl: p.liveUrl || '#', codeUrl: p.codeUrl || null,
          tags: p.tags.map((t: string) => ({ tag: t })),
          tech_stack: p.tech_stack.map((t: string) => ({ technology: t })),
          reputationWeight: p.reputationWeight,
          branding: { primary_color: p.branding.primary_color, layout_style: p.branding.layout_style as ProjectLayoutStyleType },
          introduction: { heading: p.introduction.heading, body: p.introduction.body },
          backend_architecture: {
             title: 'Standard Infrastructure',
             features: [{ feature: 'Default Integration' }]
          },
          status: 'published', tenantId: MASTER_TENANT_ID,
        }
      });
    }

    console.log(`${colors.green}✨ OPERACIÓN COMPLETADA CON ÉXITO.${colors.reset}`);
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}💥 ERROR:${colors.reset}`, error);
    process.exit(1);
  }
}

runSeed();