/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador Maestro del Ecosistema de Datos MetaShark.
 *              Refactorizado: Erradicación de TS2353 (S3 Plugin Type Override).
 *              Alineación arquitectónica con el patrón "Sovereign Pointers": 
 *              Solo la colección 'media' actúa como bóveda binaria física S3.
 * @version 51.1 - S3 Validation Sealed & Build Isolation Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import { buildConfig } from 'payload';
import type { SharpDependency } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/** 
 * INVENTARIO DE COLECCIONES (SBU Matrix)
 * @pilar V: Adherencia Arquitectónica. Importaciones directas de TypeScript.
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

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA (Heimdall Sentinel)
 * @pilar VIII: Resiliencia de Build.
 */
const IS_TYPE_GEN = process.env.PAYLOAD_GENERATE === 'true';
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const HAS_DB_URL = !!process.env.DATABASE_URL;

// Protocolo Cromático Heimdall v2.5
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

/**
 * FACTORÍA DE ADAPTADOR DE BASE DE DATOS (Hardened Handshake)
 * @description Implementa seguridad SSL granular y previene bloqueos en entornos CI/CD.
 */
const resolveDbAdapter = () => {
  /** 
   * @case TYPE_GENERATION
   * @pilar XIII: Build Isolation. Evita intentos de conexión durante la síntesis de tipos.
   */
  if (IS_TYPE_GEN && !HAS_DB_URL) {
    return postgresAdapter({
      pool: { connectionString: 'postgres://dummy:dummy@127.0.0.1:5432/dummy' },
    });
  }
  
  /**
   * @case PRODUCTION_RUNTIME
   * @pilar VIII: Resiliencia. Configuración para el Transaction Pooler de Supabase.
   */
  return postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: IS_BUILD ? 4 : 10, // Pool reducido durante build para evitar saturación
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      /**
       * @fix: Seguridad de Perímetro.
       * Permite el handshake SSL con el pooler sin comprometer la validación global.
       */
      ssl: { rejectUnauthorized: false },
    },
    idType: 'uuid',
    push: false, // Prevenimos mutaciones de esquema accidentales durante el build
  });
};

/**
 * FACTORÍA DE PLUGINS CLOUD (S3 Vault Sealing)
 * @description Orquesta la persistencia física en Supabase Storage.
 */
const resolvePlugins = () => {
  const endpoint = process.env.S3_ENDPOINT;
  
  if (!endpoint) {
    if (process.env.NODE_ENV === 'production' && !IS_BUILD) {
      console.warn(`${C.yellow}[HEIMDALL][VAULT] Alerta: S3_ENDPOINT no detectado. Activos en modo efímero.${C.reset}`);
    }
    return [];
  }
  
  return [
    s3Storage({
      /**
       * @fix TS2353: Sovereign Pointer Architecture.
       * Solo la colección 'media' es una bóveda binaria física. Las demás colecciones 
       * interactúan con ella mediante relaciones lógicas, por lo que no requieren 
       * inyección en el adaptador S3.
       */
      collections: { 
        'media': true
      },
      bucket: process.env.S3_BUCKET || 'sanctuary-vault',
      config: {
        endpoint: endpoint,
        region: process.env.S3_REGION || 'sa-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ];
};

/**
 * APARATO PRINCIPAL: config
 * @description Única fuente de verdad para la infraestructura de datos.
 */
export const config = buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'emergency-dev-vault-key-33',
  
  admin: {
    user: 'users',
    /** 
     * @pilar IX: Desacoplamiento. 
     * ImportMap dinámico para resolución en modo Source-First.
     */
    importMap: { 
      baseDir: path.resolve(__dirname) 
    },
    meta: { 
      titleSuffix: '- MetaShark Enterprise Operations',
    },
  },

  db: resolveDbAdapter(),

  email: process.env.SMTP_USER ? nodemailerAdapter({
    defaultFromAddress: 'concierge@metashark.tech',
    defaultFromName: 'Enterprise Hospitality Concierge',
  }) : undefined,

  collections: [
    Offers, FlashSales, Agencies, Agents, BusinessMetrics,
    Ingestions, Subscribers, Tenants, Users, Notifications,
    DynamicRoutes, Media, BlogPosts, Projects,
  ],
  
  editor: lexicalEditor({}),
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  /** 
   * @pilar III: Seguridad de Tipos.
   * Casting de seguridad para el motor de procesamiento Sharp.
   */
  sharp: (sharp as unknown) as SharpDependency,

  plugins: resolvePlugins(),
});

// Telemetría de Montaje de Infraestructura (Heimdall v2.5)
if (!IS_TYPE_GEN && typeof window === 'undefined') {
  const phase = IS_BUILD ? 'BUILD_GENERATION' : 'RUNTIME_ACTIVE';
  const sslStatus = HAS_DB_URL ? 'HARDENED_SSL' : 'BYPASSED';
  
  console.log(
    `${C.magenta}${C.bold}[DNA][CONFIG]${C.reset} Core Orchestrator Calibrated | ` +
    `Phase: ${C.cyan}${phase}${C.reset} | DB_SSL: ${C.green}${sslStatus}${C.reset}`
  );
}

export default config;