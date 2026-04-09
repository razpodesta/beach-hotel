/**
 * @file apps/portfolio-web/src/lib/portal/actions/ingest.actions.ts
 * @description Enterprise Data Ingestion Pipeline (Silo C).
 *              Refactorizado: Purga de extensión .js para cumplimiento con resolución "bundler".
 * @version 8.1 - Bundler Resolution Standard
 * @author Raz Podestá -  MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug, type SanitizedConfig } from 'payload';
// @fix: Eliminación de extensión .js para resolución nativa bundler
import { dataParser, type AudienceNode, type ParserIssue } from '../../services/data-parser';

/** 
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 * @pilar XIII: Build Isolation - Previene la instanciación de DB durante el build.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

/**
 * PROTOCOLO CROMÁTICO HEIMDALL
 */
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * CONTRATO DE INTEGRIDAD DE INGESTA (SSoT)
 */
const dataIngestionSchema = z.object({
  subject: z.string().min(1, 'SUBJECT_REQUIRED'),
  type: z.enum(['document', 'image', 'audio', 'text']),
  channel: z.enum(['web', 'whatsapp', 'email', 'api']),
  tenant: z.string().uuid('INVALID_TENANT_ID'),
  content: z.string().optional(),
  sender: z.record(z.string(), z.unknown()).optional(),
});

export type IngestionResponse = {
  success: boolean;
  ingestionId?: string;
  metrics?: { 
    nodesInjected: number; 
    duplicatesSkipped: number; 
    failedRows: number;
    latencyMs: string; 
  };
  issues?: ParserIssue[];
  error?: string;
  traceId: string;
};

/**
 * MODULE: executeDataIngestion
 * @description Orquesta la transmutación de archivos en nodos de identidad CRM.
 * @pilar IX: Inversión de Control y Responsabilidad Única.
 */
export async function executeDataIngestion(
  formData: FormData, 
  rawMetadata: unknown
): Promise<IngestionResponse> {
  const startTime = performance.now();
  const traceId = `ingest_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) {
    return { success: false, error: 'BUILD_BYPASS', traceId };
  }

  console.log(`\n${C.magenta}${C.bold}[DNA][PIPELINE]${C.reset} Handshake Ingestion: ${C.cyan}${traceId}${C.reset}`);

  try {
    // 1. VALIDACIÓN DE CONTRATO PERIMETRAL
    const metadata = dataIngestionSchema.parse(rawMetadata);
    
    // 2. INICIALIZACIÓN PEREZOSA (Pilar XIII)
    const configModule = await import('@metashark/cms-core/config');
    const payloadConfig = (await configModule.default) as unknown as SanitizedConfig;
    const payload = await getPayload({ config: payloadConfig });
    
    const SUBSCRIBER_COLL = 'subscribers' as CollectionSlug;
    
    let linkedMediaId: string | undefined;
    let processedJsonData: AudienceNode[] = [];
    let parserIssues: ParserIssue[] = [];
    
    const finalMetrics = { nodesInjected: 0, duplicatesSkipped: 0, failedRows: 0 };
    const file = formData.get('file') as File | null;

    // 3. FASE: PERSISTENCIA BINARIA (S3 Vault)
    if (file && file.size > 0) {
      console.log(`   ${C.cyan}→ [STREAM]${C.reset} Ingesting Binary: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const mediaRecord = await payload.create({
        collection: 'media',
        data: { 
          alt: `Ingest_Trace[${traceId}]: ${metadata.subject}`, 
          tenant: metadata.tenant 
        },
        file: { 
          data: buffer, 
          name: file.name, 
          mimetype: file.type, 
          size: file.size 
        }
      });
      linkedMediaId = String(mediaRecord.id);

      // 4. FASE: TRASMUTACIÓN DE DATOS (Excel/CSV Parser)
      if (metadata.type === 'document') {
        const parserResult = await dataParser.parseExcelBuffer(arrayBuffer, traceId);
        
        if (parserResult.success) {
          processedJsonData = parserResult.data;
          parserIssues = parserResult.issues;
          finalMetrics.failedRows = parserResult.metrics.failedRows;

          // 5. DEDUPLICACIÓN DE IDENTIDAD (O(n) In-Memory)
          const emails = processedJsonData.map(n => n.email);
          const existing = await payload.find({
            collection: SUBSCRIBER_COLL,
            where: { 
              and: [
                { email: { in: emails } }, 
                { tenant: { equals: metadata.tenant } }
              ] 
            },
            limit: 500,
            depth: 0
          });

          const existingEmails = new Set(existing.docs.map(d => d.email));
          const validNodes = processedJsonData.filter(n => !existingEmails.has(n.email));
          
          finalMetrics.duplicatesSkipped = processedJsonData.length - validNodes.length;

          // 6. INYECCIÓN ATÓMICA EN CRM (Transactional Batch Simulation)
          console.log(`   ${C.cyan}→ [SYNC]${C.reset} Injecting ${validNodes.length} nodes into CRM Perimeter...`);
          
          await Promise.all(validNodes.map(node => 
            payload.create({
              collection: SUBSCRIBER_COLL,
              data: { 
                email: node.email, 
                tenant: metadata.tenant, 
                status: 'active', 
                source: `ingest_${traceId}` 
              }
            }).catch(e => console.error(`[${traceId}] CRM Breach: ${node.email}`, e))
          ));
          
          finalMetrics.nodesInjected = validNodes.length;
        }
      }
    }

    // 7. REGISTRO DE MISIÓN (Ledger Audit)
    const ingestionResult = await payload.create({
      collection: 'ingestions' as CollectionSlug,
      data: {
        ...metadata,
        asset: linkedMediaId,
        processedData: processedJsonData,
        pipelineMetrics: { 
          ...finalMetrics, 
          executionTimeMs: Math.round(performance.now() - startTime) 
        },
        status: parserIssues.length > 0 && finalMetrics.nodesInjected > 0 
          ? 'processed' 
          : (parserIssues.length > 0 && finalMetrics.nodesInjected === 0 ? 'error' : 'processed')
      }
    });

    const totalLatency = (performance.now() - startTime).toFixed(4);
    console.log(`${C.green}${C.bold}[GRANTED]${C.reset} Pipeline Complete | Latency: ${totalLatency}ms\n`);

    return { 
      success: true, 
      ingestionId: String(ingestionResult.id),
      issues: parserIssues,
      traceId,
      metrics: { 
        ...finalMetrics, 
        latencyMs: `${totalLatency}ms` 
      } 
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'PIPELINE_CATASTROPHIC_DRIFT';
    console.error(`${C.red}${C.bold}[BREACH] Ingestion Aborted:${C.reset} ${msg}`);
    return { success: false, error: msg, traceId };
  } finally {
    console.groupEnd();
  }
}