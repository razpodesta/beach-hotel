/**
 * @file apps/portfolio-web/src/lib/portal/actions/comms.actions.ts
 * @description Enterprise Communication Dispatcher (Silo D Action).
 *              Orquesta la inyección y recuperación de señales operativas.
 *              Refactorizado: Centralización de tipos vía @metashark/cms-core (SSoT).
 *              Integrado: Protocolo Heimdall v2.5 para telemetría de latencia.
 *              Aislamiento: Implementación de "Cold-Start Sync" para resiliencia de Build.
 * @version 6.0 - SSoT Type Sync & Build Hardened
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { getPayload, type CollectionSlug, type SanitizedConfig } from 'payload';

/** 
 * IMPORTACIÓN DE CONTRATOS SOBERANOS (SSoT)
 * @fix TS2307: Se abandona la ruta relativa en favor del alias del Core.
 * Nota: Requiere que @metashark/cms-core/index.ts exporte los tipos generados.
 */
import type { Notification } from '@metashark/cms-core';

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 * @pilar XIII: Build Isolation.
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
  traceId: string;
};

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
  traceId: string;
};

/**
 * MODULE: dispatchInternalNotification
 * @description Inyecta una señal en el Ledger de infraestructura.
 */
export async function dispatchInternalNotification(
  rawPayload: unknown
): Promise<NotificationResponse> {
  const startTime = performance.now();
  const traceId = `ntf_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) {
    return { success: true, externalDispatch: 'skipped', traceId };
  }

  console.log(`\n${C.magenta}${C.bold}[DNA][COMMS]${C.reset} Dispatching Signal: ${C.cyan}${traceId}${C.reset}`);

  try {
    const contract = notificationSchema.parse(rawPayload);
    
    // 1. CARGA DINÁMICA DE CONFIGURACIÓN (Cold-Start Safe)
    const configModule = await import('@metashark/cms-core/config');
    const payloadConfig = (await configModule.default) as SanitizedConfig;
    const payload = await getPayload({ config: payloadConfig });
    
    const headerList = await headers();
    const originNode = headerList.get('x-forwarded-for')?.split(',')[0] ?? 'INTERNAL_CORE';

    const NOTIFICATION_COLL: CollectionSlug = 'notifications';
    
    const record = await payload.create({
      collection: NOTIFICATION_COLL,
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
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **CRITICAL ALERT** | **Trace:** \`${traceId}\` | **Msg:** ${contract.message}`
          })
        });
        externalStatus = response.ok ? 'sent' : 'failed';
      }
    }

    const duration = (performance.now() - startTime).toFixed(4);
    console.log(`${C.green}${C.bold}[GRANTED]${C.reset} Signal Logged | Latency: ${duration}ms\n`);

    return {
      success: true,
      notificationId: String(record.id),
      externalDispatch: externalStatus,
      latencyMs: duration,
      traceId
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'SIGNAL_DRIFT';
    console.error(`${C.red}${C.bold}[BREACH] Dispatch Failed:${C.reset} ${msg}`);
    return { success: false, externalDispatch: 'failed', error: msg, traceId };
  }
}

/**
 * MODULE: getCommsLedger
 * @description Recupera el histórico de transmisiones del perímetro actual.
 */
export async function getCommsLedger(tenantId: string): Promise<LedgerResponse> {
  const startTime = performance.now();
  const traceId = `ledger_sync_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) {
    return { success: true, data: [], traceId };
  }

  console.log(`\n${C.magenta}${C.bold}[DNA][LEDGER]${C.reset} Syncing Perimeter: ${C.cyan}${tenantId}${C.reset}`);

  try {
    const configModule = await import('@metashark/cms-core/config');
    const payloadConfig = (await configModule.default) as SanitizedConfig;
    const payload = await getPayload({ config: payloadConfig });

    const NOTIFICATION_COLL: CollectionSlug = 'notifications';

    const { docs } = await payload.find({
      collection: NOTIFICATION_COLL,
      where: { tenant: { equals: tenantId } },
      sort: '-createdAt', 
      limit: 50, 
      depth: 0,
    });

    // Casting seguro mediante el contrato del Core
    const transmissions: Transmission[] = (docs as unknown as Notification[]).map((doc) => {
      let timeString = '--:--';
      try {
        timeString = new Intl.DateTimeFormat('pt-BR', { 
          hour: '2-digit', minute: '2-digit', second: '2-digit' 
        }).format(new Date(doc.createdAt));
      } catch { /* recovery silently */ }

      return {
        id: String(doc.id),
        priority: (doc.priority as 'low' | 'high' | 'critical') || 'low',
        category: doc.category || 'ops',
        sender: doc.source || 'SYSTEM',
        subject: doc.subject || 'Unknown Node',
        body: doc.message || '',
        timestamp: timeString,
        traceId: doc.traceId || 'N/A',
        nodeSource: doc.originNode || 'EDGE_CORE',
        isRead: Boolean(doc.isRead)
      };
    });

    const duration = (performance.now() - startTime).toFixed(4);
    console.log(`${C.green}${C.bold}[GRANTED]${C.reset} Ledger ready. Nodes: ${transmissions.length} | Latency: ${duration}ms\n`);

    return {
      success: true,
      data: transmissions,
      latencyMs: duration,
      traceId
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'LEDGER_SYNC_FAILED';
    console.error(`${C.red}${C.bold}[BREACH] Ledger Sync Aborted:${C.reset} ${msg}`);
    return { success: false, data: [], error: msg, traceId };
  }
}