/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Implementa arquitectura Next.js 15 Standard, resolución ESM Estricta
 *              y blindaje de infraestructura para entornos de Vercel.
 * @version 15.0 - TS2835 ESM Compliance & Strict Resolution
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
 * @fix TS2835: El uso de '.js' es OBLIGATORIO en el source cuando 
 * el motor de resolución es 'nodenext' para garantizar la paridad con el output.
 */
import { Users } from './collections/Users.js';
import { BlogPosts } from './collections/BlogPosts.js';
import { Projects } from './collections/Projects.js';
import { Media } from './collections/Media.js';
import { Tenants } from './collections/Tenants.js';

/**
 * DETERMINACIÓN DE PERÍMETRO DE INFRAESTRUCTRURA
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

/**
 * VALIDACIÓN PERIMETRAL DE SECRETO
 */
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('[HEIMDALL][CRITICAL] DATABASE_URL is missing. Production build aborted.');
}

// Protocolo Heimdall: Trazabilidad forense de handshake
console.log(`[HEIMDALL][CMS] Bootstrapping Sovereign Core at: ${BASE_CONFIG_DIR}`);

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
   * @description Sincronización con el motor Sharp para procesamiento de activos visuales.
   */
  sharp: (sharp as unknown) as SharpDependency,

  admin: {
    user: Users.slug,
    /**
     * @description El importMap es crítico para la hidratación de componentes 
     * en el panel administrativo dentro de Next.js 15.
     */
    importMap: { 
      baseDir: BASE_CONFIG_DIR, 
    },
  },

  /**
   * REGISTRO SOBERANO DE COLECCIONES (SSoT)
   * @description Orquesta la base del conocimiento del Hotel, Festival y Journal.
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
  secret: PAYLOAD_SECRET || 'genesis-engine-dev-key',
  
  typescript: {
    /**
     * @pilar III: Inferencia Obligatoria.
     * Generación de tipos sincronizada para el desarrollo Source-First.
     */
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * @pilar VIII: Resiliencia de Persistencia (Supabase Connectivity).
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL || '',
      /** 
       * @description Límites de pool optimizados para el entorno Serverless de Vercel.
       */
      max: 10,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: true } 
        : { rejectUnauthorized: false },
    },
  }),
});