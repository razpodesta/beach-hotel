/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Nivelado: Eliminación de extensiones .js para compatibilidad total
 *              con el motor de resolución de Next.js 15 y el pipeline de Vercel.
 * @version 19.0 - Vercel Build Resolution Fix (Pure Source-First)
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
 * @nivelación: Se eliminan extensiones .js para permitir que el bundler 
 * de Next.js gestione la resolución sobre el código fuente (.ts).
 */
import { Users } from './collections/Users';
import { BlogPosts } from './collections/BlogPosts';
import { Projects } from './collections/Projects';
import { Media } from './collections/Media';
import { Tenants } from './collections/Tenants';

/**
 * DETERMINACIÓN DE PERÍMETRO DE INFRAESTRUCTRURA (SSoT)
 * Garantiza consistencia de rutas en entornos distribuidos (Vercel/Docker).
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

/**
 * AUDITORÍA DE SECRETOS (Heimdall Protocol)
 * @pilar X: Configuración Segura.
 */
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

console.group('[HEIMDALL][CMS] Sovereign Boot Sequence');
if (!DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[CRITICAL] SSoT Failure: DATABASE_URL is missing in production.');
  }
  console.warn('[INFRA] Warning: DATABASE_URL not detected. Operating in degraded mode.');
} else {
  console.log('[STATUS] Infrastructure Identity: Verified.');
}
console.groupEnd();

export default buildConfig({
  /**
   * INTERNACIONALIZACIÓN DE INFRAESTRUCTRURA (i18n)
   * @pilar VI: i18n Nativa.
   */
  email: nodemailerAdapter({
    defaultFromAddress: 'admin@beachhotelcanasvieiras.com',
    defaultFromName: 'Sanctuary Concierge Engine',
  }),

  /**
   * MOTOR DE PROCESAMIENTO DE IMÁGENES
   * @pilar III: Seguridad de Tipos & IX: Escape de Emergencia.
   */
  sharp: (sharp as unknown) as SharpDependency,

  admin: {
    user: Users.slug,
    /**
     * @description El importMap es vital para la hidratación de componentes
     * en el panel administrativo dentro de Next.js 15.
     */
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
  
  // Motor de Texto Enriquecido Estándar del Ecosistema
  editor: lexicalEditor({}),
  
  secret: PAYLOAD_SECRET || 'genesis-engine-dev-vault',
  
  typescript: {
    // Generación de tipos sincronizada para el desarrollo Source-First
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * CAPA DE PERSISTENCIA (Supabase Integration)
   * @pilar VIII: Resiliencia de Persistencia.
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL || '',
      /** 
       * @description Protocolo SSL flexible para compatibilidad con poolers 
       * de Supabase en entornos locales y de producción.
       */
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: true } 
        : { rejectUnauthorized: false },
    },
  }),
});