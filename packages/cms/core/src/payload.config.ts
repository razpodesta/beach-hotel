/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador Soberano de Configuración para Payload CMS 3.0.
 *              Implementa arquitectura Next.js 15 Standard, resolución ESM Estricta,
 *              optimización de pool para latencias altas y blindaje de infraestructura.
 * @version 16.0 - Forensic Health Sync & Pool Optimization
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
 * IMPORTACIONES ATÓMICAS DE COLECCIONES (Strict ESM)
 * @pilar V: Adherencia Arquitectónica. 
 * @fix TS2835: Sincronización obligatoria de extensiones físicas .js.
 */
import { Users } from './collections/Users.js';
import { BlogPosts } from './collections/BlogPosts.js';
import { Projects } from './collections/Projects.js';
import { Media } from './collections/Media.js';
import { Tenants } from './collections/Tenants.js';

/**
 * DETERMINACIÓN DE PERÍMETRO DE INFRAESTRUCTRURA (ESM Protocol)
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

/**
 * VALIDACIÓN PERIMETRAL DE SECRETOS (Pilar X)
 */
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

// Protocolo Heimdall: Trazabilidad forense de handshake y salud de entorno
console.group('[HEIMDALL][CMS] Sovereign Boot Protocol');
console.log(`Core_Engine_Path: ${BASE_CONFIG_DIR}`);
console.log(`Node_Runtime: ${process.version}`);
console.log(`Supabase_URL_Presence: ${!!DATABASE_URL}`);
if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.error('[CRITICAL] Missing DATABASE_URL in Vercel. Process halted.');
  throw new Error('SSoT Failure: Missing infrastructure secrets.');
}
console.groupEnd();

export default buildConfig({
  /**
   * @pilar VI: Internacionalización de Infraestructura.
   * Centraliza la identidad comunicacional del Santuario.
   */
  email: nodemailerAdapter({
    defaultFromAddress: 'admin@beachhotelcanasvieiras.com',
    defaultFromName: 'Sanctuary Concierge Engine',
  }),

  /**
   * @pilar III: Seguridad de Tipos & IX: Escape de Emergencia.
   * @description Sincronización robusta con el motor de procesamiento Sharp.
   */
  sharp: (sharp as unknown) as SharpDependency,

  admin: {
    user: Users.slug,
    /**
     * @description El importMap es el cimiento de la hidratación de componentes 
     * en el panel administrativo dentro del runtime de Next.js 15.
     */
    importMap: { 
      baseDir: BASE_CONFIG_DIR, 
    },
  },

  /**
   * REGISTRO SOBERANO DE COLECCIONES (SSoT)
   * Orquesta la base del conocimiento del Hotel, Festival y Journal.
   */
  collections: [
    Users, 
    BlogPosts, 
    Projects, 
    Media, 
    Tenants
  ],
  
  /**
   * MOTOR EDITORIAL (RSC Compatible)
   */
  editor: lexicalEditor({}),
  
  /**
   * @pilar X: Configuración Segura.
   */
  secret: PAYLOAD_SECRET || 'genesis-engine-dev-vault',
  
  typescript: {
    /**
     * @pilar III: Inferencia Obligatoria.
     * Generación de tipos sincronizada para el desarrollo Source-First.
     */
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * @pilar VIII: Resiliencia de Persistencia.
   * @pilar X: Optimización para entornos Serverless (Vercel).
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL || '',
      /** 
       * @description Ajuste basado en auditoría forense: 
       * Se incrementan los timeouts para compensar latencias de pooler > 4s.
       */
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: true } 
        : { rejectUnauthorized: false },
    },
  }),
});