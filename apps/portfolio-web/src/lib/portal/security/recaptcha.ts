/**
 * @file recaptcha.ts
 * @description Servidor centinela para validación de reCAPTCHA v3.
 * @version 1.0 - Anti-Bot Standard
 */
'use server';

export async function verifyReCaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const res = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
    method: 'POST',
  });
  const data = await res.json();
  // El score de Google va de 0.0 (bot) a 1.0 (humano). 0.5 es el estándar.
  return data.success && data.score > 0.5;
}