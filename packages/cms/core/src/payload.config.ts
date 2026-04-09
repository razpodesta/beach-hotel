/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador Maestro del Ecosistema de Datos MetaShark.
 *              Refactorizado: Implementación de "Cold-Start Config" para blindar 
 *              el análisis del grafo de Nx y el build estático de Vercel.
 *              Nivelado: Aislamiento total de I/O durante la evaluación estática.
 * @version 49.0 - Cold-Start Discovery & Next.js 15 Native
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
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 * @pilar VIII: Resiliencia de Build.
 */
const IS_GENERATION = process.env.PAYLOAD_GENERATE === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const HAS_DB = !!process.env.DATABASE_URL;

// Constantes cromáticas para Logs (Solo se activan en modo runtime)
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

/**
 * FACTORÍA DE ADAPTADOR DE BASE DE DATOS
 * @description Implementa bypass de sockets durante el descubrimiento del grafo.
 */
const resolveDbAdapter = () => {
  if (IS_GENERATION || !HAS_DB) {
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
    push: !IS_PRODUCTION,
  });
};

/**
 * FACTORÍA DE PLUGINS CLOUD
 * @description Evita la carga de SDKs externos si no hay secretos presentes.
 */
const resolvePlugins = () => {
  if (!process.env.S3_ENDPOINT || IS_GENERATION) {
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
};

/**
 * @description Orquestación Maestra de Configuración.
 * @pilar IX: Desacoplamiento de Infraestructura.
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
   * @fix Pilar III: Compatibilidad de tipos para el motor Sharp.
   */
  sharp: (sharp as unknown) as SharpDependency,

  plugins: resolvePlugins(),
});

// Telemetría de Montaje: Solo visible si no estamos en fase de generación silenciosa
if (!IS_GENERATION && process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}${C.bold}[DNA][CONFIG]${C.reset} SSoT Orquestador calibrado.`);
}

export default config;