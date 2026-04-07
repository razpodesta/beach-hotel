/**
 * @file apps/portfolio-web/src/lib/portal/actions/campaign.actions.ts
 * @description Enterprise Campaign Orchestrator (Silo C Action).
 *              Refactorizado: Resolución estricta de promesas de configuración (TS2352)
 *              mediante 'await' y casting a 'unknown'.
 * @version 1.2 - Type-Safe & Build-Isolated
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug, type SanitizedConfig } from 'payload';
import { mailCloud } from '../../services/mail-cloud';

/** 
 * DETECTOR DE ENTORNO DE CONSTRUCCIÓN
 * @pilar XIII: Build Isolation - Previene fugas de lógica de servidor al frontend.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

/**
 * CONTRATO DE EJECUCIÓN DE CAMPAÑA (SSoT)
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
 * MODULE: executeBroadcastCampaign
 * @description Punto de entrada soberano con aislamiento de build.
 */
export async function executeBroadcastCampaign(
  rawPayload: unknown
): Promise<CampaignResponse> {
  const startTime = performance.now();
  const campaignId = `cmp_${Date.now()}`;
  
  // Guardia contra build estático
  if (IS_BUILD_ENV) {
    return { success: false, campaignId, error: 'BUILD_BYPASS' };
  }

  console.group(`[ENTERPRISE][CAMPAIGN] Broadcast Initiated: ${campaignId}`);

  try {
    const contract = campaignExecutionSchema.parse(rawPayload);

    // 1. CARGA DINÁMICA Y RESOLUCIÓN ASÍNCRONA DE CONFIGURACIÓN
    const configModule = await import('@metashark/cms-core/config');
    // Resolución de TS2352: Await al default y casting seguro vía unknown
    const payloadConfig = (await configModule.default) as unknown as SanitizedConfig;
    const payload = await getPayload({ config: payloadConfig });

    // 2. RECUPERACIÓN DE AUDIENCIA
    const SUBSCRIBER_COLLECTION = 'subscribers' as CollectionSlug;
    const audience = await payload.find({
      collection: SUBSCRIBER_COLLECTION,
      where: {
        and: [
          { tenant: { equals: contract.tenant } },
          { status: { equals: 'active' } }
        ]
      },
      limit: 500
    });

    const totalTargeted = audience.docs.length;
    if (totalTargeted === 0) throw new Error('AUDIENCE_EMPTY_IN_PERIMETER');

    const CHUNK_SIZE = 50;
    let dispatchedCount = 0;
    let failedCount = 0;
    const recipientEmails = audience.docs.map(doc => doc.email);

    // 3. PROTOCOLO DE DESPACHO
    for (let i = 0; i < recipientEmails.length; i += CHUNK_SIZE) {
      const chunk = recipientEmails.slice(i, i + CHUNK_SIZE);
      
      const results = await Promise.allSettled(
        chunk.map(email => 
          mailCloud.send({
            to: [email],
            subject: contract.subject,
            html: contract.html,
            text: contract.text,
            tenantId: contract.tenant,
            tags: [{ name: 'campaign_id', value: campaignId }]
          })
        )
      );

      results.forEach(res => {
        if (res.status === 'fulfilled' && res.value.success) dispatchedCount++;
        else failedCount++;
      });

      if (i + CHUNK_SIZE < recipientEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const totalLatency = (performance.now() - startTime).toFixed(2);
    return {
      success: true,
      campaignId,
      metrics: {
        totalTargeted,
        dispatched: dispatchedCount,
        failed: failedCount,
        latencyMs: `${totalLatency}ms`
      }
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_CAMPAIGN_DRIFT';
    console.error(`[CRITICAL][CAMPAIGN] Broadcast Aborted: ${msg}`);
    
    return { 
      success: false, 
      campaignId,
      error: msg 
    };
  } finally {
    console.groupEnd();
  }
}