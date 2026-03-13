/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Configuración central soberana de Payload CMS 3.0.
 *              Orquesta la persistencia en Supabase/Postgres y el esquema de datos.
 * @version 1.8 - Bundler Compatibility & Path Normalization
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';

/**
 * IMPORTACIONES DE COLECCIONES
 * @pilar III: Seguridad de Tipos Absoluta.
 * Se eliminan extensiones explícitas (.js) para garantizar que el Bundler 
 * de Next.js 15 en Vercel resuelva correctamente los archivos fuente (.ts).
 */
import { Users, BlogPosts, Projects } from './collections';

/**
 * GUARDIÁN DE CONFIGURACIÓN (Pilar X)
 * Validación de integridad de infraestructura antes del arranque (Fail-Fast).
 */
const { DATABASE_URL, PAYLOAD_SECRET } = process.env;

if (!DATABASE_URL || !PAYLOAD_SECRET) {
  throw new Error(
    `[CMS-CORE][CRITICAL] Variables de entorno faltantes: ${
      !DATABASE_URL ? 'DATABASE_URL ' : ''
    }${!PAYLOAD_SECRET ? 'PAYLOAD_SECRET' : ''}`
  );
}

/**
 * RESOLUCIÓN DE RUTA BASE SOBERANA
 * @pilar V: Adherencia Arquitectónica.
 */
const serverDir = process.cwd();

/**
 * CONFIGURACIÓN SOBERANA
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    /**
     * Gestión de Mapa de Importaciones (Payload 3.0 Standard)
     * Crucial para el desacoplamiento de Server/Client en Next.js 15.
     */
    importMap: {
      baseDir: path.resolve(serverDir, 'packages/cms/core'),
    },
    meta: {
      titleSuffix: '| MetaShark CMS',
    },
  },

  // SSoT: Definición de colecciones soberanas del ecosistema
  collections: [Users, BlogPosts, Projects],

  // Editor de texto rico basado en Lexical
  editor: lexicalEditor(),

  // Clave secreta para encriptación de datos y sesiones
  secret: PAYLOAD_SECRET,

  // Orquestación de tipos para consumo en portfolio-web
  typescript: {
    outputFile: path.resolve(serverDir, 'packages/cms/core/payload-types.ts'),
  },

  /**
   * ADAPTADOR DE BASE DE DATOS (Supabase / Postgres)
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      /**
       * Seguridad SSL: Requerido para Supabase Poolers en producción.
       */
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),

  /**
   * @pilar X: Rendimiento.
   * Sharp es requerido explícitamente para optimizar imágenes de hospitalidad.
   */
});