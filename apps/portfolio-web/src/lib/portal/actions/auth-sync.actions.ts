/**
 * @file apps/portfolio-web/src/lib/portal/actions/auth-sync.actions.ts
 * @description Orquestador de Sincronización de Identidad y Reactor de Reputación.
 *              Realiza el Handshake final entre Supabase Auth y Payload CMS.
 *              Refactorizado: Unificación de respuesta para nodos recurrentes,
 *              mapeo de identidad extendida y recalibración de nivel P33.
 *              Estándar: Heimdall v2.5 Forensic Trace & DNA Sync.
 * @version 3.1 - Atomic Reputation Sync & Metadata Mapping
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { z } from 'zod';
import crypto from 'node:crypto';
import { getPayload } from 'payload';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 */
import type { SovereignRoleType } from '@metashark/cms-core';
import { calculateProgress } from '@metashark/protocol-33';

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

/**
 * IDENTIFICADORES DETERMINISTAS (Génesis Manifest)
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

// Protocolo Cromático Heimdall v2.5
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

/**
 * @function syncIdentityAction
 * @description Punto de entrada para sincronizar la identidad y activar la reputación.
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

    const { email, name } = validation.data;

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
       * @description Se crea la identidad digital con el bono de Génesis.
       */
      console.log(`   ${C.yellow}→ [PROVISIONING]${C.reset} Nueva identidad soberana detectada: ${email}`);
      
      profile = await payload.create({
        collection: 'users',
        data: {
          email,
          role: 'guest',
          tenant: MASTER_TENANT_ID,
          password: crypto.randomBytes(32).toString('hex'),
          _verified: true,
          // REPUTATION REACTOR INITIAL STATE
          experiencePoints: GENESIS_XP,
          level: 1,
          guestMetadata: {
             preferredLanguage: 'pt-BR'
          }
        },
      });

      console.log(`   ${C.green}✓ [P33_REACTOR]${C.reset} Genesis Bonus granted: ${C.bold}+${GENESIS_XP} XP${C.reset}`);
    } else {
      console.log(`   ${C.green}✓ [IDENTIFIED]${C.reset} Nodo de identidad vinculado: ${email}`);
    }

    // 4. CALIBRACIÓN DE PROGRESIÓN (The Math Shield)
    // Aseguramos que el nivel devuelto sea siempre el resultado del motor lógico.
    const currentXp = Number(profile.experiencePoints || 0);
    const { currentLevel } = calculateProgress(currentXp);

    const totalLatency = (performance.now() - startTime).toFixed(4);
    console.log(`${C.green}${C.bold}[GRANTED]${C.reset} Identity Bridge sincronizado | Latency: ${totalLatency}ms\n`);

    /**
     * @returns {SyncActionResult} Payload purificado para la hidratación de la UI.
     * @pilar III: Inferencia de tipos y normalización de salida.
     */
    return {
      success: true,
      traceId,
      user: {
        id: String(profile.id),
        role: profile.role as SovereignRoleType,
        email: profile.email,
        name: name || profile.email.split('@')[0],
        xp: currentXp,
        level: currentLevel,
        // En Fase 5, esto consultará la relación 'Inventory'
        artifacts: [INITIAL_ARTIFACT] 
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