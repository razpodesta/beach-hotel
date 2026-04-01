/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Enterprise Operations Orchestrator (The Master Engine).
 *              Punto de entrada único para la configuración de Payload CMS 3.0.
 *              Orquesta la integración de los 5 Silos Industriales, el clúster
 *              de almacenamiento S3 y el motor de identidad corporativa.
 * @version 39.0 - Enterprise Level 4.0 | Email Adapter Resilience
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. INFRASTRUCTURE PROTOCOL L0 (Early Initialization)
 */
(function initializeEnterpriseNetwork() {
  const isVercelNode = process.env.VERCEL === '1';
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isVercelNode || isBuildPhase) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    process.env.PGSSLMODE = 'no-verify';
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

// Importación de Colecciones
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
import { Users } from './collections/Users';
import { Notifications } from './collections/Notifications';
import { DynamicRoutes } from './collections/DynamicRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

const SERVER_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL || '';

/**
 * @description Inyector condicional de adaptador de correo.
 * Previene errores de red (ENOTFOUND) durante el seeding o falta de configuración.
 */
const getEmailAdapter = () => {
  if (process.env.IS_SEEDING_MODE === 'true' || !process.env.SMTP_USER) {
    return undefined; // Deshabilita el servicio de email si no es crítico
  }
  return nodemailerAdapter({
    defaultFromAddress: 'concierge@metashark.tech',
    defaultFromName: 'Beach Hotel Sanctuary',
    // Configuración real via variables de entorno
  });
};

export default buildConfig({
  serverURL: SERVER_URL,
  email: getEmailAdapter(),

  admin: {
    user: Users.slug,
    importMap: { baseDir: BASE_CONFIG_DIR },
    meta: { 
      titleSuffix: '- MetaShark Enterprise Operations',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/images/hotel/icon-192x192.png',
        }
      ]
    }
  },

  collections: [
    Offers, FlashSales, Agencies, Agents, BusinessMetrics,
    Ingestions, Subscribers, Tenants, Users, Notifications,
    DynamicRoutes, Media, BlogPosts, Projects,
  ],
  
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'enterprise-vault-2026-master-key',
  
  typescript: {
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
  }),

  sharp: (sharp as unknown) as SharpDependency,

  plugins: [
    ...(process.env.S3_ENDPOINT ? [
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
    ] : []),
  ],
});