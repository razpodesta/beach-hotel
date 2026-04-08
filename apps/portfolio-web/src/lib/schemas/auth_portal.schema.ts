/**
 * @file auth_portal.schema.ts
 * @description Contrato soberano para el portal de autenticación OAuth y Password-based.
 *              Nivelado para incluir fortaleza, consentimiento y estados de bloqueo.
 * @version 2.0 - Identity Fortress Standard
 */

import { z } from 'zod';

export const authPortalSchema = z.object({
  title_join: z.string().min(1),
  title_login: z.string().min(1),
  subtitle: z.string().min(1),
  
  // Proveedores OAuth
  apple_label: z.string().min(1),
  google_label: z.string().min(1),
  facebook_label: z.string().min(1),
  
  // Lógica de Email y Contraseña
  email_divider: z.string().min(1),
  email_placeholder: z.string().min(1),
  password_placeholder: z.string().min(1), // Nuevo
  email_cta: z.string().min(1),
  
  // Componentes de Fortaleza (UI Labels)
  label_toggle_password: z.string().min(1),
  label_password_strength: z.string().min(1),
  
  // Consents & Compliance
  label_tos: z.string().min(1),
  label_newsletter: z.string().min(1),
  
  // Feedback Forense (Bloqueos y errores)
  error_account_locked: z.string().min(1),
  error_invalid_credentials: z.string().min(1),
  
  // Footer & Trust
  footer_trust: z.string().min(1),
  privacy_notice: z.string().min(1),
});

export type AuthPortalDictionary = z.infer<typeof authPortalSchema>;