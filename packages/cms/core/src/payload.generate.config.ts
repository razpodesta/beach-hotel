/**
 * @file packages/cms/core/src/payload.generate.config.ts
 * @description Motor de Síntesis de Tipos con Auditoría Granular (Heimdall v5.0).
 *              Refactorizado: Implementación de Isolated Synthesis (db: undefined)
 *              para erradicar los Deadlocks de Sockets de PostgreSQL durante el build.
 * @version 5.0 - Forensic Observability & Socket Bypass
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dotenv from 'dotenv';
import { performance } from 'node:perf_hooks';

// 1. CONSTANTES CROMÁTICAS Y RASTREO
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const traceId = process.env.HEIMDALL_TRACE_ID || `DNA_${Date.now().toString(36).toUpperCase()}`;

console.log(`\n${C.magenta}${C.bold}[${traceId}] 🧬 INICIANDO HANDSHAKE DE CONFIGURACIÓN${C.reset}`);

// 2. CARGA DE ENTORNO
const envStart = performance.now();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
console.log(`   ${C.cyan}[${traceId}] [OK]${C.reset} Entorno cargado en ${(performance.now() - envStart).toFixed(2)}ms`);

// 3. IMPORTACIONES (Auditoría de Carga de Módulos)
console.log(`   ${C.cyan}[${traceId}] [WAIT]${C.reset} Importando contratos de colecciones...`);
const importStart = performance.now();

import { Tenants } from './collections/Tenants';
import { Users } from './collections/users/Users';
import { Media } from './collections/Media';
import { BlogPosts } from './collections/BlogPosts';
import { Projects } from './collections/Projects';
import { Offers } from './collections/Offers';
import { FlashSales } from './collections/FlashSales';
import { Agencies } from './collections/Agencies';
import { Agents } from './collections/Agents';
import { BusinessMetrics } from './collections/BusinessMetrics';
import { Ingestions } from './collections/Ingestions';
import { Subscribers } from './collections/Subscribers';
import { Notifications } from './collections/Notifications';
import { DynamicRoutes } from './collections/DynamicRoutes';

console.log(`   ${C.green}[${traceId}] [OK]${C.reset} 14 Colecciones indexadas en ${(performance.now() - importStart).toFixed(2)}ms`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. CONFIGURACIÓN DEL ADAPTADOR (BYPASS TOTAL)
const dbStart = performance.now();

/**
 * @pilar VIII: Resiliencia de Build.
 * Al eliminar la inicialización de postgresAdapter y pasar `undefined as any`,
 * evitamos que el driver de Node intente abrir Sockets de red. Esto erradica
 * instantáneamente el Deadlock del Event Loop.
 */
console.log(`   ${C.yellow}[${traceId}] [DB-CONNECT]${C.reset} Bypass Total del Adaptador de Base de Datos...`);
console.log(`   ${C.green}[${traceId}] [OK]${C.reset} Red aislada en ${(performance.now() - dbStart).toFixed(2)}ms`);

// 5. EXPORTACIÓN DEL CONTRATO
console.log(`   ${C.cyan}[${traceId}] [BUILD]${C.reset} Ensamblando buildConfig final...`);

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'static-dna-vault-key-33',
  db: undefined as any, // ⚡ INFRA BYPASS: Sin sockets abiertos = Sin Deadlocks
  collections: [
    Tenants, Users, Media, BlogPosts, Projects, 
    Offers, FlashSales, Agencies, Agents, 
    BusinessMetrics, Ingestions, Subscribers, 
    Notifications, DynamicRoutes
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  editor: undefined, 
  plugins: [],
  admin: { autoLogin: false },
});

console.log(`${C.magenta}${C.bold}[${traceId}] 🏁 CONFIGURACIÓN ENTREGADA AL COMPILADOR.\n${C.reset}`);