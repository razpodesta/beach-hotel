/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Refactorizado: Resolución de TS2353 (Admin Meta Config), 
 *              estabilización de infraestructura S3 y normalización relacional.
 * @version 31.1 - Strict Metadata & S3 Production Standard
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
    console.log('[HEIMDALL][L0] Infrastructure Network Bypass: ENGAGED');
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
 * IMPORTACIONES DE COLECCIONES SOBERANAS (SSoT) 
 */
import { Users } from './collections/Users';
import { BlogPosts } from './collections/BlogPosts';
import { Projects } from './collections/Projects';
import { Media } from './collections/Media';
import { Tenants } from './collections/Tenants';
import { Subscribers } from './collections/Subscribers';

/** DETERMINACIÓN DE PERÍMETRO */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

const SERVER_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL || '';

// Configuración S3 (Supabase Cluster)
const S3_ENDPOINT = process.env.S3_ENDPOINT || '';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || 'sanctuary-vault';
const S3_REGION = process.env.S3_REGION || 'sa-east-1';

const IS_CLOUD_READY = Boolean(S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY);

/**
 * TELEMETRÍA DE ARRANQUE (Heimdall Forensic Report)
 */
console.group('[HEIMDALL][INFRA] Sovereign Core Bootstrap');
console.log(`[NETWORK] Target: ${SERVER_URL}`);
console.log(`[STORAGE] S3 Sync: ${IS_CLOUD_READY ? 'ACTIVE' : 'LOCAL_ONLY'}`);
console.log(`[DATABASE] Pooler Protocol: ${DATABASE_URL ? 'READY' : 'PENDING'}`);
console.groupEnd();

/**
 * CONSTRUCCIÓN DEL MOTOR CMS (Sovereign Architecture)
 */
export default buildConfig({
  /** 
   * @pilar I: Visión Holística. 
   * Resolución de rumbos absolutos para evitar 404 en el frontend.
   */
  serverURL: SERVER_URL,

  /** @pilar VIII: Resiliencia de Comunicación */
  email: nodemailerAdapter(),

  admin: {
    user: Users.slug,
    importMap: { baseDir: BASE_CONFIG_DIR },
    meta: { 
      /** 
       * @fix TS2353: Eliminada propiedad 'ogImage' por incompatibilidad de tipo.
       * Mantenemos la identidad visual mediante el sufijo de título.
       */
      titleSuffix: '- MetaShark Sovereign CMS',
    }
  },

  /** 
   * INVENTARIO DE COLECCIONES SOBERANAS
   */
  collections: [
    Users, 
    Tenants, 
    Subscribers, 
    Media, 
    BlogPosts, 
    Projects
  ],
  
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'genesis-vault-2026',
  
  typescript: {
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },

  /** 
   * CAPA DE PERSISTENCIA (Supabase Transaction Pooler)
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
  }),

  /** @pilar IX: Sharp para procesamiento de imágenes de alta fidelidade */
  sharp: (sharp as unknown) as SharpDependency,

  /**
   * MOTOR S3: Supabase Cloud Storage Plugin
   */
  plugins: [
    ...(IS_CLOUD_READY
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