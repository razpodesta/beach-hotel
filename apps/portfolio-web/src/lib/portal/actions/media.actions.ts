/**
 * @file apps/portfolio-web/src/lib/portal/actions/media.actions.ts
 * @description Motor de Ingesta y Purga Multimedia (Server Actions).
 *              Refactorizado: Resolución de TS2352 y TS2345 (Payload Draft Fallback Trap)
 *              mediante la inyección de propiedades SSoT obligatorias (assetContext).
 * @version 4.4 - Build-Safe & Type Sealed
 * @author Raz Podestá -  MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type SanitizedConfig } from 'payload';
import { revalidatePath } from 'next/cache';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA 
 */
import { shapeMediaEntity, type SovereignMedia } from '../shapers/media.shaper';
import type { PayloadMediaDoc } from '@metashark/cms-core';

/**
 * @pilar XIII: Build Isolation.
 */
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';

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
 * @description Obtención dinámica y segura de configuración.
 * @fix TS2352: Resolución de promesas anidadas y casting a SanitizedConfig.
 */
async function getPayloadConfig(): Promise<SanitizedConfig> {
  const configModule = await import('@metashark/cms-core/config');
  return (await configModule.default) as unknown as SanitizedConfig;
}

export async function uploadMediaAction(formData: FormData): Promise<ActionResponse<SovereignMedia>> {
  if (IS_BUILD_ENV) return { success: false, error: 'BUILD_BYPASS' };

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
    
    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    /** 
     * @fix TS2345: Payload Draft Fallback Trap.
     * La colección 'Media' requiere la propiedad 'assetContext'. 
     * Al inyectarla, TypeScript reconoce la firma principal.
     */
    const result = await payload.create({
      collection: 'media',
      data: {
        alt,
        tenant: tenantId,
        assetContext: 'system' 
      },
      file: {
        data: buffer,
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
    });

    revalidatePath('/portal');

    // Casting seguro mediante contrato centralizado
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
  if (IS_BUILD_ENV) return { success: false, error: 'BUILD_BYPASS' };

  try {
    const validation = deleteMediaSchema.safeParse({ id, tenantId });
    if (!validation.success) {
      return { success: false, error: 'INVALID_SECURITY_PARAMETERS' };
    }

    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });

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
  }
}