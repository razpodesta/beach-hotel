/**
 * @file packages/auth-shield/src/lib/token.ts
 * @description Motor de orquestación de ciclo de vida de JWT.
 *              Refactorizado para cumplimiento de verbatimModuleSyntax,
 *              inmutabilidad de clase y validación estructural en tiempo de ejecución.
 * @version 2.0 - Strict Type Import Sync & Runtime Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import * as jwt from 'jsonwebtoken';
import type { AuthPayload, TokenOptions } from './types.js';

/**
 * @class TokenManager
 * @description Gestiona la emisión y validación de tokens JWT bajo un paradigma
 *              de Soberanía Apátrida (Zero-State Logic).
 */
export class TokenManager {
  private readonly secret: string;
  private readonly defaultExpiresIn: string | number;

  /**
   * @constructor
   * @param {TokenOptions} options - Opciones inyectadas (Secretos sellados).
   * @throws {Error} Si el secreto no es provisto, aplicando Fail-Fast.
   */
  constructor(options: TokenOptions) {
    if (!options.secret) {
      throw new Error('[AuthShield][CRITICAL] Secret key is required to initialize TokenManager.');
    }
    this.secret = options.secret;
    this.defaultExpiresIn = options.expiresIn;
  }

  /**
   * Genera un JWT firmado con los claims de identidad.
   * 
   * @param {AuthPayload} payload - Datos de identidad del usuario.
   * @param {string | number} [expiresIn] - Tiempo de expiración opcional.
   * @returns {string} Token JWT firmado.
   */
  public sign(payload: AuthPayload, expiresIn?: string | number): string {
    // Guardián de Tipos: Construcción explícita para evitar ambigüedad de sobrecarga
    const signOptions: jwt.SignOptions = {
      expiresIn: (expiresIn || this.defaultExpiresIn) as jwt.SignOptions['expiresIn'],
    };

    return jwt.sign(payload, this.secret, signOptions);
  }

  /**
   * Verifica un JWT y retorna el payload decodificado.
   * Aplica validación estructural en tiempo de ejecución para garantizar
   * que el token contiene los claims requeridos por el ecosistema.
   * 
   * @param {string} token - Token JWT a verificar.
   * @returns {AuthPayload | null} Payload validado o null si es inválido/expirado.
   */
  public verify(token: string): AuthPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      
      // Validación estructural en tiempo de ejecución (Defensive Type Guarding)
      // Verificamos que es un objeto válido y contiene los claims mínimos obligatorios
      if (
        typeof decoded === 'object' && 
        decoded !== null &&
        'userId' in decoded &&
        'email' in decoded
      ) {
        return decoded as AuthPayload;
      }
      
      return null;
    } catch {
      // Fail-safe silencioso: token inválido, expirado o malformado
      return null;
    }
  }
}