/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Refactorizado: Implementa el Protocolo de Infraestructura Nivel 0
 *              blindado para erradicar fallos de TLS en entornos Vercel.
 * @version 25.0 - Hardened SSL Protocol (Fix: SELF_SIGNED_CERT_IN_CHAIN)
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * 1. PROTOCOLO DE INFRAESTRUCTRURA NIVEL 0 (Early Initialization)
 * @pilar VIII: Resiliencia de Persistencia.
 * @description Inyectamos la configuración de red en el proceso global de Node.js
 * antes de que cualquier importación de módulo (como 'pg') instancie el pool.
 */
(function initializeSovereignNetwork() {
  const isVercel = process.env.VERCEL === '1';
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isVercel || isBuild) {
    // Protocolo de emergencia para certificados auto-firmados en Poolers
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    process.env.PGSSLMODE = 'no-verify';
    
    // Telemetría inmediata de bajo nivel
    console.log('[HEIMDALL][L0] SSL Infrastructure Bypass: ENGAGED');
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
 * SANEAMIENTO DE CADENA DE CONEXIÓN (Industrial Grade)
 * @description Garantiza que los parámetros de bypass viajen en la URI.
 */
if (DATABASE_URL) {
  try {
    const url = new URL(DATABASE_URL);
    // Forzamos compatibilidad con el pooler transaccional de Supabase
    url.searchParams.set('uselibpqcompat', 'true');
    url.searchParams.set('sslmode', 'no-verify'); 
    DATABASE_URL = url.toString();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown URI Drift';
    console.error(`[HEIMDALL][CRITICAL] Database URI corruption detected: ${msg}`);
  }
}

/**
 * TELEMETRÍA DE ARRANQUE (Pilar IV)
 */
console.group('[HEIMDALL][INFRA] Sovereign Engine Bootstrap');
console.log(`[CORE] Payload 3.0 Lifecycle`);
console.log(`[CORE] DB Status: ${DATABASE_URL ? 'URI_RESOLVED' : 'MISSING'}`);
console.groupEnd();

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('[CRITICAL] SSoT Failure: DATABASE_URL is mandatory for production.');
}

export default buildConfig({
  /**
   * @pilar VI: Internacionalización de Infraestructura.
   */
  email: nodemailerAdapter({
    defaultFromAddress: 'admin@beachhotelcanasvieiras.com',
    defaultFromName: 'Sanctuary Concierge Engine',
  }),

  /**
   * @pilar III: Seguridad de Tipos & IX: Escape de Emergencia.
   */
  sharp: (sharp as unknown) as SharpDependency,

  admin: {
    user: Users.slug,
    importMap: { 
      baseDir: BASE_CONFIG_DIR, 
    },
  },

  // Registro Soberano de Colecciones (SSoT)
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
   * CAPA DE PERSISTENCIA (Supabase Transaction Pooler Support)
   * @pilar VIII: Resiliencia de Persistencia.
   * @description Configuramos el pooler con el objeto SSL explícito para Next.js 15.
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      /** 
       * @description Blindaje total contra certificados auto-firmados.
       * Esta configuración es innegociable para builds exitosos en Vercel.
       */
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
});