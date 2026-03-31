/**
 * @file apps/portfolio-web/src/lib/portal/actions/comms.actions.ts
 * @description Enterprise Communication Dispatcher (Silo D Action).
 *              Orquesta la generación y persistencia de notificaciones internas,
 *              mensajería entre nodos y alertas de infraestructura.
 *              Implementa redundancia vía Webhooks para eventos críticos.
 * @version 1.0 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { headers } from 'next/headers';

/**
 * CONTRATO DE DESPACHO (SSoT)
 * @description Define la integridad requerida para la mensajería interna.
 */
const notificationSchema = z.object({
  subject: z.string().min(3).max(100),
  message: z.string().min(5),
  priority: z.enum(['low', 'high', 'critical']),
  tenant: z.string().uuid('SECURITY_ERR: Invalid Tenant Perimeter'),
  source: z.string().default('SYSTEM_NODE'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type NotificationResponse = {
  success: boolean;
  notificationId?: string;
  externalDispatch: 'sent' | 'skipped' | 'failed';
  error?: string;
};

/**
 * MODULE: dispatchInternalNotification
 * @description Punto de entrada soberano para la inyección de señales en el Comms Hub.
 * @pilar IV: Observabilidad - Implementa Trace ID y auditoría de origen.
 */
export async function dispatchInternalNotification(
  rawPayload: unknown
): Promise<NotificationResponse> {
  const traceId = `ntf_${Date.now()}`;
  console.group(`[ENTERPRISE][COMMS] Dispatching Signal: ${traceId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL
    const contract = notificationSchema.parse(rawPayload);
    const payload = await getPayload({ config: await configPromise });
    
    const headerList = await headers();
    const originNode = headerList.get('x-forwarded-for')?.split(',')[0] ?? 'INTERNAL_CORE';

    /** 
     * 2. PERSISTENCIA EN EL REPOSITORY (Silo D)
     * @pilar IX: Justificación de 'as'. 
     * Se asume la existencia de la colección 'notifications' en el Core CMS.
     */
    const TARGET_COLLECTION = 'notifications' as CollectionSlug;

    const record = await payload.create({
      collection: TARGET_COLLECTION,
      data: {
        subject: contract.subject,
        message: contract.message,
        priority: contract.priority,
        tenant: contract.tenant,
        source: contract.source,
        traceId: traceId,
        originNode: originNode,
        isRead: false,
        metadata: contract.metadata,
      }
    });

    console.log(`[SUCCESS] Signal indexed in Hub. ID: ${record.id}`);

    // 3. PROTOCOLO DE ALERTA EXTERNA (Redundancia de Mando)
    let externalStatus: 'sent' | 'skipped' | 'failed' = 'skipped';

    if (contract.priority === 'critical') {
      const webhookUrl = process.env.CRITICAL_ALERTS_WEBHOOK;
      
      if (webhookUrl) {
        console.log(`[BRIDGE] Escalating to External Webhook...`);
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🚨 **ENTERPRISE CRITICAL ALERT**\n**Subject:** ${contract.subject}\n**Node:** ${contract.source}\n**Trace:** \`${traceId}\`\n**Message:** ${contract.message}`
            })
          });
          externalStatus = response.ok ? 'sent' : 'failed';
        } catch (webhookErr) {
          console.error(`[ERROR][BRIDGE] External Dispatch Failed:`, webhookErr);
          externalStatus = 'failed';
        }
      }
    }

    return {
      success: true,
      notificationId: String(record.id),
      externalDispatch: externalStatus
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_COMMS_DRIFT';
    console.error(`[CRITICAL][COMMS] Dispatch Aborted: ${msg}`);
    
    return { 
      success: false, 
      externalDispatch: 'failed',
      error: msg 
    };
  } finally {
    console.groupEnd();
  }
}