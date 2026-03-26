/**
 * @file packages/auth-shield/src/lib/types.ts
 * @description Contratos inmutables para el motor de seguridad y tokenización.
 *              Refactorizado para cumplimiento estricto de verbatimModuleSyntax
 *              y sincronización con la arquitectura Multi-Tenant.
 * @version 2.1 - Strict Type Import & Tenant Sync
 * @author Raz Podestá - MetaShark Tech
 */

import type { JwtPayload } from 'jsonwebtoken';

/**
 * @interface AuthPayload
 * @description Extiende el payload estándar de JWT con los claims de identidad
 *              específicos requeridos por el ecosistema MetaShark (SSoT).
 */
export interface AuthPayload extends JwtPayload {
  /** Identificador único del usuario (UUID) */
  userId: string;
  
  /** Correo electrónico validado del usuario */
  email: string;
  
  /** Rol de acceso dentro de la plataforma (ej: admin, user, sponsor) */
  role?: string;

  /** 
   * @property tenantId
   * @description ID de la propiedad o ecosistema al que pertenece el usuario.
   * Crucial para el aislamiento de datos (Multi-Tenancy) en el CMS.
   */
  tenantId?: string;
}

/**
 * @interface TokenOptions
 * @description Configuración inyectable para la instanciación de bóvedas criptográficas.
 *              Aplica el patrón de Secretos Sellados (Sealed Secrets).
 */
export interface TokenOptions {
  /** Llave secreta para firma/validación (nunca debe ser expuesta al cliente) */
  secret: string;
  
  /** Tiempo de vida del token (ej: '2h', '7d', o tiempo en segundos) */
  expiresIn: string | number;
}

/**
 * @type HashResult
 * @description Representa el string encriptado resultante de una función KDF (ej. bcrypt).
 */
export type HashResult = string;