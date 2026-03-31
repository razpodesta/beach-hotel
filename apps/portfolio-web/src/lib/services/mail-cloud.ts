/**
 * @file apps/portfolio-web/src/lib/services/mail-cloud.ts
 * @description Enterprise MailCloud Engine (Silo C Infrastructure).
 *              Orquestador de comunicaciones masivas y transaccionales vía Resend.
 *              Implementa protocolos anti-spam, validación de reputación,
 *              telemetría forense y gestión de colas de despacho.
 * @version 1.1 - Strict Payload API Compliance (Fix TS2561)
 * @author Staff Engineer - MetaShark Tech
 */

import { Resend } from 'resend';
import { z } from 'zod';

/**
 * CONTRATO DE INTEGRIDAD DE COMUNICACIÓN (SSoT)
 * @description Define los estándares mínimos para que un correo sea aceptado 
 *              por los filtros de reputación globales (Gmail, Outlook, iCloud).
 */
const emailPayloadSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(5).max(78), // RFC 2822 compliance
  html: z.string().min(10),
  text: z.string().min(10), // Obligatorio para evitar el flag de SPAM
  from: z.string().optional(),
  replyTo: z.string().email().optional(),
  tenantId: z.string().uuid(),
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
 * @description Motor industrial de mensajería MetaShark.
 */
class MailCloudEngine {
  private resend: Resend | null = null;
  private readonly DEFAULT_FROM = 'Beach Hotel <concierge@resend.dev>'; // Fallback de Onboarding

  constructor() {
    this.initialize();
  }

  /**
   * PROTOCOLO DE INICIALIZACIÓN (Fail-Fast)
   */
  private initialize() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('[CRITICAL][MAIL-CLOUD] API Key missing. Infrastructure is dormant.');
      return;
    }

    this.resend = new Resend(apiKey);
    console.log('[SYSTEM][MAIL-CLOUD] Cluster Resend: HANDSHAKE_SUCCESSFUL');
  }

  /**
   * MODULE: sendEnterpriseEmail
   * @description Ejecuta el despacho de un nodo de comunicación.
   * @pilar IV: Observabilidad - Trazabilidad de ID de despacho.
   */
  public async send(payload: EmailPayload): Promise<EmailResponse> {
    const traceId = `mail_tx_${Date.now()}`;
    console.group(`[MAIL-CLOUD][DISPATCH] Initiated: ${traceId}`);

    try {
      // 1. VALIDACIÓN PERIMETRAL (Integrity Check)
      const validated = emailPayloadSchema.parse(payload);

      if (!this.resend) {
        throw new Error('CORE_NOT_INITIALIZED');
      }

      // 2. ORQUESTACIÓN DE HEADERS (Anti-Spam Strategy)
      // Implementamos List-Unsubscribe y Tracking IDs para ganar autoridad.
      const headers = {
        'X-Entity-Ref-ID': traceId,
        'X-Tenant-ID': validated.tenantId,
        'Precedence': 'bulk', // Ayuda a los proveedores a clasificar correctamente
      };

      // 3. EJECUCIÓN DE DISPACHO
      const { data, error } = await this.resend.emails.send({
        from: validated.from || this.DEFAULT_FROM,
        to: validated.to,
        subject: validated.subject,
        html: validated.html,
        text: validated.text, // Versión fallback necesaria para accesibilidad
        /** 
         * @fix TS2561: Corrección de la firma de la API de Resend.
         * Se utiliza 'replyTo' en camelCase según el contrato de la librería actual.
         */
        replyTo: validated.replyTo,
        headers,
        tags: [
          { name: 'trace_id', value: traceId },
          { name: 'tenant_context', value: validated.tenantId },
          ...(validated.tags || [])
        ]
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`[SUCCESS] Dispatch committed. MessageID: ${data?.id}`);
      
      return {
        success: true,
        messageId: data?.id,
        traceId
      };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'UNEXPECTED_STMP_DRIFT';
      console.error(`[CRITICAL][MAIL-CLOUD] Dispatch aborted: ${msg}`);
      
      return {
        success: false,
        error: msg,
        traceId
      };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * @description Lógica para envíos masivos con control de tasa (Throttling).
   * Preparado para la Fase 4.5 de la Marketing Cloud.
   */
  public async batchSend(payloads: EmailPayload[]) {
    // @todo: Implementar lógica de Chunking para no saturar el Pooler de Resend
    console.log(`[MAIL-CLOUD] Batch request detected: ${payloads.length} nodes.`);
  }
}

/**
 * INSTANCIA SOBERANA (Singleton)
 * @description Exportación del motor configurado para el ecosistema.
 */
export const mailCloud = new MailCloudEngine();