/**
 * @file scripts/supabase/check-connection.ts
 * @description Aparato de Diagnóstico de Conectividad Soberano (Heimdall).
 *              Evalúa el pooler de Supabase (libpq), mide latencia y genera
 *              un reporte forense físico en formato JSON.
 * @version 3.0 - Forensics & Report Generation Edition
 * @author Raz Podestá - MetaShark Tech
 */

import { Client } from 'pg';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';

// 1. Carga explícita del entorno
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const colors = { 
  reset: "\x1b[0m", 
  cyan: "\x1b[36m", 
  green: "\x1b[32m", 
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m"
};

/**
 * @interface ConnectionReport
 * @description Contrato inmutable para el artefacto de reporte generado.
 */
interface ConnectionReport {
  timestamp: string;
  status: 'success' | 'failed';
  latencyMs?: number;
  details: {
    DATABASE_URL: boolean;
    SUPABASE_URL: boolean;
    SUPABASE_ANON_KEY: boolean;
    dbName?: string;
    version?: string;
  };
  error: string | null;
}

/**
 * @interface PgDiagnosticRow
 * @description Estructura de la respuesta de la consulta de diagnóstico.
 */
interface PgDiagnosticRow {
  time: Date;
  db_name: string;
  version: string;
}

function maskString(str: string, visibleChars = 5): string {
  if (str.length <= visibleChars * 2) return '****';
  return `${str.substring(0, visibleChars)}****${str.substring(str.length - visibleChars)}`;
}

async function checkConnection(): Promise<void> {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   DIAGNÓSTICO DE CONEXIÓN SUPABASE   ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  const dbUrl = process.env.DATABASE_URL;
  const reportDir = path.resolve(process.cwd(), 'reports/databases/supabase');
  const reportPath = path.join(reportDir, 'supabase-connection-check.json');

  const report: ConnectionReport = {
    timestamp: new Date().toISOString(),
    status: 'failed',
    details: {
      DATABASE_URL: !!dbUrl,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    error: null
  };

  await fs.mkdir(reportDir, { recursive: true });

  if (!dbUrl) {
    const errorMsg = 'DATABASE_URL no definida en .env.local';
    report.error = errorMsg;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.error(`${colors.red}✖ ERROR CRÍTICO: ${errorMsg}${colors.reset}`);
    process.exit(1);
  }

  // Enmascarar URL en consola por seguridad
  console.log(`${colors.gray}[HEIMDALL] Connection String: ${colors.yellow}${maskString(dbUrl)}${colors.reset}`);

  // 2. FORZAR COMPATIBILIDAD CON SUPABASE POOLER
  const connectionString = dbUrl.includes('?') 
    ? `${dbUrl}&uselibpqcompat=true` 
    : `${dbUrl}?uselibpqcompat=true`;

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Requerido para poolers transaccionales
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    const startTime = Date.now();
    console.log(`${colors.cyan}[DIAGNOSTIC]${colors.reset} Iniciando handshake TCP/SSL...`);

    await client.connect();
    const connectTime = Date.now() - startTime;

    console.log(`${colors.green}✔ Handshake completado en ${connectTime}ms${colors.reset}`);
    
    // Consulta diagnóstica enriquecida
    const res = await client.query<PgDiagnosticRow>('SELECT NOW() as time, current_database() as db_name, version() as version');
    const dbInfo = res.rows[0];

    // Actualización de reporte
    report.status = 'success';
    report.latencyMs = connectTime;
    report.details.dbName = dbInfo.db_name;
    report.details.version = dbInfo.version;

    console.log(`\n${colors.green}✨ CONEXIÓN SOBERANA ESTABLECIDA ✨${colors.reset}`);
    console.log(`   ----------------------------------------`);
    console.log(`   📡 Latencia (Ping): ${colors.yellow}${connectTime}ms${colors.reset}`);
    console.log(`   🗄️  Base de Datos  : ${colors.cyan}${dbInfo.db_name}${colors.reset}`);
    console.log(`   ℹ️  Motor          : ${colors.gray}${dbInfo.version.split(',')[0]}${colors.reset}`);
    console.log(`   ----------------------------------------\n`);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    report.error = message;
    console.error(`\n${colors.red}💥 FALLO EN LA CONEXIÓN:${colors.reset}\n   ${message}\n`);
  } finally {
    await client.end();
    // Guardar el artefacto de auditoría
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`${colors.gray}[HEIMDALL] Reporte forense escrito en: ${reportPath}${colors.reset}\n`);
    
    if (report.status === 'failed') {
      process.exit(1);
    }
  }
}

checkConnection();