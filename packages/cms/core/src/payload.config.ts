/**
 * @file payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Nivelado: Integración de la colección Tenants para evitar 
 *              regresiones de esquema (borrado de tablas) en Supabase.
 * @version 12.0 - Multi-Tenant Integration & Path Resilience
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
 * @pilar V: Adherencia arquitectónica. Uso de extensiones .js obligatorio por 'nodenext'.
 */
import { Users } from './collections/Users.js';
import { BlogPosts } from './collections/BlogPosts.js';
import { Projects } from './collections/Projects.js';
import { Media } from './collections/Media.js';
import { Tenants } from './collections/Tenants.js'; // <-- INYECCIÓN DE RESCATE

/**
 * DETERMINACIÓN DE DIRECTORIO DE CONFIGURACIÓN
 * @description Garantiza la consistencia de rutas absolutas para el importMap 
 * incluso en entornos de ejecución distribuidos (Vercel/Docker).
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

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
   * @description Resolución de incompatibilidad de tipos Sharp v0.33+ en Payload 3.0.
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

  // Registro Soberano de Colecciones (SSoT)
  // Se añade Tenants para validar el cimiento multi-propiedad.
  collections: [Users, BlogPosts, Projects, Media, Tenants],
  
  // Motor de Texto Enriquecido Estándar del Ecosistema
  editor: lexicalEditor({}),
  
  /**
   * @pilar X: Configuración Segura.
   */
  secret: process.env.PAYLOAD_SECRET || 'genesis-engine-secret-key-2026',
  
  typescript: {
    // Generación de tipos sincronizada para el desarrollo Source-First
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * @pilar VIII: Resiliencia de Persistencia (Supabase Connectivity).
   */
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
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