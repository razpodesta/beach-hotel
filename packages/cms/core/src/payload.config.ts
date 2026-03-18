/**
 * @file packages/cms/core/src/payload.config.ts
 * @description Configuración central.
 *              Refactorización definitiva: Importación directa desde la raíz 
 *              de colecciones para evitar errores de resolución de rutas.
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// --- REFACORIZACIÓN: Importación directa a los archivos fuente ---
// Eliminamos la dependencia de './collections/index.js'
import { Users } from './collections/Users.js';
import { BlogPosts } from './collections/BlogPosts.js';
import { Projects } from './collections/Projects.js';
import { Media } from './collections/Media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'admin@metashark.tech',
    defaultFromName: 'Genesis Engine',
  }),

  sharp,

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(__dirname) },
  },

  // Colecciones importadas directamente
  collections: [Users, BlogPosts, Projects, Media],
  
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'genesis-engine-secret-key-2026',
  
  typescript: {
    outputFile: path.resolve(__dirname, '../payload-types.ts'),
  },
  
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),
});