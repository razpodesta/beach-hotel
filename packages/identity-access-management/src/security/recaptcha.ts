/**
 * @file packages/identity-gateway/src/security/recaptcha.ts
 * @description Centinela de Seguridad L0 (Anti-Bot Gate).
 *              Orquesta la validación de tokens de Google reCAPTCHA v3
 *              con validación de contrato y telemetría forense.
 * @version 2.0 - Forensic Resilience Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @description Esquema de respuesta oficial de Google reCAPTCHA API.
 */
const recaptchaResponseSchema = z.object({
  success: z.boolean(),
  score: z.number().optional(), // v3 provee score de 0.0 a 1.0
  action: z.string().optional(),
  challenge_ts: z.string().optional(),
  hostname: z.string().optional(),
  'error-codes': z.array(z.string()).optional(),
});

// type RecaptchaResponse = z.infer<typeof recaptchaResponseSchema>;

/**
 * @function verifyReCaptcha
 * @description Valida el token de identidad humana contra los servidores de Google.
 * @param token - El token generado por el cliente.
 * @param threshold - Puntuación mínima para considerar al usuario como humano (Def: 0.5).
 * @param traceId - Identificador para trazabilidad en el Protocolo Heimdall.
 * @returns {Promise<boolean>} True si el handshake es exitoso y supera el umbral.
 */
export async function verifyReCaptcha(
  token: string,
  threshold = 0.5,
  traceId = 'GENERIC_GATE'
): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // 1. GUARDIA DE INFRAESTRUCTURA (Pilar VIII)
  if (!secret) {
    console.error(
      `[HEIMDALL][SECURITY][CRITICAL] Trace: ${traceId} | RECAPTCHA_SECRET_KEY is missing in environment.`
    );
    return false;
  }

  if (!token) {
    console.warn(`[HEIMDALL][SECURITY][BREACH] Trace: ${traceId} | Recaptcha token is empty.`);
    return false;
  }

  console.group(`[HEIMDALL][SECURITY] Anti-Bot Handshake: ${traceId}`);

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    });

    if (!response.ok) {
      throw new Error(`Google API Communication Error: ${response.status}`);
    }

    const rawData: unknown = await response.json();
    
    // 2. VALIDACIÓN DE CONTRATO (Pilar III)
    const result = recaptchaResponseSchema.safeParse(rawData);

    if (!result.success) {
      console.error(`[BREACH] Invalid response format from Google.`, result.error.format());
      return false;
    }

    const { success, score, 'error-codes': errors } = result.data;

    // 3. TELEMETRÍA FORENSE (Pilar IV)
    console.log(`Status: ${success ? 'PASSED' : 'FAILED'}`);
    if (score !== undefined) console.log(`Humanity Score: ${score} (Min: ${threshold})`);
    if (errors) console.log(`Error Codes: ${errors.join(', ')}`);

    const isHuman = success && (score ?? 0) >= threshold;

    if (!isHuman) {
      console.warn(`[SECURITY-ALERT] Low humanity score or invalid token detected.`);
    }

    return isHuman;

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown Network Drift';
    console.error(`[CRITICAL] Handshake aborted: ${msg}`);
    return false;
  } finally {
    console.groupEnd();
  }
}