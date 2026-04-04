/**
 * @file apps/portfolio-web/src/lib/portal/actions/newsletter.actions.ts
 * @description Enterprise Data Pipeline for Audience Ingestion (Silo C).
 *              Refactorizado para Build-Time Isolation: Se utiliza importación 
 *              dinámica y guardias de entorno para evitar el crash de 'env' en Vercel.
 * @version 5.1 - Extreme Build Isolation (Dynamic Config)
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload } from 'payload';
import type { CollectionSlug } from 'payload';
import { headers } from 'next/headers';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { mailCloud } from '../../services/mail-cloud';

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 * @pilar XIII: Impide que el motor de Payload intente arrancar en workers de compilación.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

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
  code?: 'IDENTITY_COLLISION' | 'INFRASTRUCTURE_DRIFT' | 'DISPATCH_FAILURE' | 'VALIDATION_VIOLATION' | 'BUILD_BYPASS';
  latencyMs?: string;
};

/**
 * MODULE: subscribeAction
 * @description Orquestador de Sincronización de Identidad y Comunicación Transaccional.
 */
export async function subscribeAction(rawData: unknown): Promise<IngestionResponse> {
  const startTime = performance.now();
  const traceId = `ingest_aud_${Date.now()}`;
  
  /**
   * @pilar XIII: Build-Time Bypass.
   * Si Next.js intenta evaluar esta acción durante la generación estática, 
   * devolvemos un éxito simulado para no bloquear el hilo del compilador.
   */
  if (IS_BUILD_ENV) {
    return { success: true, code: 'BUILD_BYPASS' };
  }

  console.group(`[ENTERPRISE][PIPELINE] Identity & Dispatch Workflow: ${traceId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL
    const validation = audienceIngestionSchema.parse(rawData);
    const { email, tenant: tenantId } = validation;

    // 2. EXTRACCIÓN DE TELEMETRÍA
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') ?? 'unknown_client';
    const ipOrigin = headerList.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

    // 3. CONEXIÓN AL CORE ENGINE (Importación Dinámica)
    // Evita que la configuración se cargue en el nivel superior del módulo.
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });

    // 4. AUDITORÍA DE TENANT
    const tenantDoc = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    });

    if (!tenantDoc) throw new Error('TENANT_PERIMETER_NOT_FOUND');

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

    // 7. DISPACHO DE BIENVENIDA (MailCloud Handshake)
    const emailResult = await mailCloud.send({
      to: [email],
      subject: `Sovereign Access Granted | ${tenantDoc.name}`,
      tenantId: tenantId,
      text: `Welcome to the Sanctuary. Your identity has been linked to our digital node.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #080808; color: #ffffff; padding: 40px; border-radius: 24px;">
          <h2 style="font-size: 24px; letter-spacing: -0.05em; color: #a855f7;">IDENTITY LINKED</h2>
          <p style="color: #a1a1aa;">Your access to the <b>${tenantDoc.name}</b> digital ecosystem is now active.</p>
        </div>
      `
    });

    const endTime = performance.now();
    const totalLatency = (endTime - startTime).toFixed(2);

    if (!emailResult.success) {
      return { success: true, latencyMs: totalLatency, error: 'MAIL_DISPATCH_DEGRADED' };
    }

    return { success: true, latencyMs: totalLatency };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNEXPECTED_PIPELINE_EXCEPTION';
    console.error(`[CRITICAL][PIPELINE] Workflow Aborted: ${msg}`);
    return { success: false, error: msg, code: 'INFRASTRUCTURE_DRIFT' };
  } finally {
    console.groupEnd();
  }
}