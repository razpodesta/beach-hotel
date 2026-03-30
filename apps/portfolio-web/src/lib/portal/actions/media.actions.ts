/**
 * @file apps/portfolio-web/src/lib/portal/actions/media.actions.ts
 * @description Motor de Ingesta y Purga Multimedia (Server Actions).
 *              Orquesta la carga y eliminación de binarios hacia el Clúster S3 de Supabase.
 *              Refactorizado: Blindaje perimetral mediante esquemas Zod (Pilar III.IV),
 *              observabilidad forense Heimdall y resiliencia Multi-Tenant.
 * @version 3.0 - Shielded Actions & Zod Validation
 * @author Raz Podestá - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { revalidatePath } from 'next/cache';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA Y CONTRATOS
 * @pilar V: Adherencia arquitectónica.
 */
import { shapeMediaEntity, type SovereignMedia } from '../shapers/media.shaper';
import type { PayloadMediaDoc } from '@metashark/cms-core';

/**
 * CONTRATOS DE VALIDACIÓN (SSoT)
 * @description Define la integridad requerida para interactuar con la Bóveda S3.
 */
const uploadMediaSchema = z.object({
  alt: z.string().min(8, 'EDITORIAL_ERR: Alt text must be descriptive for SEO (min 8 chars)'),
  tenantId: z.string().uuid('SECURITY_ERR: Invalid Tenant Identifier'),
  // El archivo se valida por su presencia y tipo básico
  file: z.instanceof(File, { message: 'INFRA_ERR: Payload must be a valid binary File' }),
});

const deleteMediaSchema = z.object({
  id: z.string().min(1, 'INFRA_ERR: Target ID required'),
  tenantId: z.string().uuid('SECURITY_ERR: Invalid Tenant Identifier'),
});

/**
 * TIPO RESULTADO SOBERANO
 */
type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string[];
};

/**
 * ACCIÓN SOBERANA: uploadMediaAction
 * @description Procesa un archivo binario y lo persiste en la Bóveda Cloud.
 * @pilar IV: Observabilidad Heimdall.
 * @pilar VIII: Resiliencia de Operación.
 */
export async function uploadMediaAction(formData: FormData): Promise<ActionResponse<SovereignMedia>> {
  const traceId = `media_ingest_${Date.now()}`;
  console.group(`[HEIMDALL][ACTION] Media Ingestion: ${traceId}`);

  try {
    // 1. EXTRACCIÓN Y VALIDACIÓN PERIMETRAL (Pilar III)
    const rawData = {
      file: formData.get('file'),
      alt: formData.get('alt'),
      tenantId: formData.get('tenantId'),
    };

    const validation = uploadMediaSchema.safeParse(rawData);

    if (!validation.success) {
      const issues = validation.error.issues.map(i => i.message);
      console.warn(`[VALIDATION_FAIL] Ingestion rejected: ${issues.join(', ')}`);
      return { success: false, error: 'VALIDATION_FAILED', issues };
    }

    const { file, alt, tenantId } = validation.data;

    // 2. PREPARACIÓN DE MOTOR CMS
    const payload = await getPayload({ config: await configPromise });
    
    // 3. TRANSMUTACIÓN BINARIA (Pilar X: Performance)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[STATUS] Transmitting binary to Cloud Cluster: ${file.name}`);

    // 4. PERSISTENCIA ATÓMICA EN SUPABASE S3
    const result = await payload.create({
      collection: 'media',
      data: {
        alt,
        tenantId,
      },
      file: {
        data: buffer,
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
    });

    console.log(`[SUCCESS] Asset indexed in Cloud Vault: ${result.id}`);
    
    // 5. SINCRONIZACIÓN DE CACHÉ
    revalidatePath('/portal');

    /**
     * @pilar IX: Justificación de 'as'.
     * Validado por el esquema superior 'uploadMediaSchema', garantizando 
     * compatibilidad con el Shaper.
     */
    return { 
      success: true, 
      data: shapeMediaEntity(result as unknown as PayloadMediaDoc) 
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'CLOUD_SYNC_FAILURE';
    console.error(`[CRITICAL] Ingestion Aborted: ${msg}`);
    return { success: false, error: msg };
  } finally {
    console.groupEnd();
  }
}

/**
 * ACCIÓN SOBERANA: deleteMediaAction
 * @description Purga un activo de la bóveda S3 verificando estrictamente 
 *              el perímetro de propiedad (Tenant ID).
 * @pilar VIII: Aislamiento Multi-Tenant (Seguridad).
 */
export async function deleteMediaAction(id: string, tenantId: string): Promise<ActionResponse<void>> {
  const traceId = `media_purge_${Date.now()}`;
  console.group(`[HEIMDALL][ACTION] Media Purge: ${traceId}`);

  try {
    // 1. VALIDACIÓN DE IDENTIDAD TÉCNICA
    const validation = deleteMediaSchema.safeParse({ id, tenantId });

    if (!validation.success) {
      console.warn('[SECURITY] Purge rejected: Illegal parameters detected.');
      return { success: false, error: 'INVALID_SECURITY_PARAMETERS' };
    }

    const payload = await getPayload({ config: await configPromise });

    // 2. ESCUDO DE PROPIEDAD (Tenant Boundary Shield)
    const asset = await payload.findByID({
      collection: 'media',
      id: id,
    });

    if (!asset) {
      throw new Error('ASSET_NOT_FOUND');
    }

    // Verificación de integridad referencial del Tenant
    if (asset.tenantId !== tenantId) {
      console.error(`[SECURITY_ALERT] Breach Attempt: Tenant ${tenantId} tried to purge asset ${id} owned by ${asset.tenantId}`);
      throw new Error('UNAUTHORIZED_PERIMETER_ACCESS');
    }

    console.log(`[STATUS] Ownership verified. Eradicating asset...`);

    // 3. DESTRUCCIÓN ATÓMICA
    await payload.delete({
      collection: 'media',
      id: id,
    });

    console.log(`[SUCCESS] Asset purged from Cloud Vault and DB.`);

    // 4. SINCRONIZACIÓN DE INTERFAZ
    revalidatePath('/portal');

    return { success: true };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'CLOUD_PURGE_FAILURE';
    console.error(`[CRITICAL] Purge Aborted: ${msg}`);
    return { success: false, error: msg };
  } finally {
    console.groupEnd();
  }
}