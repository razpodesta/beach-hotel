/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador Maestro del Ecosistema de Datos MetaShark.
 *              Centraliza la inteligencia de colecciones, adaptadores de DB
 *              y almacenamiento en la nube (S3) con observabilidad Heimdall v2.5.
 *              Refactorizado: Optimización de resolución de plugins, blindaje
 *              de secretos, telemetría DNA-Level y cumplimiento estricto de 
 *              Payload 3.0 (Next.js Native).
 * @version 48.0 - Master SSoT & DNA Integrity (Forensic Standard)
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
 * 1. INVENTARIO DE COLECCIONES (SBU Matrix)
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
// TELEMETRÍA HEIMDALL: DNA Core Pulse v2.5
// ============================================================================

const configEvalStart = performance.now();
const traceId = `cfg_dna_${Date.now().toString(36).toUpperCase()}`;
const isGeneration = process.env.PAYLOAD_GENERATE === 'true';
const isProduction = process.env.NODE_ENV === 'production';

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

console.log(`\n${C.magenta}${C.bold}[DNA][CONFIG]${C.reset} Handshake de orquestación | Trace: ${C.cyan}${traceId}${C.reset}`);

/**
 * HELPER: measureTask
 * @description Mide y reporta la latencia de un sub-proceso de configuración.
 */
const measureTask = <T>(name: string, task: () => T): T => {
  const start = performance.now();
  try {
    const result = task();
    const duration = (performance.now() - start).toFixed(2);
    console.log(`   ${C.green}✓ [METRIC]${C.reset} ${name.padEnd(25)} | OK | ${C.yellow}${duration.padStart(8)}ms${C.reset}`);
    return result;
  } catch (error: unknown) {
    const duration = (performance.now() - start).toFixed(2);
    const msg = error instanceof Error ? error.message : 'Unknown drift';
    console.error(`   ${C.red}✕ [METRIC]${C.reset} ${name.padEnd(25)} | FAIL | ${duration}ms | ${msg}`);
    throw error;
  }
};

// ============================================================================
// COMPONENTES DE INFRAESTRUCTRURA (Silos)
// ============================================================================

/** 2. MOTOR DE PERSISTENCIA (Aislamiento de Build) */
const dbAdapter = measureTask('INFRA_DB_ADAPTER', () => {
  if (isGeneration) {
    // Protocolo de Blindaje: Evita intentos de red durante la síntesis de tipos.
    return postgresAdapter({
      pool: { connectionString: 'postgres://dummy:dummy@127.0.0.1:5432/dummy' },
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
    push: !isProduction, // Solo permite push automático en desarrollo
  });
});

/** 3. RESOLUCIÓN DE PLUGINS (Bóveda Multimedia) */
const pluginStack = measureTask('INFRA_CLOUD_PLUGINS', () => {
  // Optimizamos: Si es fase de generación, no cargamos el SDK de S3.
  if (!process.env.S3_ENDPOINT || isGeneration) {
    return [];
  }
  
  return [
    s3Storage({
      collections: { 
        media: true, 
        offers: true, 
        'flash-sales': true, 
        agencies: true, 
        ingestions: true 
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
  
  /** @pilar III: Seguridad de secretos con fallback de emergencia trazado */
  secret: process.env.PAYLOAD_SECRET || 'emergency-dev-vault-key-33',
  
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(__dirname) },
    meta: { 
      titleSuffix: '- MetaShark Enterprise Operations',
      // @fix TS2353: favicon delegado al orquestador estático de Next.js 15
    },
  },

  db: dbAdapter,

  email: process.env.SMTP_USER ? nodemailerAdapter({
    defaultFromAddress: 'concierge@metashark.tech',
    defaultFromName: 'Enterprise Hospitality Concierge',
  }) : undefined,

  collections: [
    Offers, FlashSales, Agencies, Agents, BusinessMetrics,
    Ingestions, Subscribers, Tenants, Users, Notifications,
    DynamicRoutes, Media, BlogPosts, Projects,
  ],
  
  editor: lexicalEditor({}),
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  /** 
   * @fix Pilar III: Compatibilidad de tipos para el motor Sharp
   * Sincroniza el procesamiento de imágenes con el runtime de Next.js 15.
   */
  sharp: (sharp as unknown) as SharpDependency,

  plugins: pluginStack,
});

const totalEval = (performance.now() - configEvalStart).toFixed(2);
console.log(`${C.magenta}${C.bold}[DNA][SUCCESS]${C.reset} SSoT Orquestador calibrado en ${C.yellow}${totalEval}ms${C.reset}\n`);

export default config;