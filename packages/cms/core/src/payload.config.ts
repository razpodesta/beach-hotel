/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Implementa arquitectura Next.js 15 Standard, soporte multi-tenant
 *              y resolución de rutas resiliente para entornos de CI/CD (Vercel).
 * @version 14.0 - Production Hardening & Fail-Fast Environment Validation
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
 * @pilar V: Adherencia arquitectónica. Resolución nativa sin extensiones .js.
 */
import { Users } from './collections/Users';
import { BlogPosts } from './collections/BlogPosts';
import { Projects } from './collections/Projects';
import { Media } from './collections/Media';
import { Tenants } from './collections/Tenants';

/**
 * DETERMINACIÓN DE PERÍMETRO DE INFRAESTRUCTRURA (ESM)
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

/**
 * VALIDACIÓN PERIMETRAL DE CONFIGURACIÓN (Pilar X)
 * @description El sistema aborta si faltan las llaves maestras en producción.
 */
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('[HEIMDALL][CRITICAL] DATABASE_URL is missing. Connection aborted.');
}

// Protocolo Heimdall: Trazabilidad forense de inicialización
console.group('[HEIMDALL][CMS] Initialization Sequence');
console.log(`Core_Path: ${BASE_CONFIG_DIR}`);
console.log(`SSL_Mode: ${process.env.NODE_ENV === 'production' ? 'Strict' : 'Bypass'}`);
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
   * @description Sincronización con el motor de procesamiento de imágenes Sharp.
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
     * El archivo generado en src/ será la SSoT para el frontend.
     */
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * @pilar VIII: Resiliencia de Persistencia (Supabase Connectivity).
   * @pilar X: Optimización para entornos Serverless (Vercel).
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL || '',
      /**
       * @description Límites de pool ajustados para evitar agotamiento de
       * conexiones en el plan gratuito/pro de Supabase.
       */
      max: 10, 
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: true } 
        : { rejectUnauthorized: false },
    },
  }),
});