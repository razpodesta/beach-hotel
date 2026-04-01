/**
 * @file scripts/supabase/dump-cluster-state.ts
 * @version 1.2 - SSL Bypass Hardened
 */

// --- FIX CRÍTICO: Bypass global de TLS para diagnóstico ---
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Client } from 'pg';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const REPORT_DIR = path.resolve(process.cwd(), 'reports/databases/supabase');
const OUTPUT_FILE = path.join(REPORT_DIR, 'cluster-state-dump.json');

/**
 * @interface ClusterDump
 * @description Contrato estricto para el volcado de datos.
 */
interface TableSnapshot {
  rowCount: number;
  sample: Record<string, unknown>[];
}

interface ClusterDump {
  timestamp: string;
  clusterState: Record<string, TableSnapshot>;
}

async function dumpClusterState(): Promise<void> {
  console.log(`\n🚀 [HEIMDALL] Iniciando Volcado Forense...`);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  const report: ClusterDump = {
    timestamp: new Date().toISOString(),
    clusterState: {}
  };

  try {
    const tablesRes = await client.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      
      const countRes = await client.query<{ count: string }>(`SELECT COUNT(*) FROM "${tableName}"`);
      const sampleRes = await client.query<Record<string, unknown>>(`SELECT * FROM "${tableName}" LIMIT 3`);
      
      report.clusterState[tableName] = {
        rowCount: parseInt(countRes.rows[0].count, 10),
        sample: sampleRes.rows
      };
      
      console.log(`   ✓ Volcado de ${tableName} completado.`);
    }

    await fs.mkdir(REPORT_DIR, { recursive: true });
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(report, null, 2));
    
    console.log(`\n✨ Snapshot Forense generado en: ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('💥 Fallo en el volcado:', err);
  } finally {
    await client.end();
  }
}

dumpClusterState();