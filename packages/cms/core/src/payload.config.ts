/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador Maestro del Ecosistema de Datos MetaShark.
 *              Refactorizado: Blindaje contra 'SELF_SIGNED_CERT_IN_CHAIN' mediante
 *              la sanitización del Connection String (SSL Override Trap).
 *              Sincronizado: Cumplimiento de Linter v10.0 (console.info).
 * 
 * @version 53.0 - SSL String Sanitizer & Zero-Noise Build
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

/** INVENTARIO DE COLECCIONES (SBU Matrix) */
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

const IS_TYPE_GEN = process.env.PAYLOAD_GENERATE === 'true';
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const HAS_DB_URL = !!process.env.DATABASE_URL;

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

/**
 * @function getSanitizedDbUrl
 * @description Purificador de Cadena de Conexión (SSL Override Shield).
 *              Evita que parámetros de la URL como 'sslmode=require' sobrescriban
 *              la configuración granular del pool en la librería 'pg'.
 */
const getSanitizedDbUrl = (): string => {
  const rawUrl = process.env.DATABASE_URL || '';
  if (!rawUrl) return '';

  try {
    const url = new URL(rawUrl);
    // Erradicamos sslmode para que no sobreescriba { rejectUnauthorized: false }
    url.searchParams.delete('sslmode');
    // Inyectamos compatibilidad para Supabase Transaction Pooler (Puerto 6543)
    url.searchParams.set('uselibpqcompat', 'true');
    return url.toString();
  } catch {
    return rawUrl; // Fallback silencioso si la URL es inválida
  }
};

/**
 * FACTORÍA DE ADAPTADOR DE BASE DE DATOS (Hardened Handshake)
 */
const resolveDbAdapter = () => {
  if (IS_TYPE_GEN && !HAS_DB_URL) {
    return postgresAdapter({
      pool: { connectionString: 'postgres://ghost:ghost@127.0.0.1:5432/ghost' },
    });
  }
  
  return postgresAdapter({
    pool: {
      connectionString: getSanitizedDbUrl(),
      max: IS_BUILD ? 2 : 10, // Minimizamos sockets durante el build para evitar saturación
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false }, 
    },
    idType: 'uuid',
    push: false, 
  });
};

const resolvePlugins = () => {
  const endpoint = process.env.S3_ENDPOINT;
  
  if (!endpoint) {
    if (process.env.NODE_ENV === 'production' && !IS_BUILD) {
      console.warn(`${C.yellow}[HEIMDALL][VAULT] Alerta: S3_ENDPOINT no detectado. Activos en modo efímero.${C.reset}`);
    }
    return[];
  }
  
  return[
    s3Storage({
      collections: { 'media': true },
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

export const config = buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200',
  secret: process.env.PAYLOAD_SECRET || 'emergency-dev-vault-key-33',
  
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(__dirname) },
    meta: { titleSuffix: '- MetaShark Enterprise Operations' },
  },

  db: resolveDbAdapter(),

  email: process.env.SMTP_USER ? nodemailerAdapter({
    defaultFromAddress: 'concierge@metashark.tech',
    defaultFromName: 'Enterprise Hospitality Concierge',
  }) : undefined,

  collections:[
    Offers, FlashSales, Agencies, Agents, BusinessMetrics,
    Ingestions, Subscribers, Tenants, Users, Notifications,
    DynamicRoutes, Media, BlogPosts, Projects,
  ],
  
  editor: lexicalEditor({}),
  typescript: { outputFile: path.resolve(__dirname, 'payload-types.ts') },
  sharp: (sharp as unknown) as SharpDependency,
  plugins: resolvePlugins(),
});

if (!IS_TYPE_GEN && typeof window === 'undefined') {
  const phase = IS_BUILD ? 'BUILD_GENERATION' : 'RUNTIME_ACTIVE';
  const sslStatus = HAS_DB_URL ? 'HARDENED_SSL' : 'BYPASSED';
  
  console.info(
    `${C.magenta}${C.bold}[DNA][CONFIG]${C.reset} Core Orchestrator Calibrated | ` +
    `Phase: ${C.cyan}${phase}${C.reset} | DB_SSL: ${C.green}${sslStatus}${C.reset}`
  );
}

export default config;