/**
 * @file packages/cms/core/src/payload.generate.config.ts
 * @description Motor de Síntesis de Tipos (Heimdall v5.2).
 *              Refactorizado para Build Estático Puro: Bypass de base de datos
 *              y eliminación de dependencias de runtime.
 * @version 5.2 - Forensic Observability & Strict Type Synthesis
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig, type Config } from 'payload';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dotenv from 'dotenv';

// 1. CONSTANTES CROMÁTICAS Y RASTREO
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const traceId = process.env.HEIMDALL_TRACE_ID || `DNA_${Date.now().toString(36).toUpperCase()}`;

console.log(`\n${C.magenta}${C.bold}[${traceId}] 🧬 INICIANDO SÍNTESIS DE TIPOS${C.reset}`);

// 2. CONFIGURACIÓN DE ENTORNO
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 3. IMPORTACIÓN DE CONTRATOS (Colecciones)
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @description Configuración de Build Estático.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
const config: Config = {
  secret: process.env.PAYLOAD_SECRET || 'static-dna-vault-key-33',
  
  /**
   * @pilar VIII: Resiliencia de Build.
   * Bypass total del adaptador. En fase de generación, Payload no debe
   * inicializar Sockets de PostgreSQL.
   */
  // @ts-expect-error: DB Adapter bypass required for static type generation
  db: undefined,
  
  collections: [
    Tenants,
    Users,
    Media,
    BlogPosts,
    Projects,
    Offers,
    FlashSales,
    Agencies,
    Agents,
    BusinessMetrics,
    Ingestions,
    Subscribers,
    Notifications,
    DynamicRoutes,
  ],
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  
  editor: undefined,
  plugins: [],
  admin: { autoLogin: false },
};

console.log(`   ${C.cyan}[${traceId}] [BUILD]${C.reset} Ensamblando configuración de síntesis...`);

export default buildConfig(config);

console.log(`${C.magenta}${C.bold}[${traceId}] 🏁 CONFIGURACIÓN ENTREGADA AL COMPILADOR.\n${C.reset}`);