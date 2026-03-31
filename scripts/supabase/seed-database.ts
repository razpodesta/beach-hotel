/**
 * @file scripts/supabase/seed-database.ts
 * @description Genesis Engine: Enterprise Infrastructure Bootstrap.
 *              Orquesta la provisión inicial de datos para los 5 Silos Industriales.
 *              Implementa purga secuencial anti-bloqueo, unificación relacional
 *              'tenant' y sincronización de identidades B2B verificadas.
 * @version 26.0 - Enterprise Level 4.0 | TS & Linter Strict Sync
 * @author Staff Engineer - MetaShark Tech
 */

import Module from 'node:module';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';

/** 
 * @pilar III: Seguridad de Tipos Absoluta.
 * Importación estática de tipos. TypeScript borrará esto en tiempo de compilación,
 * evitando los errores TS2339 y TS2749 asociados a importaciones dinámicas de tipos.
 */
import type { CollectionSlug } from 'payload';

// --- 1. INFRASTRUCTURE INTERCEPTOR (Node.js Compatibility) ---
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

// --- 2. ENTERPRISE ENVIRONMENT CONFIGURATION ---
process.env.PAYLOAD_SKIP_LOAD_ENV = 'true';
process.env.IS_SEEDING_MODE = 'true';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const colors = { 
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', 
  magenta: '\x1b[35m', blue: '\x1b[34m', cyan: '\x1b[36m', gray: '\x1b[90m'
};
const C = { bold: '\x1b[1m' };

// IDs DETERMINISTAS SSoT (Enterprise Integrity)
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const MASTER_ADMIN_ID = 'b174d3a8-e1ed-4054-8b63-55cce8749c11';
const TEST_AGENCY_ID = '77777777-7777-7777-7777-777777777777';

/**
 * MODULE: runGenesisSeed
 */
async function runGenesisSeed(): Promise<void> {
  console.log(`\n${colors.magenta}${C.bold}=== GENESIS ENGINE: ENTERPRISE PROVISIONING V26 ===${colors.reset}`);
  console.log(`${colors.gray}Calibrating Multi-Silo Infrastructure...${colors.reset}\n`);

  try {
    const [{ getPayload }, { default: configPromise }] = await Promise.all([
      import('payload'),
      import('@metashark/cms-core/config')
    ]);

    const payload = await getPayload({ config: await configPromise });
    
    /**
     * FASE 1: PURGA SECUENCIAL DE PERÍMETROS (Integrity Guard)
     */
    console.log(`${colors.blue}[1/4]${colors.reset} Purgando registros obsoletos...`);
    const purgeOrder: CollectionSlug[] = [
      'notifications', 'ingestions', 'flash-sales', 'offers', 
      'subscribers', 'blog-posts', 'projects', 'agencies', 
      'media', 'users', 'tenants'
    ];
    
    for (const collection of purgeOrder) {
      await payload.delete({ collection, where: {} });
    }
    console.log(`   ${colors.green}✓ Clúster de datos purificado.${colors.reset}`);

    /**
     * FASE 2: PROPIEDAD ANCLA
     */
    console.log(`${colors.blue}[2/4]${colors.reset} Levantando Propiedad Maestra...`);
    await payload.create({
      collection: 'tenants',
      data: {
        id: MASTER_TENANT_ID,
        name: 'Beach Hotel Canasvieiras',
        slug: 'beach-hotel-main',
        domain: process.env.NEXT_PUBLIC_BASE_URL || 'localhost'
      }
    });

    /**
     * FASE 3: RED DE ALIANZAS (Silo B)
     */
    console.log(`${colors.blue}[3/4]${colors.reset} Inyectando Nodo de Alianza B2B...`);
    const logoResult = await payload.create({
      collection: 'media',
      data: { alt: 'Luxury Travel Logo', tenant: MASTER_TENANT_ID },
      file: { 
        data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkCQMAAQQBAO7r8FwAAAAASUVORK5CYII=', 'base64'), 
        mimetype: 'image/png', name: 'agency-placeholder.png', size: 1 
      }
    });

    await payload.create({
      collection: 'agencies',
      data: {
        id: TEST_AGENCY_ID,
        brandName: 'Luxury Travel Chile',
        legalName: 'Luxury Travel SpA',
        taxId: '77-123456-K',
        jurisdiction: 'CL',
        trustScore: 100,
        status: 'active',
        logo: String(logoResult.id),
        tenant: MASTER_TENANT_ID,
        commercialTerms: { defaultCommission: 15, paymentCycle: 'net-30' }
      }
    });

    /**
     * FASE 4: IDENTIDADES RAÍZ
     */
    console.log(`${colors.blue}[4/4]${colors.reset} Sincronizando Staff Admin...`);
    await payload.create({
      collection: 'users',
      data: { 
        id: MASTER_ADMIN_ID,
        email: 'admin@metashark.tech', 
        password: 'EliteShark2026!', 
        role: 'developer',
        tenant: MASTER_TENANT_ID,
        level: 99,
        experiencePoints: 3300,
        _verified: true 
      }
    });

    // Finalización exitosa
    console.log(`\n\n${colors.green}${C.bold}✨ GENESIS COMPLETO: REALIDAD INDUSTRIAL SINCRONIZADA.${colors.reset}\n`);
    process.exit(0);

  } catch (error) {
    console.error(`\n${colors.red}${C.bold}💥 FALLO CATASTRÓFICO:${colors.reset}\n`, error);
    process.exit(1);
  }
}

runGenesisSeed();