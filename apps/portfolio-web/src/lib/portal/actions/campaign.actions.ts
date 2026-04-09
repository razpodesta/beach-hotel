/**
 * @file apps/portfolio-web/src/lib/portal/actions/campaign.actions.ts
 * @description Enterprise Campaign & Revenue Orchestrator (Silo A/C Actions).
 *              Refactorizado: Erradicación de 'any' en mapeo de inventario,
 *              resolución de módulos de infraestructura y sincronización SSoT.
 *              Estándar: Heimdall v2.5 Forensic Handshake & Linter Pure.
 * @version 2.1 - Type-Safe & Path Hardened
 * @author Raz Podestá -  MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug, type SanitizedConfig } from 'payload';
import { mailCloud } from '../../services/mail-cloud';

/** 
 * DETECTOR DE ENTORNO DE CONSTRUCCIÓN
 * @pilar XIII: Build Isolation Guard.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

// --- PROTOCOLO CROMÁTICO HEIMDALL ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * CONTRATOS SOBERANOS
 */
const campaignExecutionSchema = z.object({
  subject: z.string().min(5).max(78),
  html: z.string().min(20),
  text: z.string().min(20),
  tenant: z.string().uuid('SECURITY_ERR: Invalid Tenant Perimeter'),
  segment: z.enum(['all', 'verified', 'agents']).default('all'),
});

export type CampaignResponse = {
  success: boolean;
  metrics?: {
    totalTargeted: number;
    dispatched: number;
    failed: number;
    latencyMs: string;
  };
  campaignId: string;
  error?: string;
};

/**
 * @interface RawRevenueDoc
 * @description Interfaz interna para el casting seguro de documentos de Payload.
 */
interface RawRevenueDoc {
  id: string;
  title: string;
  basePrice?: number;
  discountValue?: number;
  currentStock?: number;
  maxCapacity?: number;
  totalInventory?: number;
  validUntil?: string;
  expiresAt?: string;
  vibe?: 'day' | 'night';
  status: 'active' | 'sold_out' | 'expired';
}

/**
 * @description Obtención dinámica y segura de configuración.
 * @fix TS2352: Resolución de promesas anidadas y casting a SanitizedConfig.
 */
async function getPayloadConfig(): Promise<SanitizedConfig> {
  const configModule = await import('@metashark/cms-core/config');
  return (await configModule.default) as unknown as SanitizedConfig;
}

/**
 * MODULE: executeBroadcastCampaign
 * @description Punto de entrada para el despacho masivo de misiones (Silo C).
 */
export async function executeBroadcastCampaign(
  rawPayload: unknown
): Promise<CampaignResponse> {
  const startTime = performance.now();
  const campaignId = `cmp_${Date.now()}`;
  
  if (IS_BUILD_ENV) return { success: false, campaignId, error: 'BUILD_BYPASS' };

  try {
    const contract = campaignExecutionSchema.parse(rawPayload);
    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });

    const audience = await payload.find({
      collection: 'subscribers' as CollectionSlug,
      where: {
        and: [
          { tenant: { equals: contract.tenant } },
          { status: { equals: 'active' } }
        ]
      },
      limit: 500
    });

    const totalTargeted = audience.docs.length;
    if (totalTargeted === 0) throw new Error('AUDIENCE_EMPTY');

    let dispatchedCount = 0;
    let failedCount = 0;

    for (const doc of audience.docs) {
      const res = await mailCloud.send({
        to: [doc.email],
        subject: contract.subject,
        html: contract.html,
        text: contract.text,
        tenantId: contract.tenant,
      });
      if (res.success) dispatchedCount++; else failedCount++;
    }

    return {
      success: true,
      campaignId,
      metrics: {
        totalTargeted,
        dispatched: dispatchedCount,
        failed: failedCount,
        latencyMs: `${(performance.now() - startTime).toFixed(2)}ms`
      }
    };
  } catch (error: unknown) {
    return { success: false, campaignId, error: error instanceof Error ? error.message : 'CAMPAIGN_DRIFT' };
  }
}

/**
 * ============================================================================
 * MODULE: getActiveOffersAction (Silo A Bridge)
 * ============================================================================
 * @description Recupera nodos de inventario real desde el CMS.
 */
export async function getActiveOffersAction(
  tenantId: string, 
  view: 'flash' | 'enterprise'
): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  const startTime = performance.now();
  const traceId = `rev_fetch_${Date.now().toString(36).toUpperCase()}`;

  if (IS_BUILD_ENV) return { success: true, data: [] };

  console.log(`${C.magenta}${C.bold}[DNA][REVENUE]${C.reset} Handshake real iniciado | Trace: ${C.cyan}${traceId}${C.reset}`);

  try {
    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });

    const collection: CollectionSlug = view === 'flash' ? 'flash-sales' : 'offers';

    const { docs } = await payload.find({
      collection,
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { status: { equals: 'active' } }
        ]
      },
      limit: 20,
      depth: 1,
    });

    /**
     * @pilar III: Erradicación de any.
     * Normalización del polimorfismo entre FlashSales y Offers.
     */
    const shapedData = (docs as unknown as RawRevenueDoc[]).map((doc) => ({
      id: doc.id,
      title: doc.title,
      basePrice: doc.basePrice || 0,
      discount: doc.discountValue || 0,
      stock: doc.currentStock || doc.maxCapacity || 1,
      capacity: doc.totalInventory || doc.maxCapacity || 1,
      expiresAt: doc.expiresAt || doc.validUntil || new Date().toISOString(),
      type: view,
      vibe: doc.vibe || 'day',
      status: doc.status
    }));

    const duration = (performance.now() - startTime).toFixed(4);
    console.log(`${C.green}   ✓ [GRANTED]${C.reset} Revenue nodes fetched: ${docs.length} | Lat: ${duration}ms`);

    return { success: true, data: shapedData };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'OFFER_FETCH_FAILED';
    console.error(`${C.red}   ✕ [BREACH]${C.reset} Handshake aborted in Silo A: ${msg}`);
    return { success: false, error: msg };
  }
}