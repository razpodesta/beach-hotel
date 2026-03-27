/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Nivelado: Implementa el Protocolo de Conexión Industrial para 
 *              Vercel y corrige avisos de linting en el bloque de captura.
 * @version 23.0 - Lint Hygiene & Forensic Observability (Fix: SELF_SIGNED_CERT_IN_CHAIN)
 * @author Raz Podestá - MetaShark Tech
 */

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
 * @pilar V: Adherencia Arquitectónica.
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
 * PROTOCOLO DE CONEXIÓN INDUSTRIAL (Pilar VIII - Resiliencia)
 * @description Forzado de seguridad para el driver 'pg' nativo.
 * Soluciona el error SELF_SIGNED_CERT_IN_CHAIN en Vercel.
 */
if (DATABASE_URL) {
  // Forzamos al driver PG a nivel de proceso para máxima compatibilidad
  process.env.PGSSLMODE = 'no-verify';

  try {
    const url = new URL(DATABASE_URL);
    // Aseguramos compatibilidad con el pooler de Supabase
    url.searchParams.set('uselibpqcompat', 'true');
    url.searchParams.set('sslmode', 'no-verify'); 
    DATABASE_URL = url.toString();
  } catch (err: unknown) {
    /**
     * @pilar IV: Observabilidad Forense.
     * @fix Erradicación de variable no usada. Se reporta el motivo técnico de la caída.
     */
    const message = err instanceof Error ? err.message : 'Unknown URL structure';
    console.error(`[HEIMDALL][CRITICAL] Malformed DATABASE_URL: ${message}`);
  }
}

console.group('[HEIMDALL][CMS] Sovereign Boot Sequence');
console.log(`[INFRA] Mode: ${process.env.NODE_ENV}`);
console.log(`[INFRA] Database URI: ${DATABASE_URL ? 'PRESENT' : 'MISSING'}`);

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.groupEnd();
  throw new Error('[CRITICAL] SSoT Failure: Connection String is mandatory for production build.');
}
console.groupEnd();

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
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      /** 
       * @description Configuración de objeto SSL explícita.
       * Vercel requiere que el driver 'pg' ignore activamente la validación
       * de la cadena de certificados para poolers transaccionales.
       */
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
});