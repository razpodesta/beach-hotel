/**
 * @file newsletter.actions.ts
 * @description Motor de Ingesta de Leads (Server Actions).
 *              Orquesta el registro seguro de suscriptores en el CRM del CMS, 
 *              validación perimetral con Zod y telemetría técnica enriquecida.
 *              Refactorizado: Justificación de aserciones de frontera y 
 *              optimización de metadatos para inteligencia de comportamiento.
 * @version 3.0 - Sovereign Border Contract & Forensic Sync
 * @author Raz Podestá - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { headers } from 'next/headers';

/**
 * CONTRATO DE ENTRADA (SSoT)
 * @description Define la integridad requerida para el registro del lead.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
const subscribeSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('INVALID_EMAIL_PROTOCOL')
    .min(5, 'IDENTITY_TOO_SHORT'),
  tenant: z.string().uuid('SECURITY_ERR: Invalid Tenant Identifier'),
});

/**
 * TIPO RESULTADO SOBERANO
 */
export type SubscribeResponse = {
  success: boolean;
  error?: string;
  code?: 'DUPLICATE_IDENTITY' | 'DATABASE_DRIFT' | 'VALIDATION_FAIL';
};

/**
 * ACCIÓN SOBERANA: subscribeAction
 * @description Procesa la identidad del visitante y la persiste en el CRM del CMS.
 * @pilar IV: Observabilidad Heimdall con TraceID.
 * @pilar VIII: Resiliencia Multi-Tenant.
 */
export async function subscribeAction(rawData: unknown): Promise<SubscribeResponse> {
  const traceId = `lead_sync_${Date.now()}`;
  console.group(`[HEIMDALL][ACTION] Newsletter Handshake: ${traceId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL
    const validation = subscribeSchema.safeParse(rawData);
    
    if (!validation.success) {
      const issues = validation.error.issues.map(i => i.message);
      console.warn(`[VALIDATION_FAIL] Ingestion rejected: ${issues.join(', ')}`);
      return { 
        success: false, 
        error: 'IDENTITY_PROTOCOL_VIOLATION', 
        code: 'VALIDATION_FAIL' 
      };
    }

    const { email, tenant } = validation.data;

    // 2. EXTRACCIÓN DE TELEMETRÍA (CRM Intelligence)
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') ?? 'unknown';
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

    // 3. HANDSHAKE CON MOTOR DE DATOS
    const payload = await getPayload({ config: await configPromise });

    // 4. PROTOCOLO DE DUPLICIDAD (Anti-Spam / Integrity)
    /** 
     * @pilar IX: Justificación de 'as'. 
     * Se realiza un cast a 'CollectionSlug' para satisfacer el contrato de Payload.
     * Dado que operamos en modo "Pure Source-First", esta aserción actúa como 
     * un contrato de frontera inmutable para la colección 'subscribers'.
     */
    const collectionName = 'subscribers' as CollectionSlug;

    const existing = await payload.find({
      collection: collectionName,
      where: {
        and: [
          { email: { equals: email } },
          { tenant: { equals: tenant } }
        ]
      },
      limit: 1
    });

    if (existing.docs.length > 0) {
      console.log(`[INFO] Identity collision detected: ${email} for Tenant: ${tenant}`);
      return { 
        success: false, 
        error: 'EMAIL_ALREADY_SUBSCRIBED', 
        code: 'DUPLICATE_IDENTITY' 
      };
    }

    // 5. PERSISTENCIA ATÓMICA CON METADATA DE COMPORTAMIENTO
    await payload.create({
      collection: collectionName,
      data: {
        email,
        tenant,
        status: 'active',
        source: 'web-landing-form',
        metaData: {
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
          handshakeId: traceId,
          entry_path: headerList.get('referer') ?? 'direct'
        }
      }
    });

    console.log(`[SUCCESS] Lead indexed in Sovereign CRM. Trace: ${traceId}`);
    return { success: true };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'CORE_SYNC_FAILURE';
    console.error(`[CRITICAL] Lead ingestion aborted: ${msg}`);
    
    return { 
      success: false, 
      error: 'INFRASTRUCTURE_LATENCY', 
      code: 'DATABASE_DRIFT' 
    };
  } finally {
    console.groupEnd();
  }
}