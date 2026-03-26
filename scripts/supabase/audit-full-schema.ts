/**
 * @file scripts/supabase/audit-full-schema.ts
 * @description Aparato de Auditoría Forense de Infraestructura de Datos.
 *              Evalúa tablas, políticas RLS y genera un reporte de seguridad
 *              con resumen ejecutivo y alertas de vulnerabilidad.
 * @version 2.1 - node: protocol sync & TS1295 resolved
 * @author Raz Podestá - MetaShark Tech
 */

import { Client } from 'pg';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// 1. Carga del entorno soberano
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const colors = { 
  reset: "\x1b[0m", 
  cyan: "\x1b[36m", 
  green: "\x1b[32m", 
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
  bold: "\x1b[1m"
};

/**
 * @interface AuditReport
 * @description Contrato extendido para el reporte forense de base de datos.
 */
interface AuditReport {
  timestamp: string;
  summary: {
    totalTables: number;
    totalPolicies: number;
    tablesWithRlsDisabled: string[];
    isSecurityCompliant: boolean;
  };
  tables: string[];
  rlsStatus: Array<{ tablename: string; rowsecurity: boolean }>;
  policies: Array<{ 
    policyname: string; 
    tablename: string; 
    permissive: string; 
    roles: string[]; 
    cmd: string 
  }>;
  error: string | null;
}

function maskString(str: string, visibleChars = 5): string {
  return `${str.substring(0, visibleChars)}****${str.substring(str.length - visibleChars)}`;
}

async function auditSupabase(): Promise<void> {
  console.log(`\n${colors.cyan}${colors.bold}🔍 [HEIMDALL] INICIANDO AUDITORÍA INTEGRAL DE ESQUEMA${colors.reset}\n`);

  const dbUrl = process.env.DATABASE_URL;
  const reportDir = path.resolve(process.cwd(), 'reports', 'databases', 'supabase');
  const reportPath = path.join(reportDir, 'supabase-full-audit.json');
  
  if (!dbUrl) {
    console.error(`${colors.red}✖ ERROR CRÍTICO: DATABASE_URL no definida en .env.local${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.gray}Target: ${colors.yellow}${maskString(dbUrl)}${colors.reset}`);

  const connectionString = dbUrl.includes('?') 
    ? `${dbUrl}&uselibpqcompat=true` 
    : `${dbUrl}?uselibpqcompat=true`;

  const report: AuditReport = { 
    timestamp: new Date().toISOString(), 
    summary: {
      totalTables: 0,
      totalPolicies: 0,
      tablesWithRlsDisabled: [],
      isSecurityCompliant: true
    },
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

    const tablesRes = await client.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    report.tables = tablesRes.rows.map(r => r.table_name);
    report.summary.totalTables = report.tables.length;

    const rlsRes = await client.query<{ tablename: string; rowsecurity: boolean }>(`
      SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'
    `);
    report.rlsStatus = rlsRes.rows;
    
    report.summary.tablesWithRlsDisabled = rlsRes.rows
      .filter(r => !r.rowsecurity)
      .map(r => r.tablename);
    
    report.summary.isSecurityCompliant = report.summary.tablesWithRlsDisabled.length === 0;

    const polRes = await client.query<{ 
      policyname: string; 
      tablename: string; 
      permissive: string; 
      roles: string[]; 
      cmd: string 
    }>(`
      SELECT policyname, tablename, permissive, roles, cmd 
      FROM pg_policies 
      WHERE schemaname = 'public'
    `);
    report.policies = polRes.rows;
    report.summary.totalPolicies = report.policies.length;

    await client.end();

    console.log(`${colors.green}✔ Inventario:${colors.reset} ${report.summary.totalTables} tablas detectadas.`);
    console.log(`${colors.green}✔ Políticas:${colors.reset} ${report.summary.totalPolicies} reglas de acceso activas.`);

    if (!report.summary.isSecurityCompliant) {
      console.warn(`\n${colors.yellow}${colors.bold}⚠️ ALERTA DE SEGURIDAD:${colors.reset}`);
      report.summary.tablesWithRlsDisabled.forEach(t => console.warn(`   - ${t}`));
    } else {
      console.log(`\n${colors.green}${colors.bold}✅ CUMPLIMIENTO TOTAL:${colors.reset} Todas las tablas tienen RLS activo.`);
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    report.error = msg;
    console.error(`\n${colors.red}💥 FALLO CATASTRÓFICO EN LA AUDITORÍA:${colors.reset} ${msg}`);
  }

  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n${colors.cyan}[REPORT]${colors.reset} Artefacto forense generado: ${colors.gray}${reportPath}${colors.reset}\n`);
}

auditSupabase();