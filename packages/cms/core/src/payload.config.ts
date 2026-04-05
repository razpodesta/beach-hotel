/**
 * @file packages/cms/core/src/payload.config.ts
 * @version 43.1 - Enterprise Build-Safe Standard
 * @description Orquestador central del Ecosistema MetaShark.
 *              Optimizado para ciclos de vida de build, generación de tipos 
 *              determinista y resiliencia de conexión.
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

// Importación directa de colecciones
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

// --- LÓGICA DE DETECCIÓN DE MODO ---
const isProduction = process.env.NODE_ENV === 'production';
const isGeneration = process.env.PAYLOAD_GENERATE === 'true';

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'enterprise-vault-2026-master-key',
  
  admin: {
    user: 'users',
    importMap: { 
      baseDir: path.resolve(__dirname),
    },
    meta: { titleSuffix: '- MetaShark Enterprise Operations' }
  },

  /**
   * MOTOR DE BASE DE DATOS SOBERANO
   * @fix TS2322: Se utiliza un adaptador PostgreSQL incluso en modo generación, 
   * pero con la cadena de conexión vacía y 'push: false' para evitar cualquier 
   * intento de conexión real o migración accidental.
   */
  db: postgresAdapter({
    pool: {
      connectionString: isGeneration ? 'postgres://dummy:dummy@localhost:5432/dummy' : (process.env.DATABASE_URL || ''),
      max: isGeneration ? 1 : 10,
      ssl: { rejectUnauthorized: false },
    },
    idType: 'uuid',
    push: !isProduction && !isGeneration,
  }),

  email: process.env.SMTP_USER ? nodemailerAdapter({
    defaultFromAddress: 'concierge@metashark.tech',
    defaultFromName: 'Enterprise Hospitality Concierge',
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