/**
 * @file apps/portfolio-web/src/lib/portal/actions/ingest.actions.ts
 * @description Enterprise Data Ingestion Pipeline (Silo C).
 *              Refactorizado: Build-Time Isolation absoluto. Erradicada la importación
 *              estática de configPromise. Implementada lógica de carga dinámica 
 *              para prevenir el envenenamiento de los trabajadores de build.
 * @version 7.1 - Static Build Immunity
 * @author Raz Podestá -  MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug, type SanitizedConfig } from 'payload';
import { dataParser, type AudienceNode, type ParserIssue } from '../../services/data-parser';

/** 
 * DETECTOR DE ENTORNO DE CONSTRUCCIÓN
 * @pilar XIII: Build Isolation - Previene fugas de lógica de servidor al frontend.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

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
};

/**
 * MODULE: executeDataIngestion
 * @description Orquesta la ingesta con trazabilidad forense total y persistencia en CMS.
 */
export async function executeDataIngestion(
  formData: FormData, 
  rawMetadata: unknown
): Promise<IngestionResponse> {
  // Guardia contra build estático
  if (IS_BUILD_ENV) {
    return { success: false, error: 'BUILD_BYPASS' };
  }

  const startTime = performance.now();
  const traceId = `ingest_${Date.now()}`;
  
  console.group(`[HEIMDALL][PIPELINE] Transaction Trace: ${traceId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL
    const metadata = dataIngestionSchema.parse(rawMetadata);
    
    // 2. CARGA DINÁMICA DE CONFIGURACIÓN (Build-Safe)
    const configModule = await import('@metashark/cms-core/config');
    const payloadConfig = (await configModule.default) as SanitizedConfig;
    const payload = await getPayload({ config: payloadConfig });
    
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

    // 3. PROCESAMIENTO DE ACTIVO BINARIO (S3 Sync)
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

      // 4. PROCESAMIENTO LÓGICO DE DATOS (Excel/CSV Parser)
      if (metadata.type === 'document') {
        const parserResult = await dataParser.parseExcelBuffer(buffer.buffer);
        
        if (parserResult.success) {
          processedJsonData = parserResult.data;
          parserIssues = parserResult.issues;
          finalMetrics.failedRows = parserResult.metrics.failedRows;

          // 5. DEDUPLICACIÓN DE IDENTIDAD
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

          // 6. INYECCIÓN ATÓMICA EN CRM (Subscribers)
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

    // 7. PERSISTENCIA DE MISION
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

    const totalLatency = (performance.now() - startTime).toFixed(2);
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