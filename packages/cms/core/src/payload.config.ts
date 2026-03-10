import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

// Importación explícita del índice de colecciones
import { Users, BlogPosts, Projects } from './collections/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  throw new Error('[CMS-CORE] CRITICAL: DATABASE_URL is missing in environment.');
}
if (!process.env.PAYLOAD_SECRET) {
  throw new Error('[CMS-CORE] CRITICAL: PAYLOAD_SECRET is missing in environment.');
}

/**
 * Motor central de configuración de MetaShark CMS.
 * @version 1.2
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(__dirname),
    },
    meta: {
      titleSuffix: '| MetaShark CMS',
    },
  },
  
  // Lista explícita de colecciones para evitar errores de resolución en tiempo de build
  collections: [Users, BlogPosts, Projects],
  
  editor: lexicalEditor(),
  
  secret: process.env.PAYLOAD_SECRET,
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    extra: {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),
});