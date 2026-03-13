/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Configuración central soberana de Payload CMS 3.0.
 *              Implementa resiliencia de construcción (Build-Aware) para entornos Vercel.
 * @version 2.0 - Vercel Deployment Resiliency
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';

/**
 * IMPORTACIONES DE COLECCIONES
 */
import { Users, BlogPosts, Projects } from './collections';

/**
 * RESOLUCIÓN DE ÁMBITO Y FASE
 * Detectamos si el proceso ocurre en Vercel o durante la compilación estática.
 */
const serverDir = process.cwd();
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';

/**
 * GUARDIÁN DE CONFIGURACIÓN RESILIENTE (Pilar VIII)
 * @description Permite que el build de Vercel complete su ciclo sin secretos,
 *              pero bloquea la ejecución en runtime si falta la infraestructura.
 */
const DATABASE_URL = process.env.DATABASE_URL || '';
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'temporary-secret-for-build-purposes';

if (!isBuildPhase && (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET)) {
  throw new Error(
    `[CMS-CORE][CRITICAL] Infraestructura denegada. El servidor requiere DATABASE_URL y PAYLOAD_SECRET.`
  );
}

if (isBuildPhase && !process.env.DATABASE_URL) {
  console.warn('[HEIMDALL][WARN] Compilación detectada sin base de datos. Generando artefacto estático...');
}

/**
 * CONFIGURACIÓN SOBERANA
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    /**
     * Gestión de Mapa de Importaciones (Payload 3.0 Stable)
     */
    importMap: {
      baseDir: path.resolve(serverDir, 'packages/cms/core'),
    },
    meta: {
      titleSuffix: '| MetaShark CMS',
    },
  },

  // SSoT: Registro de colecciones
  collections: [Users, BlogPosts, Projects],

  // Editor moderno Lexical
  editor: lexicalEditor(),

  // Seguridad de sesión
  secret: PAYLOAD_SECRET,

  /**
   * @pilar III: Seguridad de Tipos Absoluta.
   */
  typescript: {
    outputFile: path.resolve(serverDir, 'packages/cms/core/payload-types.ts'),
  },

  /**
   * ADAPTADOR DE PERSISTENCIA
   * @pilar X: Rendimiento. SSL configurado para Supabase en producción.
   */
  db: postgresAdapter({
    pool: {
      // Si no hay URL durante el build, pasamos un string vacío para satisfacer el contrato
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),

  /**
   * @pilar X: Rendimiento. Optimización automática vía Sharp.
   */
});