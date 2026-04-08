/**
 * @file apps/portfolio-web/src/lib/portal/actions/auth-security.actions.ts
 * @description Centinela de seguridad (Silo D).
 *              Orquesta la lógica de bloqueo, validación de ReCaptcha y autenticación.
 *              Refactorizado: Erradicación de non-null assertions, limpieza de linter,
 *              y blindaje de entorno.
 * @version 4.1 - Forensic & Linter-Pure Standard
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use server';

import { getPayload, type CollectionSlug, type SanitizedConfig } from 'payload';
import { createClient } from '@supabase/supabase-js';
import { dispatchInternalNotification } from './comms.actions';
import { verifyReCaptcha } from '../security/recaptcha';

const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';

const LOCKOUT_THRESHOLDS = [6, 7, 8];
const LOCKOUT_DURATIONS = [3600000, 14400000, 86400000]; // 1h, 4h, 24h

/**
 * @description Inicialización segura del cliente Supabase.
 */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('AUTH_INFRA_ERR: Missing Supabase Admin Credentials');
  }

  return createClient(url, key);
}

const supabaseAdmin = IS_BUILD_ENV ? null : getSupabaseAdmin();

/**
 * @description Obtención dinámica de configuración.
 */
async function getPayloadConfig(): Promise<SanitizedConfig> {
  const configModule = await import('@metashark/cms-core/config');
  return (await configModule.default) as SanitizedConfig;
}

/**
 * MODULE: validateSecurityGate
 */
export async function validateSecurityGate(email: string): Promise<{ blocked: boolean; remaining?: number }> {
  if (IS_BUILD_ENV) return { blocked: false };

  try {
    const config = await getPayloadConfig();
    const payload = await getPayload({ config });

    const attempts = await payload.find({
      collection: 'notifications' as CollectionSlug,
      where: { 
        and: [
          { 'metadata.email': { equals: email } },
          { category: { equals: 'security' } }
        ]
      },
      sort: '-createdAt',
      limit: 10
    });

    const failedAttempts = attempts.docs.length;
    
    if (failedAttempts === 0 || !attempts.docs[0]?.createdAt) return { blocked: false };

    for (let i = 0; i < LOCKOUT_THRESHOLDS.length; i++) {
      if (failedAttempts >= LOCKOUT_THRESHOLDS[i]) {
        const lastAttempt = new Date(attempts.docs[0].createdAt).getTime();
        const now = Date.now();
        const lockoutEnd = lastAttempt + LOCKOUT_DURATIONS[i];

        if (now < lockoutEnd) {
          return { blocked: true, remaining: Math.ceil((lockoutEnd - now) / 60000) };
        }
      }
    }

    return { blocked: false };
  } catch (err) {
    console.error('[HEIMDALL][CRITICAL] Security Gate Failure:', err);
    return { blocked: false };
  }
}

/**
 * MODULE: registerFailedAttempt
 */
export async function registerFailedAttempt(email: string, tenantId: string, traceId: string) {
  if (IS_BUILD_ENV) return;

  await dispatchInternalNotification({
    subject: 'Security Alert: Failed Auth Attempt',
    message: `Intento fallido de autenticación para el email: ${email}`,
    priority: 'high',
    category: 'security',
    tenant: tenantId,
    source: 'AUTH_GATEWAY',
    metadata: { email, traceId }
  });
}

/**
 * MODULE: authenticateUserAction
 */
export async function authenticateUserAction(credentials: { 
  email: string; 
  password: string; 
  recaptchaToken: string;
  tenantId: string;
}) {
  const traceId = `auth_tx_${Date.now().toString(36)}`;
  
  if (!supabaseAdmin) return { success: false, error: 'INFRA_UNAVAILABLE' };

  try {
    // 1. Verificación de Humanidad
    if (!(await verifyReCaptcha(credentials.recaptchaToken))) {
      throw new Error('BOT_ACTIVITY_DETECTED');
    }

    // 2. Verificación del Centinela
    const gate = await validateSecurityGate(credentials.email);
    if (gate.blocked) {
      throw new Error('ACCOUNT_LOCKED');
    }

    // 3. Autenticación via Supabase Admin
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      await registerFailedAttempt(credentials.email, credentials.tenantId, traceId);
      throw new Error('INVALID_CREDENTIALS');
    }

    return { success: true, user: data.user };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'UNEXPECTED_IDENTITY_DRIFT';
    console.error(`[REJECTED] ${traceId}: ${msg}`);
    return { success: false, error: msg };
  }
}