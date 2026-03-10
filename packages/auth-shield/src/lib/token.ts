// RUTA: packages/auth-shield/src/lib/token.ts
// VERSIÓN: 1.2 - ESLint & ESM Hygiene
// DESCRIPCIÓN: Se elimina la variable 'error' no utilizada en el bloque catch
//              para cumplir con la regla @typescript-eslint/no-unused-vars.
//              Se mantienen las correcciones previas de ESM (.js) y tipado estricto.

import * as jwt from 'jsonwebtoken';
import { AuthPayload, TokenOptions } from './types.js';

export class TokenManager {
  private secret: string;
  private defaultExpiresIn: string | number;

  constructor(options: TokenOptions) {
    if (!options.secret) {
      throw new Error('[AuthShield] Secret key is required to initialize TokenManager.');
    }
    this.secret = options.secret;
    this.defaultExpiresIn = options.expiresIn;
  }

  /**
   * Genera un JWT firmado.
   */
  public sign(payload: AuthPayload, expiresIn?: string | number): string {
    // Guardián de Tipos: Construimos el objeto de opciones explícitamente
    // y lo casteamos a jwt.SignOptions para resolver la ambigüedad de sobrecarga.
    const signOptions: jwt.SignOptions = {
      expiresIn: (expiresIn || this.defaultExpiresIn) as jwt.SignOptions['expiresIn'],
    };

    return jwt.sign(payload, this.secret, signOptions);
  }

  /**
   * Verifica un JWT y retorna el payload decodificado.
   * Retorna null si el token es inválido o ha expirado.
   */
  public verify(token: string): AuthPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      // Validación en tiempo de ejecución para asegurar que es un objeto
      if (typeof decoded === 'object' && decoded !== null) {
        return decoded as AuthPayload;
      }
      return null;
    } catch { // <-- CORRECCIÓN: Se elimina el parámetro 'error' no utilizado
      return null; // Fail-safe: token inválido
    }
  }
}
