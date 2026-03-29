/**
 * @file scripts/supabase/seed-database.ts
 * @description Genesis Engine: Sovereign Infrastructure Bootstrap.
 *              Refactorizado: Sincronización con el Clúster de Identidad v7.0,
 *              inyección de RBAC Nivel 0 (Developer) y normalización de 
 *              entorno para despliegue en Vercel/Supabase.
 * @version 17.0 - Identity Cluster Sync & Forensic Determinism
 * @author Raz Podestá - MetaShark Tech
 */

import Module from 'node:module';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

// --- 1. INTERCEPTOR DE INFRAESTRUCTRURA (Anti-Crash Protocol) ---
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

// --- 2. CONFIGURACIÓN DE ENTORNO SOBERANO ---
process.env.PAYLOAD_SKIP_LOAD_ENV = 'true';
process.env.IS_SEEDING_MODE = 'true'; // Bypass de verificación de email
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass para Supabase Pooler

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

// IDs DETERMINISTAS (SSoT de Infraestructura)
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const MASTER_ADMIN_ID = 'b174d3a8-e1ed-4054-8b63-55cce8749c11';
const MASTER_MEDIA_ID = 'c123d456-e789-4054-8b63-99fce8749c22';

/**
 * APARATO PRINCIPAL: Genesis Engine
 * @description Ejecuta la purga nuclear e inyección de cimientos digitales.
 */
async function runSeed(): Promise<void> {
  console.log(`\n${colors.magenta}${C.bold}=== GENESIS ENGINE: DETERMINISTIC BOOTSTRAP V17 ===${colors.reset}`);
  console.log(`${colors.gray}Targeting Clustered Identity RBAC...${colors.reset}\n`);

  try {
    const [{ getPayload }, { default: configPromise }] = await Promise.all([
      import('payload'),
      import('@metashark/cms-core/config')
    ]);
    
    const mocksPath = path.resolve(projectRoot, 'apps/portfolio-web/src/data/mocks/cms.mocks.ts');
    const { MOCK_POSTS, MOCK_PROJECTS } = await import(pathToFileURL(mocksPath).href);

    const payload = await getPayload({ config: await configPromise });
    
    /**
     * FASE 1: PROPIEDAD MAESTRA (Tenant)
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Nivelando Propiedad Principal...`);
    await payload.delete({ collection: 'tenants', where: { id: { equals: MASTER_TENANT_ID } } });
    
    const tenantDoc = await payload.create({
      collection: 'tenants',
      data: {
        id: MASTER_TENANT_ID,
        name: 'Beach Hotel Canasvieiras (HQ)',
        slug: 'beach-hotel-main',
        domain: process.env.NEXT_PUBLIC_BASE_URL || 'localhost'
      }
    });
    console.log(`   ${colors.green}✓ Tenant Alpha Activo (ID: ${tenantDoc.id})${colors.reset}`);

    /**
     * FASE 2: IDENTIDAD RAÍZ (Developer Level 99)
     * @description Inyecta al usuario soberano con privilegios de sistema.
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Sincronizando Root Developer...`);
    const adminEmail = 'admin@metashark.tech';
    
    await payload.delete({ collection: 'users', where: { id: { equals: MASTER_ADMIN_ID } } });

    const adminDoc = await payload.create({
      collection: 'users',
      data: { 
        id: MASTER_ADMIN_ID,
        email: adminEmail, 
        password: 'EliteShark2026!', 
        role: 'developer', // <-- RBAC Nivel 0
        tenantId: MASTER_TENANT_ID, 
        level: 99,
        experiencePoints: 3300,
        _verified: true 
      }
    }) as BaseCmsDoc;
    console.log(`   ${colors.green}✓ Identidad Soberana vinculada (ID: ${adminDoc.id})${colors.reset}`);

    /**
     * FASE 3: BÓVEDA DE ACTIVOS (Media)
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Preparando Media Library...`);
    await payload.delete({ collection: 'media', where: { id: { equals: MASTER_MEDIA_ID } } });
    
    const baseMedia = await payload.create({
      collection: 'media',
      data: { 
        id: MASTER_MEDIA_ID,
        alt: 'Sovereign Digital Asset Placeholder', 
        tenantId: MASTER_TENANT_ID 
      },
      file: { 
        data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkCQMAAQQBAO7r8FwAAAAASUVORK5CYII=', 'base64'), 
        mimetype: 'image/png', name: 'genesis-infra.png', size: 1 
      }
    }) as BaseCmsDoc;
    console.log(`   ${colors.green}✓ Media Vault sincronizado.${colors.reset}`);

    /**
     * FASE 4: JOURNAL EDITORIAL
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Poblando Journal de Concierge...`);
    for (const post of MOCK_POSTS) {
      await payload.delete({ collection: 'blog-posts', where: { slug: { equals: post.slug } } });
      
      const createdPost = await payload.create({
        collection: 'blog-posts',
        data: {
          id: randomUUID(),
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
          author: MASTER_ADMIN_ID, 
          status: 'published',
          tags: post.tags.map((t: string) => ({ tag: t })),
          tenantId: MASTER_TENANT_ID, 
          publishedDate: new Date(post.publishedDate).toISOString(),
          ogImage: MASTER_MEDIA_ID
        }
      }) as BaseCmsDoc;
      console.log(`   ${colors.green}✓ Articulo:${colors.reset} ${colors.gray}${post.slug}${colors.reset}`);
    }

    /**
     * FASE 5: ACTIVOS DE INGENIERÍA (Projects)
     */
    console.log(`${colors.blue}[BOOTSTRAP]${colors.reset} Registrando Activos de Próxima Generación...`);
    for (const p of MOCK_PROJECTS) {
      await payload.delete({ collection: 'projects', where: { slug: { equals: p.slug } } });

      const createdProject = await payload.create({
        collection: 'projects',
        data: {
          id: randomUUID(),
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
            title: 'Sovereign Engine v3', 
            features: [{ feature: 'Hybrid Cloud S3' }, { feature: 'Identity Cluster RBAC' }] 
          },
          status: 'published', 
          tenantId: MASTER_TENANT_ID,
        }
      }) as BaseCmsDoc;
      console.log(`   ${colors.green}✓ Activo:${colors.reset} ${colors.gray}${p.slug}${colors.reset}`);
    }

    console.log(`\n${colors.green}${C.bold}✨ GENESIS ENGINE: INFRAESTRUCTURA NIVELADA EXITOSAMENTE.${colors.reset}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}${C.bold}💥 FALLO CATASTRÓFICO EN EL GENESIS ENGINE:${colors.reset}\n`, error);
    process.exit(1);
  }
}

runSeed();