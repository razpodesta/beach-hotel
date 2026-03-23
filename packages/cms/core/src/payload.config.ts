/**
 * @file payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Nivelado: Inyección blindada de dependencias gráficas y 
 *              resolución de rutas para el Monorepo MetaShark.
 * @version 10.0 - Elite Hygiene Edition
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import type { SharpDependency } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import path from 'node:path';
import sharp from 'sharp';

/**
 * IMPORTACIONES ATÓMICAS DE COLECCIONES
 * @pilar V: Adherencia arquitectónica mediante fronteras de módulo Nx.
 */
import { Users } from './collections/Users.js';
import { BlogPosts } from './collections/BlogPosts.js';
import { Projects } from './collections/Projects.js';
import { Media } from './collections/Media.js';

/**
 * DETERMINACIÓN DE DIRECTORIO DE CONFIGURACIÓN
 * @description Asegura la consistencia de rutas absolutas para el importMap de Payload.
 */
const BASE_CONFIG_DIR = path.resolve(process.cwd(), 'packages/cms/core/src');

export default buildConfig({
  /**
   * @pilar VI: Internacionalización de Infraestructura.
   * Orquestación del servicio de mensajería del concierge.
   */
  email: nodemailerAdapter({
    defaultFromAddress: 'admin@beachhotelcanasvieiras.com',
    defaultFromName: 'Sanctuary Concierge Engine',
  }),

  /**
   * @pilar III: Seguridad de Tipos.
   * @pilar IX: Justificación de Escape de Emergencia.
   * @description Se realiza cast a 'unknown' antes de 'SharpDependency' para resolver
   * la incompatibilidad de firmas entre el paquete 'sharp' v0.33+ y las definiciones 
   * internas de Payload CMS 3.0 en entornos de compilación CommonJS.
   */
  sharp: (sharp as unknown) as SharpDependency,

  admin: {
    user: Users.slug,
    /**
     * @description El importMap es crítico para la resolución dinámica de componentes 
     * en el panel administrativo dentro de Next.js 15.
     */
    importMap: { 
      baseDir: BASE_CONFIG_DIR, 
    },
  },

  // Registro Soberano de Colecciones
  collections: [Users, BlogPosts, Projects, Media],
  
  // Motor de Texto Enriquecido Estándar
  editor: lexicalEditor({}),
  
  /**
   * @pilar X: Configuración Segura.
   * Fuente única de verdad para el secreto de sesión.
   */
  secret: process.env.PAYLOAD_SECRET || 'genesis-engine-secret-key-2026',
  
  typescript: {
    // Generación automatizada de tipos para sincronización frontend/backend
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  /**
   * @pilar VIII: Resiliencia de Persistencia (Supabase Pooler Sync).
   */
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      /** 
       * @description Protocolo SSL forzado para producción y relajado para 
       * conectividad de desarrollo local.
       */
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: true } 
        : { rejectUnauthorized: false },
    },
  }),
});