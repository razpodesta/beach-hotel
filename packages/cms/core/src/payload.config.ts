/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador central del motor CMS Payload 3.0.
 *              Nivelado para entornos Serverless (Vercel) y Poolers Transaccionales (Supabase).
 *              Implementa compatibilidad universal CJS/ESM, blindaje CORS/CSRF y optimización.
 * @version 18.2 - Sovereign Serverless Engine (Universal Path Resolution)
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'node:path';

/**
 * IMPORTACIONES DE COLECCIONES (Pilar V)
 * Sincronizado con la arquitectura atómica (sin barrel files).
 */
import { Users } from './collections/Users.js';
import { BlogPosts } from './collections/BlogPosts.js';
import { Projects } from './collections/Projects.js';
import { Media } from './collections/Media.js';

/**
 * RESOLUCIÓN DE DIRECTORIO UNIVERSAL (Pilar V & VIII)
 * @description Se erradica import.meta.url para evitar el error TS1470 en CommonJS.
 *              En un monorepo Nx, process.cwd() es determinista y apunta al workspace root.
 */
const workspaceRoot = process.cwd();
const configDir = path.resolve(workspaceRoot, 'packages/cms/core/src');

// --- DETECTORES DE ENTORNO SOBERANO ---
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';
const DATABASE_URL = process.env.DATABASE_URL || '';
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || '';
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';

/**
 * VALIDACIÓN FAIL-FAST FORENSE
 */
if (!isBuildPhase && (!DATABASE_URL || !PAYLOAD_SECRET)) {
  console.error('[HEIMDALL][CRITICAL] Abortando arranque: Variables de entorno maestras ausentes (DATABASE_URL / PAYLOAD_SECRET).');
}

/**
 * MOTOR DE CONEXIÓN SERVERLESS (Supabase Pooler Optimization)
 * @description Inyecta parámetros vitales para evitar la saturación de conexiones 
 *              (Connection Exhaustion) en entornos de Lambdas y Edge.
 */
const getSovereignConnectionString = (): string => {
  if (!DATABASE_URL) return '';
  
  try {
    const url = new URL(DATABASE_URL);
    // Compatibilidad obligatoria para el handshake con Supabase Pooler
    url.searchParams.set('uselibpqcompat', 'true');
    // Pilar X (Performance): Desactiva la caché de sentencias preparadas, 
    // esencial para que PgBouncer/Supabase maneje eficientemente miles de Lambdas efímeras.
    url.searchParams.set('statement_cache_size', '0');
    
    return url.toString();
  } catch (error: unknown) {
    /**
     * @pilar IV: Observabilidad (Protocolo Heimdall).
     */
    const errorMsg = error instanceof Error ? error.message : 'Estructura de URL inválida';
    console.warn(`[HEIMDALL][WARN] Fallo al parsear DATABASE_URL: ${errorMsg}. Usando string crudo.`);
    return DATABASE_URL;
  }
};

/**
 * CONFIGURACIÓN SOBERANA DE PAYLOAD 3.0
 */
export default buildConfig({
  // URL base requerida para la orquestación interna de endpoints
  serverURL: NEXT_PUBLIC_BASE_URL,
  
  // Blindaje de Seguridad Transversal
  cors:[NEXT_PUBLIC_BASE_URL, 'https://beachhotelcanasvieiras.com'],
  csrf:[NEXT_PUBLIC_BASE_URL, 'https://beachhotelcanasvieiras.com'],
  
  // Privacidad de Infraestructura (Desactiva el rastreo de Payload)
  telemetry: false,

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: configDir,
    },
    meta: {
      titleSuffix: ' | MetaShark Sovereign CMS',
      description: 'Motor de inteligencia y orquestación de contenidos para Beach Hotel Canasvieiras.',
    },
  },

  // SSoT: Entidades del Ecosistema
  collections:[Users, BlogPosts, Projects, Media],
  
  // Motor editorial (Abstract Syntax Tree)
  editor: lexicalEditor(),
  
  secret: PAYLOAD_SECRET || 'temporary-secret-for-build-purposes-only',

  // Generación de Contratos de Tipo
  typescript: {
    outputFile: path.resolve(configDir, '../payload-types.ts'),
  },

  /**
   * CAPA DE PERSISTENCIA (Postgres)
   */
  db: postgresAdapter({
    pool: {
      connectionString: getSovereignConnectionString(),
      // Límite conservador para Serverless. Evita agotar las conexiones del pool transaccional.
      max: 10,
      idleTimeoutMillis: 30000,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    },
  }),
});