/**
 * @file scripts/supabase/audit-full-schema.ts
 * @description Auditoría profunda de Supabase: Tablas, RLS y Políticas.
 *              Refactorizado para ser 100% Type-Safe (Sin 'any').
 * @version 1.4 - Linter Compliant
 * @author Raz Podestá - MetaShark Tech
 */

import { Client } from 'pg';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carga del entorno
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const colors = { reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m", red: "\x1b[31m" };

/**
 * Contrato de reporte tipado para garantizar integridad de datos.
 */
interface AuditReport {
  timestamp: string;
  tables: string[];
  rlsStatus: Array<{ tablename: string; rowsecurity: boolean }>;
  policies: Array<{ policyname: string; tablename: string; permissive: string; roles: string[]; cmd: string }>;
  error: string | null;
}

async function auditSupabase(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  const reportDir = path.resolve(process.cwd(), 'reports/databases/supabase');
  const reportPath = path.join(reportDir, 'supabase-full-audit.json');
  
  if (!dbUrl) {
    console.error(`${colors.red}✖ ERROR: DATABASE_URL no definida.${colors.reset}`);
    process.exit(1);
  }

  // Compatibilidad libpq forzada
  const connectionString = dbUrl.includes('?') ? `${dbUrl}&uselibpqcompat=true` : `${dbUrl}?uselibpqcompat=true`;

  const report: AuditReport = { 
    timestamp: new Date().toISOString(), 
    tables: [],
    rlsStatus: [],
    policies: [],
    error: null 
  };

  try {
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // 1. Auditoría de Tablas
    const tablesRes = await client.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    report.tables = tablesRes.rows.map(r => r.table_name);
    console.log(`${colors.green}✔ Tablas detectadas:${colors.reset}`, report.tables);

    // 2. Auditoría de RLS
    const rlsRes = await client.query<{ tablename: string; rowsecurity: boolean }>(`
      SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'
    `);
    report.rlsStatus = rlsRes.rows;

    // 3. Auditoría de Políticas
    const polRes = await client.query<{ policyname: string; tablename: string; permissive: string; roles: string[]; cmd: string }>(`
      SELECT policyname, tablename, permissive, roles, cmd FROM pg_policies WHERE schemaname = 'public'
    `);
    report.policies = polRes.rows;

    await client.end();
  } catch (err: unknown) {
    report.error = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`${colors.red}✖ Fallo:${colors.reset}`, report.error);
  }

  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`${colors.cyan}[AUDIT]${colors.reset} Reporte generado en ${reportPath}`);
}

auditSupabase();