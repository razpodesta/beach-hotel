/**
 * @file apps/portfolio-web/src/lib/portal/actions/comms.actions.ts
 * @description Enterprise Communication Dispatcher (Silo D Action).
 *              Orquesta la inyección, recuperación y gestión de señales operativas.
 *              Refactorizado: Resolución de TS2353 (Error property), purga de variables
 *              no usadas y alineación con el Core Registry v12.0.
 * @version 7.1 - Type Contract Fixed & Linter Pure
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getPayload, type SanitizedConfig, type Where } from 'payload';

/** 
 * IMPORTACIÓN DE CONTRATOS SOBERANOS (SSoT)
 */
import type { Notification } from '@metashark/cms-core';

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 * @pilar XIII: Build Isolation Guard.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

/**
 * PROTOCOLO CROMÁTICO HEIMDALL v2.5
 */
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * CONTRATOS DE VALIDACIÓN (Zod SSoT)
 */
const notificationSchema = z.object({
  subject: z.string().min(3).max(100),
  message: z.string().min(5),
  priority: z.enum(['low', 'high', 'critical']),
  category: z.enum(['security', 'ops', 'revenue', 'comms', 'infra']).default('ops'),
  tenant: z.string().uuid('SECURITY_ERR: Invalid Tenant Perimeter'),
  source: z.string().default('SYSTEM_NODE'),
  recipient: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * @interface Transmission
 * @description Contrato de salida inmutable para el Hub de UI.
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

/**
 * @description Obtención dinámica de configuración (Soberana).
 */
async function getPayloadConfig(): Promise<SanitizedConfig> {
  const configModule = await import('@metashark/cms-core/config');
  return (await configModule.default) as unknown as SanitizedConfig;
}

/**
 * MODULE: dispatchInternalNotification
 * @description Inyecta una señal en el Ledger y activa alertas críticas.
 * @pilar IX: Inversión de Control.
 */
export async function dispatchInternalNotification(
  rawPayload: unknown
): Promise<{ success: boolean; traceId: string; error?: string }> {
  const traceId = `ntf_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) return { success: true, traceId };

  console.log(`\n${C.magenta}${C.bold}[DNA][COMMS]${C.reset} Dispatching Signal: ${C.cyan}${traceId}${C.reset}`);

  try {
    const contract = notificationSchema.parse(rawPayload);
    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });
    
    const headerList = await headers();
    const originNode = headerList.get('x-forwarded-for')?.split(',')[0] ?? 'INTERNAL_CORE';

    // @pilar X: Erradicación de variables no usadas.
    await payload.create({
      collection: 'notifications',
      data: {
        ...contract,
        traceId,
        originNode,
        isRead: false,
        metadata: contract.metadata as Record<string, unknown>,
      }
    });

    // Despacho asíncrono a Webhook si es crítico (No bloqueante)
    if (contract.priority === 'critical' && process.env.CRITICAL_ALERTS_WEBHOOK) {
      fetch(process.env.CRITICAL_ALERTS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **CRITICAL_INCIDENT** | Trace: \`${traceId}\` | Msg: ${contract.message}`
        })
      }).catch(() => console.error(`${C.red}   ![SIGNAL_LOST] Webhook delivery failed.${C.reset}`));
    }

    return { success: true, traceId };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'SIGNAL_DRIFT';
    console.error(`${C.red}   ✕ [BREACH] Dispatch Failed:${C.reset} ${msg}`);
    return { success: false, error: msg, traceId };
  }
}

/**
 * MODULE: getCommsLedger
 * @description Recupera el histórico de transmisiones del perímetro actual.
 * @pilar IV: Observabilidad DNA-Level.
 * @fix TS2353: Inclusión de la propiedad 'error' en el contrato de retorno.
 */
export async function getCommsLedger(
  tenantId: string, 
  userId?: string
): Promise<{ success: boolean; data: Transmission[]; traceId: string; error?: string }> {
  const startTime = performance.now();
  const traceId = `ledger_sync_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) return { success: true, data: [], traceId };

  console.log(`\n${C.magenta}${C.bold}[DNA][LEDGER]${C.reset} Syncing Perimeter: ${C.cyan}${tenantId}${C.reset}`);

  try {
    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });

    const conditions: Where[] = [{ tenant: { equals: tenantId } }];
    if (userId) {
      conditions.push({
        or: [
          { recipient: { equals: userId } },
          { recipient: { exists: false } }
        ]
      });
    }

    const { docs } = await payload.find({
      collection: 'notifications',
      where: { and: conditions },
      sort: '-createdAt', 
      limit: 50, 
      depth: 0,
    });

    const transmissions: Transmission[] = (docs as unknown as Notification[]).map((doc) => ({
      id: String(doc.id),
      priority: doc.priority || 'low',
      category: doc.category || 'ops',
      sender: doc.source || 'SYSTEM',
      subject: doc.subject || 'Unknown Node',
      body: doc.message || '',
      timestamp: new Date(doc.createdAt).toLocaleTimeString('pt-BR'),
      traceId: doc.traceId || 'N/A',
      nodeSource: doc.originNode || 'EDGE_CORE',
      isRead: !!doc.isRead
    }));

    const duration = (performance.now() - startTime).toFixed(4);
    console.log(`${C.green}   ✓ [GRANTED]${C.reset} Ledger ready. Nodes: ${transmissions.length} | Lat: ${duration}ms`);

    return { success: true, data: transmissions, traceId };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'LEDGER_SYNC_FAILED';
    console.error(`${C.red}   ✕ [BREACH] Ledger Sync Aborted:${C.reset} ${msg}`);
    // Ahora el contrato permite devolver el error
    return { success: false, data: [], traceId, error: msg };
  }
}

/**
 * MODULE: markNotificationAsReadAction
 * @description Actualiza el estado de una señal en el Ledger.
 */
export async function markNotificationAsReadAction(
  id: string, 
  tenantId: string
): Promise<{ success: boolean }> {
  if (IS_BUILD_ENV) return { success: true };

  try {
    const payloadConfig = await getPayloadConfig();
    const payload = await getPayload({ config: payloadConfig });

    const doc = await payload.findByID({ collection: 'notifications', id });
    const docTenant = typeof doc.tenant === 'object' ? doc.tenant?.id : doc.tenant;

    if (docTenant !== tenantId) throw new Error('UNAUTHORIZED_PERIMETER_MUTATION');

    await payload.update({
      collection: 'notifications',
      id,
      data: { isRead: true, readAt: new Date().toISOString() }
    });

    revalidatePath('/portal');
    return { success: true };
  } catch (error) {
    console.error(`${C.red}   ✕ [MARK_READ_FAILED]${C.reset}`, error);
    return { success: false };
  }
}