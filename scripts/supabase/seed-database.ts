/**
 * @file scripts/supabase/seed-database.ts
 * @version 31.3 - Genesis Engine: Final Industrial Hardening
 * @description Inyección determinista con guardas de resiliencia y normalización de esquemas.
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as url from 'node:url';
import type { CollectionSlug } from 'payload';

// 1. Configuración de Entorno (Hardened)
process.env.PAYLOAD_SKIP_LOAD_ENV = 'true';
process.env.IS_SEEDING_MODE = 'true';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', 
  magenta: '\x1b[35m', blue: '\x1b[34m', cyan: '\x1b[36m',
  yellow: '\x1b[33m', gray: '\x1b[90m' 
};

// PNG Transparente 1x1 (Base64)
const GENESIS_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

(async () => {
  console.log(`\n${C.magenta}=== GENESIS ENGINE V31.3: PROVISIONING ===${C.reset}`);

  try {
    const { getPayload } = await import('payload');
    const { default: configPromise } = await import('@metashark/cms-core/config');
    const MOCKS_PATH = path.resolve(process.cwd(), 'apps/portfolio-web/src/data/mocks/cms.mocks');
    const { MOCK_POSTS, MOCK_PROJECTS } = await import(url.pathToFileURL(MOCKS_PATH).href);

    const payload = await getPayload({ config: await configPromise });
    
    // 2. PURGA JERÁRQUICA
    console.log(`${C.blue}[1/4]${C.reset} Limpiando perímetros existentes...`);
    const purgeOrder: CollectionSlug[] = [
      'notifications', 'ingestions', 'flash-sales', 'offers', 
      'subscribers', 'blog-posts', 'projects', 'agencies', 
      'media', 'users', 'tenants'
    ];
    
    for (const collection of purgeOrder) {
      try {
        await payload.delete({ collection, where: {} });
      } catch (e: unknown) {
        const _ = e;
        console.warn(`   ${C.yellow}⚠ Colección '${collection}' inaccesible.${C.reset}`);
      }
    }

    // 3. PROVISIÓN DE INFRAESTRUCTURA
    console.log(`${C.blue}[2/4]${C.reset} Levantando Tenant Maestro...`);
    const tenant = await payload.create({
      collection: 'tenants',
      data: { name: 'Beach Hotel Canasvieiras', slug: 'beach-hotel-main', domain: 'https://beach-hotel.vercel.app' }
    });

    console.log(`${C.blue}[3/4]${C.reset} Estableciendo Identidad Administrativa...`);
    const admin = await payload.create({
      collection: 'users',
      data: { 
        email: 'admin@metashark.tech', 
        password: 'EliteShark2026!', 
        role: 'developer',
        tenant: tenant.id,
        level: 99,
        experiencePoints: 3300,
        _verified: true 
      }
    });

    // 4. CREACIÓN DE MEDIA GÉNESIS
    console.log(`${C.blue}[4/4]${C.reset} Inyectando Media Génesis...`);
    const genesisMedia = await payload.create({
      collection: 'media',
      data: { alt: 'Génesis Asset Placeholder', tenant: tenant.id },
      file: { 
        data: Buffer.from(GENESIS_PNG_B64, 'base64'), 
        name: 'genesis.png', 
        mimetype: 'image/png', 
        size: 70 
      }
    });

    // 5. INYECCIÓN DE DATOS DE NEGOCIO
    console.log(`${C.blue}[5/5]${C.reset} Sembrando Journal y Activos...`);
    
    for (const post of MOCK_POSTS) {
      await payload.create({
        collection: 'blog-posts',
        data: {
          title: post.title,
          slug: post.slug,
          description: post.description,
          content: { root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: post.content }] }] } },
          publishedDate: post.publishedDate,
          tags: (post.tags as string[]).map((t: string) => ({ tag: t })),
          tenant: tenant.id,
          author: admin.id,
          status: 'published',
          ogImage: genesisMedia.id
        }
      });
    }

    for (const proj of MOCK_PROJECTS) {
      // Guardia de resiliencia: aseguramos que el objeto tenga las propiedades requeridas
      const p = proj as any;
      if (!p.introduction || !p.backend_architecture) {
         console.warn(`   ${C.yellow}⚠ Saltando activo con estructura inválida: ${p.title}${C.reset}`);
         continue;
      }

      await payload.create({
        collection: 'projects',
        data: {
          title: p.title,
          slug: p.slug,
          description: p.description,
          imageUrl: p.imageUrl,
          liveUrl: p.liveUrl || '#',
          codeUrl: p.codeUrl || null,
          tags: (p.tags as string[]).map((t: string) => ({ tag: t })),
          tech_stack: (p.tech_stack as string[]).map((t: string) => ({ technology: t })),
          introduction: {
            heading: p.introduction.heading,
            body: p.introduction.body
          },
          backend_architecture: {
            title: p.backend_architecture.title,
            description: p.backend_architecture.description || '',
            features: (p.backend_architecture.features as string[]).map((f: string) => ({ feature: f }))
          },
          branding: p.branding,
          reputationWeight: p.reputationWeight,
          tenant: tenant.id,
          status: 'published',
          heroAsset: genesisMedia.id
        }
      });
    }

    console.log(`\n\n${C.green}✨ GENESIS COMPLETO: REALIDAD POBLADA.${C.reset}\n`);
    process.exit(0);

  } catch (error) {
    console.error(`\n${C.red}💥 FALLO CATASTRÓFICO:${C.reset}`, error);
    process.exit(1);
  }
})();