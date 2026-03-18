/**
 * @file seed-database.ts
 * @description Orquestador Soberano de Población de Datos (Genesis Engine).
 *              Nivelado: Soluciona el fallo de carga de entorno de Payload 3.0 mediante 
 *              inyección temprana y supresión de carga automática.
 * @version 4.2 - PayloadStandAlone Architecture
 * @author Raz Podestá - MetaShark Tech
 */

import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';

/**
 * FASE 0: PREPARACIÓN DE ENTORNO SOBERANO
 * @pilar X: Rendimiento y Estabilidad.
 * Es crítico cargar dotenv y configurar PAYLOAD_SKIP_LOAD_ENV antes de importar 'payload'.
 */
const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// @pilar VIII: Resiliencia - Evita que Payload intente usar Next.js env loader en un script aislado.
process.env.PAYLOAD_SKIP_LOAD_ENV = 'true';
// Bypass SSL para conexiones a Supabase Poolers desde entornos locales
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Importaciones diferidas para asegurar la disponibilidad de variables de entorno
import { getPayload } from 'payload';
// eslint-disable-next-line @nx/enforce-module-boundaries
import configPromise from '../../packages/cms/core/src/payload.config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MOCK_POSTS, MOCK_PROJECTS } from '../../apps/portfolio-web/src/data/mocks/cms.mocks';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

const LOG_PREFIX = `${colors.cyan}[HEIMDALL][SEED]${colors.reset}`;

/** 
 * Identidad de Propiedad Digital Maestra 
 * @pilar I: Visión Holística - Identificador unívoco para el Tenant del Hotel.
 */
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Genera un buffer de imagen base (1x1 px) para inicializar la Media Library.
 */
function generateDummyImageBuffer(): Buffer {
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkCQMAAQQBAO7r8FwAAAAASUVORK5CYII=';
  return Buffer.from(base64, 'base64');
}

/**
 * Transforma texto Markdown a la estructura AST de Lexical requerida por Payload 3.0.
 * @param markdownText Texto plano de contenido.
 */
function generateLexicalAST(markdownText: string): unknown {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: markdownText }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

/**
 * MOTOR DE INYECCIÓN SOBERANA: runSeed
 * Orquesta la creación de tablas, usuarios y contenido inicial.
 */
async function runSeed() {
  console.log(`\n${colors.magenta}========================================${colors.reset}`);
  console.log(`${colors.magenta}   GENESIS ENGINE: STANDALONE SEEDING   ${colors.reset}`);
  console.log(`${colors.magenta}========================================${colors.reset}\n`);

  try {
    // 1. Inicialización de Payload con la configuración resuelta
    const payload = await getPayload({ config: await configPromise });
    console.log(`${LOG_PREFIX} Motor Payload forjado exitosamente.\n`);

    // 2. FASE: IDENTIDAD (Admin Global)
    console.group(`${LOG_PREFIX} Fase 1: Identidad Soberana`);
    const adminEmail = 'admin@metashark.tech';
    let adminId: string;
    
    const existingAdmin = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
    });

    if (existingAdmin.docs.length > 0) {
      adminId = String(existingAdmin.docs[0].id);
      console.log(`${colors.gray}⚪ Identidad Admin ya existente (ID: ${adminId})${colors.reset}`);
    } else {
      const newAdmin = await payload.create({
        collection: 'users',
        data: {
          email: adminEmail,
          password: 'EliteShark2026!',
          role: 'admin',
          tenantId: MASTER_TENANT_ID,
          level: 99,
          experiencePoints: 10000,
        },
      });
      adminId = String(newAdmin.id);
      console.log(`${colors.green}✔ Admin Global creado satisfactoriamente.${colors.reset}`);
    }
    console.groupEnd();

    // 3. FASE: MEDIA LIBRARY (Bootstrap)
    console.group(`\n${LOG_PREFIX} Fase 2: Media Library Infrastructure`);
    const dummyBuffer = generateDummyImageBuffer();
    const baseMedia = await payload.create({
      collection: 'media',
      data: {
        alt: 'Genesis Sovereign Asset Placeholder',
        tenantId: MASTER_TENANT_ID,
      },
      file: {
        data: dummyBuffer,
        mimetype: 'image/png',
        name: 'genesis-placeholder.png',
        size: dummyBuffer.length,
      },
    });
    console.log(`${colors.green}✔ Asset de medios base inyectado (ID: ${baseMedia.id})${colors.reset}`);
    console.groupEnd();

    // 4. FASE: EDITORIAL (The Concierge Journal)
    console.group(`\n${LOG_PREFIX} Fase 3: Editorial Content (Blog)`);
    for (const post of MOCK_POSTS) {
      const exists = await payload.find({
        collection: 'blog-posts',
        where: { slug: { equals: post.slug } },
      });

      if (exists.docs.length === 0) {
        await payload.create({
          collection: 'blog-posts',
          data: {
            title: post.title,
            slug: post.slug,
            description: post.description,
            content: generateLexicalAST(post.content),
            author: adminId,
            publishedDate: post.publishedDate,
            status: 'published',
            tags: post.tags.map(t => ({ tag: t.tag })),
            tenantId: MASTER_TENANT_ID,
            ogImage: String(baseMedia.id),
          },
        });
        console.log(`${colors.green}   ✔ Post migrado:${colors.reset} ${post.title}`);
      } else {
        console.log(`${colors.gray}   ⚪ Omitido (Ya existe):${colors.reset} ${post.title}`);
      }
    }
    console.groupEnd();

    // 5. FASE: ACTIVOS DIGITALES (Hospitality Projects)
    console.group(`\n${LOG_PREFIX} Fase 4: Hospitality Assets (Projects)`);
    for (const project of MOCK_PROJECTS) {
      const exists = await payload.find({
        collection: 'projects',
        where: { slug: { equals: project.slug } },
      });

      if (exists.docs.length === 0) {
        // Desestructuración para mapeo de campos de tags y tech_stack al formato de Payload
        const { tags, tech_stack, ...data } = project;
        
        await payload.create({
          collection: 'projects',
          data: {
            ...data,
            tags: tags.map(t => ({ tag: t })),
            tech_stack: tech_stack.map(t => ({ technology: t })),
            status: 'published',
            tenantId: MASTER_TENANT_ID,
          },
        });
        console.log(`${colors.green}   ✔ Proyecto migrado:${colors.reset} ${project.title}`);
      } else {
        console.log(`${colors.gray}   ⚪ Omitido (Ya existe):${colors.reset} ${project.title}`);
      }
    }
    console.groupEnd();

    console.log(`\n${colors.green}✨ OPERACIÓN GÉNESIS FINALIZADA CON ÉXITO ✨${colors.reset}\n`);
    process.exit(0);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`\n${LOG_PREFIX} ${colors.red}💥 FALLO CATASTRÓFICO EN EL SEEDING:${colors.reset}`);
    console.error(message);
    process.exit(1);
  }
}

runSeed();