/**
 * @file apps/portfolio-web/src/lib/portal/actions/ingest.actions.ts
 * @description Enterprise Data Ingestion Pipeline (Silo C).
 *              Refactorizado: Erradicación de TS2322 (Schema Drift). Sincronización
 *              del contrato Zod con el SSoT de la colección 'Ingestions' de Payload.
 * @version 8.3 - Schema Sync & Linter Pure
 * @author Raz Podestá -  MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type SanitizedConfig } from 'payload';
import { dataParser, type AudienceNode, type ParserIssue } from '../../services/data-parser';

/** 
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 * @pilar XIII: Build Isolation - Previene la instanciación de DB durante el build.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * CONTRATO DE INTEGRIDAD DE INGESTA (SSoT)
 * @fix TS2322: Se purga 'email' del enum para alinear 1:1 con la base de datos.
 */
const dataIngestionSchema = z.object({
  subject: z.string().min(1, 'SUBJECT_REQUIRED'),
  type: z.enum(['document', 'image', 'audio', 'text']),
  channel: z.enum(['web', 'whatsapp', 'api']), // Sincronizado con Ingestions.ts
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

export async function executeDataIngestion(
  formData: FormData, 
  rawMetadata: unknown
): Promise<IngestionResponse> {
  const startTime = performance.now();
  const traceId = `ingest_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) {
    return { success: false, error: 'BUILD_BYPASS', traceId };
  }

  console.group(`\n${C.magenta}${C.bold}[DNA][PIPELINE]${C.reset} Handshake Ingestion: ${C.cyan}${traceId}${C.reset}`);

  try {
    const metadata = dataIngestionSchema.parse(rawMetadata);
    
    const configModule = await import('@metashark/cms-core/config');
    const payloadConfig = (await configModule.default) as unknown as SanitizedConfig;
    const payload = await getPayload({ config: payloadConfig });
    
    let linkedMediaId: string | undefined;
    let processedJsonData: AudienceNode[] = [];
    let parserIssues: ParserIssue[] =[];
    
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
          tenant: metadata.tenant,
          assetContext: 'system' // @fix: Requerido por SSoT para evitar Draft Fallback
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
            collection: 'subscribers', // @fix: Literal Narrowing
            where: { 
              and:[
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

          console.log(`   ${C.cyan}→ [SYNC]${C.reset} Injecting ${validNodes.length} nodes into CRM Perimeter...`);
          
          // 6. INYECCIÓN ATÓMICA EN CRM
          await Promise.all(validNodes.map(node => 
            payload.create({
              collection: 'subscribers',
              data: { 
                email: node.email, 
                tenant: metadata.tenant, 
                status: 'active', 
                source: `ingest_${traceId}`,
                consentMarketing: true // @fix: Requerido por SSoT CRM
              }
            }).catch(e => console.error(`[${traceId}] CRM Breach: ${node.email}`, e))
          ));
          
          finalMetrics.nodesInjected = validNodes.length;
        }
      }
    }

    // 7. REGISTRO DE MISIÓN (Ledger Audit)
    const ingestionResult = await payload.create({
      collection: 'ingestions', // @fix: Literal Narrowing
      data: {
        subject: metadata.subject,
        type: metadata.type,
        channel: metadata.channel,
        tenant: metadata.tenant,
        // @fix: Mapeamos asset (inexistente) a metadata.
        senderInfo: { ...metadata.sender, linkedMediaId },
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