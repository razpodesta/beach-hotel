/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Enterprise Operations Orchestrator (The Master Engine).
 *              Punto de entrada único para la configuración de Payload CMS 3.0.
 *              Orquesta la integración de los 5 Silos Industriales, el clúster
 *              de almacenamiento S3 y el motor de identidad corporativa.
 * @version 38.0 - Enterprise Level 4.0 | MetaConfig Payload 3.0 Sync
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. INFRASTRUCTURE PROTOCOL L0 (Early Initialization)
 * @description Protocolo de bypass de red para entornos de construcción y despliegue.
 */
(function initializeEnterpriseNetwork() {
  const isVercelNode = process.env.VERCEL === '1';
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isVercelNode || isBuildPhase) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    process.env.PGSSLMODE = 'no-verify';
    console.log('[SYSTEM][L0] Infrastructure Network Bypass: ACTIVE');
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
 * ENTERPRISE COLLECTION REGISTRY (Strategic Business Units)
 * @pilar IX: Modularización por Dominio de Negocio.
 */

// SBU 1: Intelligence & CRM (Ingestion Pipeline)
import { Ingestions } from './collections/Ingestions';
import { Subscribers } from './collections/Subscribers';

// SBU 2: Partner Network & PRM (B2B Hub)
import { Agencies } from './collections/Agencies';
import { Agents } from './collections/Agents';
import { BusinessMetrics } from './collections/BusinessMetrics';

// SBU 3: Revenue Engine (Sales Operations)
import { Offers } from './collections/Offers';
import { FlashSales } from './collections/FlashSales';

// SBU 4: Asset Library (Editorial & Engineering)
import { Media } from './collections/Media';
import { BlogPosts } from './collections/BlogPosts';
import { Projects } from './collections/Projects';

// SBU 5: Core Infrastructure (Identity & Logs)
import { Tenants } from './collections/Tenants';
import { Users } from './collections/Users';
import { Notifications } from './collections/Notifications'; // <-- NUEVO LEDGER OPERATIVO
import { DynamicRoutes } from './collections/DynamicRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

/** ENVIRONMENT & CLUSTER RESOLUTION */
const SERVER_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL || '';

/** STARTUP TELEMETRY (Heimdall Forensic Report) */
console.group('[SYSTEM][ORCHESTRATOR] Enterprise Core v38.0 Booting');
console.log(`[TARGET] Node_Host: ${SERVER_URL}`);
console.log(`[STATUS] All SBUs Linked | S3_Storage: READY`);
console.groupEnd();

export default buildConfig({
  serverURL: SERVER_URL,
  email: nodemailerAdapter(),

  admin: {
    user: Users.slug,
    importMap: { baseDir: BASE_CONFIG_DIR },
    /**
     * @pilar III: Seguridad de Tipos Absoluta.
     * Adaptación al contrato MetaConfig de Payload 3.0 (Uso de array 'icons').
     */
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

  /** 
   * MASTER COLLECTIONS REGISTRY
   * Ordenado por jerarquía de dependencia para asegurar integridad referencial.
   */
  collections: [
    // --- Silo A: Revenue ---
    Offers,
    FlashSales,
    
    // --- Silo B: Partners ---
    Agencies,
    Agents,
    BusinessMetrics,
    
    // --- Silo C: Intelligence ---
    Ingestions,
    Subscribers,
    
    // --- Silo D: Infrastructure ---
    Tenants,
    Users,
    Notifications,
    DynamicRoutes,
    
    // --- Asset Content ---
    Media,
    BlogPosts,
    Projects,
  ],
  
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'enterprise-vault-2026-master-key',
  
  typescript: {
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },

  /**
   * DB ADAPTER: Postgres Core
   * Configurado para soportar el Transaction Pooler de Supabase (Puerto 6543).
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
  }),

  sharp: (sharp as unknown) as SharpDependency,

  /**
   * STORAGE CLUSTER: Multi-Collection S3 Sync
   * Centraliza los binarios industriales en el Bucket Soberano.
   */
  plugins: [
    ...(process.env.S3_ENDPOINT ? [
      s3Storage({
        collections: { 
          media: true,      // Activos generales
          offers: true,     // Imágenes de paquetes
          'flash-sales': true, 
          agencies: true,   // Logotipos White-Label
          ingestions: true  // XLSX, Audios y Capturas del Pipeline
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