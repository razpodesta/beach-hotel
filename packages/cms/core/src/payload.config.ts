/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador Maestro del Ecosistema de Datos MetaShark.
 *              Centraliza la inteligencia de colecciones, adaptadores de DB
 *              y almacenamiento en la nube (S3) con observabilidad Heimdall.
 *              Refactorizado: Resolución de TS2353 (MetaConfig alignment),
 *              blindaje total build-time y medición de latencia por sub-sistema.
 * @version 47.0 - Master SSoT & DNA Visibility (Payload 3.0 Strict)
 * @author Staff Engineer - MetaShark Tech
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { buildConfig } from 'payload';
import type { SharpDependency } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/** 
 * 1. IMPORTACIÓN DE COLECCIONES (Inventory Load)
 * @pilar V: Adherencia Arquitectónica.
 */
import { Ingestions } from './collections/Ingestions';
import { Subscribers } from './collections/Subscribers';
import { Agencies } from './collections/Agencies';
import { Agents } from './collections/Agents';
import { BusinessMetrics } from './collections/BusinessMetrics';
import { Offers } from './collections/Offers';
import { FlashSales } from './collections/FlashSales';
import { Media } from './collections/Media';
import { BlogPosts } from './collections/BlogPosts';
import { Projects } from './collections/Projects';
import { Tenants } from './collections/Tenants';
import { Notifications } from './collections/Notifications';
import { DynamicRoutes } from './collections/DynamicRoutes';
import { Users } from './collections/users/Users';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TELEMETRÍA HEIMDALL: DNA Core Pulse
// ============================================================================

const configEvalStart = performance.now();
const isGeneration = process.env.PAYLOAD_GENERATE === 'true';
const isProduction = process.env.NODE_ENV === 'production';

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

console.log(`\n${C.magenta}${C.bold}[DNA][CONFIG]${C.reset} Iniciando secuencia de orquestación central...`);

/**
 * HELPER: measureTask
 * @description Mide y reporta la latencia de un sub-proceso de configuración.
 */
const measureTask = <T>(name: string, task: () => T): T => {
  const start = performance.now();
  try {
    const result = task();
    const duration = (performance.now() - start).toFixed(2);
    console.log(`   ${C.green}✓ [METRIC]${C.reset} ${name.padEnd(25)} | OK | ${duration}ms`);
    return result;
  } catch (error) {
    const duration = (performance.now() - start).toFixed(2);
    console.error(`   ${C.yellow}✕ [METRIC]${C.reset} ${name.padEnd(25)} | FAIL | ${duration}ms`);
    throw error;
  }
};

// ============================================================================
// COMPONENTES DE INFRAESTRUCTRURA (Silos)
// ============================================================================

/** 2. MOTOR DE PERSISTENCIA (Silo de Datos) */
const dbAdapter = measureTask('DB_ADAPTER_INIT', () => {
  if (isGeneration) {
    console.log(`      ${C.cyan}→ Protocolo: Blindaje de Generación Activo.${C.reset}`);
    return postgresAdapter({
      pool: { connectionString: 'postgres://dummy:dummy@localhost:5432/dummy' },
    });
  }
  return postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 10,
      idleTimeoutMillis: 30000,
      ssl: { rejectUnauthorized: false },
    },
    idType: 'uuid',
    push: !isProduction,
  });
});

/** 3. INVENTARIO DE ENTIDADES (SBU Matrix) */
const collectionInventory = measureTask('COLLECTION_SYNC', () => [
  Offers, FlashSales, Agencies, Agents, BusinessMetrics,
  Ingestions, Subscribers, Tenants, Users, Notifications,
  DynamicRoutes, Media, BlogPosts, Projects,
]);

/** 4. BÓVEDA MULTIMEDIA (Vault Plugin) */
const pluginStack = measureTask('CLOUD_PLUGINS_RESOLVE', () => {
  // Desactivamos plugins pesados durante la generación de tipos para acelerar el build
  if (!process.env.S3_ENDPOINT || isGeneration) {
    return [];
  }
  return [
    s3Storage({
      collections: { 
        media: true, offers: true, 'flash-sales': true, 
        agencies: true, ingestions: true 
      },
      bucket: process.env.S3_BUCKET || 'sanctuary-vault',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'sa-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ];
});

// ============================================================================
// FACTORÍA SOBERANA: buildConfig
// ============================================================================

const config = buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'enterprise-vault-2026-master-key',
  
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(__dirname) },
    meta: { 
      /** 
       * @fix TS2353: 'favicon' purgado del contrato MetaConfig.
       * El favicon ahora se gestiona vía Next.js Metadata en el root layout
       * o mediante el array 'admin.icons' si se requiere personalización.
       */
      titleSuffix: '- MetaShark Enterprise Operations',
    },
  },

  db: dbAdapter,

  email: process.env.SMTP_USER ? nodemailerAdapter({
    defaultFromAddress: 'concierge@metashark.tech',
    defaultFromName: 'Enterprise Hospitality Concierge',
  }) : undefined,

  collections: collectionInventory,
  
  editor: lexicalEditor({}),
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  sharp: (sharp as unknown) as SharpDependency,

  plugins: pluginStack,
});

const totalEval = (performance.now() - configEvalStart).toFixed(2);
console.log(`${C.magenta}${C.bold}[DNA][SUMMARY]${C.reset} SSoT Config calibrada y exportada en ${totalEval}ms\n`);

export default config;