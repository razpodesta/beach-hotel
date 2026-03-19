/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Configuración central. Nivelado para CJS/ESM interop y compatibilidad con Sharp.
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import path from 'node:path';

// --- REFACORIZACIÓN: Eliminación de import.meta.url para evitar error TS1470 ---
// Usamos __dirname nativo de CJS o un path relativo desde el proceso actual
const configDir = path.resolve(process.cwd(), 'packages/cms/core/src');

import { Users, BlogPosts, Projects, Media } from './collections/index.js';

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'admin@metashark.tech',
    defaultFromName: 'Genesis Engine',
  }),

  // --- CORRECCIÓN TS2322: Cast explícito para compatibilidad con SharpDependency ---
  sharp: (await import('sharp')) as any,

  admin: {
    user: Users.slug,
    importMap: { baseDir: configDir },
  },

  collections: [Users, BlogPosts, Projects, Media],
  editor: lexicalEditor(),
  
  secret: process.env.PAYLOAD_SECRET || 'genesis-engine-secret-key-2026',
  
  typescript: {
    outputFile: path.resolve(configDir, '../payload-types.ts'),
  },
  
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),
});