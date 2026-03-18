/**
 * @file scripts/supabase/check-connection.ts
 * @version 2.4 - Production-Hardened (libpq compatible)
 * @description Auditoría de conexión forzando compatibilidad con libpq para Supabase.
 */

import { Client } from 'pg';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 1. Carga explícita del entorno
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const colors = { reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m", red: "\x1b[31m" };

async function checkConnection(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error(`${colors.red}✖ ERROR: DATABASE_URL no definida.${colors.reset}`);
    process.exit(1);
  }

  // 2. FORZAR COMPATIBILIDAD CON SUPABASE POOLER
  // Añadimos uselibpqcompat=true para que el driver se comporte como libpq (más permisivo con certificados)
  const connectionString = dbUrl.includes('?') 
    ? `${dbUrl}&uselibpqcompat=true` 
    : `${dbUrl}?uselibpqcompat=true`;

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    }
  });

  console.log(`${colors.cyan}[DIAGNOSTIC]${colors.reset} Intentando conexión con uselibpqcompat...`);

  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`${colors.green}✔ Conexión exitosa:${colors.reset}`, res.rows[0]);
    await client.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`${colors.red}✖ Fallo en la conexión:${colors.reset}`, message);
    process.exit(1);
  }
}

checkConnection();