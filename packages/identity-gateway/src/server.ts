/**
 * @file packages/identity-gateway/src/server.ts
 * @description Fachada Soberana de Infraestructura (Server Environment Entry Point).
 *              Único punto de acceso para los handlers de enrutamiento y Server Actions.
 *              Aislamiento absoluto para evitar "Client Boundary Leaks" en Next.js.
 * @version 2.0 - Server Isolation Standard
 * @author Staff Engineer - MetaShark Tech
 */

/**
 * 1. ORQUESTADORES DE FLUJO (Edge & Handlers)
 * @description Lógica de intercambio de identidad (OAuth) consumida por el 
 *              API Router de la aplicación anfitriona.
 */
export { handleOAuthCallback } from './handlers/oauth-callback';
export type { OAuthHandlerOptions } from './handlers/oauth-callback';

/**
 * 2. ACCIONES DE SERVIDOR (Identity Actions)
 * @description Mutaciones asíncronas puras para la comunicación con Supabase Auth.
 */
export { 
  loginAction, 
  registerAction, 
  signOutAction 
} from './actions/server-auth';
export type { AuthActionResult } from './actions/server-auth';