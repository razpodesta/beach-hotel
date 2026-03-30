/**
 * @file media.actions.ts
 * @description Motor de Ingesta y Purga Multimedia (Server Actions).
 *              Orquesta la carga y eliminación de binarios hacia el Clúster S3 de Supabase.
 *              Refactorizado: Resolución de TS2345 mediante aserción estructural
 *              justificada para la API local de Payload.
 * @version 2.1 - S3 Cloud CRUD & Type Assertion Compliant
 * @author Raz Podestá - MetaShark Tech
 */

'use server';

import { getPayload } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { revalidatePath } from 'next/cache';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA Y CONTRATOS
 */
import { shapeMediaEntity, type SovereignMedia } from '../shapers/media.shaper';
import type { PayloadMediaDoc } from '@metashark/cms-core';

/**
 * ACCIÓN SOBERANA: uploadMediaAction
 * @description Procesa un archivo binario y lo persiste en la Bóveda Cloud.
 * @pilar IV: Observabilidad Heimdall.
 * @pilar VIII: Resiliencia de Operación.
 */
export async function uploadMediaAction(formData: FormData): Promise<{ 
  success: boolean; 
  data?: SovereignMedia; 
  error?: string 
}> {
  const traceId = `media_ingest_${Date.now()}`;
  console.group(`[HEIMDALL][ACTION] Media Ingestion: ${traceId}`);

  try {
    const payload = await getPayload({ config: await configPromise });
    
    // 1. Extracción de Payload
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;
    const tenantId = formData.get('tenantId') as string;

    if (!file || !alt || !tenantId) {
      throw new Error('MISSING_REQUIRED_FIELDS');
    }

    // 2. Transmutación a Buffer para el motor de Payload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[STATUS] Transmitting binary to S3: ${file.name} (${file.size} bytes)`);

    // 3. Persistencia atómica en Supabase S3
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
    
    // 4. Invalidación de caché para reflejar cambios en galerías
    revalidatePath('/portal');

    /**
     * @pilar IX: Justificación de 'as'.
     * Payload.create devuelve un genérico (JsonObject). Realizamos un cast seguro
     * porque garantizamos en el objeto 'data' superior que los campos obligatorios
     * del contrato PayloadMediaDoc (como 'alt') están presentes.
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
 * @pilar IV: Observabilidad Heimdall.
 * @pilar VIII: Aislamiento Multi-Tenant (Seguridad).
 */
export async function deleteMediaAction(id: string, tenantId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const traceId = `media_purge_${Date.now()}`;
  console.group(`[HEIMDALL][ACTION] Media Purge: ${traceId}`);

  try {
    if (!id || !tenantId) {
      throw new Error('INVALID_PURGE_PARAMETERS');
    }

    const payload = await getPayload({ config: await configPromise });

    // 1. Verificación de Propiedad (Tenant Boundary Shield)
    const asset = await payload.findByID({
      collection: 'media',
      id: id,
    });

    if (!asset) {
      throw new Error('ASSET_NOT_FOUND');
    }

    if (asset.tenantId !== tenantId) {
      console.error(`[SECURITY] Tenant mismatch. Expected: ${tenantId}, Found: ${asset.tenantId}`);
      throw new Error('UNAUTHORIZED_TENANT_ACCESS');
    }

    console.log(`[STATUS] Asset ownership verified for Tenant: ${tenantId}`);

    // 2. Destrucción Atómica en S3 y DB
    await payload.delete({
      collection: 'media',
      id: id,
    });

    console.log(`[SUCCESS] Asset physically eradicated from Cloud Vault: ${id}`);

    // 3. Sincronización de Interfaz
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