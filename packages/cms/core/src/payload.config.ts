/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Nivelado: Implementa el Protocolo de Conexión Industrial para 
 *              Vercel, forzando la compatibilidad de certificados SSL.
 * @version 21.0 - Full Build-Time DB Synchronization
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
 * @description Los poolers de Supabase requieren parámetros específicos para 
 *              evitar errores de TLS 'self-signed certificate' en entornos CI.
 */
if (DATABASE_URL) {
  const url = new URL(DATABASE_URL);
  
  // Forzamos compatibilidad con libpq y desactivamos validación estricta de cadena
  url.searchParams.set('uselibpqcompat', 'true');
  url.searchParams.set('sslmode', 'no-verify'); // Nivelación agresiva para Build-Time
  
  DATABASE_URL = url.toString();
}

console.group('[HEIMDALL][CMS] Sovereign Boot Sequence');
if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('[CRITICAL] SSoT Failure: Connection String is mandatory.');
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
       * @description Fallback de seguridad para el driver 'pg'. 
       *              Garantiza que el handshake ocurra incluso si 
       *              la CA no está en el store de Vercel.
       */
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
});