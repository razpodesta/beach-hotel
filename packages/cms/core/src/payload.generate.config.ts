/**
 * @file packages/cms/core/src/payload.generate.config.ts
 * @description Motor de Síntesis de Tipos (Lightweight DNA Engine).
 *              Provee una configuración mínima pero completa para la generación
 *              de artefactos TS, optimizada para velocidad en CI/CD.
 *              Refactorizado: Resolución de TS2322 (RichText Null Mismatch),
 *              unificación de colecciones SSoT e instrumentación Heimdall v2.0.
 * @version 2.1 - Type-Safe DNA Mirror (Build-Resilient)
 * @author Staff Engineer - MetaShark Tech
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 
 * 1. INVENTARIO COMPLETO DE COLECCIONES (Full SSoT Sync)
 * @pilar I: Visión Holística. Incluimos todas las definiciones para 
 * garantizar la integridad del archivo 'payload-types.ts'.
 */
import { Ingestions } from './collections/Ingestions';
import { Subscribers } from './collections/Subscribers';
import { Agencies } from './collections/Agencies';
import { Agents } from './collections/Agents';
import { BusinessMetrics } from './collections/BusinessMetrics';
import { Offers } from './collections/Offers';
import { FlashSales } from './collections/FlashSales';
import { Media } from './collections/Media';
import { BlogPosts } from './collections/BlogPosts';
import { Projects } from './collections/Projects';
import { Tenants } from './collections/Tenants';
import { Notifications } from './collections/Notifications';
import { DynamicRoutes } from './collections/DynamicRoutes';
import { Users } from './collections/users/Users';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TELEMETRÍA HEIMDALL: Generation DNA Pulse
// ============================================================================

const genStart = performance.now();
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

console.log(`\n${C.magenta}${C.bold}[DNA][GEN-CONFIG]${C.reset} Iniciando motor de síntesis de contratos...`);

/**
 * HELPER: measureGenTask
 * @description Mide y reporta latencia en la fase de construcción de esquemas.
 */
const measureGenTask = <T>(name: string, task: () => T): T => {
  const start = performance.now();
  const result = task();
  console.log(`   ${C.green}✓ [GEN-METRIC]${C.reset} ${name.padEnd(25)} | OK | ${(performance.now() - start).toFixed(2)}ms`);
  return result;
};

// ============================================================================
// CONFIGURACIÓN DE GENERACIÓN (Atómica y Pura)
// ============================================================================

export default buildConfig({
  /** 
   * @pilar III: Seguridad de Tipos.
   * Secreto dummy inalterable para el worker de build.
   */
  secret: process.env.PAYLOAD_SECRET || 'static-generation-vault-key-33',
  
  /**
   * ADAPTADOR BLINDADO (No-Network Handshake)
   * @description Evita que el build se cuelgue intentando conectar a Supabase.
   */
  db: measureGenTask('DUMMY_DB_INIT', () => postgresAdapter({
    pool: { connectionString: 'postgres://localhost:5432/dummy_gen' },
    push: false, 
  })),

  /**
   * SINCRO DE ESQUEMAS
   */
  collections: measureGenTask('COLLECTION_MIRROR_LOAD', () => [
    Tenants, Users, Media, BlogPosts, Projects, 
    Offers, FlashSales, Agencies, Agents, 
    BusinessMetrics, Ingestions, Subscribers, 
    Notifications, DynamicRoutes
  ]),
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  /**
   * @fix TS2322: Mismatch de Tipo en Editor.
   * Payload 3.0 no acepta 'null' para la propiedad 'editor'.
   * Usamos 'undefined' para cumplir con el contrato 'RichTextAdapterProvider | undefined'.
   * Esto reduce drásticamente el peso del proceso de generación de tipos.
   */
  editor: undefined, 

  /**
   * @description Aislamiento de Plugins. 
   * Desactivamos S3 y otros durante la generación para máxima velocidad.
   */
  plugins: [],

  admin: {
    // Evitamos procesos administrativos redundantes durante la síntesis.
    autoLogin: false,
  },
});

const totalGenInit = (performance.now() - genStart).toFixed(2);
console.log(`${C.magenta}${C.bold}[DNA][SUCCESS]${C.reset} Espejo de generación calibrado en ${totalGenInit}ms\n`);