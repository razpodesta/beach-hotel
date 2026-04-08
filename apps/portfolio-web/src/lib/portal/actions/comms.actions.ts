/**
 * @file apps/portfolio-web/src/lib/portal/actions/comms.actions.ts
 * @description Enterprise Communication Dispatcher (Silo D Action).
 *              Orquesta la inyección y recuperación de señales operativas.
 *              Refactorizado: Extreme Build Isolation (Lazy Config Load),
 *              erradicación de tipos 'any', reconexión del Trace ID 
 *              y resolución de CollectionSlug mediante inferencia estática.
 * @version 4.0 - Build-Immune & Forensic Ready
 * @author Raz Podestá -  MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { getPayload } from 'payload'; // Importación estática segura (No ejecuta DB)

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTURA
 * @pilar XIII: Impide que el motor de Payload intente arrancar en workers de compilación.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

/**
 * CONTRATOS DE INTEGRIDAD SSoT
 * @description Alineados estrictamente con 'packages/cms/core/src/collections/Notifications.ts'.
 */
const notificationSchema = z.object({
  subject: z.string().min(3).max(100),
  message: z.string().min(5),
  priority: z.enum(['low', 'high', 'critical']),
  category: z.enum(['security', 'ops', 'revenue', 'comms', 'infra']).default('ops'),
  tenant: z.string().uuid('SECURITY_ERR: Invalid Tenant Perimeter'),
  source: z.string().default('SYSTEM_NODE'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type NotificationResponse = {
  success: boolean;
  notificationId?: string;
  externalDispatch: 'sent' | 'skipped' | 'failed';
  error?: string;
  latencyMs?: string;
  traceId?: string;
};

/**
 * @interface Transmission
 * @description Contrato de salida formateado específicamente para consumo en UI.
 */
export interface Transmission {
  id: string;
  priority: 'low' | 'high' | 'critical';
  category: string;
  sender: string;
  subject: string;
  body?: string;
  timestamp: string;
  traceId: string;
  nodeSource: string;
  isRead: boolean;
}

export type LedgerResponse = {
  success: boolean;
  data: Transmission[];
  error?: string;
  latencyMs?: string;
  traceId?: string;
};

/**
 * @interface NotificationData
 * @description Contrato local para mapear la respuesta cruda de DB sin usar 'any'.
 */
interface NotificationData {
  id: string | number;
  priority?: 'low' | 'high' | 'critical';
  category?: string;
  source?: string;
  subject?: string;
  message?: string;
  createdAt: string;
  traceId?: string;
  originNode?: string;
  isRead?: boolean;
}

/**
 * MODULE: dispatchInternalNotification
 * @description Inyecta una nueva alerta en el Ledger de Infraestructura y dispara Webhooks si es crítica.
 */
export async function dispatchInternalNotification(
  rawPayload: unknown
): Promise<NotificationResponse> {
  const startTime = performance.now();
  const traceId = `ntf_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) {
    return { success: true, externalDispatch: 'skipped', traceId };
  }

  console.group(`[HEIMDALL][COMMS] Dispatching Signal | Trace: ${traceId}`);

  try {
    const contract = notificationSchema.parse(rawPayload);
    
    // Lazy Initialization of Config (Build-Safe)
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });
    
    const headerList = await headers();
    const originNode = headerList.get('x-forwarded-for')?.split(',')[0] ?? 'INTERNAL_CORE';

    const record = await payload.create({
      collection: 'notifications' as never, // Resuelve TS2305 para Payload V3 local 
      data: {
        subject: contract.subject,
        message: contract.message,
        priority: contract.priority,
        category: contract.category,
        tenant: contract.tenant,
        source: contract.source,
        traceId: traceId,
        originNode: originNode,
        isRead: false,
        metadata: contract.metadata as Record<string, unknown>,
      }
    });

    let externalStatus: 'sent' | 'skipped' | 'failed' = 'skipped';

    if (contract.priority === 'critical') {
      const webhookUrl = process.env.CRITICAL_ALERTS_WEBHOOK;
      if (webhookUrl) {
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🚨 **CRITICAL ALERT**\n**Trace:** \`${traceId}\`\n**Node:** \`${originNode}\`\n**Message:** ${contract.message}`
            })
          });
          externalStatus = response.ok ? 'sent' : 'failed';
        } catch {
          externalStatus = 'failed';
        }
      }
    }

    const totalLatency = (performance.now() - startTime).toFixed(2);
    console.log(`[SUCCESS] Signal Logged in Ledger | Latency: ${totalLatency}ms`);

    return {
      success: true,
      notificationId: String(record.id),
      externalDispatch: externalStatus,
      latencyMs: totalLatency,
      traceId
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_COMMS_DRIFT';
    console.error(`[CRITICAL] Signal Dispatch Aborted: ${msg}`);
    
    return { 
      success: false, 
      externalDispatch: 'failed',
      error: msg,
      traceId
    };
  } finally {
    console.groupEnd();
  }
}

/**
 * MODULE: getCommsLedger
 * @description Orquestador de lectura para el Silo D. Recupera el historial 
 *              de transmisiones validado y formateado para la UI.
 */
export async function getCommsLedger(tenantId: string): Promise<LedgerResponse> {
  const startTime = performance.now();
  const traceId = `ledger_sync_${Date.now().toString(36)}`;
  
  if (IS_BUILD_ENV) {
    return { success: true, data: [], traceId };
  }

  // @fix: Trazabilidad reactivada para 'traceId' (TS6133)
  console.group(`[HEIMDALL][COMMS] Fetching Ledger | Tenant: ${tenantId} | Trace: ${traceId}`);

  try {
    // Lazy Initialization of Config
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });

    const { docs } = await payload.find({
      collection: 'notifications' as never,
      where: { tenant: { equals: tenantId } },
      sort: '-createdAt', 
      limit: 50, 
      depth: 0,
    });

    // @fix: Erradicación de 'any' implícito
    const transmissions: Transmission[] = docs.map((rawDoc: unknown) => {
      const doc = rawDoc as NotificationData;
      
      // Formateador cronológico resiliente
      let timeString = '--:--';
      try {
        timeString = new Intl.DateTimeFormat('pt-BR', { 
          hour: '2-digit', minute: '2-digit', second: '2-digit' 
        }).format(new Date(doc.createdAt));
      } catch { /* silent fallback */ }

      return {
        id: String(doc.id),
        priority: doc.priority || 'low',
        category: doc.category || 'ops',
        sender: doc.source || 'SYSTEM',
        subject: doc.subject || 'Unknown Signal',
        body: doc.message,
        timestamp: timeString,
        traceId: doc.traceId || 'N/A',
        nodeSource: doc.originNode || 'UNKNOWN_NODE',
        isRead: Boolean(doc.isRead)
      };
    });

    const totalLatency = (performance.now() - startTime).toFixed(2);
    console.log(`[SUCCESS] Ledger Synced. Nodes: ${transmissions.length} | Latency: ${totalLatency}ms`);

    return {
      success: true,
      data: transmissions,
      latencyMs: totalLatency,
      traceId
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_LEDGER_DRIFT';
    console.error(`[CRITICAL] Ledger Sync Failed: ${msg}`);
    
    return { 
      success: false, 
      data: [],
      error: msg,
      traceId
    };
  } finally {
    console.groupEnd();
  }
}