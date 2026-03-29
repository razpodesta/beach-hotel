/**
 * @file auth_portal.schema.ts
 * @description Contrato soberano para el portal de autenticación OAuth.
 *              Define la validación para la captura de identidad de huéspedes.
 * @version 1.0 - Identity Gateway Standard
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
  
  // Lógica de Email
  email_divider: z.string().min(1),
  email_placeholder: z.string().min(1),
  email_cta: z.string().min(1),
  
  // Footer & Trust
  footer_trust: z.string().min(1),
  privacy_notice: z.string().min(1),
});

export type AuthPortalDictionary = z.infer<typeof authPortalSchema>;