/**
 * @file apps/portfolio-web/src/lib/portal/actions/media.actions.ts
 * @description Motor de Ingesta y Purga Multimedia (Server Actions).
 *              Refactorizado: Inyección dinámica de configuración (Lazy Load) para 
 *              erradicar el error 'Module not found' en el build de Vercel.
 * @version 3.2 - Build-Safe Runtime Engine
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload } from 'payload';
import { revalidatePath } from 'next/cache';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA Y CONTRATOS
 * @pilar V: Adherencia arquitectónica.
 */
import { shapeMediaEntity, type SovereignMedia } from '../shapers/media.shaper';
import type { PayloadMediaDoc } from '@metashark/cms-core';

/**
 * CONTRATOS DE VALIDACIÓN (SSoT)
 */
const uploadMediaSchema = z.object({
  alt: z.string().min(8, 'EDITORIAL_ERR: Alt text must be descriptive for SEO (min 8 chars)'),
  tenantId: z.string().uuid('SECURITY_ERR: Invalid Tenant Identifier'),
  file: z.instanceof(File, { message: 'INFRA_ERR: Payload must be a valid binary File' }),
});

const deleteMediaSchema = z.object({
  id: z.string().min(1, 'INFRA_ERR: Target ID required'),
  tenantId: z.string().uuid('SECURITY_ERR: Invalid Tenant Identifier'),
});

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string[];
};

/**
 * @description Obtención perezosa del config para evitar empaquetado estático en el build.
 */
async function getPayloadConfig() {
  const config = await import('@metashark/cms-core/config');
  return config.default;
}

export async function uploadMediaAction(formData: FormData): Promise<ActionResponse<SovereignMedia>> {
  const traceId = `media_ingest_${Date.now()}`;
  console.group(`[HEIMDALL][ACTION] Media Ingestion: ${traceId}`);

  try {
    const rawData = {
      file: formData.get('file'),
      alt: formData.get('alt'),
      tenantId: formData.get('tenantId'),
    };

    const validation = uploadMediaSchema.safeParse(rawData);

    if (!validation.success) {
      const issues = validation.error.issues.map(i => i.message);
      return { success: false, error: 'VALIDATION_FAILED', issues };
    }

    const { file, alt, tenantId } = validation.data;
    
    // Inyección dinámica de configuración
    const config = await getPayloadConfig();
    const payload = await getPayload({ config });
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await payload.create({
      collection: 'media',
      data: {
        alt,
        tenant: tenantId,
      },
      file: {
        data: buffer,
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
    });

    revalidatePath('/portal');

    const shapedAsset = shapeMediaEntity(result as unknown as PayloadMediaDoc, tenantId);

    if (!shapedAsset) {
      throw new Error('TENANT_BOUNDARY_BREACH_DETECTED_POST_INGESTION');
    }

    return { success: true, data: shapedAsset };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'CLOUD_SYNC_FAILURE';
    console.error(`[CRITICAL] Ingestion Aborted: ${msg}`);
    return { success: false, error: msg };
  } finally {
    console.groupEnd();
  }
}

export async function deleteMediaAction(id: string, tenantId: string): Promise<ActionResponse<void>> {
  const traceId = `media_purge_${Date.now()}`;
  console.group(`[HEIMDALL][ACTION] Media Purge: ${traceId}`);

  try {
    const validation = deleteMediaSchema.safeParse({ id, tenantId });

    if (!validation.success) {
      return { success: false, error: 'INVALID_SECURITY_PARAMETERS' };
    }

    const config = await getPayloadConfig();
    const payload = await getPayload({ config });

    const asset = await payload.findByID({
      collection: 'media',
      id: id,
    });

    if (!asset) {
      throw new Error('ASSET_NOT_FOUND');
    }

    const assetTenant = typeof asset.tenant === 'object' && asset.tenant !== null 
      ? asset.tenant.id 
      : asset.tenant;

    if (assetTenant !== tenantId) {
      throw new Error('UNAUTHORIZED_PERIMETER_ACCESS');
    }

    await payload.delete({
      collection: 'media',
      id: id,
    });

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