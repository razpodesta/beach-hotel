/**
 * @file apps/portfolio-web/src/lib/portal/actions/newsletter.actions.ts
 * @description Enterprise Data Pipeline for Audience Ingestion (Silo C).
 *              Orquesta la sincronización de identidades y dispara el flujo de
 *              bienvenida vía MailCloud Engine. Implementa validación perimetral,
 *              telemetría de latencia y protocolos anti-spam.
 * @version 5.0 - Enterprise Level 4.0 | MailCloud Integration
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { headers } from 'next/headers';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { mailCloud } from '../../services/mail-cloud';

/**
 * CONTRATO DE INTEGRIDAD SSoT
 */
const audienceIngestionSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('CORE_ERR_INVALID_EMAIL_PROTOCOL')
    .min(5, 'CORE_ERR_IDENTITY_MIN_LENGTH'),
  tenant: z.string().uuid('SECURITY_ERR_INVALID_TENANT_ID'),
});

export type IngestionResponse = {
  success: boolean;
  error?: string;
  code?: 'IDENTITY_COLLISION' | 'INFRASTRUCTURE_DRIFT' | 'DISPATCH_FAILURE' | 'VALIDATION_VIOLATION';
  latencyMs?: string;
};

/**
 * MODULE: subscribeAction
 * @description Orquestador de Sincronización de Identidad y Comunicación Transaccional.
 */
export async function subscribeAction(rawData: unknown): Promise<IngestionResponse> {
  const startTime = performance.now();
  const traceId = `ingest_aud_${Date.now()}`;
  
  console.group(`[ENTERPRISE][PIPELINE] Identity & Dispatch Workflow: ${traceId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL
    const validation = audienceIngestionSchema.parse(rawData);
    const { email, tenant: tenantId } = validation;

    // 2. EXTRACCIÓN DE TELEMETRÍA
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') ?? 'unknown_client';
    const ipOrigin = headerList.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

    // 3. CONEXIÓN AL CORE ENGINE
    const payload = await getPayload({ config: await configPromise });

    // 4. AUDITORÍA DE TENANT
    const tenantDoc = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    });

    if (!tenantDoc) throw new Error('TENANT_PERIMETER_NOT_FOUND');

    /** @pilar IX: Justificación de 'as' para SSoT de colección */
    const TARGET_COLLECTION = 'subscribers' as CollectionSlug;

    // 5. DETECCIÓN DE COLISIONES
    const existing = await payload.find({
      collection: TARGET_COLLECTION,
      where: {
        and: [{ email: { equals: email } }, { tenant: { equals: tenantId } }]
      },
      limit: 1
    });

    if (existing.docs.length > 0) {
      return { success: false, error: 'IDENTITY_ALREADY_EXISTS', code: 'IDENTITY_COLLISION' };
    }

    // 6. PERSISTENCIA EN CORE CRM
    await payload.create({
      collection: TARGET_COLLECTION,
      data: {
        email,
        tenant: tenantId,
        status: 'active',
        source: 'enterprise-web-portal',
        metaData: {
          ip: ipOrigin,
          userAgent,
          handshakeTimestamp: new Date().toISOString(),
          traceId,
          pathOrigin: headerList.get('referer') ?? 'direct_access'
        }
      }
    });

    console.log(`[PIPELINE] Identity indexed. Initializing transational dispatch...`);

    // 7. DISPACHO DE BIENVENIDA (MailCloud Handshake)
    // @pilar XII: MEA/UX - Cuerpo de correo diseñado para impacto emocional.
    const emailResult = await mailCloud.send({
      to: [email],
      subject: `Sovereign Access Granted | ${tenantDoc.name}`,
      tenantId: tenantId,
      text: `Welcome to the Sanctuary. Your identity has been linked to our digital node. Access your portal at ${process.env.NEXT_PUBLIC_BASE_URL}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #080808; color: #ffffff; padding: 40px; border-radius: 24px;">
          <h2 style="font-size: 24px; letter-spacing: -0.05em; color: #a855f7;">IDENTITY LINKED</h2>
          <p style="color: #a1a1aa; line-height: 1.6;">Your access to the <b>${tenantDoc.name}</b> digital ecosystem is now active.</p>
          <div style="margin: 32px 0; padding: 20px; border: 1px solid #27272a; border-radius: 16px;">
            <span style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 0.2em;">Protocol Trace ID</span><br/>
            <code style="color: #e879f9; font-size: 12px;">${traceId}</code>
          </div>
          <p style="font-size: 14px; color: #71717a;">The sun never sets in our Sanctuary. Welcome home.</p>
        </div>
      `
    });

    const endTime = performance.now();
    const totalLatency = (endTime - startTime).toFixed(2);

    if (!emailResult.success) {
      console.warn(`[PIPELINE][WARN] DB Sync OK but Dispatch Failed: ${emailResult.error}`);
      return { success: true, latencyMs: totalLatency, error: 'MAIL_DISPATCH_DEGRADED' };
    }

    console.log(`[SUCCESS] Full Workflow Completed. Latency: ${totalLatency}ms`);
    return { success: true, latencyMs: totalLatency };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_PIPELINE_EXCEPTION';
    console.error(`[CRITICAL][PIPELINE] Workflow Aborted: ${msg}`);
    return { success: false, error: msg, code: 'INFRASTRUCTURE_DRIFT' };
  } finally {
    console.groupEnd();
  }
}