/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Configuración central soberana de Payload CMS 3.0.
 *              Orquesta la persistencia en Supabase/Postgres y el esquema de datos.
 * @version 1.9 - Production Hardened & Bundler Ready
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';

/**
 * IMPORTACIONES DE COLECCIONES
 * @pilar V: Se utilizan rutas sin extensión para permitir que el motor de 
 * empaquetado de Next.js resuelva los archivos fuente .ts en Vercel.
 */
import { Users, BlogPosts, Projects } from './collections';

/**
 * GUARDIÁN DE CONFIGURACIÓN (Pilar X)
 * Validación de integridad de infraestructura antes del arranque.
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
 * Utilizamos la raíz del proceso para mapear activos en el Monorepo.
 */
const serverDir = process.cwd();

/**
 * CONFIGURACIÓN SOBERANA
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    /**
     * Gestión de Mapa de Importaciones (Payload 3.0 Stable)
     * Proporciona la ruta física necesaria para generar el grafo de dependencias
     * del panel administrativo en entornos Serverless.
     */
    importMap: {
      baseDir: path.resolve(serverDir, 'packages/cms/core'),
    },
    meta: {
      titleSuffix: '| MetaShark CMS',
    },
  },

  // SSoT: Registro de colecciones innegociables
  collections: [Users, BlogPosts, Projects],

  // Editor moderno basado en Lexical
  editor: lexicalEditor(),

  // Clave maestra para seguridad de tokens y sesiones
  secret: PAYLOAD_SECRET,

  /**
   * @pilar III: Seguridad de Tipos Absoluta.
   * Generación de tipos ambientales para sincronización con portfolio-web.
   */
  typescript: {
    outputFile: path.resolve(serverDir, 'packages/cms/core/payload-types.ts'),
  },

  /**
   * ADAPTADOR DE PERSISTENCIA (Supabase Optimized)
   */
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
      /**
       * Protocolo SSL: Obligatorio para conexiones remotas seguras.
       */
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),

  /**
   * @pilar X: Rendimiento.
   * Sharp se encarga de la optimización de activos del hotel y festival.
   */
});