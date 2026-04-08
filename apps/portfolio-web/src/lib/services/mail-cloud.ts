/**
 * @file apps/portfolio-web/src/lib/services/mail-cloud.ts
 * @description Enterprise MailCloud Engine (Silo C Infrastructure).
 *              Orquestador de comunicaciones industriales vía Resend.
 *              Refactorizado: Motor de Batch-Processing activo, validación 
 *              de integridad L0 y blindaje de reputación Multi-Tenant.
 * @version 2.0 - Enterprise Batch Engine & L0 Integrity
 * @author Raz Podestá -  MetaShark Tech
 */

import { Resend } from 'resend';
import { z } from 'zod';

/**
 * CONTRATO DE INTEGRIDAD DE COMUNICACIÓN (SSoT)
 */
const emailPayloadSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(5).max(78),
  html: z.string().min(10),
  text: z.string().min(10),
  from: z.string().optional(),
  replyTo: z.string().email().optional(),
  tenantId: z.string().uuid('SECURITY_ERR: Invalid Tenant Identifier'),
  tags: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
});

export type EmailPayload = z.infer<typeof emailPayloadSchema>;

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  traceId: string;
}

/**
 * CLASS: MailCloudEngine
 * @description Orquestador de alta disponibilidad para el Silo C.
 */
class MailCloudEngine {
  private resend: Resend | null = null;
  private readonly DEFAULT_FROM = 'Beach Hotel Canasvieiras <concierge@resend.dev>';
  private readonly BATCH_SIZE = 50; // Límite de seguridad por ráfaga

  constructor() {
    this.initialize();
  }

  /**
   * PROTOCOLO DE INICIALIZACIÓN (Handshake L0)
   */
  private initialize() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('[HEIMDALL][CRITICAL] RESEND_API_KEY is missing. Communication Silo is DORMANT.');
      return;
    }

    this.resend = new Resend(apiKey);
    console.log('[SYSTEM][MAIL-CLOUD] Cluster Handshake: SUCCESSFUL');
  }

  /**
   * MODULE: send
   * @description Despacha un nodo de comunicación individual con telemetría forense.
   */
  public async send(payload: EmailPayload): Promise<EmailResponse> {
    const traceId = `mail_tx_${Date.now()}`;
    console.group(`[MAIL-CLOUD][DISPATCH] Initiated: ${traceId}`);

    try {
      if (!this.resend) throw new Error('INFRA_ERR: Mail Engine is dormant (Check API Key)');

      const validated = emailPayloadSchema.parse(payload);

      // Inyección de Cabeceras de Soberanía
      const headers = {
        'X-Entity-Ref-ID': traceId,
        'X-Tenant-ID': validated.tenantId,
        'Precedence': 'bulk',
      };

      const { data, error } = await this.resend.emails.send({
        from: validated.from || this.DEFAULT_FROM,
        to: validated.to,
        subject: validated.subject,
        html: validated.html,
        text: validated.text,
        replyTo: validated.replyTo,
        headers,
        tags: [
          { name: 'trace_id', value: traceId },
          { name: 'tenant_id', value: validated.tenantId },
          ...(validated.tags || [])
        ]
      });

      if (error) throw new Error(error.message);

      console.log(`[SUCCESS] Node Dispatched. MessageID: ${data?.id}`);
      return { success: true, messageId: data?.id, traceId };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'UNEXPECTED_MAIL_DRIFT';
      console.error(`[CRITICAL][MAIL-CLOUD] Dispatch Aborted: ${msg}`);
      return { success: false, error: msg, traceId };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * MODULE: batchSend
   * @description Ejecuta el despacho masivo mediante fragmentación táctica (Chunking).
   * @pilar_X: Performance - Maximiza el throughput sin exceder límites de API.
   */
  public async batchSend(payloads: EmailPayload[]): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];
    
    console.log(`[MAIL-CLOUD] Mass Dispatch Start. Payload Count: ${payloads.length}`);

    for (let i = 0; i < payloads.length; i += this.BATCH_SIZE) {
      const chunk = payloads.slice(i, i + this.BATCH_SIZE);
      const chunkResults = await Promise.allSettled(chunk.map(p => this.send(p)));
      
      chunkResults.forEach((res) => {
        if (res.status === 'fulfilled') {
          results.push(res.value);
        } else {
          results.push({ 
            success: false, 
            error: 'PROMISE_REJECTED', 
            traceId: `err_${Date.now()}` 
          });
        }
      });

      // Latencia de enfriamiento entre ráfagas para proteger la reputación IP
      if (i + this.BATCH_SIZE < payloads.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

export const mailCloud = new MailCloudEngine();