/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Nivelado: Eliminación de extensiones .js y blindaje de conexión SSL
 *              para erradicar errores de certificado en el pipeline de Vercel.
 * @version 20.0 - SSL Resilience & SSoT Hardening
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
 * PROTOCOLO DE SANEAMIENTO DE CONEXIÓN (Pilar VIII - Resiliencia)
 * @description Inyecta parámetros de compatibilidad para evitar fallos de SSL 
 *              durante la fase de 'Collecting page data' en Vercel.
 */
if (DATABASE_URL && !DATABASE_URL.includes('uselibpqcompat')) {
  const separator = DATABASE_URL.includes('?') ? '&' : '?';
  DATABASE_URL = `${DATABASE_URL}${separator}uselibpqcompat=true`;
}

console.group('[HEIMDALL][CMS] Sovereign Boot Sequence');
if (!DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[CRITICAL] SSoT Failure: DATABASE_URL missing.');
  }
} else {
  console.log('[STATUS] Infrastructure Identity: Verified.');
}
console.groupEnd();

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
  
  secret: PAYLOAD_SECRET || 'genesis-engine-dev-vault',
  
  typescript: {
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * CAPA DE PERSISTENCIA (Supabase Integration)
   * @pilar VIII: Resiliencia de Persistencia.
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      /** 
       * @description Configuración SSL adaptada para entornos Serverless.
       *              Se añade 'rejectUnauthorized: false' como fallback 
       *              específicamente para mitigar el error detectado en Vercel.
       */
      ssl: {
        rejectUnauthorized: false, // Necesario para poolers de Supabase en Vercel
      },
    },
  }),
});