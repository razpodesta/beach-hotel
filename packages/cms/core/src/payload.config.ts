/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Orquestador soberano de configuración para Payload CMS 3.0.
 *              Nivelado: Uso obligatorio de extensiones .js para compatibilidad ESM (nodenext).
 * @version 18.2 - Fixed ESM Module Imports
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import type { SharpDependency } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/**
 * IMPORTACIONES ATÓMICAS DE COLECCIONES
 * @fix Resolución TS2835: Extensiones .js obligatorias para ESM (nodenext).
 */
import { Users } from './collections/Users.js';
import { BlogPosts } from './collections/BlogPosts.js';
import { Projects } from './collections/Projects.js';
import { Media } from './collections/Media.js';
import { Tenants } from './collections/Tenants.js';

/**
 * DETERMINACIÓN DE PERÍMETRO DE INFRAESTRUCTRURA
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_CONFIG_DIR = __dirname;

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

console.group('[HEIMDALL][CMS] Sovereign Boot Protocol');
if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('SSoT Failure: Infrastructure secrets missing.');
}
console.groupEnd();

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'admin@beachhotelcanasvieiras.com',
    defaultFromName: 'Sanctuary Concierge Engine',
  }),

  sharp: (sharp as unknown) as SharpDependency,

  admin: {
    user: Users.slug,
    importMap: { 
      baseDir: BASE_CONFIG_DIR, 
    },
  },

  collections: [
    Users, 
    BlogPosts, 
    Projects, 
    Media, 
    Tenants
  ],
  
  editor: lexicalEditor({}),
  
  secret: PAYLOAD_SECRET || 'genesis-engine-dev-vault',
  
  typescript: {
    outputFile: path.resolve(BASE_CONFIG_DIR, 'payload-types.ts'),
  },
  
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL || '',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: true } 
        : { rejectUnauthorized: false },
    },
  }),
});