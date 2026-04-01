/**
 * @file scripts/supabase/seed-database.ts
 * @version 29.1 - Enterprise Level 4.0 | Payload 3.0 Sync
 */

import Module from 'node:module';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { CollectionSlug } from 'payload';

// --- 1. INFRASTRUCTURE INTERCEPTOR ---
const ModuleCore = Module as unknown as { _load: (r: string, p: unknown, m: boolean) => unknown; };
const originalLoad = ModuleCore._load;
ModuleCore._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === '@next/env') {
    return { __esModule: true, default: { loadEnvConfig: () => ({ combinedEnv: process.env }) }, loadEnvConfig: () => ({ combinedEnv: process.env }) };
  }
  return originalLoad.call(this, request, parent, isMain);
};

// --- 2. ENTERPRISE ENVIRONMENT CONFIGURATION ---
process.env.PAYLOAD_SKIP_LOAD_ENV = 'true';
process.env.IS_SEEDING_MODE = 'true';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', magenta: '\x1b[35m', blue: '\x1b[34m', cyan: '\x1b[36m' };

async function runGenesisSeed(): Promise<void> {
  console.log(`\n${colors.magenta}=== GENESIS ENGINE: ENTERPRISE PROVISIONING V29.1 ===${colors.reset}`);

  try {
    const { getPayload } = await import('payload');
    const { default: configPromise } = await import('@metashark/cms-core/config');

    // PAYLOAD 3.0 STANDARD: getPayload es headless y local por defecto.
    // El adaptador SMTP ya fue neutralizado en payload.config.ts
    const payload = await getPayload({ 
        config: await configPromise
    });
    
    console.log(`${colors.blue}[1/4]${colors.reset} Purgando registros...`);
    const purgeOrder: CollectionSlug[] = [
      'notifications', 'ingestions', 'flash-sales', 'offers', 
      'subscribers', 'blog-posts', 'projects', 'agencies', 
      'media', 'users', 'tenants'
    ];
    
    for (const collection of purgeOrder) {
      await payload.delete({ collection, where: {} });
    }

    console.log(`${colors.blue}[2/4]${colors.reset} Levantando Propiedad Maestra...`);
    await payload.create({
      collection: 'tenants',
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Beach Hotel Canasvieiras',
        slug: 'beach-hotel-main',
        domain: process.env.NEXT_PUBLIC_BASE_URL || 'localhost'
      }
    });

    console.log(`${colors.blue}[3/4]${colors.reset} Sincronizando Staff Admin...`);
    await payload.create({
      collection: 'users',
      data: { 
        id: 'b174d3a8-e1ed-4054-8b63-55cce8749c11',
        email: 'admin@metashark.tech', 
        password: 'EliteShark2026!', 
        role: 'developer',
        tenant: '00000000-0000-0000-0000-000000000001',
        level: 99,
        experiencePoints: 3300,
        _verified: true 
      }
    });

    console.log(`\n\n${colors.green}✨ GENESIS COMPLETO: REALIDAD SINCRONIZADA.${colors.reset}\n`);
    process.exit(0);

  } catch (error) {
    console.error(`\n${colors.red}💥 FALLO CATASTRÓFICO:${colors.reset}`, error);
    process.exit(1);
  }
}

runGenesisSeed();