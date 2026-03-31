/**
 * @file newsletter.actions.ts
 * @description Motor de Ingesta de Leads (Server Actions).
 *              Orquesta el registro seguro de suscriptores en el CMS, 
 *              validación perimetral con Zod y trazabilidad forense.
 * @version 1.0 - Sovereign Ingestion & Identity Link
 * @author Raz Podestá - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import { getPayload } from 'payload';
import configPromise from '@metashark/cms-core/config';

/**
 * CONTRATO DE ENTRADA (SSoT)
 * @description Define la integridad requerida para el registro del lead.
 */
const subscribeSchema = z.object({
  email: z.string().email('INVALID_EMAIL_PROTOCOL'),
  tenant: z.string().min(1, 'MISSING_TENANT_CONTEXT'), // Relación relacional (ID)
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
 * @description Procesa la identidad del visitante y la persiste en el CMS.
 * @pilar IV: Observabilidad Heimdall con TraceID.
 * @pilar VIII: Resiliencia ante identidades duplicadas.
 */
export async function subscribeAction(rawData: unknown): Promise<SubscribeResponse> {
  const traceId = `lead_sync_${Date.now()}`;
  console.group(`[HEIMDALL][ACTION] Newsletter Handshake: ${traceId}`);

  try {
    // 1. VALIDACIÓN PERIMETRAL (Pilar III)
    const validation = subscribeSchema.safeParse(rawData);
    
    if (!validation.success) {
      console.warn('[VALIDATION_FAIL] Ingestion rejected: Malformed Payload');
      return { 
        success: false, 
        error: 'IDENTITY_PROTOCOL_VIOLATION', 
        code: 'VALIDATION_FAIL' 
      };
    }

    const { email, tenant } = validation.data;

    // 2. PREPARACIÓN DEL MOTOR CMS
    const payload = await getPayload({ config: await configPromise });

    // 3. PROTOCOLO DE DUPLICIDAD (Anti-Spam / UX Resilience)
    // Verificamos si el email ya existe en este tenant específico
    const existing = await payload.find({
      collection: 'subscribers' as any, // @note: Definiremos esta colección en el siguiente paso
      where: {
        and: [
          { email: { equals: email } },
          { tenant: { equals: tenant } }
        ]
      },
      limit: 1
    });

    if (existing.docs.length > 0) {
      console.log(`[INFO] Identity already linked to Tenant: ${tenant}`);
      return { 
        success: false, 
        error: 'EMAIL_ALREADY_SUBSCRIBED', 
        code: 'DUPLICATE_IDENTITY' 
      };
    }

    // 4. PERSISTENCIA ATÓMICA
    await payload.create({
      collection: 'subscribers' as any,
      data: {
        email,
        tenant,
        status: 'active',
        source: 'web-landing-form'
      }
    });

    console.log(`[SUCCESS] Lead indexed successfully. Trace: ${traceId}`);
    
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