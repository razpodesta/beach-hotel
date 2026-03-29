/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Refactorizado: Arquitectura S3 (Supabase Storage) integrada,
 *              telemetría forense hiper-verbosa y estabilización del pooler SSL.
 * @version 26.5 - Build Fixed & Production Ready
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * 1. PROTOCOLO DE INFRAESTRUCTRURA NIVEL 0 (Early Initialization)
 * @pilar VIII: Resiliencia de Persistencia.
 */
(function initializeSovereignNetwork() {
  const isVercel = process.env.VERCEL === '1';
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isVercel || isBuild) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    process.env.PGSSLMODE = 'no-verify';
    console.log('[HEIMDALL][L0] SSL Infrastructure Bypass: ENGAGED (Vercel/Build Context)');
  }
})();

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
 * IMPORTACIONES ATÓMICAS DE COLECCIONES
 */
import { Users } from './collections/Users';
import { BlogPosts } from './collections/BlogPosts';
import { Projects } from './collections/Projects';
import { Media } from './collections/Media';
import { Tenants } from './collections/Tenants';

/**
 * DETERMINACIÓN DE PERÍMETRO DE INFRAESTRUCTRURA
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'genesis-engine-production-vault-2026';
let DATABASE_URL = process.env.DATABASE_URL || '';

// Credenciales de Nube (Supabase S3)
const S3_ENDPOINT = process.env.S3_ENDPOINT || '';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || 'sanctuary-vault';
const S3_REGION = process.env.S3_REGION || 'sa-east-1';

/**
 * SANEAMIENTO DE CADENA DE CONEXIÓN
 */
if (DATABASE_URL) {
  try {
    const url = new URL(DATABASE_URL);
    url.searchParams.set('uselibpqcompat', 'true');
    url.searchParams.set('sslmode', 'no-verify'); 
    DATABASE_URL = url.toString();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown URI Drift';
    console.error(`[HEIMDALL][CRITICAL] Database URI corruption detected: ${msg}`);
  }
}

const IS_CLOUD_STORAGE_READY = Boolean(S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY);

/**
 * TELEMETRÍA DE ARRANQUE VERBOSA (Heimdall)
 */
console.group('[HEIMDALL][INFRA] Sovereign Engine Bootstrap');
console.log(`[CORE] Payload Version: 3.0 Lifecycle`);
console.log(`[CORE] Database Status: ${DATABASE_URL ? 'URI_RESOLVED' : 'MISSING_URI'}`);
console.log(`[CORE] Media Storage: ${IS_CLOUD_STORAGE_READY ? 'S3_CLOUD_ACTIVE (Supabase)' : 'LOCAL_EPHEMERAL (Vercel Warning)'}`);
console.groupEnd();

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('[CRITICAL] SSoT Failure: DATABASE_URL is mandatory for production.');
}

/**
 * CONSTRUCCIÓN DEL MOTOR CMS
 */
export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || '',

  email: nodemailerAdapter({
    defaultFromAddress: 'admin@beachhotelcanasvieiras.com',
    defaultFromName: 'Sanctuary Concierge Engine',
  }),

  sharp: (sharp as unknown) as SharpDependency,

  admin: {
    user: Users.slug,
    importMap: { 
      baseDir: BASE_CONFIG_DIR, 
    },
    meta: {
      titleSuffix: '- MetaShark Sovereign CMS',
    }
  },

  collections: [
    Users, 
    BlogPosts, 
    Projects, 
    Media, 
    Tenants
  ],
  
  editor: lexicalEditor({}),
  secret: PAYLOAD_SECRET,
  
  typescript: {
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },

  /**
   * CAPA DE PERSISTENCIA (Supabase Transaction Pooler)
   * @pilar VIII: Resiliencia de Persistencia.
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),

  /**
   * SISTEMA DE PLUGINS: S3 Storage (Supabase)
   */
  plugins: [
    ...(IS_CLOUD_STORAGE_READY
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: S3_BUCKET,
            config: {
              endpoint: S3_ENDPOINT,
              region: S3_REGION,
              credentials: {
                accessKeyId: S3_ACCESS_KEY_ID,
                secretAccessKey: S3_SECRET_ACCESS_KEY,
              },
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
});