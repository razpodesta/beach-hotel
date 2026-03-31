/**
 * @file apps/portfolio-web/src/lib/portal/actions/ingest.actions.ts
 * @description Enterprise Data Ingestion & CRM Synchronization Pipeline (Silo C).
 *              Orquesta la captura de activos multi-modal, el parseo de documentos
 *              XLSX/CSV y la inyección masiva en el repositorio de suscriptores.
 *              Implementa telemetría forense, deduplicación y aislamiento perimetral.
 * @version 6.0 - Enterprise Level 4.0 | ESLint Zero-Any & Const Sync
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { dataParser, type AudienceNode } from '../../services/data-parser';

/**
 * CONTRATO DE INTEGRIDAD (SSoT)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
const dataIngestionSchema = z.object({
  subject: z.string().min(1, 'PIPELINE_ERR: Subject identifier required'),
  type: z.enum(['document', 'image', 'audio', 'text']),
  channel: z.enum(['web', 'whatsapp', 'email', 'api']),
  tenant: z.string().uuid('PIPELINE_ERR: Invalid Tenant Perimeter'),
  content: z.string().optional(),
  sender: z.record(z.string(), z.unknown()).optional(),
});

export type IngestionResponse = {
  success: boolean;
  ingestionId?: string;
  metrics?: {
    nodesInjected: number;
    duplicatesSkipped: number;
    latencyMs: string;
  };
  error?: string;
};

/**
 * MODULE: executeDataIngestion
 * @description Orquestador del flujo de datos desde el binario hasta el CRM Core.
 */
export async function executeDataIngestion(
  formData: FormData,
  rawMetadata: unknown
): Promise<IngestionResponse> {
  const startTime = performance.now();
  const traceId = `ingest_sync_${Date.now()}`;
  
  console.group(`[ENTERPRISE][PIPELINE] Data Ingestion & Sync: ${traceId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL (Gatekeeper)
    const metadata = dataIngestionSchema.parse(rawMetadata);
    const payload = await getPayload({ config: await configPromise });

    let linkedMediaId: string | undefined;
    
    // @fix ESLint (prefer-const): El objeto muta internamente, la referencia no cambia.
    const injectionMetrics = { nodesInjected: 0, duplicatesSkipped: 0 };
    
    // @fix ESLint (no-explicit-any): Tipado estricto vinculado al motor de parseo.
    let processedJsonData: AudienceNode[] = [];

    const file = formData.get('file') as File | null;

    // 2. PROCESAMIENTO ESTRATÉGICO DE BINARIOS
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      
      // A. RESPALDO FÍSICO EN REPOSITORY (S3)
      const mediaRecord = await payload.create({
        collection: 'media',
        data: {
          alt: `Source: ${metadata.subject} | Type: ${metadata.type}`,
          tenant: metadata.tenant,
        },
        file: {
          data: Buffer.from(arrayBuffer),
          name: file.name,
          mimetype: file.type,
          size: file.size,
        },
      });
      linkedMediaId = String(mediaRecord.id);

      // B. INTELIGENCIA DE DATOS (Si es documento, parsear e inyectar)
      if (metadata.type === 'document') {
        console.log(`[PIPELINE] Document detected. Initializing Transmutation Engine...`);
        const parserResult = await dataParser.parseExcelBuffer(arrayBuffer);
        
        if (parserResult.success && parserResult.data.length > 0) {
          processedJsonData = parserResult.data;
          
          /**
           * PROTOCOLO DE INYECCIÓN CRM (Bulk Sync)
           * @description Itera los nodos parseados y los inserta en el Core CRM.
           * Se utiliza un loop secuencial para proteger el Pooler de Supabase.
           */
          const SUBSCRIBER_COLLECTION = 'subscribers' as CollectionSlug;
          
          for (const node of parserResult.data) {
            try {
              // Verificación de Colisión (Deduplicación en DB)
              const existing = await payload.find({
                collection: SUBSCRIBER_COLLECTION,
                where: {
                  and: [{ email: { equals: node.email } }, { tenant: { equals: metadata.tenant } }]
                },
                limit: 1
              });

              if (existing.docs.length === 0) {
                await payload.create({
                  collection: SUBSCRIBER_COLLECTION,
                  data: {
                    email: node.email,
                    tenant: metadata.tenant,
                    source: `ingest_${metadata.subject}`,
                    status: 'active'
                  }
                });
                injectionMetrics.nodesInjected++;
              } else {
                injectionMetrics.duplicatesSkipped++;
              }
            } catch (err) {
              console.warn(`[PIPELINE][NON-FATAL] Failed to inject node ${node.email}:`, err);
            }
          }
        }
      }
    }

    // 3. INDEXACIÓN DE LA OPERACIÓN (Traceability)
    const ingestionResult = await payload.create({
      collection: 'ingestions' as CollectionSlug,
      data: {
        subject: metadata.subject,
        type: metadata.type,
        channel: metadata.channel,
        tenant: metadata.tenant,
        rawContent: metadata.content,
        asset: linkedMediaId,
        processedData: processedJsonData,
        pipelineMetrics: {
          executionTimeMs: Math.round(performance.now() - startTime),
          itemsProcessed: injectionMetrics.nodesInjected,
          errorCount: injectionMetrics.duplicatesSkipped
        },
        senderInfo: metadata.sender,
        status: 'processed'
      }
    });

    const totalLatency = (performance.now() - startTime).toFixed(2);
    console.log(`[SUCCESS] Pipeline Completed. Injected: ${injectionMetrics.nodesInjected} | Skipped: ${injectionMetrics.duplicatesSkipped}`);

    return { 
      success: true, 
      ingestionId: String(ingestionResult.id),
      metrics: {
        ...injectionMetrics,
        latencyMs: `${totalLatency}ms`
      }
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_PIPELINE_DRIFT';
    console.error(`[CRITICAL][PIPELINE] Execution Aborted: ${msg}`);
    return { success: false, error: msg };
  } finally {
    console.groupEnd();
  }
}