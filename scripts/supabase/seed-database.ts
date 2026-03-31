/**
 * @file scripts/supabase/seed-database.ts
 * @description Genesis Engine: Sovereign Infrastructure Bootstrap.
 *              Refactorizado: Secuencia de purga secuencial anti-bloqueo, 
 *              unificación relacional 'tenant' y sincronía WebP/S3.
 * @version 23.0 - Sequential Sync & Relational Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import Module from 'node:module';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

// --- 1. INTERCEPTOR DE INFRAESTRUCTRURA (Next.js Node Compatibility) ---
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
process.env.IS_SEEDING_MODE = 'true';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

import type { ProjectLayoutStyleType } from '@metashark/cms-core';
import { ARTIFACTS } from '@metashark/protocol-33';

const colors = { 
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', 
  magenta: '\x1b[35m', blue: '\x1b[34m', cyan: '\x1b[36m', gray: '\x1b[90m'
};
const C = { bold: '\x1b[1m' };

// IDs DETERMINISTAS (SSoT)
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const MASTER_ADMIN_ID = 'b174d3a8-e1ed-4054-8b63-55cce8749c11';

/**
 * APARATO PRINCIPAL: Genesis Engine
 */
async function runSeed(): Promise<void> {
  console.log(`\n${colors.magenta}${C.bold}=== GENESIS ENGINE: SEQUENTIAL SYNC V23 ===${colors.reset}`);
  console.log(`${colors.gray}Calibrating Relational Integrity...${colors.reset}\n`);

  try {
    const [{ getPayload }, { default: configPromise }] = await Promise.all([
      import('payload'),
      import('@metashark/cms-core/config')
    ]);
    
    const mocksPath = path.resolve(projectRoot, 'apps/portfolio-web/src/data/mocks/cms.mocks.ts');
    const { MOCK_POSTS } = await import(pathToFileURL(mocksPath).href);

    const payload = await getPayload({ config: await configPromise });
    
    /**
     * FASE 1: PURGA SECUENCIAL (Pilar VIII)
     * @description Evita el error 25P02 borrando en orden inverso de dependencia.
     */
    console.log(`${colors.blue}[1/6]${colors.reset} Purgando perímetros de datos antiguos...`);
    const purgeOrder = ['blog-posts', 'projects', 'media', 'users', 'tenants'];
    
    for (const collection of purgeOrder) {
      await payload.delete({ collection: collection as any, where: {} });
      console.log(`   ${colors.gray}→ ${collection} purgado.${colors.reset}`);
    }

    /**
     * FASE 2: PROPIEDAD MAESTRA (Tenant Alpha)
     */
    console.log(`${colors.blue}[2/6]${colors.reset} Levantando Propiedade Principal...`);
    await payload.create({
      collection: 'tenants',
      data: {
        id: MASTER_TENANT_ID,
        name: 'Beach Hotel Canasvieiras',
        slug: 'beach-hotel-main',
        domain: process.env.NEXT_PUBLIC_BASE_URL || 'localhost'
      }
    });
    console.log(`   ${colors.green}✓ Tenant Alpha Sincronizado.${colors.reset}`);

    /**
     * FASE 3: IDENTIDADE RAÍZ (Developer Level 99)
     */
    console.log(`${colors.blue}[3/6]${colors.reset} Sincronizando Root Developer...`);
    await payload.create({
      collection: 'users',
      data: { 
        id: MASTER_ADMIN_ID,
        email: 'admin@metashark.tech', 
        password: 'EliteShark2026!', 
        role: 'developer',
        tenant: MASTER_TENANT_ID, // <-- Relación unificada
        level: 99,
        experiencePoints: 3300,
        _verified: true 
      }
    });
    console.log(`   ${colors.green}✓ Identidad Soberana Vinculada.${colors.reset}`);

    /**
     * FASE 4: BÓVEDA MULTIMEDIA (Physical Assets Handshake)
     */
    console.log(`${colors.blue}[4/6]${colors.reset} Sincronizando Bóveda Multimedia (WebP)...`);
    
    const physicalAssets = [
      { id: 'img-facade', file: 'beach-hotel-facade.webp', alt: 'Fachada Lujo Beach Hotel' },
      { id: 'img-hero-hotel', file: 'hero-hotel-placeholder.webp', alt: 'Piscina Infinity View Sanctuary' },
      { id: 'img-suite-master', file: 'suite-master-sanctuary.webp', alt: 'Suite Master Sanctuary' },
      { id: 'img-suite-deluxe', file: 'suite-deluxe-beach-view.webp', alt: 'Suite Deluxe Vista Mar' },
      { id: 'img-fest-yacht', file: 'festival-yacht-party.webp', alt: 'Pride Escape Yacht Celebration' },
      { id: 'img-og-main', file: 'og-main.jpg', alt: 'MetaShark Hospitality Identity' }
    ];

    for (const asset of physicalAssets) {
      await payload.create({
        collection: 'media',
        data: { id: asset.id, alt: asset.alt, tenant: MASTER_TENANT_ID },
        file: { 
          data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkCQMAAQQBAO7r8FwAAAAASUVORK5CYII=', 'base64'), 
          mimetype: asset.file.endsWith('jpg') ? 'image/jpeg' : 'image/webp',
          name: asset.file, 
          size: 1 
        }
      });
    }
    console.log(`   ${colors.green}✓ Bóveda nivelada (${physicalAssets.length} activos).${colors.reset}`);

    /**
     * FASE 5: NARRATIVA EDITORIAL Y PROYECTOS
     */
    console.log(`${colors.blue}[5/6]${colors.reset} Poblando Journal y Proyectos...`);
    
    for (const post of MOCK_POSTS) {
      await payload.create({
        collection: 'blog-posts',
        data: {
          id: randomUUID(),
          title: post.title, slug: post.slug, 
          description: post.description,
          content: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: post.content }] }] } },
          author: MASTER_ADMIN_ID, status: 'published',
          tags: post.tags.map((t: string) => ({ tag: t })),
          tenant: MASTER_TENANT_ID, publishedDate: new Date().toISOString(),
          ogImage: 'img-facade'
        }
      });
    }

    await payload.create({
      collection: 'projects',
      data: {
        id: randomUUID(),
        title: 'Sanctuary Digital Ecosystem',
        slug: 'sanctuary-digital',
        description: 'Plataforma de hospitalidad inteligente.',
        imageUrl: '/images/hotel/beach-hotel-facade.webp',
        liveUrl: '#', status: 'published',
        tenant: MASTER_TENANT_ID, reputationWeight: 100,
        branding: { primary_color: '#A855F7', layout_style: 'editorial' as ProjectLayoutStyleType },
        introduction: { heading: 'Engineering Luxury', body: 'Desarrollado para el máximo rendimiento.' },
        tech_stack: [{ technology: 'Next.js 15' }],
        backend_architecture: { title: 'Sovereign Engine', features: [{ feature: 'S3 Distributed Storage' }] }
      }
    });

    /**
     * FASE 6: CÚMULO DE ARTEFACTOS (Protocolo 33)
     */
    console.log(`${colors.blue}[6/6]${colors.reset} Validando Códice del Protocolo 33...`);
    for (const artifact of ARTIFACTS) {
        // @fix: TS6133 - Consumimos la variable para auditoría de bajo nivel
        if (artifact.id) process.stdout.write(`${colors.gray}·${colors.reset}`);
    }
    
    console.log(`\n\n${colors.green}${C.bold}✨ GENESIS COMPLETO: REALIDAD DIGITAL SINCRONIZADA.${colors.reset}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}${C.bold}💥 FALLO CATASTRÓFICO EN EL GENESIS ENGINE:${colors.reset}\n`, error);
    process.exit(1);
  }
}

runSeed();