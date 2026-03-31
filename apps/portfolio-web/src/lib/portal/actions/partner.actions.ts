/**
 * @file apps/portfolio-web/src/lib/portal/actions/partner.actions.ts
 * @description Enterprise Partner Authorization Pipeline (Silo B).
 *              Orquesta el onboarding de agencias aliadas, validación fiscal
 *              y sincronización de activos de marca blanca en S3.
 *              Implementa normalización de tipos para IDs, telemetría de 
 *              rendimiento y blindaje de perímetros comerciales.
 * @version 2.0 - Enterprise Level 4.0 | TS/ESLint Resolution
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { partnerRegistrationSchema } from '../../schemas/partners/registration.schema';

/**
 * TIPO RESULTADO CORPORATIVO (Result Pattern)
 * @description Contrato de salida con telemetría industrial.
 */
export type PartnerActionResponse = {
  success: boolean;
  agencyId?: string;
  error?: string;
  latencyMs?: string;
};

/**
 * MODULE: registerAgencyAction
 * @description Punto de entrada soberano para el registro de nuevos nodos B2B.
 * @fix TS2322: Resolución de ambigüedad en IDs mediante normalización explícita.
 * @fix ESLint: Purgada importación 'z' no utilizada.
 */
export async function registerAgencyAction(
  formData: FormData,
  rawMetadata: unknown
): Promise<PartnerActionResponse> {
  const startTime = performance.now();
  const traceId = `b2b_auth_${Date.now()}`;
  
  console.group(`[ENTERPRISE][B2B-HUB] Registration Pipeline: ${traceId}`);

  try {
    // 1. VALIDACIÓN DE CONTRATO (SSoT Enforcement)
    const validation = partnerRegistrationSchema.safeParse(rawMetadata);
    
    if (!validation.success) {
      console.warn(`[AUDIT] B2B Onboarding rejected: Protocol Violation.`);
      return { success: false, error: 'BUSINESS_CONTRACT_VIOLATION' };
    }

    const data = validation.data;
    const payload = await getPayload({ config: await configPromise });

    // 2. AUDITORÍA DE PERÍMETRO (Tenant Verification)
    const tenantExists = await payload.findByID({
      collection: 'tenants',
      id: data.tenant,
    });

    if (!tenantExists) {
      console.error(`[SECURITY][CRITICAL] Unauthorized Onboarding: Tenant ${data.tenant} not found.`);
      throw new Error('TENANT_PERIMETER_NOT_FOUND');
    }

    // 3. PROCESAMIENTO DE IDENTIDAD VISUAL (S3 Asset Sync)
    let logoAssetId: string | undefined;
    const logoFile = formData.get('logo') as File | null;

    if (logoFile && logoFile.size > 0) {
      console.log(`[PIPELINE] Ingesting corporate identity asset: ${logoFile.name}`);
      
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const mediaRecord = await payload.create({
        collection: 'media',
        data: {
          alt: `Corporate Identity: ${data.brandName}`,
          tenant: data.tenant,
        },
        file: {
          data: buffer,
          name: `${data.brandName.toLowerCase().replace(/ /g, '-')}-logo`,
          mimetype: logoFile.type,
          size: logoFile.size,
        },
      });

      /**
       * @fix TS2322: Normalización de ID de Media.
       * Garantizamos el cumplimiento del contrato string-first.
       */
      logoAssetId = String(mediaRecord.id);
    }

    // 4. INDEXACIÓN DE NODO DE AGENCIA (Core PRM)
    const TARGET_COLLECTION = 'agencies' as CollectionSlug;
    
    const agencyResult = await payload.create({
      collection: TARGET_COLLECTION,
      data: {
        brandName: data.brandName,
        legalName: data.legalName,
        taxId: data.taxId,
        iataCode: data.iataCode,
        website: data.website,
        logo: logoAssetId,
        tenant: data.tenant,
        status: 'review', // Protocolo de Auditoría Humana mandatorio
        trustScore: 50,    // Scoring inicial de confianza
        internalObservations: `Registration initiated via Web Portal. Trace: ${traceId}`
      }
    });

    const endTime = performance.now();
    const totalLatency = (endTime - startTime).toFixed(2);
    
    // @fix TS2322: Normalización de ID de Agencia.
    const finalAgencyId = String(agencyResult.id);

    console.log(`[SUCCESS] Agency Indexed. ID: ${finalAgencyId} | Latency: ${totalLatency}ms`);
    
    return { 
      success: true, 
      agencyId: finalAgencyId,
      latencyMs: `${totalLatency}ms`
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_B2B_PIPELINE_DRIFT';
    console.error(`[CRITICAL][B2B-HUB] Onboarding Aborted: ${msg}`);
    
    return { 
      success: false, 
      error: msg 
    };
  } finally {
    console.groupEnd();
  }
}