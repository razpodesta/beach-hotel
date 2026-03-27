/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Refactorizado: Protocolo de Persistencia Indestructible para 
 *              entornos Vercel + Supabase Transaction Pooler.
 * @version 26.0 - Indestructible Data Layer (Fix: SSG DB Refusal)
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
    // Protocolo de emergencia para certificados auto-firmados y Poolers
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    process.env.PGSSLMODE = 'no-verify';
    
    // Telemetría inmediata de bajo nivel
    console.log('[HEIMDALL][L0] Infrastructure Network Bypass: ENGAGED');
  }
})();

import { buildConfig } from 'payload';
import type { SharpDependency } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
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

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
let DATABASE_URL = process.env.DATABASE_URL || '';

/**
 * SANEAMIENTO DE CADENA DE CONEXIÓN (Indestructible Mode)
 * @description Asegura que el pooler de Supabase no rechace las queries de SSG.
 */
if (DATABASE_URL) {
  try {
    const url = new URL(DATABASE_URL);
    
    // Si estamos usando el pooler (6543), forzamos pgbouncer mode para evitar errores de prepared statements
    if (url.port === '6543') {
      url.searchParams.set('pgbouncer', 'true');
      url.searchParams.set('uselibpqcompat', 'true');
    }
    
    url.searchParams.set('sslmode', 'no-verify'); 
    DATABASE_URL = url.toString();
  } catch (err: unknown) {
    console.error(`[HEIMDALL][CRITICAL] Database URI corruption detected.`);
  }
}

/**
 * TELEMETRÍA DE ARRANQUE (Pilar IV)
 */
console.group('[HEIMDALL][INFRA] Sovereign Engine Bootstrap');
console.log(`[CORE] Payload 3.0 Standard`);
console.log(`[CORE] DB Connection: ${DATABASE_URL.includes('6543') ? 'TRANSACTION_POOLER' : 'DIRECT_PORT'}`);
console.groupEnd();

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('[CRITICAL] SSoT Failure: DATABASE_URL is mandatory.');
}

export default buildConfig({
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
  },

  collections: [
    Users, 
    BlogPosts, 
    Projects, 
    Media, 
    Tenants
  ],
  
  editor: lexicalEditor({}),
  
  secret: PAYLOAD_SECRET || 'genesis-engine-production-vault-2026',
  
  typescript: {
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * CAPA DE PERSISTENCIA (Supabase Resilient Configuration)
   * @pilar VIII: Resiliencia de Persistencia.
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      /**
       * CONFIGURACIÓN DE POOL PARA VERCEL (Serverless Limits)
       * max: 10 evita el colapso de "too many clients" en Supabase Free Tier.
       * idleTimeoutMillis: Permite que las conexiones mueran rápido tras el SSG.
       */
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    /**
     * @description Desactivamos el push de esquema automático durante el build
     * para evitar bloqueos por latencia de red en Vercel.
     */
    push: false,
  }),
});