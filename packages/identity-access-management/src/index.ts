/**
 * @file packages/identity-gateway/src/index.ts
 * @description Fachada Pública Soberana (Client Environment Entry Point).
 *              Único punto de acceso para la UI del ecosistema de Identidad.
 *              Refactorizado: Purga de exportaciones Server-Side (Handlers y Actions)
 *              para erradicar el "Client Boundary Leak" en Next.js 15 y estabilizar
 *              el pipeline de Vercel. (Ver `src/server.ts` para lógica de servidor).
 * @version 2.0 - Client Isolation Standard (Build-Resilient)
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. COMPONENTES DE INTERFAZ (Oxygen UI)
 * @description Exportación de átomos y organismos de autenticación cliente.
 * @pilar IX: Desacoplamiento de infraestructura estricto.
 */
export { AuthModal } from './ui/AuthModal';
export type { AuthModalProps } from './ui/AuthModal';
export { LoginForm } from './ui/forms/LoginForm';
export { RegisterForm } from './ui/forms/RegisterForm';
export { PasswordStrength } from './ui/PasswordStrength';
export { SocialLogin } from './ui/SocialLogin';

/**
 * 2. CONTRATOS SOBERANOS Y ESQUEMAS (SSoT)
 * @description Los esquemas se mantienen en la interfaz principal ya que son
 *              isomórficos (seguros tanto para cliente como servidor).
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
 * 3. UTILIDADES COMPARTIDAS
 */
export { cn } from './utils/cn';

/**
 * @pilar IV: Observabilidad DNA-Level.
 */
if (typeof window !== 'undefined') {
  const version = '2.0.0-sealed';
  console.log(
    `%c🛡️ Identity Gateway v${version} | Client Isolation Active`, 
    'color: #a855f7; font-weight: bold; background: rgba(168, 85, 247, 0.1); padding: 2px 5px; border-radius: 4px;'
  );
}