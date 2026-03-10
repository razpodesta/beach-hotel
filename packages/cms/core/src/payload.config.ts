// RUTA: packages/cms/core/src/payload.config.ts

/**
 * @file Motor Central de CMS (Payload 3.0)
 * @version 1.1 - Validaciones de Élite & Estructura Modular
 * @description Configuración soberana del CMS. Desacoplada y lista para 
 *              multi-tenant con validación de entorno Fail-Fast.
 * @author Raz Podestá - MetaShark Tech
 */

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

// Importación a través del índice centralizado (Barrel Pattern)
import * as collections from './collections/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validación Fail-Fast para variables críticas
if (!process.env.DATABASE_URL) throw new Error('CRITICAL: DATABASE_URL is missing in environment.');
if (!process.env.PAYLOAD_SECRET) throw new Error('CRITICAL: PAYLOAD_SECRET is missing in environment.');

export default buildConfig({
  admin: {
    user: collections.Users.slug,
    importMap: {
      baseDir: path.resolve(__dirname),
    },
    meta: {
      titleSuffix: '| Beach Hotel CMS',
    },
  },
  
  // Orquestación dinámica de colecciones (Escalabilidad infinita)
  collections: Object.values(collections),
  
  editor: lexicalEditor(),
  
  secret: process.env.PAYLOAD_SECRET,
  
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Configuración SSL permisiva para Supabase (evita errores SELF_SIGNED_CERT_IN_CHAIN)
    extra: {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  }),
});