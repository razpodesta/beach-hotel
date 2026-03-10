import * as bcrypt from 'bcryptjs';

/**
 * Genera un hash seguro para una contraseña.
 * @param password Texto plano.
 * @param saltRounds Costo del algoritmo (default: 10).
 */
export async function hashPassword(password: string, saltRounds = 10): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compara una contraseña en texto plano con un hash.
 * @param password Texto plano.
 * @param hash Hash almacenado.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
