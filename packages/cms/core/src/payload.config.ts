/**
 * @file packages/cms/core/src/payload.config.ts
 * @version 42.1 - Build-Safe ImportMap Resolution
 * @description Orquestador de configuración Payload 3.0. 
 *              Refactorizado para resolver conflictos de resolución de módulos en el monorepo Nx
 *              y garantizar la generación determinista de tipos e importMap.
 * @author Staff Engineer - MetaShark Tech
 */

// --- FIX CRÍTICO: Handshake SSL para Vercel Build Worker ---
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
 * IMPORTACIONES DE COLECCIONES (Arquitectura Atómica)
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
import { Users } from './collections/Users';
import { Notifications } from './collections/Notifications';
import { DynamicRoutes } from './collections/DynamicRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'enterprise-vault-2026-master-key',
  
  admin: {
    user: 'users',
    /** 
     * @fix Determinismo de ImportMap: 
     * Apuntamos al directorio actual para asegurar que Payload 
     * encuentre el contexto del monorepo.
     */
    importMap: { 
      baseDir: path.resolve(__dirname),
    },
    meta: { titleSuffix: '- MetaShark Enterprise' }
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 10,
      idleTimeoutMillis: 30000,
      ssl: { 
        rejectUnauthorized: false 
      },
    },
    idType: 'uuid',
    push: !isProduction,
  }),

  email: process.env.SMTP_USER ? nodemailerAdapter({
    defaultFromAddress: 'concierge@metashark.tech',
    defaultFromName: 'Beach Hotel Sanctuary',
  }) : undefined,

  collections: [
    Offers, 
    FlashSales, 
    Agencies, 
    Agents, 
    BusinessMetrics,
    Ingestions, 
    Subscribers, 
    Tenants, 
    Users, 
    Notifications,
    DynamicRoutes, 
    Media, 
    BlogPosts, 
    Projects,
  ],
  
  editor: lexicalEditor({}),
  
  typescript: {
    /** 
     * @fix: Generación de tipos determinista. 
     * Apuntar directamente al directorio raíz del paquete facilita 
     * la resolución por parte del compilador global.
     */
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  sharp: (sharp as unknown) as SharpDependency,

  plugins: [
    ...(process.env.S3_ENDPOINT ? [
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
    ] : []),
  ],
});