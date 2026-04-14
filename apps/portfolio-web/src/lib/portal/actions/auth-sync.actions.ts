/**
 * @file apps/portfolio-web/src/lib/portal/actions/auth-sync.actions.ts
 * @description Orquestador de Sincronización de Identidad y Reactor de Reputación.
 *              Realiza el Handshake final entre Supabase Auth y Payload CMS.
 *              Refactorizado: Idempotencia del Reactor P33, blindaje de metadatos
 *              OAuth y alineación con el Core Registry v12.0.
 *              Nivelado: Erradicación de console.log (Linter Pure).
 * @version 4.1 - Linter Pure & Atomic Reputation Sync
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import crypto from 'node:crypto';
import { getPayload } from 'payload';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica. Resolución vía Paths de tsconfig.
 */
import type { SovereignRoleType } from '@metashark/cms-core';
import { calculateProgress } from '@metashark/reputation-engine';

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 * @pilar XIII: Build Isolation.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

/**
 * IDENTIFICADORES DETERMINISTAS (Génesis Manifest)
 * @description SSoT para la provisión de nuevas identidades.
 */
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const GENESIS_XP = 50;
const INITIAL_ARTIFACT = 'monolito-obsidiana';

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
    level: number;
    artifacts: string[];
    name: string;
  };
  error?: string;
  traceId: string;
};

/**
 * @function syncIdentityAction
 * @description Punto de entrada para sincronizar la identidad y activar la reputación.
 * @pilar IX: Inversión de Control. El Host gestiona la persistencia de la librería de identidad.
 */
export async function syncIdentityAction(
  rawUser: unknown
): Promise<SyncActionResult> {
  const startTime = performance.now();
  const traceId = `sync_hsk_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) return { success: true, traceId };

  console.group(`[DNA][BRIDGE] Handshake detectado | Trace: ${traceId}`);

  try {
    // 1. VALIDACIÓN DE CONTRATO SOBERANO
    const validation = syncIdentitySchema.safeParse(rawUser);
    if (!validation.success) {
      throw new Error('HANDSHAKE_DATA_MALFORMED');
    }

    const { email, name: providedName } = validation.data;

    // 2. INICIALIZACIÓN PEREZOSA DEL CMS (Isolated Synthesis)
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });

    // 3. PROTOCOLO DE LOCALIZACIÓN DE NODO
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });

    let profile = docs[0];

    if (!profile) {
      /**
       * @step Provisioning: Activación del Reactor de Reputación P33.
       */
      const initialName = providedName || email.split('@')[0];
      console.info(`   → [PROVISIONING] Nueva identidad soberana: ${email}`);
      
      profile = await payload.create({
        collection: 'users',
        data: {
          email,
          name: initialName,
          role: 'guest',
          tenant: MASTER_TENANT_ID,
          password: crypto.randomBytes(32).toString('hex'),
          _verified: true,
          experiencePoints: GENESIS_XP,
          level: 1,
          guestMetadata: {
             preferredLanguage: 'pt-BR',
             discoverySource: 'auth-gateway-v1'
          }
        },
      });

      console.info(`   ✓ [P33_REACTOR] Genesis Bonus granted: +${GENESIS_XP} XP`);
    } else {
      console.info(`   ✓ [IDENTIFIED] Nodo de identidad vinculado: ${email}`);
    }

    // 4. CALIBRACIÓN DE PROGRESIÓN (The Math Shield)
    const currentXp = Number(profile.experiencePoints || 0);
    const { currentLevel } = calculateProgress(currentXp);

    if (profile.level !== currentLevel) {
       console.warn(`   ![REPUTATION_DRIFT] Correcting level: ${profile.level} -> ${currentLevel}`);
    }

    const totalLatency = (performance.now() - startTime).toFixed(4);
    console.info(`   ✓ [GRANTED] Identity Bridge sincronizado | Latency: ${totalLatency}ms`);

    return {
      success: true,
      traceId,
      user: {
        id: String(profile.id),
        role: (profile.role as SovereignRoleType) || 'guest',
        email: profile.email,
        name: profile.name || email.split('@')[0],
        xp: currentXp,
        level: currentLevel,
        artifacts: [INITIAL_ARTIFACT] 
      }
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'UNEXPECTED_SYNC_DRIFT';
    console.error(`   ✕ [BREACH] Handshake abortado: ${msg}`);
    
    return {
      success: false,
      error: msg,
      traceId
    };
  } finally {
    console.groupEnd();
  }
}