// RUTA: /packages/testing-utils/src/lib/factories/user.factory.ts
// VERSIÓN: 1.1 - Tipográficamente Correcto y Definitivo
// DESCRIPCIÓN: Factory para generar objetos de usuario de prueba consistentes
//              y personalizables. Utiliza faker-js para datos realistas. Se ha
//              corregido un error tipográfico en la llamada al método de faker
//              para asegurar la compatibilidad y eliminar los errores de build.

import { faker } from '@faker-js/faker';

// Define la estructura base de un usuario para consistencia en las pruebas.
type TestUser = {
  id: string;
  email: string;
  username: string;
  privilege: 'user' | 'admin' | 'god';
  active: boolean;
};

/**
 * Construye un objeto de usuario de prueba con datos realistas generados por faker-js.
 * Permite la sobreescritura de cualquier propiedad para adaptarse a escenarios de
 * prueba específicos.
 *
 * @param {Partial<TestUser>} overrides - Un objeto con las propiedades que se desean sobreescribir.
 * @returns {TestUser} Un objeto de usuario de prueba completo y tipado.
 */
export const buildUser = (overrides?: Partial<TestUser>): TestUser => {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    // --- CORRECCIÓN CRÍTICA ---
    // El método correcto en la API de faker-js es 'username' en minúsculas.
    username: faker.internet.username(),
    // -------------------------
    privilege: 'user',
    active: true,
    // Permite que cualquier propiedad proporcionada en 'overrides' reemplace los valores por defecto.
    ...overrides,
  };
};
