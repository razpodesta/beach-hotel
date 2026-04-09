/**
 * @file packages/identity-gateway/src/index.ts
 * @description Fachada Pública Soberana (The Sovereign Entry Point).
 *              Único punto de acceso para el ecosistema de Identidad.
 *              Refactorizado: Consolidación de contratos de tipos para erradicar 
 *              el error TS2307 en el host.
 *              Estándar: ESM Pure (NodeNext) con Inversión de Control.
 * @version 1.2 - Type Contract Consolidation & ESM Hardened
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. COMPONENTES DE INTERFAZ (Oxygen UI)
 * @description Exportación de átomos y organismos de autenticación.
 */
export { AuthModal } from './ui/AuthModal.js';
export type { AuthModalProps } from './ui/AuthModal.js';
export { LoginForm } from './ui/forms/LoginForm.js';
export { RegisterForm } from './ui/forms/RegisterForm.js';
export { PasswordStrength } from './ui/PasswordStrength.js';
export { SocialLogin } from './ui/SocialLogin.js';

/**
 * 2. ORQUESTADORES DE FLUJO (Edge & Handlers)
 * @description Lógica de intercambio de identidad para OAuth y Callbacks.
 */
export { handleOAuthCallback } from './handlers/oauth-callback.js';
export type { OAuthHandlerOptions } from './handlers/oauth-callback.js';

/**
 * 3. ACCIONES DE SERVIDOR (Identity Actions)
 * @description Server Actions puras para comunicación con Supabase Auth.
 */
export { 
  loginAction, 
  registerAction, 
  signOutAction 
} from './actions/server-auth.js';
export type { AuthActionResult } from './actions/server-auth.js';

/**
 * 4. CONTRATOS SOBERANOS Y ESQUEMAS (SSoT)
 * @pilar III: Seguridad de Tipos Absoluta. 
 * Exportamos los esquemas y sus inferencias para que el host valide 
 * la integridad de los datos antes del handshake.
 */
export {
  loginCredentialsSchema,
  registerCredentialsSchema,
  identityUserSchema,
  identityDictionarySchema
} from './schemas/auth.schema.js';

export type {
  LoginCredentials,
  RegisterCredentials,
  IdentityUser,
  AuthCredentials,
  IdentityDictionary // Crítico para el host (AuthPortal.tsx)
} from './schemas/auth.schema.js';

/**
 * 5. UTILIDADES COMPARTIDAS
 */
export { cn } from './utils/cn.js';

/**
 * @pilar IV: Observabilidad DNA-Level.
 */
if (typeof window !== 'undefined') {
  const version = '1.2.0-stable';
  console.log(
    `%c🛡️ Identity Gateway v${version} | Boundary Synchronized`, 
    'color: #a855f7; font-weight: bold; background: rgba(168, 85, 247, 0.1); padding: 2px 5px; border-radius: 4px;'
  );
}