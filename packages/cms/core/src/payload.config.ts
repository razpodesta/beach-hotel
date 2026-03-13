/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Configuración central soberana de Payload CMS 3.0.
 *              Implementa resiliencia de construcción (Build-Aware) y orquestación de medios.
 * @version 2.1 - Media Integration & Build Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';

/**
 * IMPORTACIONES DE COLECCIONES Sincronizadas
 * @pilar I: Sincronización de infraestructura. Se añade 'Media' para sanar
 * el error de integridad referencial detectado en Vercel.
 */
import { Users, BlogPosts, Projects, Media } from './collections';

/**
 * RESOLUCIÓN DE ÁMBITO Y FASE
 * @pilar V: Adherencia Arquitectónica.
 */
const serverDir = process.cwd();
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';

/**
 * GUARDIÁN DE CONFIGURACIÓN RESILIENTE (Pilar VIII)
 * @description Permite que el build de Vercel complete su ciclo sin secretos,
 *              evitando el colapso del prerendering estático.
 */
const DATABASE_URL = process.env.DATABASE_URL || '';
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'temporary-secret-for-build-purposes';

// Bloqueo estricto solo en modo ejecución (Runtime)
if (!isBuildPhase && (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET)) {
  throw new Error(
    `[CMS-CORE][CRITICAL] Infraestructura denegada. DATABASE_URL y PAYLOAD_SECRET son obligatorios en ejecución.`
  );
}

if (isBuildPhase && !process.env.DATABASE_URL) {
  console.warn('[HEIMDALL][WARN] Compilación detectada sin base de datos activa. Operando en modo estático...');
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

  /**
   * @pilar I: Registro Íntegro de Colecciones.
   * Se incluye Media para satisfacer las dependencias de BlogPosts.
   */
  collections: [Users, BlogPosts, Projects, Media],

  // Editor moderno Lexical
  editor: lexicalEditor(),

  // Seguridad de sesión y encriptación
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
      // Pasamos string vacío durante el build para evitar crash de conexión
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),

  /**
   * @pilar X: Rendimiento. 
   * Sharp se encarga de optimizar los assets de hospitalidad (Suites/Festival).
   */
});