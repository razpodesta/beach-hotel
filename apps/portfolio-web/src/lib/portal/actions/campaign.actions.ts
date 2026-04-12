/**
 * @file apps/portfolio-web/src/lib/portal/actions/campaign.actions.ts
 * @description Enterprise Campaign & Revenue Orchestrator (Silo A/C Actions).
 *              Orquesta el despacho masivo de misiones y la recuperación de inventario.
 *              Refactorizado: Despacho por lotes (Batch Engine), tipado estricto
 *              de inventario polimórfico y blindaje de aislamiento de build.
 *              Nivelado: Literal Type Narrowing para erradicar el error TS2339.
 * @version 3.1 - Batch Dispatch Optimized & SSoT Sealed
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug, type SanitizedConfig, type Where } from 'payload';
import { mailCloud } from '../../services/mail-cloud';

/** 
 * DETECTOR DE ENTORNO DE CONSTRUCCIÓN
 * @pilar XIII: Build Isolation Guard.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * CONTRATOS SOBERANOS (SSoT)
 */
const campaignExecutionSchema = z.object({
  subject: z.string().min(5).max(78, 'CORE_ERR: Subject exceeds RFC standard'),
  html: z.string().min(20),
  text: z.string().min(20),
  tenant: z.string().uuid('SECURITY_ERR: Invalid Tenant Perimeter'),
  segment: z.enum(['all', 'verified', 'agents']).default('all'),
  traceId: z.string().optional(),
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
 * @description Contrato de entrada polimórfico para activos de Silo A.
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
 * @description Obtención dinámica y segura de configuración del CMS.
 * @pilar IX: Desacoplamiento de infraestructura.
 */
async function getPayloadConfig(): Promise<SanitizedConfig> {
  const configModule = await import('@metashark/cms-core/config');
  return (await configModule.default) as unknown as SanitizedConfig;
}

/**
 * MODULE: executeBroadcastCampaign
 * @description Punto de entrada para el despacho masivo de misiones (Silo C).
 * @pilar X: Performance - Utiliza el Batch Engine para maximizar throughput.
 */
export async function executeBroadcastCampaign(
  rawPayload: unknown
): Promise<CampaignResponse> {
  const startTime = performance.now();
  const campaignId = `cmp_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) return { success: true, campaignId };

  console.group(`${C.magenta}${C.bold}[DNA][MARKETING]${C.reset} Dispatching Mission: ${campaignId}`);

  try {
    // 1. VALIDACIÓN DE CONTRATO SOBERANO
    const contract = campaignExecutionSchema.parse(rawPayload);
    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });

    // 2. RECUPERACIÓN DE AUDIENCIA SEGMENTADA (Multi-Tenant Shield)
    /**
     * @fix TS2339: Literal Type Narrowing.
     * Pasamos 'subscribers' de forma explícita sin el cast 'as CollectionSlug'.
     * Esto permite a TypeScript inferir correctamente las propiedades de la entidad.
     */
    const { docs: audience } = await payload.find({
      collection: 'subscribers',
      where: {
        and:[
          { tenant: { equals: contract.tenant } },
          { status: { equals: 'active' } }
        ]
      },
      limit: 500,
      depth: 0
    });

    const totalTargeted = audience.length;
    if (totalTargeted === 0) {
      console.warn(`   ${C.yellow}![ABORTED] Audience is empty for tenant: ${contract.tenant}${C.reset}`);
      throw new Error('AUDIENCE_EMPTY_IN_PERIMETER');
    }

    // 3. ORQUESTACIÓN DE DESPACHO POR LOTES (Silo C Engine)
    console.log(`   ${C.cyan}→ [BATCH_LOAD] Preparing ${totalTargeted} nodes for transmission...${C.reset}`);
    
    const emailPayloads = audience.map(doc => ({
      to: [doc.email],
      subject: contract.subject,
      html: contract.html,
      text: contract.text,
      tenantId: contract.tenant,
    }));

    // Ejecutamos el motor de lotes con throttling integrado
    const results = await mailCloud.batchSend(emailPayloads);
    
    const dispatched = results.filter(r => r.success).length;
    const failed = results.length - dispatched;
    const duration = (performance.now() - startTime).toFixed(2);

    console.log(`${C.green}   ✓ [MISSION_COMPLETE]${C.reset} Success: ${dispatched} | Failed: ${failed} | Lat: ${duration}ms`);

    return {
      success: true,
      campaignId,
      metrics: {
        totalTargeted,
        dispatched,
        failed,
        latencyMs: `${duration}ms`
      }
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'CLOUD_GATEWAY_DRIFT';
    console.error(`   ${C.red}✕ [BREACH] Mission failed:${C.reset} ${msg}`);
    return { success: false, campaignId, error: msg };
  } finally {
    console.groupEnd();
  }
}

/**
 * MODULE: getActiveOffersAction
 * @description Recupera nodos de inventario real desde el CMS (Silo A Bridge).
 * @pilar III: Inferencia de tipos y erradicación de any.
 */
export async function getActiveOffersAction(
  tenantId: string, 
  view: 'flash' | 'enterprise'
): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  const startTime = performance.now();
  const traceId = `rev_fetch_${Date.now().toString(36).toUpperCase()}`;

  if (IS_BUILD_ENV) return { success: true, data:[] };

  console.log(`${C.magenta}${C.bold}[DNA][REVENUE]${C.reset} Syncing Silo A | View: ${C.cyan}${view.toUpperCase()}${C.reset} | Trace: ${traceId}`);

  try {
    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });

    const collection: CollectionSlug = view === 'flash' ? 'flash-sales' : 'offers';

    /**
     * @step Filtro Táctico de Inventario
     * Solo recuperamos activos que pertenezcan al perímetro y estén vigentes.
     */
    const whereClause: Where = {
      and:[
        { tenant: { equals: tenantId } },
        { status: { equals: 'active' } }
      ]
    };

    const { docs } = await payload.find({
      collection,
      where: whereClause,
      limit: 25,
      depth: 1,
    });

    /**
     * @step Transmutación de Datos (Editorial Shaper)
     * Normalizamos el polimorfismo entre FlashSales y Ofertas B2B.
     */
    const shapedData = (docs as unknown as RawRevenueDoc[]).map((doc) => ({
      id: doc.id,
      title: doc.title,
      basePrice: doc.basePrice || 0,
      discount: doc.discountValue || 0,
      stock: doc.currentStock ?? doc.maxCapacity ?? 1,
      capacity: doc.totalInventory ?? doc.maxCapacity ?? 1,
      expiresAt: doc.expiresAt || doc.validUntil || new Date().toISOString(),
      type: view,
      vibe: doc.vibe || 'day',
      status: doc.status
    }));

    const duration = (performance.now() - startTime).toFixed(4);
    console.log(`${C.green}   ✓[GRANTED]${C.reset} Inventory nodes synchronized: ${docs.length} | Lat: ${duration}ms`);

    return { success: true, data: shapedData };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'REVENUE_FETCH_FAILED';
    console.error(`${C.red}   ✕ [BREACH]${C.reset} Revenue Handshake aborted: ${msg}`);
    return { success: false, error: msg };
  }
}