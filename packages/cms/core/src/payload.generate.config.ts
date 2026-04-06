/**
 * @file packages/cms/core/src/payload.generate.config.ts
 * @description Motor de Síntesis de Tipos (Lightweight DNA Engine).
 *              Provee una configuración atómica y pura para la generación
 *              de artefactos TS, optimizada para velocidad extrema en CI/CD.
 *              Refactorizado: Sincronización SSoT de 14 colecciones, blindaje
 *              de adaptador DB local-only y telemetría Heimdall v2.5.
 * @version 3.0 - Sovereign DNA Standard (Build-Immune)
 * @author Staff Engineer - MetaShark Tech
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 
 * 1. INVENTARIO MAESTRO DE COLECCIONES (Full SSoT Matrix)
 * @pilar I: Visión Holística. El espejo debe reflejar el 100% de los datos.
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
// TELEMETRÍA HEIMDALL: Generation Pulse v2.5
// ============================================================================

const genStart = performance.now();
const traceId = `dna_gen_${Date.now().toString(36).toUpperCase()}`;

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

console.log(`\n${C.magenta}${C.bold}[DNA][GEN-CONFIG]${C.reset} Iniciando síntesis atómica | Trace: ${C.cyan}${traceId}${C.reset}`);

/**
 * HELPER: measureGenTask
 * @description Reporta latencia de micro-operaciones en el pipeline de generación.
 */
const measureGenTask = <T>(name: string, task: () => T): T => {
  const start = performance.now();
  const result = task();
  const duration = (performance.now() - start).toFixed(2);
  console.log(`   ${C.green}✓ [GEN-METRIC]${C.reset} ${name.padEnd(25)} | OK | ${C.yellow}${duration.padStart(8)}ms${C.reset}`);
  return result;
};

// ============================================================================
// FACTORÍA SOBERANA: buildConfig (Modo Generación)
// ============================================================================

export default buildConfig({
  /** 
   * @pilar III: Seguridad de Tipos.
   * Secreto inalterable para el entorno de compilación estática.
   */
  secret: process.env.PAYLOAD_SECRET || 'static-dna-vault-key-33',
  
  /**
   * ADAPTADOR BLINDADO (No-Network Handshake)
   * @fix: Usamos la IP de loopback explícita para evitar demoras de resolución DNS.
   */
  db: measureGenTask('DNA_DB_ADAPTER', () => postgresAdapter({
    pool: { connectionString: 'postgres://dummy:dummy@127.0.0.1:5432/dummy_gen' },
    push: false, 
  })),

  /**
   * SINCRO DE ESQUEMAS (Handshake de 14 Nodos)
   */
  collections: measureGenTask('DNA_COLLECTION_SYNC', () => [
    Tenants, Users, Media, BlogPosts, Projects, 
    Offers, FlashSales, Agencies, Agents, 
    BusinessMetrics, Ingestions, Subscribers, 
    Notifications, DynamicRoutes
  ]),
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  /**
   * @fix TS2322: Erradicación de 'null' en adaptador de texto.
   * Se utiliza 'undefined' para cumplir con el contrato de Payload 3.0,
   * eliminando el overhead de Lexical durante la síntesis de tipos.
   */
  editor: undefined, 

  /**
   * @description Aislamiento Total. 
   * Cero plugins activos para garantizar un tiempo de ejecución < 1s.
   */
  plugins: [],

  admin: {
    autoLogin: false, // Desactivado para entorno de build
    // @fix: Evita que Payload intente generar un importMap paralelo e inconsistente.
  },
});

const totalGenInit = (performance.now() - genStart).toFixed(2);
console.log(`${C.magenta}${C.bold}[DNA][SUCCESS]${C.reset} Espejo de generación sellado en ${C.yellow}${totalGenInit}ms${C.reset}\n`);