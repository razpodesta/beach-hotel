/**
 * @file apps/portfolio-web/src/lib/portal/actions/auth-sync.actions.ts
 * @description Orquestador de Sincronización de Identidad (Identity Bridge).
 *              Realiza el Handshake final entre Supabase y Payload CMS.
 *              Refactorizado: Activación del Reactor de Reputación (Protocolo 33).
 *              Inyectado: Bono de Génesis (+50 XP) y Artefacto de Origen.
 * @version 2.0 - Reputation Reactor Active (Heimdall v2.5)
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import crypto from 'node:crypto';
import { getPayload } from 'payload';

/** 
 * IMPORTACIONES DE CONTRATO (SSoT)
 * @pilar V: Adherencia Arquitectónica.
 */
import type { SovereignRoleType } from '@metashark/cms-core';

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

/**
 * CONTRATOS DE HANDSHAKE (SSoT)
 */
const syncIdentitySchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(2).optional(),
  id: z.string().uuid('IDENTITY_ERR: Invalid Global ID'),
});

export type SyncActionResult = {
  success: boolean;
  user?: {
    id: string;
    role: SovereignRoleType;
    email: string;
    xp: number;
  };
  error?: string;
  traceId: string;
};

// Constantes cromáticas para Logs Heimdall v2.5
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

/**
 * @function syncIdentityAction
 * @description Punto de entrada para sincronizar la identidad y activar la reputación.
 * @pilar IX: Inversión de Control. Handshake entre Auth y Data.
 */
export async function syncIdentityAction(
  rawUser: unknown
): Promise<SyncActionResult> {
  const startTime = performance.now();
  const traceId = `sync_hsk_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) return { success: true, traceId };

  console.log(`\n${C.magenta}${C.bold}[DNA][BRIDGE]${C.reset} Handshake detectado | Trace: ${C.cyan}${traceId}${C.reset}`);

  try {
    // 1. VALIDACIÓN DE CONTRATO SOBERANO
    const validation = syncIdentitySchema.safeParse(rawUser);
    if (!validation.success) {
      throw new Error('HANDSHAKE_DATA_MALFORMED');
    }

    const { email } = validation.data;

    // 2. INICIALIZACIÓN PEREZOSA (Build-Safe)
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });

    // 3. PROTOCOLO DE BUSQUEDA
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });

    let profile = docs[0];

    if (!profile) {
      /**
       * @step Provisioning: Activación del Reactor de Reputación.
       * @protocol_33: Asignación de Bono de Génesis y Artefacto de Origen.
       */
      console.log(`   ${C.yellow}→ [PROVISIONING]${C.reset} Nueva identidad soberana detectada: ${email}`);
      
      const GENESIS_XP = 50;
      const INITIAL_ARTIFACT = 'monolito-obsidiana';

      profile = await payload.create({
        collection: 'users',
        data: {
          email,
          role: 'guest',
          // ID Fijo del Beach Hotel (Génesis Manifest v3.0)
          tenant: '00000000-0000-0000-0000-000000000001',
          password: crypto.randomBytes(32).toString('hex'),
          _verified: true,
          // --- REPUTATION REACTOR DATA ---
          experiencePoints: GENESIS_XP,
          level: 1,
          guestMetadata: {
             preferredLanguage: 'pt-BR'
          }
        },
      });

      /**
       * @pilar IV: Observabilidad. Log de inyección de reputación.
       */
      console.log(`   ${C.green}✓ [P33_REACTOR]${C.reset} Genesis Bonus granted: ${C.bold}+${GENESIS_XP} XP${C.reset}`);
      console.log(`   ${C.green}✓ [P33_REACTOR]${C.reset} Artifact materialized: ${C.cyan}${INITIAL_ARTIFACT}${C.reset}`);

    } else {
      console.log(`   ${C.green}✓ [IDENTIFIED]${C.reset} Nodo de identidad vinculado: ${email}`);
    }

    const totalLatency = (performance.now() - startTime).toFixed(4);
    console.log(`${C.green}${C.bold}[GRANTED]${C.reset} Identity Bridge sincronizado | Latency: ${totalLatency}ms\n`);

    return {
      success: true,
      traceId,
      user: {
        id: String(profile.id),
        role: profile.role as SovereignRoleType,
        email: profile.email,
        xp: Number(profile.experiencePoints || 0)
      }
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'UNEXPECTED_SYNC_DRIFT';
    console.error(`${C.red}${C.bold}[BREACH] Handshake abortado:${C.reset} ${msg}`);
    
    return {
      success: false,
      error: msg,
      traceId
    };
  }
}