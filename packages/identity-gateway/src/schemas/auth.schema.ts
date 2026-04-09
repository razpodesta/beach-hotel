/**
 * @file packages/identity-gateway/src/schemas/auth.schema.ts
 * @description Contratos Soberanos de Identidad (SSoT).
 *              Define la validación lógica de credenciales y el esquema 
 *              internacionalizado para la interfaz del Gateway.
 *              Refactorizado: Inclusión de IdentityUser y AuthCredentials (Fix TS2305).
 * @version 3.1 - Type Contract Sealed
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

// ============================================================================
// 1. CONTRATOS LÓGICOS (Form Validation)
// ============================================================================

const passwordRules = z
  .string()
  .min(8, 'SECURITY_ERR: Minimum 8 characters')
  .regex(/[A-Z]/, 'SECURITY_ERR: Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'SECURITY_ERR: Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'SECURITY_ERR: Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'SECURITY_ERR: Must contain at least one symbol');

export const loginCredentialsSchema = z.object({
  email: z.string().email('IDENTITY_ERR: Invalid email protocol').toLowerCase().trim(),
  password: z.string().min(1, 'IDENTITY_ERR: Password required'),
  recaptchaToken: z.string().min(1, 'SECURITY_ERR: Bot verification required'),
});

export const registerCredentialsSchema = z
  .object({
    name: z.string().min(2, 'IDENTITY_ERR: Name too short').max(50),
    email: z.string().email('IDENTITY_ERR: Invalid email protocol').toLowerCase().trim(),
    password: passwordRules,
    confirmPassword: z.string(),
    tosConsent: z.boolean().refine((val) => val === true, {
      message: 'COMPLIANCE_ERR: Terms acceptance required',
    }),
    newsletterOptIn: z.boolean().optional(),
    recaptchaToken: z.string().min(1, 'SECURITY_ERR: Bot verification required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "SECURITY_ERR: Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * @description Identidad del usuario devuelta por el motor de autenticación.
 */
export const identityUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  user_metadata: z.record(z.string(), z.unknown()).optional(),
  last_sign_in_at: z.string().optional(),
});

/** 
 * INFERENCIAS SOBERANAS (Fix TS2305)
 */
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;
export type IdentityUser = z.infer<typeof identityUserSchema>;

/** 
 * @type AuthCredentials
 * @description Unión de tipos para manejo polimórfico en el Modal.
 */
export type AuthCredentials = LoginCredentials | RegisterCredentials;

// ============================================================================
// 2. CONTRATO DE DICCIONARIO (UI Labels)
// ============================================================================

export const identityDictionarySchema = z.object({
  title_join: z.string().min(1),
  title_login: z.string().min(1),
  subtitle: z.string().min(1),
  apple_label: z.string().min(1),
  google_label: z.string().min(1),
  facebook_label: z.string().min(1),
  email_divider: z.string().min(1),
  label_name: z.string().min(1),
  name_placeholder: z.string().min(1),
  label_email: z.string().min(1),
  email_placeholder: z.string().min(1),
  label_password: z.string().min(1),
  password_placeholder: z.string().min(1),
  label_confirm_password: z.string().min(1),
  confirm_password_placeholder: z.string().min(1),
  login_cta: z.string().min(1),
  register_cta: z.string().min(1),
  label_toggle_password: z.string().min(1),
  label_password_strength: z.string().min(1),
  label_processing: z.string().min(1),
  label_tos: z.string().min(1),
  label_newsletter: z.string().min(1),
  error_account_locked: z.string().min(1),
  error_invalid_credentials: z.string().min(1),
  error_identity_exists: z.string().min(1),
  success_registration_title: z.string().min(1),
  success_registration_subtitle: z.string().min(1),
  footer_trust: z.string().min(1),
  privacy_notice: z.string().min(1),
});

export type IdentityDictionary = z.infer<typeof identityDictionarySchema>;