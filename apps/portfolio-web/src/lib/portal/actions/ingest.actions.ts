/**
 * @file apps/portfolio-web/src/lib/portal/actions/ingest.actions.ts
 * @description Enterprise Data Ingestion Pipeline (Silo C).
 *              Refactorizado: Trazabilidad forense (traceId integrado),
 *              observabilidad total ante fallos y cumplimiento estricto de ESLint.
 * @version 6.2 - Forensic Observability & Clean Code
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { dataParser, type AudienceNode } from '../../services/data-parser';

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
  metrics?: { nodesInjected: number; duplicatesSkipped: number; latencyMs: string };
  error?: string;
};

/**
 * MODULE: executeDataIngestion
 * @description Orquesta la ingesta con trazabilidad forense total.
 */
export async function executeDataIngestion(
  formData: FormData, 
  rawMetadata: unknown
): Promise<IngestionResponse> {
  const startTime = performance.now();
  const traceId = `ingest_${Date.now()}`;
  
  console.group(`[HEIMDALL][PIPELINE] Transaction Trace: ${traceId}`);

  try {
    const metadata = dataIngestionSchema.parse(rawMetadata);
    const payload = await getPayload({ config: await configPromise });
    const SUBSCRIBER_COLL = 'subscribers' as CollectionSlug;
    
    let linkedMediaId: string | undefined;
    const metrics = { nodesInjected: 0, duplicatesSkipped: 0 };
    let processedJsonData: AudienceNode[] = [];

    const file = formData.get('file') as File | null;

    if (file && file.size > 0) {
      console.log(`[${traceId}] Processing asset: ${file.name}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const mediaRecord = await payload.create({
        collection: 'media',
        data: { alt: `Trace[${traceId}]: ${metadata.subject}`, tenant: metadata.tenant },
        file: { data: buffer, name: file.name, mimetype: file.type, size: file.size }
      });
      linkedMediaId = String(mediaRecord.id);

      if (metadata.type === 'document') {
        const parserResult = await dataParser.parseExcelBuffer(buffer.buffer);
        if (parserResult.success) {
          processedJsonData = parserResult.data;
          
          const emails = processedJsonData.map(n => n.email);
          const existing = await payload.find({
            collection: SUBSCRIBER_COLL,
            where: { and: [{ email: { in: emails } }, { tenant: { equals: metadata.tenant } }] },
            limit: 500
          });

          const existingEmails = new Set(existing.docs.map(d => d.email));
          const validNodes = processedJsonData.filter(n => !existingEmails.has(n.email));
          
          metrics.duplicatesSkipped = processedJsonData.length - validNodes.length;

          await Promise.all(validNodes.map(node => 
            payload.create({
              collection: SUBSCRIBER_COLL,
              data: { email: node.email, tenant: metadata.tenant, status: 'active', source: `ingest_${metadata.subject}` }
            }).catch(e => console.error(`[${traceId}] Ingestion failed for ${node.email}:`, e))
          ));
          
          metrics.nodesInjected = validNodes.length;
        }
      }
    }

    const ingestionResult = await payload.create({
      collection: 'ingestions' as CollectionSlug,
      data: {
        ...metadata,
        asset: linkedMediaId,
        processedData: processedJsonData,
        pipelineMetrics: { 
          ...metrics, 
          executionTimeMs: Math.round(performance.now() - startTime) 
        },
        status: 'processed'
      }
    });

    const totalLatency = (performance.now() - startTime).toFixed(2);
    console.log(`[${traceId}] Pipeline Completed Successfully. Injected: ${metrics.nodesInjected}`);

    return { 
      success: true, 
      ingestionId: String(ingestionResult.id), 
      metrics: { ...metrics, latencyMs: `${totalLatency}ms` } 
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'PIPELINE_DRIFT';
    console.error(`[${traceId}] Critical failure: ${msg}`);
    return { success: false, error: msg };
  } finally {
    console.groupEnd();
  }
}