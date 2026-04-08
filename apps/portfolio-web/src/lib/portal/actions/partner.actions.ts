/**
 * @file apps/portfolio-web/src/lib/portal/actions/partner.actions.ts
 * @description Enterprise Partner Authorization Pipeline (Silo B).
 *              Refactorizado: Aislamiento de Build absoluto mediante importaciones 
 *              dinámicas y guardias de entorno. Resolución de TS2345/TS2322.
 * @version 2.1 - Build-Safe & Production Elite
 * @author Raz Podestá -  MetaShark Tech
 */

'use server';

import { getPayload, type CollectionSlug, type SanitizedConfig } from 'payload';
import { partnerRegistrationSchema } from '../../schemas/partners/registration.schema';

/**
 * DETECTOR DE ENTORNO DE CONSTRUCCIÓN
 * @pilar XIII: Build Isolation.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

export type PartnerActionResponse = {
  success: boolean;
  agencyId?: string;
  error?: string;
  latencyMs?: string;
};

/**
 * MODULE: registerAgencyAction
 * @description Punto de entrada soberano para el registro de nuevos nodos B2B.
 */
export async function registerAgencyAction(
  formData: FormData,
  rawMetadata: unknown
): Promise<PartnerActionResponse> {
  // Guardia contra build estático
  if (IS_BUILD_ENV) {
    return { success: false, error: 'BUILD_BYPASS' };
  }

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

    // 2. CARGA DINÁMICA DE CONFIGURACIÓN (Build-Safe)
    const configModule = await import('@metashark/cms-core/config');
    const payloadConfig = (await configModule.default) as SanitizedConfig;
    const payload = await getPayload({ config: payloadConfig });

    // 3. AUDITORÍA DE PERÍMETRO (Tenant Verification)
    const tenantExists = await payload.findByID({
      collection: 'tenants',
      id: data.tenant,
    });

    if (!tenantExists) {
      console.error(`[SECURITY][CRITICAL] Unauthorized Onboarding: Tenant ${data.tenant} not found.`);
      throw new Error('TENANT_PERIMETER_NOT_FOUND');
    }

    // 4. PROCESAMIENTO DE IDENTIDAD VISUAL (S3 Asset Sync)
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

      logoAssetId = String(mediaRecord.id);
    }

    // 5. INDEXACIÓN DE NODO DE AGENCIA (Core PRM)
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
        status: 'review',
        trustScore: 50,
        internalObservations: `Registration initiated via Web Portal. Trace: ${traceId}`
      }
    });

    const endTime = performance.now();
    const totalLatency = (endTime - startTime).toFixed(2);
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