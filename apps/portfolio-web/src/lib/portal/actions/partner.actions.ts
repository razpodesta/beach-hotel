/**
 * @file apps/portfolio-web/src/lib/portal/actions/partner.actions.ts
 * @description Enterprise Partner Authorization Pipeline (Silo B).
 *              Refactorizado: Resolución de TS2322 (Jurisdiction Drift) mediante 
 *              mapeo normativo a 'INTL'. Erradicación de TS2345 (Draft Trap) 
 *              y TS2353 (Website Mapping).
 * @version 2.4 - Multi-Jurisdiction Guard & SSoT Compliant
 * @author Raz Podestá -  MetaShark Tech
 */

'use server';

import { getPayload, type SanitizedConfig } from 'payload';
import { partnerRegistrationSchema } from '../../schemas/partners/registration.schema';

/** IMPORTACIONES DE CONTRATO (Pure Types del Core) */
import type { Agency } from '@metashark/cms-core';

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
 * @description Tipo auxiliar extraído del SSoT de la Base de Datos.
 */
type DatabaseJurisdiction = Agency['jurisdiction'];

/**
 * MODULE: registerAgencyAction
 * @description Punto de entrada soberano para el registro de nuevos nodos B2B.
 */
export async function registerAgencyAction(
  formData: FormData,
  rawMetadata: unknown
): Promise<PartnerActionResponse> {
  if (IS_BUILD_ENV) {
    return { success: false, error: 'BUILD_BYPASS' };
  }

  const startTime = performance.now();
  const traceId = `b2b_auth_${Date.now().toString(36).toUpperCase()}`;
  
  console.group(`[ENTERPRISE][B2B-HUB] Registration Pipeline: ${traceId}`);

  try {
    // 1. VALIDACIÓN DE CONTRATO (Frontend Side)
    const validation = partnerRegistrationSchema.safeParse(rawMetadata);
    
    if (!validation.success) {
      console.warn(`[AUDIT] B2B Onboarding rejected: Protocol Violation.`);
      return { success: false, error: 'BUSINESS_CONTRACT_VIOLATION' };
    }

    const data = validation.data;

    // 2. INICIALIZACIÓN DE NÚCLEO (Isolated Synthesis)
    const configModule = await import('@metashark/cms-core/config');
    const payloadConfig = (await configModule.default) as SanitizedConfig;
    const payload = await getPayload({ config: payloadConfig });

    // 3. AUDITORÍA DE PERÍMETRO (Tenant Verification)
    const tenantExists = await payload.findByID({
      collection: 'tenants',
      id: data.tenant,
    });

    if (!tenantExists) {
      throw new Error('TENANT_PERIMETER_NOT_FOUND');
    }

    // 4. PROCESAMIENTO DE IDENTIDAD VISUAL (S3 Vault)
    let logoAssetId: string | undefined;
    const logoFile = formData.get('logo') as File | null;

    if (logoFile && logoFile.size > 0) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const mediaRecord = await payload.create({
        collection: 'media',
        data: {
          alt: `Logo Corporativo: ${data.brandName}`,
          tenant: data.tenant,
          assetContext: 'branding' // @fix TS2345: Campo requerido inyectado
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

    // 5. RESOLUCIÓN DE JURISDICCIÓN (Math & Logic Guard)
    /**
     * @fix TS2322: Jurisdiction Resolver.
     * Mapea el input hacia los valores soportados físicamente en 'Agencies.ts'.
     */
    const resolvedJurisdiction: DatabaseJurisdiction = 
      (data.jurisdiction === 'BR' || data.jurisdiction === 'CL') 
        ? data.jurisdiction 
        : 'INTL';

    // 6. INDEXACIÓN DE NODO DE AGENCIA (Core PRM)
    /**
     * @fix TS2353: 'website' no existe en el esquema, se mueve a observaciones.
     * @fix TS2345: Inyección de 'tier' (obligatorio) para evitar Draft Fallback.
     */
    const websiteInfo = data.website ? `URL: ${data.website} | ` : '';
    const finalLogoId = logoAssetId || 'c123d456-e789-4054-8b63-99fce8749c22'; // Placeholder Génesis

    const agencyResult = await payload.create({
      collection: 'agencies',
      data: {
        brandName: data.brandName,
        legalName: data.legalName,
        taxId: data.taxId,
        jurisdiction: resolvedJurisdiction,
        logo: finalLogoId,
        tier: 'bronze',
        tenant: data.tenant,
        status: 'review',
        trustScore: 50,
        internalObservations: `${websiteInfo}Handshake via Web Portal. Trace: ${traceId}`,
        iataCode: data.iataCode || ''
      }
    });

    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`[SUCCESS] Agency Indexed: ${agencyResult.id} | Latency: ${duration}ms`);
    
    return { 
      success: true, 
      agencyId: String(agencyResult.id),
      latencyMs: `${duration}ms`
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_B2B_DRIFT';
    console.error(`[CRITICAL][B2B-HUB] Registration Aborted: ${msg}`);
    return { success: false, error: msg };
  } finally {
    console.groupEnd();
  }
}