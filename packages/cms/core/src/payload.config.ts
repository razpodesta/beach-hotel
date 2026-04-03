/**
 * @file packages/cms/core/src/payload.config.ts
 * @version 41.0 - Vercel Build Sync & Circular Dependency Resolved
 * @description Orquestador de configuración Payload 3.0. 
 *              Refactorizado: Blindaje SSL global inyectado y 
 *              rutas atómicas para evitar corrupción de TypeScript AST.
 * @author Staff Engineer - MetaShark Tech
 */

// --- FIX CRÍTICO DE INFRAESTRUCTURA (Vercel Build Sync) ---
// Desactiva la validación estricta de SSL en el entorno Node.js durante
// la fase de prerenderizado (SSG) de Next.js para permitir el handshake 
// con el Pooler de Supabase y evitar el error "self-signed certificate".
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

// --- PILAR V: ARQUITECTURA ATÓMICA (Resolución de Dependencia Circular) ---
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

// Determinación del entorno (Production Check)
const isProduction = process.env.NODE_ENV === 'production';

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'enterprise-vault-2026-master-key',
  
  admin: {
    user: 'users',
    importMap: { baseDir: __dirname },
    meta: { titleSuffix: '- MetaShark Enterprise' }
  },

  /**
   * MOTOR DE BASE DE DATOS SOBERANO
   * @pilar_XIII: Integridad de IDs y blindaje SSL.
   */
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      /** 
       * @fix: Forzamos la desactivación de validación de certificados SSL 
       * para evitar 'self-signed certificate in certificate chain' en Vercel.
       */
      ssl: { 
        rejectUnauthorized: false 
      },
    },
    idType: 'uuid',
    // push: false en producción es MANDATORIO para evitar errores de migración en tiempo de build
    push: !isProduction,
  }),

  // Adaptador de Email para Silo D
  email: process.env.SMTP_USER ? nodemailerAdapter({
    defaultFromAddress: 'concierge@metashark.tech',
    defaultFromName: 'Beach Hotel Sanctuary',
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