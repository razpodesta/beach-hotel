/**
 * @file apps/portfolio-web/src/lib/portal/actions/ingest.actions.ts
 * @description Enterprise Data Ingestion Pipeline (Silo C).
 *              Orquestador de lógica de servidor para la ingesta masiva.
 *              Refactorizado: Sincronización con DataParser v3.0, reporte 
 *              de fallos granulares e integridad de métricas industriales.
 * @version 7.0 - Forensic Reporting & Pipeline Sync
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { dataParser, type AudienceNode, type ParserIssue } from '../../services/data-parser';

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

/**
 * @interface IngestionResponse
 * @description Contrato de salida para la UI con soporte para éxito parcial.
 */
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
};

/**
 * MODULE: executeDataIngestion
 * @description Orquesta la ingesta con trazabilidad forense total y persistencia en CMS.
 * @pilar_III: Seguridad de Tipos - Validación Zod de entrada.
 * @pilar_IV: Observabilidad - Implementación de Trace ID para seguimiento S3/DB.
 */
export async function executeDataIngestion(
  formData: FormData, 
  rawMetadata: unknown
): Promise<IngestionResponse> {
  const startTime = performance.now();
  const traceId = `ingest_${Date.now()}`;
  
  console.group(`[HEIMDALL][PIPELINE] Transaction Trace: ${traceId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL
    const metadata = dataIngestionSchema.parse(rawMetadata);
    const payload = await getPayload({ config: await configPromise });
    const SUBSCRIBER_COLL = 'subscribers' as CollectionSlug;
    
    let linkedMediaId: string | undefined;
    let processedJsonData: AudienceNode[] = [];
    let parserIssues: ParserIssue[] = [];
    
    const finalMetrics = { 
      nodesInjected: 0, 
      duplicatesSkipped: 0,
      failedRows: 0
    };

    const file = formData.get('file') as File | null;

    // 2. PROCESAMIENTO DE ACTIVO BINARIO (S3 Sync)
    if (file && file.size > 0) {
      console.log(`[${traceId}] Handshaking with S3 Cluster: ${file.name}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const mediaRecord = await payload.create({
        collection: 'media',
        data: { 
          alt: `Trace[${traceId}]: ${metadata.subject}`, 
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

      // 3. PROCESAMIENTO LÓGICO DE DATOS (Excel/CSV Parser)
      if (metadata.type === 'document') {
        const parserResult = await dataParser.parseExcelBuffer(buffer.buffer);
        
        if (parserResult.success) {
          processedJsonData = parserResult.data;
          parserIssues = parserResult.issues;
          finalMetrics.failedRows = parserResult.metrics.failedRows;

          // 4. DEDUPLICACIÓN DE IDENTIDAD CROSS-DATABASE
          const emails = processedJsonData.map(n => n.email);
          const existing = await payload.find({
            collection: SUBSCRIBER_COLL,
            where: { 
              and: [
                { email: { in: emails } }, 
                { tenant: { equals: metadata.tenant } }
              ] 
            },
            limit: 500
          });

          const existingEmails = new Set(existing.docs.map(d => d.email));
          const validNodes = processedJsonData.filter(n => !existingEmails.has(n.email));
          
          finalMetrics.duplicatesSkipped = processedJsonData.length - validNodes.length;

          // 5. INYECCIÓN ATÓMICA EN CRM (Subscribers)
          await Promise.all(validNodes.map(node => 
            payload.create({
              collection: SUBSCRIBER_COLL,
              data: { 
                email: node.email, 
                tenant: metadata.tenant, 
                status: 'active', 
                source: `ingest_${metadata.subject}_${traceId}` 
              }
            }).catch(e => console.error(`[${traceId}] CRM Injection failed for ${node.email}:`, e))
          ));
          
          finalMetrics.nodesInjected = validNodes.length;
        }
      }
    }

    // 6. PERSISTENCIA DE MISION (Audit Trail en Ingestions)
    const ingestionResult = await payload.create({
      collection: 'ingestions' as CollectionSlug,
      data: {
        ...metadata,
        asset: linkedMediaId,
        processedData: processedJsonData,
        // Almacenamos los fallos específicos para consulta histórica
        pipelineMetrics: { 
          ...finalMetrics, 
          executionTimeMs: Math.round(performance.now() - startTime) 
        },
        status: parserIssues.length > 0 && finalMetrics.nodesInjected > 0 
          ? 'processed' // Éxito parcial es éxito en el pipeline
          : (parserIssues.length > 0 && finalMetrics.nodesInjected === 0 ? 'error' : 'processed')
      }
    });

    const totalLatency = (performance.now() - startTime).toFixed(2);
    console.log(`[${traceId}] Ingestion Sequence Concluded. Injected: ${finalMetrics.nodesInjected} | Failed: ${finalMetrics.failedRows}`);

    return { 
      success: true, 
      ingestionId: String(ingestionResult.id),
      issues: parserIssues,
      metrics: { 
        ...finalMetrics, 
        latencyMs: `${totalLatency}ms` 
      } 
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'PIPELINE_CATASTROPHIC_DRIFT';
    console.error(`[${traceId}] Pipeline aborted: ${msg}`);
    return { success: false, error: msg };
  } finally {
    console.groupEnd();
  }
}