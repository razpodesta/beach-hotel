/**
 * @file apps/portfolio-web/src/lib/portal/actions/campaign.actions.ts
 * @description Enterprise Campaign Orchestrator (Silo C Action).
 *              Orquesta el despacho masivo de comunicaciones a la audiencia indexada.
 *              Implementa procesamiento por lotes (Chunking), control de cuotas,
 *              telemetría de conversión y protección anti-bloqueo.
 * @version 1.0 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { mailCloud } from '../../services/mail-cloud';

/**
 * CONTRATO DE EJECUCIÓN DE CAMPAÑA (SSoT)
 * @description Define la integridad requerida para un broadcast masivo.
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
 * @description Punto de entrada soberano para el despacho masivo de comunicaciones.
 * @pilar X: Performance - Implementa procesamiento por lotes para proteger el Pooler.
 * @pilar IV: Trazabilidad - Genera un Campaign_ID único para auditoría.
 */
export async function executeBroadcastCampaign(
  rawPayload: unknown
): Promise<CampaignResponse> {
  const startTime = performance.now();
  const campaignId = `cmp_${Date.now()}`;
  
  console.group(`[ENTERPRISE][CAMPAIGN] Broadcast Initiated: ${campaignId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL
    const contract = campaignExecutionSchema.parse(rawPayload);
    const payload = await getPayload({ config: await configPromise });

    // 2. RECUPERACIÓN DE AUDIENCIA (CRM Query)
    const SUBSCRIBER_COLLECTION = 'subscribers' as CollectionSlug;
    
    /** 
     * @description Recuperamos solo nodos activos dentro del perímetro del Tenant.
     * Limitamos a 500 para esta fase (Escalabilidad controlada).
     */
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

    console.log(`[PIPELINE] Target Audience detected: ${totalTargeted} nodes.`);

    // 3. PROTOCOLO DE DESPACHO POR LOTES (Chunking Strategy)
    /**
     * @description Para evitar ser marcados como SPAM, dividimos el envío
     * en fragmentos de 50 correos. Esto "suaviza" la carga en el servidor SMTP.
     */
    const CHUNK_SIZE = 50;
    let dispatchedCount = 0;
    let failedCount = 0;

    const recipientEmails = audience.docs.map(doc => doc.email);

    for (let i = 0; i < recipientEmails.length; i += CHUNK_SIZE) {
      const chunk = recipientEmails.slice(i, i + CHUNK_SIZE);
      
      console.log(`[DISPATCH] Processing Batch ${dispatchedCount / CHUNK_SIZE + 1} | Size: ${chunk.length}`);

      /**
       * EJECUCIÓN PARALELA DENTRO DEL LOTE
       * Utilizamos allSettled para que un fallo individual no detenga la campaña.
       */
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

      // Conteo de métricas de lote
      results.forEach(res => {
        if (res.status === 'fulfilled' && res.value.success) dispatchedCount++;
        else failedCount++;
      });

      // Breve latencia artificial para enfriamiento de cabeceras (Anti-Spam)
      if (i + CHUNK_SIZE < recipientEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 4. REGISTRO DE EVENTO (Infrastructure Log)
    // @todo: Crear colección 'campaign-logs' para persistencia histórica.
    
    const totalLatency = (performance.now() - startTime).toFixed(2);
    console.log(`[SUCCESS] Campaign Concluded. Injected: ${dispatchedCount} | Failures: ${failedCount}`);

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