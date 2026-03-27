/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador Soberano de Configuración para Payload CMS 3.0.
 *              Implementa arquitectura Next.js 15 Standard, resolución híbrida
 *              resiliente y optimización de infraestructura para Vercel.
 * @version 18.0 - Strict NodeNext Compliance (TS2835 Fixed)
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
 * @fix Resolución del error TS2835. Se inyectan las extensiones .js 
 *      obligatorias para el estándar ESM/nodenext. El bundler de Next.js 
 *      las resolverá transparentemente hacia los archivos .ts subyacentes.
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
 * VALIDACIÓN PERIMETRAL DE SECRETOS (Pilar X)
 */
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

// Protocolo Heimdall: Trazabilidad forense de salud de entorno
console.group('[HEIMDALL][CMS] Sovereign Boot Protocol');
console.log(`Core_Path: ${BASE_CONFIG_DIR}`);
console.log(`Runtime: ${process.env.NODE_ENV}`);
if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.error('[CRITICAL] Missing DATABASE_URL in Vercel.');
  throw new Error('SSoT Failure: Infrastructure secrets missing.');
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
   * Sincronización con el motor Sharp para procesamiento de activos visuales.
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
  collections:[
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
     */
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * @pilar VIII: Resiliencia de Persistencia.
   * @pilar X: Optimización para latencias de pooler detectadas (>4s).
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL || '',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000, // Margen de seguridad incrementado
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: true } 
        : { rejectUnauthorized: false },
    },
  }),
});