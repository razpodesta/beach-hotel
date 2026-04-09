/**
 * @file packages/identity-gateway/src/index.ts
 * @description Fachada Pública Soberana (The Sovereign Entry Point).
 *              Único punto de acceso para el ecosistema de Identidad.
 *              Refactorizado: Erradicación de extensiones .js para compatibilidad 
 *              nativa con el modo "Pure Source-First" y resolución "bundler".
 *              Sincronizado: Consolidación de contratos para erradicar TS2307 en el host.
 * @version 1.3 - Bundler Resolution Standard (Vercel Build Fix)
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. COMPONENTES DE INTERFAZ (Oxygen UI)
 * @description Exportación de átomos y organismos de autenticación.
 * @pilar IX: Desacoplamiento. Se eliminan extensiones .js para permitir 
 * que el orquestador Next.js resuelva los fuentes .tsx directamente.
 */
export { AuthModal } from './ui/AuthModal';
export type { AuthModalProps } from './ui/AuthModal';
export { LoginForm } from './ui/forms/LoginForm';
export { RegisterForm } from './ui/forms/RegisterForm';
export { PasswordStrength } from './ui/PasswordStrength';
export { SocialLogin } from './ui/SocialLogin';

/**
 * 2. ORQUESTADORES DE FLUJO (Edge & Handlers)
 * @description Lógica de intercambio de identidad para OAuth y Callbacks.
 */
export { handleOAuthCallback } from './handlers/oauth-callback';
export type { OAuthHandlerOptions } from './handlers/oauth-callback';

/**
 * 3. ACCIONES DE SERVIDOR (Identity Actions)
 * @description Server Actions puras para comunicación con Supabase Auth.
 */
export { 
  loginAction, 
  registerAction, 
  signOutAction 
} from './actions/server-auth';
export type { AuthActionResult } from './actions/server-auth';

/**
 * 4. CONTRATOS SOBERANOS Y ESQUEMAS (SSoT)
 * @pilar III: Seguridad de Tipos Absoluta. 
 */
export {
  loginCredentialsSchema,
  registerCredentialsSchema,
  identityUserSchema,
  identityDictionarySchema
} from './schemas/auth.schema';

export type {
  LoginCredentials,
  RegisterCredentials,
  IdentityUser,
  AuthCredentials,
  IdentityDictionary
} from './schemas/auth.schema';

/**
 * 5. UTILIDADES COMPARTIDAS
 */
export { cn } from './utils/cn';

/**
 * @pilar IV: Observabilidad DNA-Level.
 */
if (typeof window !== 'undefined') {
  const version = '1.3.0-stable';
  console.log(
    `%c🛡️ Identity Gateway v${version} | Bundler Sync Active`, 
    'color: #a855f7; font-weight: bold; background: rgba(168, 85, 247, 0.1); padding: 2px 5px; border-radius: 4px;'
  );
}