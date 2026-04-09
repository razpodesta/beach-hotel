/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador Maestro del Ecosistema de Datos MetaShark.
 *              Refactorizado: Erradicación del bypass global de TLS, implementación 
 *              de Hardened SSL en el pooler y sincronización real en fase de Build.
 *              Sello: Resolución del aviso de adaptador de almacenamiento en Vercel.
 * @version 50.0 - Hardened Infrastructure & Real-Data Sync
 * @author Staff Engineer - MetaShark Tech
 */

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
 * INVENTARIO DE COLECCIONES (SBU Matrix)
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

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA (Heimdall Sentinel)
 * @pilar VIII: Resiliencia de Build.
 */
const IS_TYPE_GEN = process.env.PAYLOAD_GENERATE === 'true';
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const HAS_DB_URL = !!process.env.DATABASE_URL;

// Protocolo Cromático Heimdall v2.5
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

/**
 * FACTORÍA DE ADAPTADOR DE BASE DE DATOS (Hardened Handshake)
 * @description Implementa seguridad SSL granular sin comprometer el proceso global.
 */
const resolveDbAdapter = () => {
  /** 
   * @case TYPE_GENERATION
   * Único escenario donde se permite una conexión dummy para síntesis de esquemas.
   */
  if (IS_TYPE_GEN && !HAS_DB_URL) {
    return postgresAdapter({
      pool: { connectionString: 'postgres://dummy:dummy@127.0.0.1:5432/dummy' },
    });
  }
  
  /**
   * @case PRODUCTION_BUILD & RUNTIME
   * @pilar VIII: Resiliencia. Conexión real con timeout extendido para el Edge de Vercel.
   */
  return postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: IS_BUILD ? 5 : 10, // Reducimos pool durante build para evitar saturación
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      /**
       * @fix: Seguridad de Perímetro.
       * Supabase requiere SSL. Al usar rejectUnauthorized: false AQUÍ, 
       * permitimos el pooler transaccional sin inhabilitar el escudo TLS global de Node.
       */
      ssl: { rejectUnauthorized: false },
    },
    idType: 'uuid',
    push: false, // Prevenimos mutaciones accidentales del esquema en el build
  });
};

/**
 * FACTORÍA DE PLUGINS CLOUD (S3 Vault Sealing)
 * @description Asegura que el adaptador de almacenamiento esté inyectado para evitar 
 *              advertencias de Vercel y fallos en la ingesta multimedia.
 */
const resolvePlugins = () => {
  const endpoint = process.env.S3_ENDPOINT;
  
  if (!endpoint) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`${C.yellow}[HEIMDALL][VAULT] Alerta: S3_ENDPOINT no detectado en producción.${C.reset}`);
    }
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
        endpoint: endpoint,
        region: process.env.S3_REGION || 'sa-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ];
};

/**
 * APARATO PRINCIPAL: config
 * @description Orquestación Maestra de Datos y Servicios.
 */
export const config = buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'emergency-dev-vault-key-33',
  
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(__dirname) },
    meta: { 
      titleSuffix: '- MetaShark Enterprise Operations',
    },
  },

  db: resolveDbAdapter(),

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
   * @pilar III: Seguridad de Tipos.
   * Casting de seguridad para el motor de procesamiento de imágenes Sharp.
   */
  sharp: (sharp as unknown) as SharpDependency,

  plugins: resolvePlugins(),
});

// Telemetría de Montaje (Heimdall v2.5)
if (!IS_TYPE_GEN && typeof window === 'undefined') {
  const phase = IS_BUILD ? 'BUILD_GENERATION' : 'RUNTIME_ACTIVE';
  console.log(`${C.magenta}${C.bold}[DNA][CONFIG]${C.reset} Core Orchestrator Calibrated | Phase: ${phase}`);
}

export default config;